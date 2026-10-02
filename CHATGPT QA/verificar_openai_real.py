"""Prueba acotada del backend activo con gpt-4o-mini y fuentes sintéticas, sin leer claves."""
import sys,json,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'CHATGPT QA/_deps'))
import httpx
from pypdf import PdfReader,PdfWriter
from reportlab.pdfgen.canvas import Canvas

OUT=ROOT/'CHATGPT QA/openai_real';OUT.mkdir(exist_ok=True)
BASE='http://localhost:8000'
report={'backend':BASE,'cases':[],'cleanup':[]}
def save():
    (OUT/'resultados.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
def record(name,passed,**data):
    report['cases'].append(dict(name=name,passed=bool(passed),**data));save()
    print(('PASS' if passed else 'FAIL')+': '+name,flush=True)
def make_fixtures():
    old=ROOT/'CHATGPT QA/gemini_real'
    files={kind:old/('QA_GEMINI_'+kind+'.pdf') for kind in ['factura','contrato','manual','escaneado']}
    table=OUT/'QA_OPENAI_tabla.pdf';c=Canvas(str(table));c.setFont('Helvetica',14)
    for i,line in enumerate(['INVENTARIO QA - DATOS FICTICIOS','Articulo       Existencias       Almacen','Cable-A           31               Norte','Router-B          17               Sur']):c.drawString(50,780-i*30,line)
    c.save();files['tabla']=table
    mixed=OUT/'QA_OPENAI_mixto.pdf';writer=PdfWriter();writer.add_page(PdfReader(files['manual']).pages[0]);writer.add_page(PdfReader(files['escaneado']).pages[0])
    with mixed.open('wb') as f:writer.write(f)
    files['mixto']=mixed
    long=OUT/'QA_OPENAI_largo.pdf';c=Canvas(str(long))
    for i in range(1,13):
        c.setFont('Helvetica',14);c.drawString(50,780,'MANUAL MULTIPAGINA QA - DATOS FICTICIOS');c.drawString(50,750,f'Seccion numero {i}')
        c.drawString(50,710,'Procedimiento de seguridad: Revisar equipo antes de operar.')
        if i==12:c.drawString(50,675,'Codigo de cierre: AZUL-735')
        c.showPage()
    c.save();files['largo']=long
    assert not (PdfReader(files['escaneado']).pages[0].extract_text() or '').strip()
    return files

created=[];ids={}
with httpx.Client(timeout=180) as client:
    config=client.get(BASE+'/api/config').json()
    report['config']={k:config.get(k) for k in ['provider','model','temperature','has_api_key','backend_available']}
    if config.get('provider')!='openai' or config.get('model')!='gpt-4o-mini' or not config.get('has_api_key'):
        print('BLOCKED: configura OpenAI gpt-4o-mini con su clave en la aplicación.',flush=True);sys.exit(2)
    files=make_fixtures()
    before={d['document_id'] for d in client.get(BASE+'/api/documentos').json()['documentos']}
    try:
        for kind,path in files.items():
            start=time.perf_counter();response=client.post(BASE+'/api/upload',files={'file':(path.name,path.read_bytes(),'application/pdf')});body=response.json()
            doc=body.get('documento',{});ident=doc.get('document_id')
            if ident:
                ids[kind]=ident
                if ident not in before:created.append(ident)
            record('carga_'+kind,response.status_code==200 and bool(ident) and doc.get('extraction_method','').startswith('openai'),
                   status=response.status_code,elapsed_ms=round((time.perf_counter()-start)*1000),response=body)
        checks=[('factura_total','factura','Cual es el total a pagar?',['23.00'],1),
                ('contrato_plazo','contrato','Cual es el plazo del contrato de telecomunicaciones?',['12'],2),
                ('manual_apagado','manual','Que debo hacer en el paso final del apagado?',['valvula azul'],2),
                ('escaneado_total','escaneado','Cual es el total a pagar?',['47.80'],1),
                ('tabla_inventario','tabla','Cuantas existencias del Router-B hay y en que almacen estan?',['17','sur'],1),
                ('mixto_pagina_visual','mixto','Cual es el total a pagar de la factura que aparece en la segunda pagina?',['47.80'],2),
                ('ultima_pagina','largo','Cual es el codigo de cierre del manual?',['azul-735'],12)]
        for name,kind,question,expected,page in checks:
            if kind not in ids:record(name,False,reason='Carga fallida');continue
            start=time.perf_counter();response=client.post(BASE+'/api/chat',json={'question':question,'document_ids':[ids[kind]]});body=response.json();answer=body.get('answer','').lower().replace(',','.')
            ai=not any(marker in answer for marker in ['extractos literales','sin síntesis','sin sintesis'])
            expected_page=any(c.get('pagina')==page and c.get('codigo_proyecto')==ids[kind] for c in body.get('evidence_chunks',[]))
            passed=response.status_code==200 and body.get('found_info') and all(t in answer for t in expected) and body.get('sources')==[ids[kind]] and expected_page and ai
            record(name,passed,status=response.status_code,elapsed_ms=round((time.perf_counter()-start)*1000),ai_synthesis=ai,response=body)
        if all(k in ids for k in ['factura','escaneado']):
            selected=[ids['factura'],ids['escaneado']]
            body=client.post(BASE+'/api/chat',json={'question':'Compara los totales de ambas facturas. Reproduce las cifras, no las sumes. Cita ambos documentos.','document_ids':selected}).json()
            answer=body.get('answer','').replace(',','.')
            record('comparacion_multiple',body.get('found_info') and set(body.get('sources',[]))==set(selected) and '23' in answer and '47.80' in answer and 'extractos literales' not in answer,response=body)
        if 'factura' in ids:
            body=client.post(BASE+'/api/chat',json={'question':'Cual es la contrasena bancaria secreta del cliente?','document_ids':[ids['factura']]}).json()
            record('abstencion_dato_ausente',body.get('found_info') is False and not body.get('sources'),response=body)
            body=client.post(BASE+'/api/chat',json={'question':'Que contiene?','document_ids':['DOC-0000000000000000',ids['factura']]}).json()
            record('fuente_inexistente',body.get('found_info') is False and not body.get('sources'),response=body)
            response=client.post(BASE+'/api/upload',files={'file':('mismo_contenido.pdf',files['factura'].read_bytes(),'application/pdf')});body=response.json()
            record('duplicado_idempotente',response.status_code==200 and body.get('documento',{}).get('document_id')==ids['factura'],response=body)
            body=client.post(BASE+'/api/chat',json={'question':'Cual es la penalidad de cancelacion del contrato?','document_ids':[ids['factura']]}).json()
            record('aislamiento_entre_documentos',body.get('found_info') is False and not body.get('sources'),response=body)
    finally:
        for ident in created:
            try:
                response=client.delete(BASE+'/api/proyectos/'+ident)
                report['cleanup'].append({'document_id':ident,'status':response.status_code,'deleted':response.json().get('deleted')})
            except Exception as exc:report['cleanup'].append({'document_id':ident,'error':type(exc).__name__})
        report['passed']=sum(c['passed'] for c in report['cases']);report['total']=len(report['cases'])
        report['verdict']='CASOS PROBADOS APROBADOS; no garantiza cualquier PDF' if report['passed']==report['total'] else 'HAY CASOS SIN APROBAR'
        save()
print(json.dumps({'passed':report['passed'],'total':report['total']}),flush=True)
