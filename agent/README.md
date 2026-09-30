# Arquitectura y Guía de Operación: Carpeta `agent/`

Este directorio contiene la especificación formal, reglas de comportamiento, prompts estructurados y skills que rigen el desarrollo y la ejecución del **Agente de Consulta de Proyectos de Procesa Consultores**.

---

## 🗺️ Mapeo Lineal Paso a Paso (Roadmap $\leftrightarrow$ Recursos)

| Paso | Objetivo | Prompts Asociados | Skills Asociadas | Archivo de Control |
| :--- | :--- | :--- | :--- | :--- |
| **Paso 1** | Estructura del Proyecto, Git y Configuración | - | - | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/workflow_plan.md) |
| **Paso 2** | Extracción Pydantic y Base de Datos SQLite | [`prompts/extractor_prompt.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/prompts/extractor_prompt.md) | [`skills/extraction_skill.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/skills/extraction_skill.md)<br>[`skills/database_skill.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/skills/database_skill.md) | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/workflow_plan.md) |
| **Paso 3** | Chunking Semántico e Indexación RAG | - | [`skills/rag_skill.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/skills/rag_skill.md) | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/workflow_plan.md) |
| **Paso 4** | Agente Orquestador, Tools (SQL + RAG) y Citas | [`prompts/agent_system_prompt.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/prompts/agent_system_prompt.md)<br>[`prompts/sql_generator_prompt.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/prompts/sql_generator_prompt.md) | [`system_prompt.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/system_prompt.md) | [`agent_loop.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/agent_loop.md) |
| **Paso 5** | Interfaces de Usuario (CLI Rich + Web Streamlit) | - | [`skills/cli_web_skill.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/skills/cli_web_skill.md) | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/workflow_plan.md) |
| **Paso 6** | Tests Automatizados (Pytest) y Documentación | - | [`skills/evaluation_skill.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/skills/evaluation_skill.md) | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/agent/workflow_plan.md) |

---

## 🔒 Garantías de Calidad (Anti-Alucinación & Grounding)
1. **Fidelidad al documento:** El agente rechaza responder datos fuera de los 4 informes.
2. **Cita verificable:** Toda afirmación incluye `[Fuente: Codigo - Proyecto]`.
3. **Visibilidad completa:** Trazabilidad en tiempo real de las herramientas invocadas.
