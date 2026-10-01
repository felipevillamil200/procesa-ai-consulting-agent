"""Complemento de auditoría: invocado por ejecutar_auditoria.py, sin credenciales reales."""
import re,ast
from types import SimpleNamespace as NS
from reportlab.pdfgen import canvas
official={
 'PC-2025-014':('2025-02-03','2025-06-27',21,'Ing. Daniela Cevallos'),
 'PC-2025-027':('2025-07-07','2025-12-12',23,'Ing. Martín Aguirre'),
 'PC-2025-033':('2025-10-06','2026-02-27',21,'Ing. Martín Aguirre'),
 'PC-2026-006':('2026-03-02','2026-08-21',25,'Ing. Daniela Cevallos')}
results['campos_comparados']=[]
for f in results['fichas_generadas']:
    for field,expected in zip(['fecha_inicio','fecha_fin','duracion_semanas','gerente_proyecto'],official[f['codigo_proyecto']]):
        row={'project':f['codigo_proyecto'],'field':field,'expected':expected,'actual':f[field],'passed':expected==f[field]}
        results['campos_comparados'].append(row)
        check(f"PDF {f['codigo_proyecto']} {field}",expected,f[field],row['passed'])
expected_kpis={
 'PC-2025-014':[('12 días hábiles','5 días hábiles'),('34%','12%'),('85 solicitudes/analista/mes','124 solicitudes/analista/mes'),('3,2 / 5,0','4,1 / 5,0'),('18%','11%')],
 'PC-2025-027':[('58%','71%'),('95 min','38 min'),('64 h/mes','31 h/mes'),('6,0%','5,0%'),('72%','82%'),('86%','91%'),('94%','95%')],
 'PC-2025-033':[('52 min','39,5 min'),('14 min','6 min'),('0%','41%'),('22%','15%'),('18','37')],
 'PC-2026-006':[('9,5%','4,8%'),('38 días','31 días'),('0 de 3','0 de 3'),('4,1%','3,4%'),('78%','93%')]}
results['kpis_comparados']=[]
for f in results['fichas_generadas']:
    for i,pair in enumerate(expected_kpis[f['codigo_proyecto']]):
        k=f['kpis_impacto'][i];actual=(k['linea_base_antes'],k['resultado_despues'])
        row={'project':f['codigo_proyecto'],'indicator':k['indicador'],'expected':pair,'actual':actual,'passed':pair==actual}
        results['kpis_comparados'].append(row)
        check(f"KPI {f['codigo_proyecto']} {k['indicador']}",pair,actual,pair==actual)
# Arranque sin data: proceso aislado, base nueva, informes solo en extracted.
cold=WORK/'cold_start'
shutil.copytree(ROOT/'codigo/backend',cold/'codigo/backend')
(cold/'codigo/__init__.py').write_text('')
shutil.copytree(ROOT/'extracted',cold/'extracted')
env=dict(os.environ,PYTHONPATH=os.pathsep.join([str(DEPS),str(cold)]))
code="import json; from codigo.backend.database import DatabaseManager; from codigo.backend.config import RAW_REPORTS_DIR,FICHAS_DIR; from codigo.backend.rag import get_search_engine; d=DatabaseManager(); e=get_search_engine(); print(json.dumps({'rows':len(d.get_all_proyectos()),'pdfs':len(list(RAW_REPORTS_DIR.glob('*.pdf'))),'fichas':len(list(FICHAS_DIR.glob('*.json'))),'chunks':len(e.chunks),'max_chars':max(len(c.contenido) for c in e.chunks)}))"
proc=subprocess.run([PY,'-X','utf8','-c',code],cwd=cold,env=env,capture_output=True,text=True,encoding='utf8',timeout=30)
try: results['cold_start']=json.loads(proc.stdout.splitlines()[-1])
except Exception: results['cold_start']={'error':proc.stderr[-1000:],'exit':proc.returncode}
c=results['cold_start']; check('arranque_sin_data','4 DB/4 PDFs/4 fichas, chunks <=600',c,c.get('rows')==4 and c.get('pdfs')==4 and c.get('fichas')==4 and c.get('max_chars',999)>0 and c.get('max_chars',999)<=600)
# El caso base solo mira found_info. Aquí se comprueba el texto y la rama con tools.
original_openai=openai.OpenAI
class ProviderDouble:
    answers=[]; calls=[]
    def __init__(self,**kw): self.chat=NS(completions=NS(create=self.create))
    def create(self,**kw):
        self.calls.append(kw)
        return NS(choices=[NS(message=self.answers.pop(0))])
