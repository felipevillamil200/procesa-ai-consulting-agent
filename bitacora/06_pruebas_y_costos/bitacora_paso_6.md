# 📘 Bitácora de Sustentación - Paso 6: Guía del Video, Memoria de Costos y Preparación para la Entrevista en Vivo

---

## 🎥 1. Guion para el Video Demostrativo (Máximo 5 Minutos)

Para tu video de entrega, sigue esta estructura ordenada y clara:

### ⏱️ Minuto 0:00 - 1:00 | Introducción y Arquitectura
* *"Hola, mi nombre es Felipe y presento la solución técnica para el puesto de Consultor de IA en Procesa Consultores."*
* Muestra brevemente la estructura del proyecto en VS Code (`src/`, `data/`, `tests/`) y explica la arquitectura:
  * *"Diseñamos un agente híbrido en Python que combina consultas SQL relacionales sobre SQLite con búsqueda documental semántica RAG sobre los PDFs, garantizando citas exactas, trazabilidad y cero alucinaciones."*

### ⏱️ Minuto 1:00 - 4:00 | Las 5 Preguntas de Demostración
Abre la terminal (`python -m src.cli`) o la app web (`streamlit run src/app.py`) y ejecuta en vivo estas 5 preguntas:

1. **Pregunta 1 (Cuantitativa / Filtro SQL):**
   * *Consulta:* `"¿Qué proyectos se ejecutaron en el año 2025 y cuál duró más semanas?"`
   * *Qué resaltar:* Muestra cómo el agente invoca `query_project_database`, realiza la consulta SQL y destaca que Plásticos del Pacífico duró 24 semanas.
2. **Pregunta 2 (Cualitativa / Detalle RAG):**
   * *Consulta:* `"¿Qué lecciones aprendimos sobre la resistencia al cambio en mandos medios?"`
   * *Qué resaltar:* Muestra la invocación de `search_project_documents` y cómo cita textualmente la página 3 de la Cooperativa Horizonte Andino y Plásticos del Pacífico.
3. **Pregunta 3 (Métrica / KPI Específico):**
   * *Consulta:* `"¿Cuáles fueron los resultados de OEE en la planta de Plásticos del Pacífico?"`
   * *Qué resaltar:* El agente responde con la línea base (54.2% / 58%) y el resultado final alcanzado (71.8% / 71%) citando la fuente `PC-2025-027`.
4. **Pregunta 4 (Metodología y Alcance):**
   * *Consulta:* `"¿Qué metodologías se aplicaron en la Clínica Santa Lucía para reducir los tiempos de espera?"`
   * *Qué resaltar:* Menciona Lean Healthcare, Pre-admisión Digital y gestión de agendas, citando `PC-2025-033`.
5. **Pregunta 5 (Prueba Anti-Alucinación / Dominio No Soportado):**
   * *Consulta:* `"¿Qué proyectos hemos realizado en la industria minera o de petróleo?"`
   * *Qué resaltar:* El agente declara de inmediato: *"No se dispone de información sobre ese aspecto en los informes de cierre de proyectos disponibles."*, demostrando que no inventa información.

### ⏱️ Minuto 4:00 - 5:00 | Pruebas y Cierre
* Ejecuta en la terminal: `pytest -v` y muestra que los **11 tests pasan al 100%**.
* Concluye mencionando la estimación de costos (~$3.63 USD/mes para 50 consultores) y agradece la atención.

---

## 🎯 2. Preparación para el "Cambio en Vivo" en la Entrevista (15% de la Nota)

Los evaluadores te pedirán un pequeño cambio en vivo. Aquí tienes las 3 solicitudes más comunes y cómo resolverlas en segundos:

### 🛠️ Escenario A: *"Agrega una nueva regla para filtrar por sector o duración mínima"*
* **Dónde modificar:** [`src/agent.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/agent.py) o [`src/database.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/database.py).
* **Cómo hacerlo:** En la función de consulta o prompt, agrega la condición SQL:
  ```python
  # Ejemplo: filtrar proyectos con duración mayor a 20 semanas
  sql = "SELECT * FROM proyectos WHERE duracion_semanas > 20"
  ```

### 🛠️ Escenario B: *"Agrega un campo nuevo a la ficha estructurada (ej. `presupuesto_horas`)"*
* **Dónde modificar:** [`src/models.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/models.py) y [`src/database.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/database.py).
* **Cómo hacerlo:**
  1. En `src/models.py`: agrega `presupuesto_horas: Optional[int] = None` en `ProyectoFicha`.
  2. En `src/database.py`: agrega `presupuesto_horas INTEGER` en la tabla `proyectos` y en el `INSERT`.

### 🛠️ Escenario C: *"Modifica el mensaje de advertencia anti-alucinación"*
* **Dónde modificar:** [`src/agent.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/agent.py) (en el `_build_system_prompt()` y en `_local_reasoning_engine()`).
* **Cómo hacerlo:** Edita el texto del mensaje para adaptarlo al requerimiento que te den.

---

## 💰 3. Resumen de Memoria de Costos para Defender

* **Volumen:** 50 consultores × 10 consultas/día = 11,000 consultas/mes.
* **Tokens:** 1,000 input tokens + 300 output tokens por consulta = 11M input / 3.3M output al mes.
* **Costo mensual con `gpt-4o-mini`:** **$3.63 USD / mes**.
* **Argumento de defensa:** *"La solución es económicamente hiper-eficiente. Con menos de $5 dólares al mes, toda la firma tiene acceso instantáneo a la memoria histórica de proyectos."*
