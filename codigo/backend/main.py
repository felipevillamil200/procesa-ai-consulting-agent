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


@app.get("/health")
def health_check():
    """Estado de salud de la API."""
    return {"status": "ok", "service": "Procesa Consultores IA Backend"}


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


@app.get("/api/fichas")
def get_fichas_json():
    """Retorna las 4 fichas estructuradas completas en formato JSON."""
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
