import os, sys, json, shutil, subprocess, hashlib, time, sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'CHATGPT QA'
PY=sys.executable
DEPS=OUT/'_deps'
if DEPS.exists():
    sys.path.insert(0,str(DEPS))
os.environ.update(GEMINI_API_KEY='',OPENAI_API_KEY='',LLM_PROVIDER='openai',LLM_MODEL='gpt-4o-mini',LLM_TEMPERATURE='0.1',PYTHONUTF8='1',PYTHONDONTWRITEBYTECODE='1')
WORK=OUT/'sandbox'
if WORK.exists():
    from datetime import datetime
    WORK=OUT/('sandbox_'+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
WORK.mkdir(exist_ok=True)
for folder in ['codigo/backend','tests','extracted','data']:
    shutil.copytree(ROOT/folder,WORK/folder,dirs_exist_ok=True)
(WORK/'codigo/__init__.py').write_text('',encoding='utf8')
shutil.copy(ROOT/'pytest.ini',WORK/'pytest.ini')
os.environ['PYTHONPATH']=os.pathsep.join([str(DEPS),str(WORK)])
def fingerprint_sources():
    paths=list((ROOT/'codigo/backend').glob('*.py'))+list((ROOT/'tests').glob('*.py'))+list((ROOT/'data').rglob('*'))+list((ROOT/'codigo/frontend/src').rglob('*'))
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.is_file() and '__pycache__' not in str(p)}
source_before=fingerprint_sources()
def run_suite(name):
    t=time.perf_counter()
    r=subprocess.run([PY,'-m','pytest','-v','--junitxml='+str(OUT/(name+'.xml'))],cwd=WORK,env=os.environ,capture_output=True,text=True,encoding='utf8')
    (OUT/(name+'.log')).write_text(r.stdout+'\n'+r.stderr,encoding='utf8')
    return {'exit_code':r.returncode,'seconds':round(time.perf_counter()-t,3),'tail':r.stdout[-1800:]}
