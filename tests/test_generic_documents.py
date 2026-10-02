"""Integración de PDFs heterogéneos, identidad, aislamiento y contratos Gemini sin red."""
import io
import json
import httpx
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
    ficha=next(f for f in app.client.get('/api/fichas').json()['fichas'] if f['codigo_proyecto']==ident)
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

@pytest.mark.parametrize('kind',['fake_quote','wrong_source','wrong_page','empty_answer'])
def test_gemini_unsupported_answer_rejected(app,monkeypatch,kind):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL A PAGAR: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    quote='TOTAL A PAGAR: USD 23.00'
    answer=GroundedAnswer(answer='El total es USD 23.',found_info=True,citations=[{'document_id':ident,'page_number':1,'quote':quote}])
    if kind=='fake_quote': answer.citations[0].quote='TOTAL A PAGAR: USD 999.00'
    if kind=='wrong_source': answer.citations[0].document_id='DOC-0000000000000000'
    if kind=='wrong_page': answer.citations[0].page_number=2
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
        return SimpleNamespace(is_success=True,status_code=200,json=lambda:{'candidates':[{'content':{'parts':[{'text':json.dumps(body)}]}}]})
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

def test_invalid_pdf_does_not_persist(app):
    response=app.client.post('/api/upload',files={'file':('factura.pdf',b'%PDF-1.7\n'+b'bad'*100,'application/pdf')})
    assert response.status_code in (400,422)
    assert not app.store.list() and not list(app.store.reports_dir.glob('*.pdf'))

