"""Diagnóstico sin red ni cambios en producto: factura sintética en sandbox nuevo."""
import os,sys,json,shutil,hashlib
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
OUT=Path(__file__).resolve().parent; ROOT=OUT.parent
WORK=OUT/('diagnostico_factura_'+datetime.now(ZoneInfo('America/Bogota')).strftime('%Y%m%d_%H%M%S'))
shutil.copytree(ROOT/'codigo/backend',WORK/'codigo/backend')
(WORK/'codigo/__init__.py').write_text('')
sys.path[:0]=[str(OUT/'_deps'),str(WORK)]
os.environ.update(GEMINI_API_KEY='',OPENAI_API_KEY='',LLM_PROVIDER='openai',LLM_TEMPERATURE='0.1',PYTHONDONTWRITEBYTECODE='1')
from reportlab.pdfgen import canvas
from fastapi.testclient import TestClient
from codigo.backend.main import app,agent,db_manager
from codigo.backend import config
pdf=WORK/'ad09004201220072622380266.pdf';c=canvas.Canvas(str(pdf))
for i,line in enumerate(['FACTURA DE SERVICIOS DE TELEFONIA','Proveedor: Operadora Ejemplo S.A.','Numero de factura: FAC-2026-123','Fecha de emision: 2026-10-01','Concepto: Plan de telefonia movil mensual','Subtotal: USD 20.00','IVA: USD 3.00','TOTAL A PAGAR: USD 23.00','Vencimiento: 2026-10-15']): c.drawString(40,800-i*22,line)
c.save();client=TestClient(app)
uploaded=client.post('/api/upload',files={'file':(pdf.name,pdf.read_bytes(),'application/pdf')})
ficha=uploaded.json().get('proyecto',{});code=ficha.get('codigo_proyecto')
questions=['que es esto','¿Cuál es el total a pagar de esta factura?','¿Qué contiene esta factura de telecomunicaciones?']
answers=[]
for q in questions:
    response=client.post('/api/chat',json={'question':f"[Foco en informe {code} - {ficha.get('cliente','')}]: {q}"})
    answers.append({'question':q,'http':response.status_code,**response.json()})
hits=agent.search_engine.search('total pagar factura',project_id=code)
raw_hits=agent.search_engine.search('total pagar factura')
result={'test_document':'Factura sintética, no documento real del usuario','sandbox':str(WORK),'upload_http':uploaded.status_code,'ficha':ficha,'sqlite_count':len(db_manager.get_all_proyectos()),'rag_codes':sorted({x.codigo_proyecto for x in agent.search_engine.chunks}),'focused_hits':hits,'unfiltered_hits':raw_hits,'answers':answers,'live_llm_calls':0}
(OUT/'diagnostico_documento_generico.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps(result,indent=2,ensure_ascii=False))