openai.OpenAI=ProviderDouble
os.environ['OPENAI_API_KEY']='qa-fake-key-no-network'
ProviderDouble.calls=[]
ProviderDouble.answers=[NS(tool_calls=None,content='PC-2025-014 ahorró 999 millones de USD.')]
resp=agent.ask('¿Cuál fue el ahorro monetario de Horizonte Andino?')
check('LLM_cita_sin_evidencia_texto','No presentar afirmación sin tools ni fuentes',resp.model_dump(),'999' not in resp.answer and not resp.found_info)
ProviderDouble.answers=[NS(tool_calls=[NS(id='qa1',function=NS(name='query_project_database',arguments=json.dumps({'sql_query':"SELECT * FROM proyectos WHERE codigo_proyecto='PC-2099-999'"})))]),NS(content='PC-2025-014 ahorró 999 millones de USD.')]
ProviderDouble.calls=[]
resp=agent.ask('¿Cuánto ahorró el proyecto inexistente PC-2099-999?')
check('LLM_tools_vacios_abstencion','No afirmar datos después de 0 filas',resp.model_dump(),not resp.found_info and '999 millones' not in resp.answer)
check('temperatura_inferencia','Todas las llamadas usan temperatura guardada 0.8',[x.get('temperature') for x in ProviderDouble.calls],bool(ProviderDouble.calls) and all(x.get('temperature')==0.8 for x in ProviderDouble.calls))
openai.OpenAI=original_openai
os.environ['OPENAI_API_KEY']=''
resp=agent._local_reasoning_engine('¿Cuál es el proyecto PC-2099-999?')
check('codigo_inexistente_abstencion','found_info=False y sin fuentes ajenas',resp.model_dump(),not resp.found_info and not resp.sources)
resp=agent._local_reasoning_engine('¿Qué proyectos tenemos en telecomunicaciones?')
check('sector_nuevo_abstencion','found_info=False, telecomunicaciones no está en corpus',resp.model_dump(),not resp.found_info)
resp=agent._local_reasoning_engine('¿Cuántos días de inventario tiene retail después del proyecto?')
check('retail_cantidad_no_monetaria','Responder 31 días con found_info=True',resp.model_dump(),resp.found_info and '31' in resp.answer)
resp=agent._local_reasoning_engine('¿Qué lecciones aprendidas tuvo PC-2025-027 sobre mandos medios?')
check('foco_codigo_preserva_intencion','Responder lecciones sobre supervisores, no solo ficha',resp.model_dump(),any(x in resp.answer.lower() for x in ['supervisores','reunión diaria','reunion diaria']))
# Fecha y rango config: contrato real, sin cambios en entorno de producción.
response=client.post('/api/config',json={'temperature':1.8})
check('temperatura_rango','422 fuera de 0..1',response.json(),response.status_code==422)
client.post('/api/config',json={'temperature':0.1})
source=(ROOT/'codigo/frontend/src/App.jsx').read_text(encoding='utf8')
check('frontend_evidence_chunks','App preserva res.evidence_chunks', 'evidence_chunks: res.evidence_chunks || []' in source, 'evidence_chunks: res.evidence_chunks || []' in source)
config_source=(ROOT/'codigo/frontend/src/components/ConfigModal.jsx').read_text(encoding='utf8')
api_source=(ROOT/'codigo/frontend/src/services/api.js').read_text(encoding='utf8')
check('frontend_envia_temperatura','Slider transmitido al backend',{'call':re.findall(r'onSaveConfig\([^\n]+',config_source),'service_has_temperature':'temperature' in api_source},'temperature' in api_source and bool(re.search(r'onSaveConfig\([^)]*temperature',config_source)))
# Parser no generaliza: basta con mencionar proyecto y término de reconocimiento.
fake_text='PC-2025-014. Este texto solo menciona una solicitud y no contiene cifras, gerentes ni fechas. '
f=extractor.extract_ficha_deterministic(fake_text,'mencion.pdf')
check('mencion_no_fabrica_ficha','No producir datos ausentes solo por código y palabra clave',f.model_dump(),f.duracion_semanas==0 and not f.gerente_proyecto)
for query in ['UPDATE proyectos SET cliente=\'x\'','SELECT 1; SELECT 2','ATTACH DATABASE \'qa.db\' AS other','SELECT load_extension(\'not_installed\')','WITH x AS (SELECT 1) SELECT * FROM x','SELECT 1 AS n;']:
    q=db.execute_read_query(query); readok=query in ['WITH x AS (SELECT 1) SELECT * FROM x','SELECT 1 AS n;']
    check('SQL ampliado '+query,'Permitida' if readok else 'Bloqueada',q,q['success']==readok)