def test_provider_failure_preserves_readable_text(app,monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    def fail(*args): raise ValueError('Provider unavailable (HTTP 503)')
    monkeypatch.setattr(documents,'gemini_json',fail)
    import pytest
    with pytest.raises(ValueError, match='No se pudo procesar el documento'):
        app.store.ingest(pdf(['FACTURA SERVICIOS','TOTAL A PAGAR: USD 23.00']), 'factura.pdf')
    assert len(app.store.list()) == 0

def test_mixed_text_and_visual_page_keeps_both(app,monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    data=pdf(['CONTRATO DE SERVICIOS','Objeto: Servicio de internet'],[])
    output=ExtractedDocument(title='Contrato',document_type='contrato',pages=[{'page_number':1,'text':'NO DEBE REEMPLAZAR TEXTO ORIGINAL'},{'page_number':2,'text':'CONDICIONES ESCANEADAS\nPlazo: 12 meses'}])
    monkeypatch.setattr(documents,'gemini_json',lambda *args:output)
    ident=upload(app,data)
    record=app.store.get(ident)
    assert 'Servicio de internet' in record['pages'][0]['text']
    assert 'Plazo: 12 meses' in record['pages'][1]['text']

def test_field_not_supported_by_quote_is_discarded(app,monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    output=ExtractedDocument(title='Factura',document_type='factura',pages=[{'page_number':1,'text':'FACTURA SERVICIOS\nTOTAL: USD 23.00'}],fields=[{'name':'Total','value':'USD 999.00','page_number':1,'quote':'TOTAL: USD 23.00'}])
    monkeypatch.setattr(documents,'gemini_json',lambda *args:output)
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL: USD 23.00']))
    assert not app.store.get(ident)['fields']

def test_summary_includes_final_page(app):
    ident=upload(app,pdf(*[['MANUAL DE OPERACIONES',f'Seccion: {i}'] for i in range(1,7)],['ANEXO FINAL','Requisito: Apagar equipo al terminar']))
    result=ask(app,'Resume el documento',ident)
    assert result['found_info'] and 'Apagar equipo' in result['answer'] and 'Pág. 7' in result['answer']

def test_valid_model_answer_can_name_source_identifier(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(answer=f'El total de {ident} es USD 23.00.',found_info=True,citations=[{'document_id':ident,'page_number':1,'quote':'TOTAL: USD 23.00'}]))
    assert ask(app,'¿Cuál es el total?',ident)['found_info']

def test_gemini_retries_temporary_provider_errors(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setenv('LLM_MODEL','gemini-qa-model')
    responses=[httpx.Response(503),httpx.Response(200,json={'candidates':[{'content':{'parts':[{'text':json.dumps({'answer':'No hay información.','found_info':False,'citations':[]})}]}}]})]
    calls=[]
    def post(*args,**kwargs):
        calls.append(1);return responses.pop(0)
    monkeypatch.setattr(documents.httpx,'post',post)
    monkeypatch.setattr(documents.time,'sleep',lambda _:None)
    result=documents.gemini_json('Pregunta',GroundedAnswer)
    assert not result.found_info and len(calls)==2

def test_provider_diagnostic_does_not_expose_sensitive_error_details():
    exc=ValueError('Gemini failed HTTP 429; key=private-secret')
    message=documents.provider_error_reason(exc)
    assert '429' in message and 'cuota' in message and 'private-secret' not in message

def test_openai_text_ingestion_does_not_send_pdf_images(app,monkeypatch):
    monkeypatch.setenv('LLM_PROVIDER','openai');monkeypatch.setenv('OPENAI_API_KEY','qa-fake-key')
    calls=[]
    def read(prompt,schema,data=None):
        calls.append(data)
        return ExtractedDocument(title='Factura',document_type='factura',summary='Factura de servicios',fields=[],pages=[])
    monkeypatch.setattr(documents,'openai_json',read)
    ident=upload(app,pdf(['FACTURA SERVICIOS','Total: USD 23.00']))
    assert calls==[None] and app.store.get(ident)['extraction_method']=='openai_text'
    assert '23.00' in app.store.get(ident)['pages'][0]['text']

def test_openai_scan_ingestion_and_chat(app,monkeypatch):
    monkeypatch.setenv('LLM_PROVIDER','openai');monkeypatch.setenv('OPENAI_API_KEY','qa-fake-key')
    calls=[]
    def read(prompt,schema,data=None):
        calls.append(data)
        return ExtractedDocument(title='Factura escaneada',document_type='factura',summary='Factura',fields=[],
                                 pages=[{'page_number':1,'text':'FACTURA ESCANEADA\nTotal: USD 47.80'}] if data else [])
    monkeypatch.setattr(documents,'openai_json',read)
    ident=upload(app,pdf([]))
    assert calls[0].startswith(b'%PDF') and calls[1] is None
    assert app.store.get(ident)['extraction_method']=='openai_pdf'
    monkeypatch.setattr(document_chat,'openai_json',lambda *args:GroundedAnswer(answer='El total es USD 47.80.',found_info=True,citations=[{'document_id':ident,'page_number':1,'quote':'Total: USD 47.80'}]))
    result=ask(app,'¿Cuál es el total?',ident)
    assert result['found_info'] and result['sources']==[ident]

def test_openai_mixed_pdf_only_sends_page_without_text(app,monkeypatch):
    monkeypatch.setenv('LLM_PROVIDER','openai');monkeypatch.setenv('OPENAI_API_KEY','qa-fake-key')
    def read(prompt,schema,data=None):
        if data:
            assert len(PdfReader(io.BytesIO(data)).pages)==1
            assert 'páginas originales [2]' in prompt
        return ExtractedDocument(title='Contrato',document_type='contrato',pages=[{'page_number':2,'text':'Plazo: 12 meses'}] if data else [])
    monkeypatch.setattr(documents,'openai_json',read)
    ident=upload(app,pdf(['CONTRATO\nObjeto: Servicio de internet'],[]))
    assert app.store.get(ident)['extraction_method']=='openai_mixed'
    assert 'internet' in app.store.get(ident)['pages'][0]['text'] and '12 meses' in app.store.get(ident)['pages'][1]['text']

def test_native_openai_request_schema_pdf_and_temperature(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY','qa-fake-key');monkeypatch.setenv('LLM_MODEL','gpt-4o-mini');monkeypatch.setenv('LLM_TEMPERATURE','0.2')
    payloads=[]
    def post(url,**kwargs):
        assert url=='https://api.openai.com/v1/chat/completions'
        payloads.append(kwargs['json'])
        body={'title':'Documento','document_type':'documento','summary':'','fields':[],'pages':[]}
        return httpx.Response(200,json={'choices':[{'finish_reason':'stop','message':{'content':json.dumps(body)}}]})
    monkeypatch.setattr(documents.httpx,'post',post)
    documents.openai_json('Lee el PDF',ExtractedDocument,b'%PDF-qa')
    payload=payloads[0];schema=payload['response_format']['json_schema']['schema']
    assert payload['model']=='gpt-4o-mini' and payload['temperature']==0.2
    assert payload['messages'][0]['content'][1]['file']['file_data'].startswith('data:application/pdf;base64,')
    assert schema['additionalProperties'] is False and set(schema['required'])==set(schema['properties'])
    assert all(d.get('additionalProperties') is False for d in schema['$defs'].values())

def test_openai_refusal_is_not_success(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY','qa-fake-key')
    monkeypatch.setattr(documents.httpx,'post',lambda *args,**kwargs:httpx.Response(200,json={'choices':[{'finish_reason':'stop','message':{'refusal':'Cannot read'}}]}))
    with pytest.raises(ValueError,match='verificable'):documents.openai_json('Lee',ExtractedDocument)

def test_config_does_not_report_gemini_key_as_openai_key(app,monkeypatch):
    monkeypatch.setenv('LLM_PROVIDER','openai');monkeypatch.setenv('GEMINI_API_KEY','qa-gemini-key');monkeypatch.setenv('OPENAI_API_KEY','')
    assert app.client.get('/api/config').json()['has_api_key'] is False

def test_numbered_comparison_preserves_grounding(app,monkeypatch):
    one=upload(app,pdf(['FACTURA UNO','TOTAL: USD 23.00']))
    two=upload(app,pdf(['FACTURA DOS','TOTAL: USD 91.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(
        answer='1. Primera factura: USD 23.00.\n2. Segunda factura: USD 91.00.',found_info=True,
        citations=[{'document_id':one,'page_number':1,'quote':'TOTAL: USD 23.00'},
                   {'document_id':two,'page_number':1,'quote':'TOTAL: USD 91.00'}]))
    result=ask(app,'Compara los totales',one,two)
    assert result['found_info'] and set(result['sources'])=={one,two}

def test_amount_can_change_locale_but_not_value(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL: USD 81,000.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    def answer(value):
        return GroundedAnswer(answer=f'El total es USD {value}.',found_info=True,
            citations=[{'document_id':ident,'page_number':1,'quote':'TOTAL: USD 81,000.00'}])
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:answer('81.000,00'))
    res = ask(app,'Cuál es el total',ident)
    assert res['found_info'] and res['sources'] == [ident]

def test_quote_across_chunks_verified_against_same_original_page(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','Concepto: Servicio de internet','TOTAL: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    original=app.store.get(ident)['pages'][0]['text']
    monkeypatch.setattr(app.engine,'search',lambda *args,**kwargs:[
        {'codigo_proyecto':ident,'pagina':1,'contenido':'Concepto: Servicio de internet'},
        {'codigo_proyecto':ident,'pagina':1,'contenido':'TOTAL: USD 23.00'}])
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(
        answer='El total es USD 23.00.',found_info=True,
        citations=[{'document_id':ident,'page_number':1,'quote':original.strip()}]))
    assert ask(app,'Cuál es el total',ident)['found_info']

def test_invalid_summary_shows_original_text_without_invented_amount(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(
        answer='El total es USD 999.00.',found_info=True,
        citations=[{'document_id':ident,'page_number':1,'quote':'TOTAL: USD 999.00'}]))
    result=ask(app,'Qué contiene este documento',ident)
    assert result['found_info'] and '23.00' in result['answer'] and '999' not in result['answer']
    assert 'extractos literales' in result['answer'] and result['sources']==[ident]

def test_invoice_missing_lessons_explains_document_type(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','TOTAL: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(answer='No hay lecciones.',found_info=False,citations=[]))
    result=ask(app,'Cuáles son las lecciones aprendidas',ident)
    assert not result['found_info'] and 'es una factura' in result['answer'] and 'consultar el total' in result['answer']

def test_render_does_not_claim_persistence_without_explicit_configuration(app,monkeypatch):
    monkeypatch.setenv('RENDER','true');monkeypatch.delenv('PROCESA_PERSISTENT_STORAGE',raising=False)
    assert app.client.get('/api/config').json()['storage_persistent'] is False

def test_summary_completes_date_citation_from_retrieved_source(app,monkeypatch):
    ident=upload(app,pdf(['FACTURA SERVICIOS','Fecha: 02/06/2026','TOTAL: USD 23.00']))
    monkeypatch.setenv('GEMINI_API_KEY','qa-fake-key')
    monkeypatch.setattr(document_chat,'gemini_json',lambda *args:GroundedAnswer(
        answer='Factura del 02 de junio de 2026 por USD 23.00.',found_info=True,
        citations=[{'document_id':ident,'page_number':1,'quote':'TOTAL: USD 23.00'}]))
    result=ask(app,'Qué contiene el documento',ident)
    assert result['found_info'] and 'extractos literales' not in result['answer']
    assert 'Fecha: 02/06/2026' in result['answer']

def test_bold_numbered_lists_are_formatting():
    assert document_chat.number_tokens('**1. Factura**: USD 23.00.\n## 2. Otra: USD 91.00.',answer=True)=={'23','91'}
