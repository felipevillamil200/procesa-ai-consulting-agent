"""Pruebas adicionales independientes de los 95 controles históricos, sin red."""
from types import SimpleNamespace as NS
from reportlab.pdfgen import canvas
start=len(checks)
results['metrics_95_originales']={'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'total':len(checks)}

# Un SELECT con filas no acredita hechos inventados por el sintetizador.
original_provider=openai.OpenAI
class NonemptyProvider:
    answers=[]
    def __init__(self,**kw): self.chat=NS(completions=NS(create=self.create))
    def create(self,**kw): return NS(choices=[NS(message=self.answers.pop(0))])
openai.OpenAI=NonemptyProvider
os.environ['OPENAI_API_KEY']='qa-fake-key-no-network'
for name,query in [('LLM_SQL_constante_no_es_evidencia','SELECT 1 AS n'),('LLM_SQL_real_no_valida_cifra',"SELECT codigo_proyecto,cliente FROM proyectos WHERE codigo_proyecto='PC-2025-014'")]:
    NonemptyProvider.answers=[NS(tool_calls=[NS(id='final1',function=NS(name='query_project_database',arguments=json.dumps({'sql_query':query})))]),NS(content='PC-2025-014 ahorró 999 millones de USD.')]
    response=agent.ask('¿Cuánto dinero ahorró Horizonte Andino?')
    check(name,'No aceptar ahorro 999 millones ausente de la evidencia',response.model_dump(),not response.found_info and '999 millones' not in response.answer)
openai.OpenAI=original_provider
os.environ['OPENAI_API_KEY']=''

# El nuevo proyecto ya cargado debe preservar los campos presentes, no solo su código.
new_row=next(p for p in db.get_all_proyectos() if p['codigo_proyecto']=='PC-2026-099')
for field,expected in [('cliente','Omega'),('sector','Tecnologia'),('fecha_inicio','2026-01-01'),('fecha_fin','2026-01-29'),('duracion_semanas',4),('gerente_proyecto','Ana Perez')]:
    check('PDF_nuevo_campo_'+field,expected,new_row[field],new_row[field]==expected)
new_kpis=json.loads(new_row['kpis_impacto'])
check('PDF_nuevo_KPI_preservado','Resultado textual 10 a 5 minutos persistido como KPI',new_kpis,any('10' in str(k.get('linea_base_antes','')) and '5' in str(k.get('resultado_despues','')) for k in new_kpis))
check('PDF_nuevo_JSON_SQL_identicos','JSON y SQLite contienen mismos valores',{'json_exists':(config.FICHAS_DIR/'PC-2026-099.json').exists()},json.loads((config.FICHAS_DIR/'PC-2026-099.json').read_text(encoding='utf8'))['duracion_semanas']==new_row['duracion_semanas'])

# Los acentos, etiquetas y código en el contenido no deben romper ingestión ni RAG.
text='Informe de cierre PC-2026-098. Cliente: Empresa Omega. Sector: Tecnología. Fecha inicio: 2026-01-01. Fecha fin: 2026-01-29. Duración: 4 semanas. Gerente: Ing. José Muñoz. Objetivo: reducir espera.'
parsed=extractor.extract_ficha_deterministic(text,'documento.pdf')
check('PDF_nuevo_etiquetas_y_acentos','Fechas y gerente presentes preservados',parsed.model_dump(),parsed.fecha_inicio=='2026-01-01' and parsed.fecha_fin=='2026-01-29' and 'José Muñoz' in parsed.gerente_proyecto)
pdf=WORK/'informe_neutro.pdf'; cv=canvas.Canvas(str(pdf));cv.drawString(30,800,'Informe PC-2026-097. Proyecto Sigma, sector Tecnologia, periodo 2026-01-01 a 2026-01-29, 4 semanas.');cv.drawString(30,780,'Gerente Ana Perez. Objetivo: reducir tiempo de respuesta.');cv.save()
res=client.post('/api/upload',files={'file':(pdf.name,pdf.read_bytes(),'application/pdf')})
hits=engine.search('tiempo respuesta',project_id='PC-2026-097')
check('PDF_codigo_en_contenido_RAG','Código del contenido visible en DB y recuperable en RAG',{'status':res.status_code,'proyecto':res.json().get('proyecto'),'hits':hits},res.status_code==200 and any(p['codigo_proyecto']=='PC-2026-097' for p in db.get_all_proyectos()) and bool(hits))

# Un punto y coma dentro de un literal sigue siendo una sola sentencia.
for query in ["SELECT 'uno;dos' AS texto", "SELECT 'DELETE;UPDATE' AS texto"]:
    response=db.execute_read_query(query)
    check('SQL_literal_punto_coma_'+query,'SELECT válido permitido',response,response['success'])

# Acceso fuera de images: se usa un marcador inofensivo, nunca credenciales.
public=WORK/'codigo/frontend/public';(public/'images').mkdir(parents=True,exist_ok=True)
sentinel=public/'qa_marcador.txt';sentinel.write_text('QA_MARCADOR_FUERA_IMAGES',encoding='utf8')
response=client.get('/images/..%2Fqa_marcador.txt')
check('images_path_traversal','403/404, no servir fuera de images',{'url':'/images/..%2Fqa_marcador.txt','status':response.status_code,'marker_returned':'QA_MARCADOR_FUERA_IMAGES' in response.text},response.status_code in [403,404] and 'QA_MARCADOR_FUERA_IMAGES' not in response.text)

for value in [-0.01,1.01,0.0,1.0]:
    response=client.post('/api/config',json={'temperature':value})
    expected=422 if value<0 or value>1 else 200
    check('temperatura_limite_'+str(value),expected,response.status_code,response.status_code==expected)
client.post('/api/config',json={'temperature':0.1})

html_proc=subprocess.run(['node',str(OUT/'validar_html.mjs')],cwd=ROOT,capture_output=True,text=True,encoding='utf8',timeout=20)
try: html_proof=json.loads(html_proc.stdout)
except Exception: html_proof={'error':html_proc.stderr,'exit_code':html_proc.returncode}
results['html_render']=html_proof
check('HTML_chat_sanitizado','Escapar/remover HTML y atributos ejecutables antes de dangerouslySetInnerHTML',html_proof,html_proof.get('escaped') is True)

results['final_metrics']={'passed':sum(x['passed'] for x in checks[start:]),'failed':sum(not x['passed'] for x in checks[start:]),'total':len(checks)-start}
results['final_checks']=checks[start:]
