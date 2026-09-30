# Skill: Búsqueda Semántica de Documentos (RAG Skill)

## Propósito
Permitir la recuperación precisa de fragmentos de texto de los informes para responder consultas cualitativas y narrativas.

## Directrices de Implementación
1. **Chunking Inteligente:**
   - Fragmentar los textos por secciones o párrafos con un tamaño de ~400-600 tokens con overlap de ~50 tokens.
   - Cada chunk debe conservar metadatos: `codigo_proyecto`, `cliente`, `pagina`, `seccion`.
2. **Motor de Recuperación Híbrido:**
   - Soporte de búsqueda semántica (embeddings de OpenAI / HuggingFace / BM25) para máxima relevancia y rapidez.
3. **Herramienta RAG (`search_project_documents`):**
   - Recibe `query` y parámetro opcional `project_id` para filtrar por proyecto específico si el usuario lo menciona.
   - Devuelve los Top-K fragmentos más relevantes con su cita formal.
