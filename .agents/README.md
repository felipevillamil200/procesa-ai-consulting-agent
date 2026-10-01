# 🧠 Especificación y Parámetros del Agente de IA (`.agents/`)

Este directorio centraliza las **directivas, prompts estructurados, habilidades especializadas (skills), reglas de diseño y flujos de ejecución** que guiaron a la IA para construir y verificar la solución completa de **Procesa Consultores**.

---

## 🗺️ Mapa de Recursos y Configuración de la IA

| Categoría | Archivo / Carpeta | Propósito y Función |
| :--- | :--- | :--- |
| **Orquestación & Loop** | [`agent_loop.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/.agents/agent_loop.md) | Ciclo de razonamiento ReAct (Reasoning + Acting) y toma de decisiones paso a paso. |
| **System Prompt Maestro** | [`system_prompt.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/.agents/system_prompt.md) | Directivas de comportamiento, guardrails anti-alucinación y formato de citas obligatorias. |
| **Plan de Trabajo** | [`workflow_plan.md`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/.agents/workflow_plan.md) | Roadmap estructurado de desarrollo, etapas y criterios de aceptación. |
| **Catálogo de Prompts** | [`prompts/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/.agents/prompts/) | Prompts de extracción estructurada, generación de consultas SQL y agente conversacional. |
| **Skills Especializadas** | [`skills/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/.agents/skills/) | Reglas técnicas de RAG, base de datos SQLite, validaciones de código y diseño UI/UX. |

---

## 🛠️ Catálogo de Skills Integradas

1. **`skills/impeccable-design/`**: Principios de diseño interactivo de alta gama (micro-animaciones, tipografía, layouts y pulido visual).
2. **`skills/taste-skill/`**: Curaduría de interfaces modernas tipo Linear/Stripe/Vercel sin plantillas genéricas.
3. **`skills/database_skill.md`**: Reglas de modelado relacional SQLite, indexación y guardrails de solo lectura.
4. **`skills/rag_skill.md`**: Directivas de chunking semántico ($\le 600$ caracteres) y recuperación con filtro por `project_id`.
5. **`skills/extraction_skill.md`**: Reglas de extracción estructurada con Pydantic v2 y validación de tipos.
6. **`skills/evaluation_skill.md`**: Criterios de testing automatizado con `pytest` y métricas de exactitud documental.
7. **`skills/cli_web_skill.md`**: Pautas para interfaces de usuario en React + Vite y consolas enriquecidas en Rich.

---

## 🔒 Parámetros de Control y Anti-Alucinación (Grounding)

* **Abstención Fáctica:** Si una consulta no tiene respaldo en los 4 informes oficiales o en la base relacional, la IA se abstiene explícitamente (`found_info=False`).
* **Citas Estrictas:** Toda respuesta incluye la referencia de procedencia (ej. `[Fuente: PC-2025-027 - Plásticos del Pacífico S.A.]`).
* **Trazabilidad Estructurada:** Registro de cada herramienta ejecutada, argumentos enviados y tiempo en milisegundos (`ms`).
