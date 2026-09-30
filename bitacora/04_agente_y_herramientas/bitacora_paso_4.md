# 📘 Bitácora de Sustentación - Paso 4: Agente Inteligente y Herramientas (SQL + RAG)

---

## 🎯 ¿Qué hicimos en este paso?

1. **Definición Formal de Herramientas (`AGENT_TOOLS_SCHEMA` en `src/agent.py`):**
   - **`query_project_database(sql_query)`**: Para consultas cuantitativas, analíticas, conteos, ordenamientos y filtros relacionales en SQLite.
   - **`search_project_documents(query, project_id)`**: Para consultas narrativas, metodológicas, lecciones aprendidas cualitativas y factores humanos en los PDFs.
2. **Orquestador con Function Calling (`ConsultorAgent`):**
   - El agente analiza la pregunta del consultor y decide de forma autónoma cuál herramienta invocar (o ambas).
   - Inyección del esquema DDL en el `system_prompt` para guiar al modelo a generar SQL válido y seguro.
3. **Módulo de Trazabilidad (`ToolExecutionLog`):**
   - Cada ejecución de herramienta queda registrada con: nombre, parámetros enviados, resumen de resultados y tiempo de ejecución en milisegundos (`execution_time_ms`).
4. **Mecanismo Anti-Alucinación (Grounding Estricto):**
   - Regla explícita en el System Prompt y motor de inferencia: si los datos no existen en las fuentes disponibles, el agente declara: *"No se dispone de información sobre ese aspecto en los informes de cierre de proyectos disponibles."*
5. **Doble Motor de Inferencia:**
   - Modo Cloud/Producción con OpenAI API (`gpt-4o-mini`).
   - Modo Offline/Local Determinista para pruebas continuas y entornos sin conexión o sin API Key.

---

## 💡 ¿Por qué tomamos estas decisiones técnicas? (Defensa para la Entrevista)

| Decisión Técnica | Justificación para los Evaluadores |
| :--- | :--- |
| **Function Calling Nativo vs Regex/Parsing Manual** | El estándar de la industria es OpenAI Tool Calling. Permite validación estricta de argumentos según esquema JSON, manejo de múltiples llamadas paralelas y reduce drásticamente los errores de sintaxis en comparación con parsear texto libre. |
| **Separación Clara de Herramientas (SQL vs RAG)** | Los LLMs tienen dificultades haciendo cálculos agregados (ej. *"¿Cuál fue el proyecto con mayor duración en semanas?"*) si solo leen texto narrativo. Delegar las matemáticas y filtros a SQL y las explicaciones a RAG maximiza la precisión y elimina alucinaciones numéricas. |
| **Registro de Trazabilidad Estructurado** | Permite auditoría técnica completa: los evaluadores pueden ver exactamente qué query SQL generó el agente o qué términos de búsqueda RAG utilizó antes de responder. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Cómo decide el agente si usar SQL, RAG o ambos?"*
> **Tu Respuesta:** *"El agente utiliza las descripciones semánticas y tipado del `AGENT_TOOLS_SCHEMA`. Si la pregunta contiene intenciones analíticas, filtros o comparaciones (ej. 'proyectos en 2025', 'cuántas semanas duró'), el LLM selecciona `query_project_database`. Si la pregunta indaga sobre el 'cómo', problemas de liderazgo o lecciones aprendidas, selecciona `search_project_documents`. Para preguntas mixtas (ej. '¿Qué metodología se aplicó en el proyecto de retail?'), el agente ejecuta primero la consulta SQL para identificar el proyecto y luego la búsqueda RAG para profundizar."*

### 2. *"¿Cómo garantizas que el agente no invente datos ante una pregunta capciosa?"*
> **Tu Respuesta:** *"Implementamos una estrategia de **Grounding en dos capas**: primero, un System Prompt con directivas negativas estrictas que prohíben suponer o extrapolar; segundo, el agente solo recibe como contexto lo que las herramientas retornan. Si las herramientas no devuelven registros coincidentes, el agente está programado para emitir el mensaje estándar de indisponibilidad de información sin especular."*
