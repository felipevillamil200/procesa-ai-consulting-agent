"""Prueba con Gemini del backend activo. Solo carga y elimina PDFs sintéticos propios."""
import sys, json, time, io
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'CHATGPT QA/_deps'))
import httpx
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
from PIL import Image,ImageDraw,ImageFont
from pypdf import PdfReader

OUT=ROOT/'CHATGPT QA/gemini_real';OUT.mkdir(exist_ok=True)
BASE='http://localhost:8000'
report={'backend':BASE,'cases':[],'cleanup':[]}
def save():
    (OUT/'resultados.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
def record(name,passed,**data):
    report['cases'].append(dict(name=name,passed=bool(passed),**data));save()
    print(f"{'PASS' if passed else 'FAIL'}: {name}",flush=True)
def make(name,pages,scan=False):
    path=OUT/name;c=Canvas(str(path))
    for lines in pages:
        if scan:
            im=Image.new('RGB',(1240,1754),'white');draw=ImageDraw.Draw(im)
            font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',32)
            for i,line in enumerate(lines):draw.text((90,120+i*70),line,fill='black',font=font)
            im.save(OUT/'escaneado.png');c.drawImage(ImageReader(im),0,0,width=595,height=842)
        else:
            c.setFont('Helvetica',14)
            for i,line in enumerate(lines):c.drawString(50,780-i*28,line)
        c.showPage()
    c.save()
    if scan:assert not ''.join(p.extract_text() or '' for p in PdfReader(path).pages).strip()
    return path

files={
 'factura':make('QA_GEMINI_factura.pdf',[['FACTURA DE SERVICIOS QA - DATOS FICTICIOS','Proveedor: Operadora Ejemplo','Servicio: Telefonia','Total a pagar: USD 23.00','Vencimiento: 15 de noviembre de 2026']]),
 'contrato':make('QA_GEMINI_contrato.pdf',[['CONTRATO DE TELECOMUNICACIONES QA - DATOS FICTICIOS','Proveedor: Operadora Ejemplo','Objeto: Servicio de internet'],['CONDICIONES DEL SERVICIO','Plazo: 12 meses','Penalidad por cancelacion: USD 50.00']]),
 'manual':make('QA_GEMINI_manual.pdf',[['MANUAL DE OPERACION QA - DATOS FICTICIOS','Equipo: Bomba industrial','Advertencia: No operar sin proteccion'],['PROCEDIMIENTO DE APAGADO','Paso final: Cerrar la valvula azul y desconectar la energia']]),
 'escaneado':make('QA_GEMINI_escaneado.pdf',[['FACTURA ESCANEADA QA - DATOS FICTICIOS','Proveedor: Escaneos Ejemplo','Total a pagar: USD 47.80','Numero de factura: QA-778']],scan=True)
}
created=[];ids={}
try:
    with httpx.Client(timeout=150) as client:
        config=client.get(BASE+'/api/config').json()
        report['config']={k:config.get(k) for k in ['provider','model','temperature','has_api_key','backend_available']};save()
        before={d['document_id'] for d in client.get(BASE+'/api/documentos').json()['documentos']}
        for kind,path in files.items():
            start=time.perf_counter();r=client.post(BASE+'/api/upload',files={'file':(path.name,path.read_bytes(),'application/pdf')});body=r.json()
            ident=body.get('documento',{}).get('document_id')
            if ident:
                ids[kind]=ident
                if ident not in before:created.append(ident)
            detail=next((d for d in client.get(BASE+'/api/documentos').json()['documentos'] if d['document_id']==ident),{}) if ident else {}
            record('upload_'+kind,r.status_code==200 and bool(ident),status=r.status_code,elapsed_ms=round((time.perf_counter()-start)*1000),response=body,document=detail)
        checks=[('total_factura','factura','Cual es el total a pagar de esta factura?',['23']),('contrato_pagina_2','contrato','Cual es el plazo del contrato de telecomunicaciones?',['12']),('manual_pagina_2','manual','Que debo hacer en el paso final del apagado?',['valvula azul']),('lectura_escaneado','escaneado','Cual es el total a pagar de esta factura escaneada?',['47.80'])]
        for name,kind,question,expected in checks:
            if kind not in ids:record(name,False,reason='Carga fallida');continue
            r=client.post(BASE+'/api/chat',json={'question':question,'document_ids':[ids[kind]]});body=r.json();answer=body.get('answer','').lower()
            passed=r.status_code==200 and body.get('found_info') and all(t in answer for t in expected) and body.get('sources')==[ids[kind]]
            record(name,passed,status=r.status_code,response=body,synthetized_by_ai='sin sintesis' not in answer and 'sin síntesis' not in answer and 'extractos literales' not in answer)
        if 'factura' in ids:
            body=client.post(BASE+'/api/chat',json={'question':'Cual es la contrasena bancaria secreta del cliente?','document_ids':[ids['factura']]}).json()
            record('abstencion_dato_ausente',body.get('found_info') is False,response=body)
            body=client.post(BASE+'/api/chat',json={'question':'Que contiene?','document_ids':['DOC-0000000000000000',ids['factura']]}).json()
            record('fuente_inexistente_sin_contaminacion',body.get('found_info') is False,response=body)
        if all(k in ids for k in ['factura','escaneado']):
            selected=[ids['factura'],ids['escaneado']]
            body=client.post(BASE+'/api/chat',json={'question':'Compara los importes totales de ambas facturas. No sumes, cita cada documento.','document_ids':selected}).json()
            answer=body.get('answer','')
            record('comparacion_multiple',body.get('found_info') and set(body.get('sources',[]))==set(selected) and '23' in answer and '47.80' in answer,response=body)
finally:
    for ident in created:
        try:
            r=httpx.delete(BASE+'/api/proyectos/'+ident,timeout=30)
            report['cleanup'].append({'document_id':ident,'status':r.status_code,'deleted':r.json().get('deleted')})
        except Exception as e:report['cleanup'].append({'document_id':ident,'error':type(e).__name__})
    save()
print(json.dumps({'passed':sum(c['passed'] for c in report['cases']),'total':len(report['cases'])}),flush=True)
