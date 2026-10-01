"""
Punto de entrada Serverless para Vercel Functions.
Carga FastAPI y adapta las rutas y datos para el entorno de Vercel.
"""

import os
import sys
import shutil
from pathlib import Path

# Agregar directorio raíz al sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# En entorno Vercel Serverless, asegurar que /tmp/data tenga los datos base
if os.environ.get("VERCEL"):
    tmp_data = Path("/tmp/data")
    tmp_data.mkdir(parents=True, exist_ok=True)
    orig_data = ROOT_DIR / "data"
    if orig_data.exists():
        for item in orig_data.rglob("*"):
            if item.is_file():
                dest = tmp_data / item.relative_to(orig_data)
                dest.parent.mkdir(parents=True, exist_ok=True)
                if not dest.exists():
                    try:
                        shutil.copy(item, dest)
                    except Exception:
                        pass

from codigo.backend.main import app
