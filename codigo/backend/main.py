"""
Servidor API REST con FastAPI - Procesa Consultores.
Expone el agente de IA, base de datos SQLite y fichas de proyectos para el Frontend.
"""

import json
import sys
from pathlib import Path

# Asegurar que el directorio raíz y backend estén en sys.path
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent.parent

for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

from codigo.backend.agent import ConsultorAgent
from codigo.backend.database import DatabaseManager
from codigo.backend.config import FICHAS_DIR, BASE_DIR


app = FastAPI(
    title="Procesa Consultores - API Agente IA",
    description="API REST para consulta de proyectos históricos con SQL Relacional y RAG Documental",
    version="1.0.0"
)

# Configuración de CORS para permitir peticiones desde cualquier frontend (React/Vite/Browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancias compartidas
db_manager = DatabaseManager()
agent = ConsultorAgent(db_manager=db_manager)
from codigo.backend.documents import DocumentStore, MAX_PDF_BYTES
document_store = DocumentStore(db_manager.db_path)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Endpoint de comprobación de salud del sistema."""
    return {"status": "ok", "service": "procesa-consultores-api", "version": "1.0.0"}


# Schemas de Request y Response
class ChatRequest(BaseModel):
    question: str = Field(..., description="Pregunta del usuario en lenguaje natural")
    history: Optional[List[Dict[str, str]]] = Field(default=None, description="Historial previo de mensajes")
    document_ids: Optional[List[str]] = Field(default=None, max_length=20, description="Identificadores exactos de documentos seleccionados")
    api_key: Optional[str] = Field(default=None, description="Clave de API opcional enviada por el cliente")
    provider: Optional[str] = Field(default=None, description="Proveedor opcional (openai/gemini)")
    model: Optional[str] = Field(default=None, description="Modelo LLM opcional")


class SQLRequest(BaseModel):
    query: str = Field(..., description="Consulta SQL SELECT")


class ConfigUpdateRequest(BaseModel):
    api_key: Optional[str] = Field(default=None, description="Clave de Google Gemini o OpenAI API")
    model: Optional[str] = Field(default=None, description="Nombre del modelo LLM")
    provider: Optional[str] = Field(default=None, description="Proveedor LLM (gemini/openai)")
    temperature: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Temperatura de muestreo (0.0 a 1.0)")


@app.get("/health")
def health_check():
    """Estado de salud de la API."""
    return {"status": "ok", "service": "Procesa Consultores IA Backend"}


@app.get("/api/config")
@app.get("/config")
def get_config():
    """Retorna la configuración activa del LLM, temperatura y estado de la API Key."""
    import os
    from codigo.backend.config import GEMINI_API_KEY, OPENAI_API_KEY, LLM_MODEL, LLM_PROVIDER
    active_prov = os.getenv("LLM_PROVIDER", LLM_PROVIDER)
    gem_env = os.environ.get("GEMINI_API_KEY") if "GEMINI_API_KEY" in os.environ else GEMINI_API_KEY
    oai_env = os.environ.get("OPENAI_API_KEY") if "OPENAI_API_KEY" in os.environ else OPENAI_API_KEY
    
    current_key = (oai_env if active_prov == "openai" else gem_env) or ""
    current_key = (current_key or "").strip()

    masked = f"{current_key[:6]}...{current_key[-4:]}" if len(current_key) > 10 else ("Configurada" if current_key else "No configurada")
    return {
        "success": True,
        "provider": active_prov,
        "backend_available": True,
        "storage_persistent": True,
        "model": os.getenv("LLM_MODEL", LLM_MODEL),
        "temperature": float(os.getenv("LLM_TEMPERATURE", "0.1")),
        "has_api_key": bool(current_key),
        "gemini_api_key_set": bool(gem_env and gem_env.strip()),
        "openai_api_key_set": bool(oai_env and oai_env.strip()),
        "masked_key": masked
    }


@app.post("/api/config")
@app.post("/config")
def update_config(req: ConfigUpdateRequest):
    """Actualiza en memoria la clave de API, modelo LLM o temperatura con validación de rango."""
    import os
    if req.provider and req.provider.strip():
        os.environ["LLM_PROVIDER"] = req.provider.strip()
    if req.model and req.model.strip():
        os.environ["LLM_MODEL"] = req.model.strip()
    if req.temperature is not None:
        os.environ["LLM_TEMPERATURE"] = str(req.temperature)

    active_provider = os.getenv("LLM_PROVIDER", "openai")
    if req.api_key is not None:
        clean_key = req.api_key.strip()
        if clean_key == "__DELETE__" or clean_key == "":
            if active_provider == "openai":
                os.environ["OPENAI_API_KEY"] = ""
            else:
                os.environ["GEMINI_API_KEY"] = ""
        else:
            if active_provider == "openai" or (req.provider == "openai") or clean_key.startswith("sk-"):
                os.environ["OPENAI_API_KEY"] = clean_key
                os.environ["LLM_PROVIDER"] = "openai"
                if not req.model:
                    os.environ["LLM_MODEL"] = "gpt-4o-mini"
            else:
                os.environ["GEMINI_API_KEY"] = clean_key
                os.environ["LLM_PROVIDER"] = "gemini"
                if not req.model:
                    os.environ["LLM_MODEL"] = "gemini-flash-latest"

    return {
        "success": True,
        "message": "Configuración actualizada correctamente",
        "provider": os.getenv("LLM_PROVIDER"),
        "model": os.getenv("LLM_MODEL"),
        "temperature": float(os.getenv("LLM_TEMPERATURE", "0.1"))
    }


@app.delete("/api/config/key")
@app.delete("/api/config")
@app.delete("/config/key")
@app.delete("/config")
def delete_api_key():
    """Elimina la clave de API activa en memoria para volver al modo local/offline."""
    import os
    os.environ["GEMINI_API_KEY"] = ""
    os.environ["OPENAI_API_KEY"] = ""
    return {"success": True, "message": "Clave de API eliminada correctamente. Modo local activado.", "has_api_key": False}



@app.post("/api/chat")
@app.post("/chat")
def chat_with_agent(req: ChatRequest):
    """
    Envía una pregunta al Agente de IA.
    Ejecuta el ciclo de razonamiento (SQL + RAG) y retorna respuesta con citas, trazabilidad y fragmentos de evidencia.
    """
    try:
        import os
        if req.api_key and req.api_key.strip():
            k = req.api_key.strip()
            if (req.provider == "openai") or k.startswith("sk-"):
                os.environ["OPENAI_API_KEY"] = k
                os.environ["LLM_PROVIDER"] = "openai"
            else:
                os.environ["GEMINI_API_KEY"] = k
                os.environ["LLM_PROVIDER"] = "gemini"
        if req.provider and req.provider.strip():
            os.environ["LLM_PROVIDER"] = req.provider.strip()
        if req.model and req.model.strip():
            os.environ["LLM_MODEL"] = req.model.strip()

        response = agent.ask(req.question, chat_history=req.history, document_ids=req.document_ids)
        return {
            "success": True,
            "answer": response.answer,
            "tools_used": [t.model_dump() for t in response.tools_used],
            "sources": response.sources,
            "found_info": response.found_info,
            "evidence_chunks": response.evidence_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/proyectos/{codigo_proyecto}/preview")
@app.get("/proyectos/{codigo_proyecto}/preview")
def get_project_document_preview(codigo_proyecto: str):
    """
    Retorna el visor completo del informe PDF (páginas extraídas, texto original y fragmentos RAG)
    para la verificación de citas en pantalla dividida.
    """
    preview = agent.search_engine.get_document_preview(codigo_proyecto)
    if not preview:
        # Intentar obtener ficha técnica estructurada como respaldo
        ficha_path = FICHAS_DIR / f"{codigo_proyecto}.json"
        if ficha_path.exists():
            with open(ficha_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {
                "success": True,
                "codigo_proyecto": codigo_proyecto,
                "cliente": data.get("cliente", ""),
                "filename": f"{codigo_proyecto}.pdf",
                "total_pages": 1,
                "pages": [{"page_number": 1, "text": json.dumps(data, ensure_ascii=False, indent=2)}],
                "chunks": []
            }
        raise HTTPException(status_code=404, detail=f"Documento no encontrado para el proyecto {codigo_proyecto}")
    return {"success": True, **preview}


@app.get("/api/pdf/{codigo_proyecto}")
@app.get("/pdf/{codigo_proyecto}")
def get_project_pdf_file(codigo_proyecto: str):
    """
    Sirve directamente el archivo PDF físico original para renderizado embebido en el Visor de Evidencia.
    """
    from codigo.backend.config import RAW_REPORTS_DIR
    document = document_store.get(codigo_proyecto)
    if document:
        target = document_store.pdf_path(document)
        if not target.exists():
            raise HTTPException(status_code=404, detail='Archivo no disponible.')
        return FileResponse(target,media_type='application/pdf',filename=document['filename'],headers={'Content-Disposition':'inline'})
    code_clean = codigo_proyecto.strip().upper()
    pdf_files = list(RAW_REPORTS_DIR.glob("*.pdf"))

    target_pdf = None
    for pdf in pdf_files:
        if code_clean in pdf.name.upper():
            target_pdf = pdf
            break

    if not target_pdf and pdf_files:
        for pdf in pdf_files:
            c, _ = agent.search_engine._extract_project_metadata(pdf.name)
            if c.upper() == code_clean:
                target_pdf = pdf
                break

    if not target_pdf or not target_pdf.exists():
        raise HTTPException(status_code=404, detail=f"Archivo PDF para {codigo_proyecto} no encontrado.")

    return FileResponse(
        path=str(target_pdf),
        media_type="application/pdf",
        filename=target_pdf.name,
        headers={"Content-Disposition": f"inline; filename={target_pdf.name}"}
    )


@app.get("/api/proyectos")
@app.get("/proyectos")
def get_all_projects():
    """Obtiene la lista de todos los proyectos registrados en la base de datos SQLite."""
    proyectos = db_manager.get_all_proyectos()
    formatted = []
    for p in proyectos:
        item = dict(p)
        for json_col in ["equipo_consultor", "metodologias_herramientas", "kpis_impacto", "principales_hitos", "lecciones_aprendidas", "factores_riesgo"]:
            if item.get(json_col) and isinstance(item[json_col], str):
                try:
                    item[json_col] = json.loads(item[json_col])
                except Exception:
                    pass
        import re
        if re.fullmatch(r'PC-\d{4}-\d{3}',item['codigo_proyecto']):
            formatted.append(item)
    formatted.extend(document_store.adapter(d) for d in document_store.list())
    return {"success": True, "count": len(formatted), "proyectos": formatted}


@app.delete("/api/proyectos/{codigo_proyecto}")
@app.delete("/proyectos/{codigo_proyecto}")
def delete_project(codigo_proyecto: str):
    """Elimina un proyecto de la base de datos SQLite, borra su ficha JSON y actualiza el índice RAG."""
    if codigo_proyecto.upper().startswith('DOC-'):
        deleted = document_store.delete(codigo_proyecto)
        agent.search_engine.reload_index()
        return {'success':True,'deleted':deleted,'codigo_proyecto':codigo_proyecto}
    # 1. Eliminar de SQLite
    deleted = db_manager.delete_proyecto(codigo_proyecto)
    
    # 2. Eliminar ficha JSON si existe
    json_path = FICHAS_DIR / f"{codigo_proyecto}.json"
    if json_path.exists():
        json_path.unlink()
        
    # 3. Eliminar PDF si existe
    from codigo.backend.config import RAW_REPORTS_DIR
    for pdf in RAW_REPORTS_DIR.glob(f"*{codigo_proyecto}*.pdf"):
        try:
            pdf.unlink()
        except Exception:
            pass

    # 4. Reindexar RAG
    agent.search_engine.reload_index()

    return {"success": True, "deleted": deleted, "codigo_proyecto": codigo_proyecto, "message": f"Proyecto {codigo_proyecto} eliminado correctamente"}


@app.post("/api/proyectos/reset")
@app.post("/proyectos/reset")
def reset_projects():
    """Restaura exactamente los 4 proyectos oficiales de prueba técnica regenerando fichas, SQLite y RAG."""
    from codigo.backend.extractor import process_all_reports
    from codigo.backend.config import RAW_REPORTS_DIR
    import shutil

    # 1. Limpiar base de datos SQLite por completo
    conn = db_manager.get_connection()
    try:
        conn.execute("DELETE FROM proyectos")
        conn.execute("DELETE FROM documentos")
        conn.commit()
    finally:
        conn.close()

    # 2. Limpiar directorio de fichas JSON
    for f in FICHAS_DIR.glob("*.json"):
        try:
            f.unlink()
        except Exception:
            pass

    # 3. Limpiar directorio de raw reports
    for p in RAW_REPORTS_DIR.glob("*.pdf"):
        try:
            p.unlink()
        except Exception:
            pass

    # 4. Copiar los 4 PDFs oficiales desde extracted
    extracted_dir = PROJECT_ROOT / "extracted"
    if extracted_dir.exists():
        for pdf in extracted_dir.glob("Informe_Cierre_*.pdf"):
            shutil.copy(pdf, RAW_REPORTS_DIR / pdf.name)

    # 5. Procesar y poblar exactamente los 4 oficiales
    fichas = process_all_reports(use_llm=False)
    agent.search_engine.reload_index()
    return {"success": True, "count": len(fichas), "message": "Base de datos y RAG restaurados con los 4 proyectos oficiales"}


from fastapi import UploadFile, File
import io
import os
import pypdf

@app.post("/api/upload")
@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Sube un nuevo informe PDF con validación estricta de estructura y protección anti path-traversal.
    """
    from codigo.backend.config import RAW_REPORTS_DIR
    from codigo.backend.extractor import process_single_pdf

    # Sanitizar nombre de archivo (eliminar cualquier ../ o ruta externa)
    safe_filename = os.path.basename(file.filename)
    if not safe_filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos con extensión .pdf.")

    # Leer contenido en memoria antes de guardar en disco
    content = await file.read(MAX_PDF_BYTES + 1)
    if len(content) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413,detail='El PDF supera el límite de 15 MB.')
    if len(content) < 50 or not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="El archivo proporcionado no es un documento PDF válido.")

    # Validar que sea un PDF sintácticamente correcto con pypdf
    try:
        reader = pypdf.PdfReader(io.BytesIO(content))
        if len(reader.pages) == 0:
            raise HTTPException(status_code=400, detail="El archivo PDF no contiene páginas.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Estructura de PDF corrupta o no legible: {str(e)}")

    # Asegurar que el guardado se realiza estrictamente dentro de RAW_REPORTS_DIR
    save_path = (RAW_REPORTS_DIR / safe_filename).resolve()
    if not str(save_path).startswith(str(RAW_REPORTS_DIR.resolve())):
        raise HTTPException(status_code=400, detail="Ruta de archivo no permitida.")

    try:
        document = document_store.ingest(content,safe_filename)
        agent.search_engine.reload_index()
        return {
            "success": True,
            "message": f"Documento '{safe_filename}' procesado e indexado con éxito.",
            "proyecto": document_store.adapter(document),
            "documento": document_store.adapter(document),
            "warnings": document.get('warnings', [])
        }
    except ValueError as e:
        raise HTTPException(status_code=422,detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail='No se pudo guardar el documento.') from e


