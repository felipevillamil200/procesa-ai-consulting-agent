# Skill: Evaluación, Pruebas y Control de Calidad (Evaluation Skill)

## Propósito
Verificar y validar de forma automatizada mediante `pytest` que el agente cumple al 100% con los requerimientos y no comete alucinaciones.

## Banco de Preguntas de Prueba y Respuestas Esperadas:

1. **Pregunta Cuantitativa / SQL:**
   - *Pregunta:* "¿Qué proyectos se ejecutaron durante el año 2025 y cuál fue la duración de cada uno en semanas?"
   - *Herramienta esperada:* `query_project_database`
   - *Validación:* Debe listar `PC-2025-014` (20 semanas), `PC-2025-027` (24 semanas) y `PC-2025-033` (18 semanas).

2. **Pregunta Cualitativa / RAG:**
   - *Pregunta:* "¿Qué lecciones aprendidas se registraron sobre la resistencia al cambio en el personal médico?"
   - *Herramienta esperada:* `search_project_documents`
   - *Validación:* Debe citar el proyecto `PC-2025-033` (Clínica Santa Lucía) y mencionar el involucramiento de jefes de servicio y capacitación práctica.

3. **Pregunta de Métrica Específica:**
   - *Pregunta:* "¿Cuál fue el incremento en el OEE en la planta de Plásticos del Pacífico?"
   - *Herramienta esperada:* `query_project_database` o `search_project_documents`
   - *Validación:* Línea base ~54.2% a resultado final ~71.8% (+17.6 pp) con cita `PC-2025-027`.

4. **Pregunta de Prueba Anti-Alucinación (Dato inexistente):**
   - *Pregunta:* "¿Qué proyectos hemos realizado para la industria minera o de petróleo?"
   - *Validación:* Debe responder que no se dispone de información sobre proyectos en minería o petróleo en los informes disponibles.
