# 📘 Bitácora de Sustentación - Paso 3: Motor de Búsqueda RAG (Texto de los Informes)

---

## 🎯 ¿Qué hicimos en este paso?

1. **Estrategia de Segmentación Semántica (Chunking) (`src/rag.py`):**
   - Implementamos división basada en párrafos naturales (`\n\n`) y longitud controlada (~600 caracteres con solapamiento de 100 caracteres).
   - Evitamos cortar oraciones por la mitad, preservando la coherencia semántica de cada idea.
2. **Preservación de Metadatos de Trazabilidad:**
   - Cada fragmento (`DocumentChunk`) almacena: `chunk_id`, `codigo_proyecto`, `cliente`, `pagina` y `contenido`.
   - Generación automática del formato de cita: `[Fuente: {codigo_proyecto} - {cliente}, Pág. {pagina}]`.
3. **Motor de Recuperación Híbrido (BM25 + Ponderación):**
   - Algoritmo de ponderación de términos BM25 para calcular relevancia exacta entre la consulta del usuario y los fragmentos.
   - Soporte de filtrado por proyecto (`project_id`) para búsquedas contextualizadas.
4. **Patrón Singleton (`get_search_engine`):**
   - Carga el índice una sola vez en memoria, garantizando respuestas ultrarrápidas (<10 ms).

---

## 💡 ¿Por qué tomamos estas decisiones técnicas? (Defensa para la Entrevista)

| Decisión Técnica | Justificación para los Evaluadores |
| :--- | :--- |
| **Chunking por Párrafos vs. Longitud Fija** | En informes de consultoría, las lecciones aprendidas y metodologías se redactan en párrafos enteros. Cortar por tokens fijos rompería tablas y conclusiones; cortar por párrafos preserva el contexto completo. |
| **Metadato de Página Explícito** | La prueba exige que cada respuesta indique de qué informe proviene la información. Guardar el número de página permite citas hiper-precisas (*"Clínica Santa Lucía, Pág. 3"*). |
| **Motor BM25 Nativo sin Base Vectorial Pesada** | Para un corpus de 4 informes de cierre (13-20 páginas en total), un motor BM25 nativo ofrece latencia cero, no requiere instalar servicios externos (como Pinecone o servidores de milvus), no consume costo de embeddings innecesario y es 100% determinista y explicable. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste incluir el número de página y código de proyecto en cada chunk?"*
> **Tu Respuesta:** *"Porque uno de los requisitos críticos de la rúbrica es la **confiabilidad y la atribución de fuentes**. Al embeber el código de proyecto y el número de página como metadatos nativos del chunk, el agente no tiene que adivinar de dónde sacó el dato; la herramienta le entrega la cita exacta lista para ser incluida en la respuesta al consultor."*

### 2. *"Si la firma creciera a 500 informes de proyectos en lugar de 4, ¿cómo escalaría este motor RAG?"*
> **Tu Respuesta:** *"Nuestra arquitectura está desacoplada mediante la interfaz `DocumentSearchEngine`. Para 500 informes, mantendríamos exactamente la misma API `search(query, project_id)`, pero reemplazaríamos el índice local por una base vectorial como **ChromaDB / pgvector / Qdrant** utilizando embeddings densos (`text-embedding-3-small`) combinados con un reranker (Hybrid Search)."*
