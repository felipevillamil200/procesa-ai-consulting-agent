"""Integración de PDFs heterogéneos, identidad, aislamiento y contratos Gemini sin red."""
import io
import json
from types import SimpleNamespace
import pytest
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
from fastapi.testclient import TestClient
from codigo.backend import main, documents, document_chat
from codigo.backend.documents import DocumentStore, ExtractedDocument, GroundedAnswer
from codigo.backend.database import DatabaseManager
from codigo.backend.rag import DocumentSearchEngine
from codigo.backend.agent import ConsultorAgent

def pdf(*pages):
    data=io.BytesIO(); c=canvas.Canvas(data)
    for lines in pages:
        for i,line in enumerate(lines): c.drawString(35,800-i*22,line)
        c.showPage()
    c.save(); return data.getvalue()

@pytest.fixture
def app(tmp_path,monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','');monkeypatch.setenv('OPENAI_API_KEY','');monkeypatch.setenv('LLM_PROVIDER','gemini')
    db=DatabaseManager(tmp_path/'test.db',auto_seed=False)
    store=DocumentStore(db.db_path,tmp_path/'pdfs')
    engine=DocumentSearchEngine(store.reports_dir,db.db_path)
    agent=ConsultorAgent(db);agent.search_engine=engine
    monkeypatch.setattr(main,'db_manager',db);monkeypatch.setattr(main,'document_store',store);monkeypatch.setattr(main,'agent',agent)
    # El código de upload valida el directorio de configuración, pero guarda solo vía catálogo.
    return SimpleNamespace(client=TestClient(main.app),store=store,engine=engine,agent=agent,db=db)

def upload(app,data,name='archivo.pdf'):
    response=app.client.post('/api/upload',files={'file':(name,data,'application/pdf')})
    assert response.status_code==200,response.text
    return response.json()['documento']['document_id']

def ask(app,q,*ids):
    return app.client.post('/api/chat',json={'question':q,'document_ids':list(ids)}).json()

def test_invoice_is_not_a_project(app):
    ident=upload(app,pdf(['FACTURA TELEFONIA','Proveedor: Operadora Ejemplo','TOTAL A PAGAR: USD 23.00']),name='ad09004201220072622380266.pdf')
    ficha=app.client.get('/api/fichas').json()['fichas'][0]
    assert ficha['duracion_semanas'] is None and ficha['tipo_documento']=='factura'
    assert not app.db.get_all_proyectos()
    response=ask(app,'¿Cuál es el total a pagar?',ident)
    assert response['found_info'] and '23.00' in response['answer'] and 'semanas' not in response['answer']
    assert response['sources']==[ident] and response['evidence_chunks'][0]['codigo_proyecto']==ident

def test_contract_unknown_sector_and_page_two(app):
    ident=upload(app,pdf(['CONTRATO DE TELECOMUNICACIONES','Objeto: Servicio de internet'],['CONDICIONES DEL SERVICIO','Plazo: 12 meses','Penalidad: USD 50.00']))
    response=ask(app,'¿Cuál es el plazo del contrato de telecomunicaciones?',ident)
    assert response['found_info'] and '12 meses' in response['answer'] and 'Pág. 2' in response['answer']

def test_missing_fact_abstains(app):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL A PAGAR: USD 23.00']))
    response=ask(app,'¿Cuál es la contraseña secreta del banco?',ident)
    assert not response['found_info'] and not response['sources']

def test_two_files_same_name_are_isolated(app):
    one=upload(app,pdf(['FACTURA EMPRESA UNO','TOTAL A PAGAR: USD 23.00']))
    two=upload(app,pdf(['FACTURA EMPRESA DOS','TOTAL A PAGAR: USD 91.00']))
    assert one!=two and len(app.store.list())==2
    response=ask(app,'¿Cuál es el total a pagar?',one)
    assert '23.00' in response['answer'] and '91.00' not in response['answer'] and response['sources']==[one]
    both=ask(app,'Compara los totales de ambas facturas',one,two)
    assert both['found_info'] and set(both['sources'])=={one,two}
    assert '23.00' in both['answer'] and '91.00' in both['answer']

def test_duplicate_is_idempotent_and_survives_reload(app):
    data=pdf(['MANUAL DE OPERACIONES','Instruccion: Revisar equipos antes del encendido'])
    first=upload(app,data,'manual.pdf');second=upload(app,data,'renombrado.pdf')
    assert first==second and len(app.store.list())==1
    fresh=DocumentSearchEngine(app.store.reports_dir,app.db.db_path)
    assert fresh.search('equipos encendido',project_id=first)
    assert app.client.get('/api/pdf/'+first).content==data
    preview=app.client.get('/api/proyectos/'+first+'/preview').json()
    assert preview['filename']=='manual.pdf' and preview['pages'][0]['page_number']==1

def test_delete_does_not_touch_other_file(app):
    one=upload(app,pdf(['FACTURA UNO','TOTAL: USD 1.00']))
    two=upload(app,pdf(['FACTURA DOS','TOTAL: USD 2.00']))
    assert app.client.delete('/api/proyectos/'+one).json()['deleted']
    assert app.client.get('/api/pdf/'+one).status_code==404
    assert app.client.get('/api/pdf/'+two).status_code==200
    assert not app.engine.search('TOTAL',project_id=one)

def test_unknown_id_does_not_use_other_document(app):
    ident=upload(app,pdf(['FACTURA UNO','TOTAL A PAGAR: USD 23.00']))
    response=ask(app,'¿Qué contiene?','DOC-0000000000000000',ident)
    assert not response['found_info'] and not response['sources']

def test_scan_requires_visual_or_ocr(app):
    writer=PdfWriter();writer.add_blank_page(width=600,height=800);buffer=io.BytesIO();writer.write(buffer)
    response=app.client.post('/api/upload',files={'file':('escaneado.pdf',buffer.getvalue(),'application/pdf')})
    assert response.status_code==422 and 'OCR' in response.json()['detail']
    assert not app.store.list() and not list(app.store.reports_dir.glob('*.pdf'))

def test_visual_scan_and_gemini_grounded_answer(app,monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key');monkeypatch.setenv('LLM_MODEL','gemini-qa-model')
    writer=PdfWriter();writer.add_blank_page(width=600,height=800);buffer=io.BytesIO();writer.write(buffer)
    extracted=ExtractedDocument(title='Factura escaneada',document_type='factura',summary='Factura de servicios',pages=[{'page_number':1,'text':'FACTURA SERVICIOS\nTOTAL A PAGAR: USD 23.00'}],fields=[{'name':'Total','value':'USD 23.00','page_number':1,'quote':'TOTAL A PAGAR: USD 23.00'}])
    calls=[]
    def extract(prompt,schema,pdf_bytes):
        calls.append(pdf_bytes);return extracted
    monkeypatch.setattr(documents,'gemini_json',extract)
    ident=upload(app,buffer.getvalue())
    assert calls and calls[0].startswith(b'%PDF')
    assert app.store.get(ident)['extraction_method']=='gemini_pdf'
    def synth(prompt,schema):
        assert ident in prompt and 'USD 23.00' in prompt
        return GroundedAnswer(answer='El total es USD 23.',found_info=True,citations=[{'document_id':ident,'page_number':1,'quote':'TOTAL A PAGAR: USD 23.00'}])
    monkeypatch.setattr(document_chat,'gemini_json',synth)
    response=ask(app,'¿Cuál es el total?',ident)
    assert response['found_info'] and response['sources']==[ident]

@pytest.mark.parametrize('kind',['fake_quote','wrong_source','wrong_page','fake_amount','empty_answer'])
def test_gemini_unsupported_answer_rejected(app,monkeypatch,kind):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL A PAGAR: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    quote='TOTAL A PAGAR: USD 23.00'
    answer=GroundedAnswer(answer='El total es USD 23.',found_info=True,citations=[{'document_id':ident,'page_number':1,'quote':quote}])
    if kind=='fake_quote': answer.citations[0].quote='TOTAL A PAGAR: USD 999.00'
    if kind=='wrong_source': answer.citations[0].document_id='DOC-0000000000000000'
    if kind=='wrong_page': answer.citations[0].page_number=2
    if kind=='fake_amount': answer.answer='El total es USD 999.'
    if kind=='empty_answer': answer.answer=''
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:answer)
    result=ask(app,'¿Cuál es el total?',ident)
    assert not result['found_info'] and not result['sources']

def test_native_gemini_pdf_request_has_schema_and_temperature(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key');monkeypatch.setenv('LLM_MODEL','gemini-qa-model');monkeypatch.setenv('LLM_TEMPERATURE','0.8')
    captured={}
    def post(url,**kwargs):
        captured.update(kwargs)
        body={'title':'Documento','document_type':'documento','summary':'','fields':[],'pages':[{'page_number':1,'text':'Texto del documento de ejemplo.'}]}
        return SimpleNamespace(is_success=True,json=lambda:{'candidates':[{'content':{'parts':[{'text':json.dumps(body)}]}}]})
    monkeypatch.setattr(documents.httpx,'post',post)
    parsed=documents.gemini_json('Lee este PDF',ExtractedDocument,b'%PDF-qa')
    assert parsed.pages[0].page_number==1
    assert captured['json']['generationConfig']['temperature']==0.8
    assert captured['json']['generationConfig']['responseJsonSchema']
    assert captured['json']['contents'][0]['parts'][1]['inline_data']['mime_type']=='application/pdf'

def test_neutral_filename_migration_has_consistent_id(app):
    path=app.store.reports_dir/'documento_sin_codigo.pdf';path.write_bytes(pdf(['FACTURA EJEMPLO','TOTAL A PAGAR: USD 47.00']))
    app.engine.reload_index(); migrated=app.store.by_filename(path.name)
    assert migrated and app.engine.search('total pagar',project_id=migrated['document_id'])

def test_path_name_does_not_escape_storage(app,tmp_path):
    ident=upload(app,pdf(['MANUAL DE USO','Instruccion: Revisar todos los equipos']),name='../escape.pdf')
    assert app.store.get(ident)['filename']=='escape.pdf'
    assert not (tmp_path/'escape.pdf').exists()