@app.get("/api/fichas")
@app.get("/fichas")
def get_fichas_json():
    """Retorna las fichas estructuradas completas en formato JSON."""
    fichas = []
    for jf in sorted(list(FICHAS_DIR.glob("*.json"))):
        with open(jf, "r", encoding="utf-8") as f:
            fichas.append(json.load(f))
    import re
    fichas = [f for f in fichas if re.fullmatch(r'PC-\d{4}-\d{3}',f.get('codigo_proyecto',''))]
    fichas.extend(document_store.adapter(d) for d in document_store.list())
    return {"success": True, "count": len(fichas), "fichas": fichas}

@app.get('/api/documentos')
@app.get('/documentos')
def get_documents():
    docs=[document_store.adapter(d) for d in document_store.list()]
    return {'success':True,'documentos':docs,'count':len(docs)}


@app.post("/api/sql")
@app.post("/sql")
def execute_custom_sql(req: SQLRequest):
    """Ejecuta una consulta SQL segura (solo lectura) sobre la base SQLite."""
    result = db_manager.execute_read_query(req.query)
    return result


# Montar archivos estáticos del frontend (React compilado en dist/ o raíz)
FRONTEND_DIR = PROJECT_ROOT / "codigo" / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
target_static_dir = FRONTEND_DIST if FRONTEND_DIST.exists() else FRONTEND_DIR

