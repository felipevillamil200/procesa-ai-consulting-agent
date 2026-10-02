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

    def __init__(self, reports_dir: Path = RAW_REPORTS_DIR, db_path=None):
        from codigo.backend.config import DATABASE_PATH
        self.db_path = db_path or DATABASE_PATH
        self.reports_dir = reports_dir
        self.chunks: List[DocumentChunk] = []
        self._build_index()

    def reload_index(self) -> int:
        """Reconstruye el índice RAG leyendo los informes actuales."""
        self._build_index()
        return len(self.chunks)

    def _extract_project_metadata(self, filename: str) -> tuple[str, str]:
        """Extrae el código y nombre legible del cliente a partir del nombre del archivo."""
        for p_code, p_name in [
            ("PC-2025-014", "Cooperativa Horizonte Andino"),
            ("PC-2025-027", "Plásticos del Pacífico S.A."),
            ("PC-2025-033", "Clínica Santa Lucía del Valle"),
            ("PC-2026-006", "Supermercados La Canasta")
        ]:
            if p_code in filename:
                return p_code, p_name

        from codigo.backend.documents import DocumentStore
        registry = DocumentStore(db_path=self.db_path, reports_dir=self.reports_dir)
        document = registry.by_filename(filename)
        if document:
            return document['document_id'], document['title']
        
        match = re.search(r"(PC-\d{4}-\d{3})", filename)
        if match:
            code = match.group(1)
            name = filename.replace(code, "").replace(".pdf", "").replace("_", " ").strip(" -_")
            return code, name or "Proyecto " + code

        clean_name = filename.replace(".pdf", "").replace("_", " ").strip()
        import hashlib
        path = self.reports_dir / filename
        identity = hashlib.sha256(path.read_bytes()).hexdigest()[:16].upper() if path.exists() else hashlib.sha256(filename.encode()).hexdigest()[:16].upper()
        return "DOC-" + identity, clean_name or "Documento Adicional"


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
        """Divide el texto en fragmentos coherentes garantizando un tamaño máximo <= max_chars."""
        text = self._sanitize_text(text).strip()
        if not text:
            return []

        def slice_large_string(s: str) -> List[str]:
            parts = []
            step = max(1, max_chars - overlap)
            for i in range(0, len(s), step):
                part = s[i : i + max_chars].strip()
                if part:
                    parts.append(part)
                if i + max_chars >= len(s):
                    break
            return parts

        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        raw_chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            if len(para) > max_chars:
                if current_chunk:
                    raw_chunks.append(current_chunk)
                    current_chunk = ""
                raw_chunks.extend(slice_large_string(para))
            elif len(current_chunk) + len(para) + (1 if current_chunk else 0) <= max_chars:
                current_chunk = f"{current_chunk}\n{para}".strip()
            else:
                if current_chunk:
                    raw_chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            raw_chunks.append(current_chunk)

        if not raw_chunks and text:
            raw_chunks = slice_large_string(text)

        # Garantizar que ningún chunk exceda max_chars
        final_chunks: List[str] = []
        for c in raw_chunks:
            if len(c) > max_chars:
                final_chunks.extend(slice_large_string(c))
            else:
                final_chunks.append(c)

        return [c for c in final_chunks if c]

    def _build_index(self) -> None:
        """Lee todos los informes PDF y construye la colección de chunks con metadatos."""
        self.chunks = []
        from codigo.backend.documents import DocumentStore
        registry = DocumentStore(db_path=self.db_path,reports_dir=self.reports_dir)
        registry.migrate()
        pdf_files = sorted(list(self.reports_dir.glob("*.pdf")))

        for pdf_path in pdf_files:
            codigo, cliente = self._extract_project_metadata(pdf_path.name)
            try:
                document = registry.by_filename(pdf_path.name)
                pages = document['pages'] if document else [{'page_number':i+1,'text':p.extract_text() or ''} for i,p in enumerate(pypdf.PdfReader(str(pdf_path)).pages)]
                for page in pages:
                    page_num = page['page_number']
                    page_text = page['text']
                    page_chunks = self._chunk_text(page_text)

                    for chunk_idx, chunk_text in enumerate(page_chunks):
                        if chunk_text.strip():  # Un total o una condición breve también son evidencia.
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
            candidate_chunks = [c for c in self.chunks if pid_clean == c.codigo_proyecto.upper()]
            if not candidate_chunks:
                return []

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

    def get_document_preview(self, codigo_proyecto: str) -> Optional[Dict[str, Any]]:
        """Extrae el contenido página por página y fragmentos indexados de un informe PDF."""
        code_clean = codigo_proyecto.strip().upper()
        from codigo.backend.documents import DocumentStore
        document = DocumentStore(db_path=self.db_path,reports_dir=self.reports_dir).get(code_clean)
        if document:
            return {'codigo_proyecto':document['document_id'],'document_id':document['document_id'],
                    'cliente':document['title'],'filename':document['filename'],'total_pages':len(document['pages']),
                    'pages':document['pages'],'chunks':[c.to_dict() for c in self.chunks if c.codigo_proyecto==code_clean]}
        pdf_files = list(self.reports_dir.glob("*.pdf"))
        target_pdf = None

        for pdf in pdf_files:
            if code_clean in pdf.name.upper():
                target_pdf = pdf
                break

        if not target_pdf and pdf_files:
            # Intentar búsqueda aproximada
            for pdf in pdf_files:
                c, _ = self._extract_project_metadata(pdf.name)
                if c.upper() == code_clean:
                    target_pdf = pdf
                    break

        if not target_pdf or not target_pdf.exists():
            return None

        codigo, cliente = self._extract_project_metadata(target_pdf.name)
        pages = []

        try:
            reader = pypdf.PdfReader(str(target_pdf))
            for p_idx, page in enumerate(reader.pages):
                raw_text = page.extract_text() or ""
                pages.append({
                    "page_number": p_idx + 1,
                    "text": self._sanitize_text(raw_text)
                })
        except Exception as e:
            print(f"[ERROR] Leyendo PDF {target_pdf.name}: {e}")

        # Obtener los chunks de este proyecto
        project_chunks = [c.to_dict() for c in self.chunks if c.codigo_proyecto.upper() == code_clean]

        return {
            "codigo_proyecto": codigo,
            "cliente": cliente,
            "filename": target_pdf.name,
            "total_pages": len(pages),
            "pages": pages,
            "chunks": project_chunks
        }


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
