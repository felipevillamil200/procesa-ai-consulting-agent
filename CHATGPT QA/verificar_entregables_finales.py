import json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
from pypdf import PdfReader
from PIL import Image,ImageOps,ImageDraw
OUT=Path(__file__).resolve().parent;ROOT=OUT.parent
r=json.loads((OUT/'evidencia_resultados.json').read_text(encoding='utf8'))
reader=PdfReader(OUT/'Reporte_Auditoria_QA_PROCESA.pdf'); texts=[p.extract_text() or '' for p in reader.pages]; text='\n'.join(texts)
assert r['metrics']=={'passed':106,'failed':9,'total':115}
assert r['metrics_95_originales']=={'passed':95,'failed':0,'total':95}
assert r['final_metrics']=={'passed':11,'failed':9,'total':20}
assert '75 / 100' in text and '106/115' in text and 'NO APROBADO' in text
assert len(texts)==17 and all(len(t)>100 for t in texts)
suite=[]
for name in ['suite_estado_actual','suite_corpus_aislado']:
    xml=ET.parse(OUT/(name+'.xml')).getroot(); suites=xml.findall('testsuite')
    suite.append({'name':name,'tests':sum(int(s.attrib['tests']) for s in suites),'failures':sum(int(s.attrib['failures']) for s in suites),'errors':sum(int(s.attrib['errors']) for s in suites)})
assert all(s['tests']==11 and s['failures']==s['errors']==0 for s in suite)
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
now={path:hashfile(ROOT/path) for path in r['source_manifest']}
assert now==r['source_manifest']
pages=sorted((OUT/'pdf_revision_final').glob('pagina-*.png'))
if pages:
    contact=Image.new('RGB',(4*220,((len(pages)+3)//4)*330),'#D9E1E8');draw=ImageDraw.Draw(contact)
    for i,path in enumerate(pages):
        thumb=ImageOps.contain(Image.open(path).convert('RGB'),(210,297)); x=(i%4)*220+5;y=(i//4)*330+5
        contact.paste(thumb,(x,y));draw.text((x,y+303),f'Página {i+1}',fill='#12304B')
    contact.save(OUT/'pdf_revision_final/contacto.png')
proof={'metrics':r['metrics'],'score':75,'verdict':'NO APROBADO PARA CERTIFICACIÓN DEL 100%','pdf_pages':len(texts),'pdf_text_integrity':True,'pytest_junit':suite,'source_manifest_reverified':True,'source_unchanged':r['source_unchanged'],'pdf_sha256':hashfile(OUT/'Reporte_Auditoria_QA_PROCESA.pdf'),'markdown_sha256':hashfile(OUT/'REPORTE_QA_EVALUACION_PROCESA.md'),'json_sha256':hashfile(OUT/'evidencia_resultados.json'),'visual_review_completed':False}
(OUT/'verificacion_final.json').write_text(json.dumps(proof,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps(proof,indent=2,ensure_ascii=False))
