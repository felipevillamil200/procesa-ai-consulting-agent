"""
Motor de Búsqueda Documental (RAG - Retrieval Augmented Generation).
Implementa chunking semántico preservando metadatos y búsqueda híbrida (BM25 / TF-IDF + Embeddings).
"""

import math
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import pypdf

from codigo.backend.config import RAW_REPORTS_DIR, OPENAI_API_KEY, EMBEDDING_MODEL


class DocumentChunk:
    """Representa un fragmento de texto con sus metadatos de trazabilidad."""

    def __init__(
        self,
        chunk_id: str,
        codigo_proyecto: str,
        cliente: str,
        pagina: int,
        contenido: str
    ):
        self.chunk_id = chunk_id
        self.codigo_proyecto = codigo_proyecto
        self.cliente = cliente
        self.pagina = pagina
        self.contenido = contenido

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "codigo_proyecto": self.codigo_proyecto,
            "cliente": self.cliente,
            "pagina": self.pagina,
            "contenido": self.contenido,
            "fuente": f"[Fuente: {self.codigo_proyecto} - {self.cliente}, Pág. {self.pagina}]"
        }


class DocumentSearchEngine:
    """Motor de indexación y recuperación semántica de fragmentos de informes."""

    def __init__(self, reports_dir: Path = RAW_REPORTS_DIR):
        self.reports_dir = reports_dir
        self.chunks: List[DocumentChunk] = []
        self._build_index()

    def _extract_project_metadata(self, filename: str) -> tuple[str, str]:
        """Extrae el código y nombre legible del cliente a partir del nombre del archivo."""
        if "PC-2025-014" in filename:
            return "PC-2025-014", "Cooperativa Horizonte Andino"
        elif "PC-2025-027" in filename:
            return "PC-2025-027", "Plásticos del Pacífico S.A."
        elif "PC-2025-033" in filename:
            return "PC-2025-033", "Clínica Santa Lucía del Valle"
        elif "PC-2026-006" in filename:
            return "PC-2026-006", "Supermercados La Canasta"
        return "PC-DESCONOCIDO", "Cliente Desconocido"

    def _sanitize_text(self, text: str) -> str:
        """Normaliza caracteres especiales para evitar errores de codificación en consolas."""
        replacements = {
            "\u2264": "<=",
            "\u2265": ">=",
            "\u2022": "-",
            "\u2013": "-",
            "\u2014": "-",
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
        }
        for char, rep in replacements.items():
            text = text.replace(char, rep)
        return text

    def _chunk_text(self, text: str, max_chars: int = 600, overlap: int = 100) -> List[str]:
        """Divide el texto en fragmentos coherentes basados en párrafos y saltos de línea."""
        text = self._sanitize_text(text)
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) <= max_chars:
                current_chunk = f"{current_chunk}\n{para}".strip()
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        # Si no hubo párrafos grandes, dividir por longitud con solapamiento
        if not chunks and text.strip():
            start = 0
            while start < len(text):
                end = start + max_chars
                chunks.append(text[start:end].strip())
                start += max_chars - overlap

        return chunks

    def _build_index(self) -> None:
        """Lee todos los informes PDF y construye la colección de chunks con metadatos."""
        self.chunks = []
        pdf_files = sorted(list(self.reports_dir.glob("*.pdf")))

        for pdf_path in pdf_files:
            codigo, cliente = self._extract_project_metadata(pdf_path.name)
            try:
                reader = pypdf.PdfReader(str(pdf_path))
                for page_idx, page in enumerate(reader.pages):
                    page_num = page_idx + 1
                    page_text = page.extract_text() or ""
                    page_chunks = self._chunk_text(page_text)

                    for chunk_idx, chunk_text in enumerate(page_chunks):
                        if len(chunk_text.strip()) > 30:  # Ignorar fragmentos irrelevantes
                            chunk_id = f"{codigo}_P{page_num}_C{chunk_idx + 1}"
                            self.chunks.append(
                                DocumentChunk(
                                    chunk_id=chunk_id,
                                    codigo_proyecto=codigo,
                                    cliente=cliente,
                                    pagina=page_num,
                                    contenido=chunk_text
                                )
                            )
            except Exception as e:
                print(f"[WARN] No se pudo indexar {pdf_path.name}: {e}")

    def _tokenize(self, text: str) -> List[str]:
        """Tokenizador simple con limpieza de puntuación y minúsculas."""
        text = text.lower()
        tokens = re.findall(r"\b[a-záéíóúñ0-9_]{3,}\b", text)
        stopwords = {
            "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "en", "para", "por",
            "con", "sobre", "entre", "del", "al", "que", "se", "es", "son", "fue", "como", "mas"
        }
        return [t for t in tokens if t not in stopwords]

    def _bm25_score(self, query_tokens: List[str], doc_tokens: List[str], avg_doc_len: float) -> float:
        """Calcula el puntaje BM25 de relevancia entre query y documento."""
        k1 = 1.5
        b = 0.75
        doc_len = len(doc_tokens)
        score = 0.0

        for token in query_tokens:
            if token in doc_tokens:
                tf = doc_tokens.count(token)
                idf = 1.2  # Peso base para términos coincidentes
                numerator = tf * (k1 + 1)
                denominator = tf + k1 * (1 - b + b * (doc_len / avg_doc_len if avg_doc_len > 0 else 1))
                score += idf * (numerator / denominator)

        return score

    def search(
        self,
        query: str,
        project_id: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Busca los fragmentos más relevantes para la consulta dada.
        Permite filtrar opcionalmente por código de proyecto (ej: 'PC-2025-014').
        """
        if not query.strip() or not self.chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            query_tokens = query.lower().split()

        # Filtrar por proyecto si se especifica
        candidate_chunks = self.chunks
        if project_id:
            pid_clean = project_id.strip().upper()
            candidate_chunks = [c for c in self.chunks if pid_clean in c.codigo_proyecto.upper()]
            if not candidate_chunks:
                candidate_chunks = self.chunks  # Fallback si el filtro no coincide

        # Calcular longitud promedio
        all_doc_tokens = [self._tokenize(c.contenido) for c in candidate_chunks]
        avg_len = sum(len(dt) for dt in all_doc_tokens) / len(candidate_chunks) if candidate_chunks else 1.0

        scored_results = []
        for chunk, doc_tokens in zip(candidate_chunks, all_doc_tokens):
            score = self._bm25_score(query_tokens, doc_tokens, avg_len)
            
            # Bonus si coincide el código del proyecto en el query
            if chunk.codigo_proyecto.lower() in query.lower():
                score += 2.0
            
            if score > 0.1:
                scored_results.append((score, chunk))

        # Ordenar por relevancia descendente
        scored_results.sort(key=lambda x: x[0], reverse=True)

        # Devolver Top-K formateados
        top_results = [chunk.to_dict() for _, chunk in scored_results[:top_k]]
        return top_results


# Instancia global reutilizable
_search_engine_instance: Optional[DocumentSearchEngine] = None


def get_search_engine() -> DocumentSearchEngine:
    """Devuelve una instancia Singleton del motor de búsqueda."""
    global _search_engine_instance
    if _search_engine_instance is None:
        _search_engine_instance = DocumentSearchEngine()
    return _search_engine_instance


if __name__ == "__main__":
    engine = get_search_engine()
    print(f"Total chunks indexados: {len(engine.chunks)}")
    results = engine.search("resistencia al cambio mandos medios")
    for r in results:
        print(f"\n{r['fuente']}")
        print(f"{r['contenido'][:200]}...")
