"""
Módulo de Configuración y Variables de Entorno.
Centraliza las rutas del proyecto y parámetros del modelo LLM.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno desde .env si existe
load_dotenv()

# Rutas Base del Proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_REPORTS_DIR = DATA_DIR / "raw_reports"
FICHAS_DIR = DATA_DIR / "fichas"
DATABASE_PATH = DATA_DIR / "proyectos.db"

# Asegurar existencia de directorios clave y auto-poblado desde extracted
RAW_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
FICHAS_DIR.mkdir(parents=True, exist_ok=True)

def ensure_official_data():
    """Garantiza que data/ contenga los 4 PDFs oficiales desde extracted."""
    import shutil
    extracted_dir = BASE_DIR / "extracted"
    if extracted_dir.exists():
        for pdf in extracted_dir.glob("Informe_Cierre_*.pdf"):
            target = RAW_REPORTS_DIR / pdf.name
            if not target.exists() or target.stat().st_size == 0:
                try:
                    shutil.copy(pdf, target)
                except Exception:
                    pass

ensure_official_data()

# Configuración de Proveedores LLM (Google Gemini / OpenAI)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini" if GEMINI_API_KEY else "openai")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-flash-latest" if LLM_PROVIDER == "gemini" else "gpt-4o-mini")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# Configuración del Agente
MAX_TOOL_ITERATIONS = 5
SQL_QUERY_TIMEOUT_SECONDS = 5