@app.get("/")
def serve_root_spa():
    """Sirve la aplicación React principal."""
    for candidate in [FRONTEND_DIST / "index.html", FRONTEND_DIR / "index.html"]:
        if candidate.exists():
            return FileResponse(candidate, media_type="text/html")
    return {"status": "ok", "service": "Procesa Consultores IA Backend"}

if target_static_dir.exists():
    app.mount("/app", StaticFiles(directory=str(target_static_dir), html=True), name="frontend")
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

# Rutas directas para páginas HTML complementarias
for html_page in ["inicio.html", "guia.html", "nival.html", "solucion.html"]:
    def _create_handler(page_name: str):
        def handler():
            for candidate in [FRONTEND_DIST / page_name, FRONTEND_DIR / page_name, FRONTEND_DIR / "public" / page_name]:
                if candidate.exists():
                    return FileResponse(candidate, media_type="text/html")
            raise HTTPException(status_code=404, detail="Página no encontrada")
        return handler
    app.add_api_route(f"/{html_page}", _create_handler(html_page), methods=["GET"])
    app.add_api_route(f"/app/{html_page}", _create_handler(html_page), methods=["GET"])

# Montar imágenes estáticas y route handler para /images/{image_name:path}
@app.get("/images/{image_name:path}")
def get_static_image(image_name: str):
    for base in [
        FRONTEND_DIR / "public" / "images",
        FRONTEND_DIST / "images",
        FRONTEND_DIR / "images",
        BASE_DIR / "codigo" / "frontend" / "public" / "images",
        BASE_DIR / "codigo" / "frontend" / "dist" / "images",
        PROJECT_ROOT / "codigo" / "frontend" / "public" / "images"
    ]:
        target = (base / image_name).resolve()
        if not target.is_relative_to(base.resolve()):
            continue
        if target.exists() and target.is_file():
            return FileResponse(target)
    raise HTTPException(status_code=404, detail="Imagen no encontrada")

for img_dir in [FRONTEND_DIR / "public" / "images", FRONTEND_DIST / "images", FRONTEND_DIR / "images", BASE_DIR / "codigo" / "frontend" / "public" / "images"]:
    if img_dir.exists():
        app.mount("/images", StaticFiles(directory=str(img_dir)), name="images")
        break


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
