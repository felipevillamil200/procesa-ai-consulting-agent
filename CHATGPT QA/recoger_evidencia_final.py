import json,sys,os,subprocess,hashlib,re
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
OUT=Path(__file__).resolve().parent;ROOT=OUT.parent
r=json.loads((OUT/'evidencia_resultados.json').read_text(encoding='utf8'))
work=Path(r['sandbox_path'])
env=dict(os.environ,PYTHONPATH=os.pathsep.join([str(OUT/'_deps'),str(work)]),GEMINI_API_KEY='',OPENAI_API_KEY='',LLM_PROVIDER='openai',PYTHONUTF8='1',PYTHONDONTWRITEBYTECODE='1')
cli=subprocess.run([sys.executable,'-m','codigo.backend.cli'],cwd=work,input='/salir\n',env=env,capture_output=True,text=True,encoding='utf8',timeout=30)
(OUT/'cli_final.log').write_text(cli.stdout+'\n'+cli.stderr,encoding='utf8')
r['cli_smoke']={'exit_code':cli.returncode,'command':'python -m codigo.backend.cli; entrada /salir','tail':cli.stdout[-1000:]}
build=OUT/'frontend-build-final'
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
build_info={'status':'PASS','timestamp_bogota':datetime.now(ZoneInfo('America/Bogota')).isoformat(),'command':'node node_modules/vite/bin/vite.js build --outDir ../../CHATGPT QA/frontend-build-final','details':'1602 módulos; build 10.40 s; JavaScript 370.41 kB (gzip 101.64); CSS 66.54 kB (gzip 11.06). Primera ejecución EPERM del sandbox; reintento permitido y exitoso.','outputs':{str(p.relative_to(build)):hashfile(p) for p in build.glob('assets/*')},'delivered_index_sha256':hashfile(ROOT/'codigo/frontend/dist/index.html'),'fresh_index_sha256':hashfile(build/'index.html')}
(OUT/'evidencia_build.json').write_text(json.dumps(build_info,indent=2,ensure_ascii=False),encoding='utf8')
r['build_final']=build_info
r['runtime_executable']=sys.executable
r['final_source_review']={'config_modal_hydrates_temperature':bool(re.search(r'(useState\(config\??\.temperature|setTemperature\(config\??\.temperature)',(ROOT/'codigo/frontend/src/components/ConfigModal.jsx').read_text(encoding='utf8'))),'chroma_or_vector_search_implemented':False,'sql_timeout_enforced':False,'images_containment_enforced':False,'live_llm_calls':0,'browser_xss_execution_tested':False,'technical_demo_video_certified':False}
(OUT/'evidencia_resultados.json').write_text(json.dumps(r,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({'cli_exit':cli.returncode,'metrics':r['metrics'],'source_unchanged':r['source_unchanged']},indent=2))