q=db.execute_read_query("SELECT 'UPDATE' AS palabra")
check('SQL_literal_no_mutacion','Permitir literal sin mutación',q,q['success'])
# PDF nuevo real: no depende de nombre oficial ni de credenciales.
new=WORK/'nuevo_PC-2026-099.pdf'; cv=canvas.Canvas(str(new)); cv.drawString(30,800,'Informe PC-2026-099: Proyecto Omega, sector Tecnologia, periodo 2026-01-01 a 2026-01-29, 4 semanas.');cv.drawString(30,780,'Gerente Ana Perez. Objetivo: reducir espera. Resultado: 10 a 5 minutos.');cv.save()
res=client.post('/api/upload',files={'file':(new.name,new.read_bytes(),'application/pdf')})
body=res.json(); check('upload_proyecto_nuevo_persistido','Proyecto nuevo extraído y visible en SQLite',{'status':res.status_code,'proyecto':body.get('proyecto'),'codes':[p['codigo_proyecto'] for p in db.get_all_proyectos()]},res.status_code==200 and any(p['codigo_proyecto']=='PC-2026-099' for p in db.get_all_proyectos()))
res=client.post('/api/upload',files={'file':('fake_header.pdf',b'%PDF-1.7\n'+b'x'*100,'application/pdf')})
check('pdf_cabecera_sin_estructura','400 sin residuo',{'status':res.status_code,'exists':(config.RAW_REPORTS_DIR/'fake_header.pdf').exists()},res.status_code==400 and not (config.RAW_REPORTS_DIR/'fake_header.pdf').exists())
# Rutas del dist entregado, no se recicla el JSON de la auditoría anterior.
shutil.copytree(ROOT/'codigo/frontend/dist',WORK/'codigo/frontend/dist',dirs_exist_ok=True)
from fastapi.staticfiles import StaticFiles
client.app.mount('/app',StaticFiles(directory=str(WORK/'codigo/frontend/dist'),html=True),name='qa_frontend')
routes=[{'url':u,'status':client.get(u).status_code} for u in ['/app/','/app/inicio.html','/app/nival.html','/app/guia.html','/app/solucion.html','/inicio.html','/guia.html','/solucion.html','/images/procesa_brand_logo.jpg']]
results['routes']=routes
(OUT/'evidencia_rutas_ui.json').write_text(json.dumps(routes,indent=2),encoding='utf8')
for rt in routes: check('Ruta '+rt['url'],'200',rt['status'],rt['status']==200)
results['extra_metrics']={'passed':sum(c['passed'] for c in checks[27:]),'failed':sum(not c['passed'] for c in checks[27:]),'total':len(checks)-27}