results={'suite_estado_actual':run_suite('suite_estado_actual')}
results['sandbox_path']=str(WORK)
sys.path.insert(0,str(WORK))
from codigo.backend import config, extractor, rag
from codigo.backend.database import DatabaseManager
from codigo.backend.agent import ConsultorAgent
from pypdf import PdfReader
db=DatabaseManager()
results['estado_actual']={'rows':len(db.get_all_proyectos()),'pdfs':len(list(config.RAW_REPORTS_DIR.glob('*.pdf'))),'fichas':len(list(config.FICHAS_DIR.glob('*.json'))),'chunks':len(rag.get_search_engine().chunks)}
for f in (WORK/'extracted').glob('Informe_Cierre_*.pdf'): shutil.copy(f,config.RAW_REPORTS_DIR/f.name)
extractor.process_all_reports(use_llm=True)
rag.get_search_engine().reload_index()
results['suite_corpus_aislado']=run_suite('suite_corpus_aislado')
engine=rag.get_search_engine()
results['fichas_generadas']=[json.loads(p.read_text(encoding='utf8')) for p in config.FICHAS_DIR.glob('*.json')]
results['corpus']=[{'file':f.name,'pages':len(PdfReader(f).pages),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in (WORK/'extracted').glob('*.pdf')]
results['index']={'chunks':len(engine.chunks),'codes':sorted({c.codigo_proyecto for c in engine.chunks}),'max_chars':max(map(lambda c:len(c.contenido),engine.chunks))}
checks=[]
def check(name,expected,actual,passed): checks.append({'name':name,'expected':expected,'actual':actual,'passed':bool(passed)})
f=extractor.extract_ficha_deterministic('DOCUMENTO VACIO SIN DATOS','PC-2025-014.pdf')
check('extraccion_grounded','Rechazar documento sin datos',{'cliente':f.cliente,'duracion':f.duracion_semanas}, f.cliente in ['Documento sin datos', 'PC-DESCONOCIDO'] and f.duracion_semanas == 0)
f=extractor.extract_ficha_deterministic('Proyecto nuevo sin fechas','nuevo.pdf')
check('nuevo_pdf_sin_inventar','No inventar fechas o duracion',{'fecha_inicio':f.fecha_inicio,'duracion':f.duracion_semanas}, f.fecha_inicio == '' and f.duracion_semanas == 0)
f.duracion_semanas=-10
from codigo.backend.models import ProyectoFicha
try: ProyectoFicha.model_validate(f.model_dump()); accepted=True
except Exception: accepted=False
check('validacion_duracion_negativa','Rechazar duracion negativa',accepted,not accepted)
chunk=engine._chunk_text('x'*1800)
check('limite_chunk_600','Todos <=600',list(map(len,chunk)),all(len(x)<=600 for x in chunk))
hits=engine.search('resistencia cambio',project_id='PC-2099-999')
check('filtro_proyecto_inexistente','Sin resultados', [h['codigo_proyecto'] for h in hits],not hits)
agent=ConsultorAgent(db)
questions=['¿Qué proyectos se ejecutaron en el año 2025 y cuál duró más?','¿Qué lecciones aprendidas tuvimos sobre mandos medios y resistencia al cambio?','¿Qué proyectos tenemos en minería o petróleo?','¿Qué proyectos tenemos en agricultura?','¿Cuál es el promedio de duración en semanas?','¿Cuánto dinero se ahorró en retail?','¿Cuál es el proyecto PC-2025-014?']
results['preguntas']=[]
for q in questions:
    t=time.perf_counter(); r=agent._local_reasoning_engine(q)
    results['preguntas'].append({'question':q,**r.model_dump(),'total_ms':round((time.perf_counter()-t)*1000,2)})
check('agricultura_abstencion','found_info=False',results['preguntas'][3]['found_info'],not results['preguntas'][3]['found_info'])
check('promedio_calculado','22.5 semanas segun PDFs (21+23+21+25)/4',results['preguntas'][4]['answer'],'22.5' in results['preguntas'][4]['answer'])
check('ahorro_retail','Declarar falta de montos economicos en informe',results['preguntas'][5]['answer'],not results['preguntas'][5]['found_info'])
check('foco_codigo_sql','Solo PC-2025-014',results['preguntas'][6]['sources'],results['preguntas'][6]['sources']==['PC-2025-014'])
for query in ['DROP TABLE proyectos','DELETE FROM proyectos','SELECT 1; DROP TABLE proyectos','WITH a AS (SELECT 1) DELETE FROM proyectos','PRAGMA writable_schema=1']:
    r=db.execute_read_query(query); check('SQL '+query,'Bloqueada',r,not r['success'])
r=db.execute_read_query('SELECT COUNT(*) AS n FROM proyectos'); check('SQL count','4 proyectos',r,r['success'] and r['rows'][0]['n']==4)
# Simulacion del proveedor: prueba del contrato sin red ni credenciales.
from types import SimpleNamespace as NS
import openai
old=openai.OpenAI
class Fake:
    def __init__(self,**kwargs): self.chat=NS(completions=NS(create=lambda **kw:NS(choices=[NS(message=NS(tool_calls=None,content='La empresa minera ahorró 999 millones.'))])))
openai.OpenAI=Fake
os.environ['OPENAI_API_KEY']='qa-fake-key-no-network'
r=agent.ask('¿Cuánto ahorró la empresa minera?')
check('LLM_sin_tools_grounding','Rechazar respuesta sin evidencia',r.model_dump(),not r.found_info)
os.environ['OPENAI_API_KEY']=''
openai.OpenAI=old
from codigo.backend import main
from fastapi.testclient import TestClient
client=TestClient(main.app)
for url in ['/health','/api/proyectos','/api/fichas','/api/proyectos/PC-2025-014/preview','/api/pdf/PC-2025-014']:
    r=client.get(url); check('GET '+url,'200',r.status_code,r.status_code==200)
r=client.post('/api/sql',json={'query':'DROP TABLE proyectos'}); check('API SQL DROP','success=False',r.json(),not r.json()['success'])
r=client.post('/api/config',json={'temperature':0.8}); check('temperatura_contrato','Persistir temperature=0.8',{'post':r.json(),'config':client.get('/api/config').json()},client.get('/api/config').json().get('temperature')==0.8)
r=client.delete('/api/proyectos/PC-2025-014'); check('delete_aislado','Desaparece DB PDF JSON',r.json(),not any(p['codigo_proyecto']=='PC-2025-014' for p in db.get_all_proyectos()) and engine.get_document_preview('PC-2025-014') is None)
extra=extractor.extract_ficha_deterministic('','extra.pdf'); db.upsert_proyecto(extra)
r=client.post('/api/proyectos/reset'); check('reset_exactamente_oficiales','4 proyectos oficiales',{'response':r.json(),'rows':len(db.get_all_proyectos())},len(db.get_all_proyectos())==4)
r=client.post('/api/upload',files={'file':('bad.pdf',b'no es pdf','application/pdf')}); check('pdf_invalido_rechazado','400/422 sin archivo residual',{'status':r.status_code,'residual':(config.RAW_REPORTS_DIR/'bad.pdf').exists()},r.status_code in [400,422] and not (config.RAW_REPORTS_DIR/'bad.pdf').exists())
# Path traversal con payload inofensivo, solo dentro del sandbox.
payload=(WORK/'extracted/Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf').read_bytes()
r=client.post('/api/upload',files={'file':('../qa_escape.pdf',payload,'application/pdf')})
check('upload_path_traversal','No escribir fuera de raw_reports',{'status':r.status_code,'escaped':(WORK/'data/qa_escape.pdf').exists()},not (WORK/'data/qa_escape.pdf').exists())
results['regression_metrics']={'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'total':len(checks)}
import runpy
runpy.run_path(str(OUT/'validaciones_reauditoria.py'),init_globals=globals())
runpy.run_path(str(OUT/'validaciones_finales.py'),init_globals=globals())
results['source_unchanged']=source_before==fingerprint_sources()
results['source_manifest']=source_before
results['timestamp_bogota']=__import__('datetime').datetime.now(__import__('zoneinfo').ZoneInfo('America/Bogota')).isoformat()
results['checks']=checks
results['metrics']={'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'total':len(checks)}
import importlib.metadata as md
results['versions']={x:md.version(x) for x in ['pydantic','pytest','fastapi','openai','pypdf']}
(OUT/'evidencia_resultados.json').write_text(json.dumps(results,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({k:v for k,v in results.items() if k in ['estado_actual','suite_estado_actual','suite_corpus_aislado','index','metrics','versions']},indent=2,ensure_ascii=False))
