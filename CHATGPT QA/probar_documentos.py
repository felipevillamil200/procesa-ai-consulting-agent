import os,sys,shutil,subprocess,json
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'CHATGPT QA'
WORK=OUT/('validacion_documentos_'+datetime.now(ZoneInfo('America/Bogota')).strftime('%Y%m%d_%H%M%S'))
for directory in ['codigo/backend','tests','extracted']:
    shutil.copytree(ROOT/directory,WORK/directory)
(WORK/'codigo/__init__.py').write_text('')
shutil.copy(ROOT/'pytest.ini',WORK/'pytest.ini')
env=dict(os.environ,PYTHONPATH=os.pathsep.join([str(OUT/'_deps'),str(WORK)]),GEMINI_API_KEY='',OPENAI_API_KEY='',LLM_PROVIDER='gemini',PYTHONUTF8='1',PYTHONDONTWRITEBYTECODE='1')
env.pop('PROCESA_DATA_DIR',None)
proc=subprocess.run([sys.executable,'-m','pytest','-v','--junitxml='+str(OUT/'suite_documentos.xml')],cwd=WORK,env=env,capture_output=True,text=True,encoding='utf8')
(OUT/'suite_documentos.log').write_text(proc.stdout+'\n'+proc.stderr,encoding='utf8')
(OUT/'suite_documentos_estado.json').write_text(json.dumps({'sandbox':str(WORK),'exit_code':proc.returncode,'timestamp':datetime.now(ZoneInfo('America/Bogota')).isoformat()},indent=2),encoding='utf8')
print(proc.stdout[-10000:]);print(proc.stderr[-2000:]);sys.exit(proc.returncode)
