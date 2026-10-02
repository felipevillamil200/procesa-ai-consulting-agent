"""
Módulo de Gestión y Carga de Prompts del Sistema (Prompt Engineering).
Carga archivos Markdown (.md) desacoplados con soporte de caché en memoria.
"""

from functools import lru_cache
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent


@lru_cache(maxsize=32)
def load_prompt(prompt_name: str) -> str:
    """
    Carga y retorna el contenido de un prompt .md desde el directorio de prompts.
    Utiliza caché en memoria para máximo rendimiento en ejecuciones concurrentes.
    """
    file_path = PROMPTS_DIR / f"{prompt_name}.md"
    if not file_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de prompt: {file_path}")
    return file_path.read_text(encoding="utf-8").strip()
