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


# Schemas de Request y Response
class ChatRequest(BaseModel):
    question: str = Field(..., description="Pregunta del usuario en lenguaje natural")
    history: Optional[List[Dict[str, str]]] = Field(default=None, description="Historial previo de mensajes")


class SQLRequest(BaseModel):
    query: str = Field(..., description="Consulta SQL SELECT")


class ConfigUpdateRequest(BaseModel):
    api_key: Optional[str] = Field(default=None, description="Clave de Google Gemini API")
    model: Optional[str] = Field(default=None, description="Nombre del modelo LLM")
    provider: Optional[str] = Field(default=None, description="Proveedor LLM (gemini/openai)")


@app.get("/health")
def health_check():
    """Estado de salud de la API."""
    return {"status": "ok", "service": "Procesa Consultores IA Backend"}


@app.get("/api/config")
def get_config():
    """Retorna la configuración activa del LLM y estado de la API Key."""
    import os
    from codigo.backend.config import GEMINI_API_KEY, LLM_MODEL, LLM_PROVIDER
    current_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    masked = f"{current_key[:6]}...{current_key[-4:]}" if len(current_key) > 10 else ("Configurada" if current_key else "No configurada")
    return {
        "success": True,
        "provider": os.getenv("LLM_PROVIDER", LLM_PROVIDER),
        "model": os.getenv("LLM_MODEL", LLM_MODEL),
        "has_api_key": bool(current_key),
        "masked_key": masked
    }


@app.post("/api/config")
def update_config(req: ConfigUpdateRequest):
    """Actualiza en memoria la clave de API o modelo LLM."""
    import os
    if req.api_key and req.api_key.strip():
        os.environ["GEMINI_API_KEY"] = req.api_key.strip()
    if req.model and req.model.strip():
        os.environ["LLM_MODEL"] = req.model.strip()
    if req.provider and req.provider.strip():
        os.environ["LLM_PROVIDER"] = req.provider.strip()
    return {"success": True, "message": "Configuración actualizada correctamente"}



@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    """
    Envía una pregunta al Agente de IA.
    Ejecuta el ciclo de razonamiento (SQL + RAG) y retorna respuesta con citas y trazabilidad.
    """
    try:
        response = agent.ask(req.question, chat_history=req.history)
        return {
            "success": True,
            "answer": response.answer,
            "tools_used": [t.model_dump() for t in response.tools_used],
            "sources": response.sources,
            "found_info": response.found_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/proyectos")
def get_all_projects():
    """Obtiene la lista de todos los proyectos registrados en la base de datos SQLite."""
    proyectos = db_manager.get_all_proyectos()
    # Parsear campos JSON almacenados
    formatted = []
    for p in proyectos:
        item = dict(p)
        for json_col in ["equipo_consultor", "metodologias_herramientas", "kpis_impacto", "principales_hitos", "lecciones_aprendidas", "factores_riesgo"]:
            if item.get(json_col) and isinstance(item[json_col], str):
                try:
                    item[json_col] = json.loads(item[json_col])
                except Exception:
                    pass
        formatted.append(item)
    return {"success": True, "count": len(formatted), "proyectos": formatted}


@app.delete("/api/proyectos/{codigo_proyecto}")
def delete_project(codigo_proyecto: str):
    """Elimina un proyecto de la base de datos SQLite, borra su ficha JSON y actualiza el índice RAG."""
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
def reset_projects():
    """Restaura los 4 proyectos oficiales de prueba técnica regenerando fichas, SQLite y RAG."""
    from codigo.backend.extractor import process_all_reports
    # Restaurar PDFs originales desde extracted si hacen falta
    from codigo.backend.config import RAW_REPORTS_DIR
    extracted_dir = PROJECT_ROOT / "extracted"
    if extracted_dir.exists():
        import shutil
        for pdf in extracted_dir.glob("Informe_Cierre_*.pdf"):
            shutil.copy(pdf, RAW_REPORTS_DIR / pdf.name)
            
    fichas = process_all_reports(use_llm=False)
    agent.search_engine.reload_index()
    return {"success": True, "count": len(fichas), "message": "Base de datos y RAG restaurados con los 4 proyectos oficiales"}


from fastapi import UploadFile, File
import shutil

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Sube un nuevo informe PDF, ejecuta la extracción estructurada, lo persiste en SQLite y reindexa RAG."""
    from codigo.backend.config import RAW_REPORTS_DIR
    from codigo.backend.extractor import process_single_pdf
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF.")

    save_path = RAW_REPORTS_DIR / file.filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        ficha = process_single_pdf(save_path, db_manager)
        agent.search_engine.reload_index()
        return {
            "success": True,
            "message": f"Documento '{file.filename}' procesado e indexado con éxito.",
            "proyecto": ficha.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")


@app.get("/api/fichas")
def get_fichas_json():
    """Retorna las fichas estructuradas completas en formato JSON."""
    fichas = []
    for jf in sorted(list(FICHAS_DIR.glob("*.json"))):
        with open(jf, "r", encoding="utf-8") as f:
            fichas.append(json.load(f))
    return {"success": True, "count": len(fichas), "fichas": fichas}


@app.post("/api/sql")
def execute_custom_sql(req: SQLRequest):
    """Ejecuta una consulta SQL segura (solo lectura) sobre la base SQLite."""
    result = db_manager.execute_read_query(req.query)
    return result


# Montar archivos estáticos del frontend si existen
FRONTEND_DIR = PROJECT_ROOT / "codigo" / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/app", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

