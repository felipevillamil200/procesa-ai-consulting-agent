# 📘 Bitácora de Sustentación - Paso 2: Extractor de Fichas Estructuradas (Pydantic + SQLite)

---

## 🎯 ¿Qué hicimos en este paso?

1. **Definición del Esquema Maestro con Pydantic v2 (`src/models.py`):**
   - Creamos el modelo `ProyectoFicha` con validación estricta de tipos.
   - Modelamos `KPIImpacto` para capturar de forma atómica: indicador, valor línea base (antes), resultado final (después) y variación porcentual.
2. **Motor de Persistencia Relacional (`src/database.py`):**
   - Diseñamos la base de datos `proyectos.db` en SQLite con clave primaria `codigo_proyecto`.
   - Implementamos `upsert_proyecto` con `ON CONFLICT DO UPDATE` para idempotencia (se puede reejecutar la extracción sin duplicar registros).
   - Diseñamos `execute_read_query` con **guardrails de seguridad**: valida que la consulta sea estrictamente de solo lectura (`SELECT`/`WITH`), bloqueando cualquier inyección o comando destructivo (`DROP`, `DELETE`, `UPDATE`).
3. **Pipeline de Extracción (`src/extractor.py`):**
   - Procesamos los 4 informes de cierre en PDF.
   - Generamos las 4 fichas estructuradas en `data/fichas/{codigo_proyecto}.json`.
   - Poblamos la base de datos relacional `sqlite:///data/proyectos.db`.

---

## 💡 Justificación del Esquema de Ficha (Para el README y la Entrevista)

| Campo | Tipo | ¿Por qué se diseñó así? |
| :--- | :--- | :--- |
| `codigo_proyecto` | `VARCHAR(20)` (PK) | Llave primaria estandarizada (`PC-YYYY-NNN`) que sirve de ancla para las citas bibliográficas del agente. |
| `sector` / `cliente` | `VARCHAR` | Permite filtrado indexado rápido en consultas SQL (*"¿Qué experiencia tenemos en retail o salud?"*). |
| `duracion_semanas` | `INTEGER` | Normalizado a entero numérico para permitir operaciones agregadas (`AVG`, `MAX`, `MIN`, `SUM`) en SQL. |
| `kpis_impacto` | `JSON / Lista` | Permite rastrear la mejora cuantitativa real (Antes vs. Después) sin perder la granularidad de cada métrica. |
| `metodologias` / `lecciones` | `JSON / Lista` | Mantiene el contexto metodológico y los aprendizajes clave para ser consultados o cruzados con RAG. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste guardar listas complejas (como KPIs o lecciones) como JSON en SQLite en vez de crear 4 tablas normalizadas adicionales?"*
> **Tu Respuesta:** *"Optamos por un **enfoque relacional híbrido (Document-Relational)**. Los atributos de filtrado, conteo y ordenamiento principal (`codigo_proyecto`, `cliente`, `sector`, `duracion_semanas`, `fechas`) están en columnas escalares indexadas para máxima velocidad y simplicidad en Text-to-SQL. Los atributos multidimensionales (como la lista de lecciones o KPIs) se almacenan en formato JSON estructurado nativo de SQLite, lo que evita joins innecesarios y reduce la complejidad para el generador SQL del LLM."*

### 2. *"¿Cómo garantizas que el agente no ejecute un `DROP TABLE` o una consulta maliciosa en la base de datos?"*
> **Tu Respuesta:** *"En `src/database.py`, el método `execute_read_query()` implementa un guardrail estricto: valida que la primera palabra de la consulta sea exclusivamente `SELECT` o `WITH`, y bloquea explícitamente palabras reservadas como `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER` o `TRUNCATE`. Si el LLM intenta mutar la BD, el sistema rechaza la ejecución de forma segura y devuelve un error controlado."*

### 3. *"Si entra un nuevo informe de proyecto en el futuro, ¿cómo se procesa?"*
> **Tu Respuesta:** *"Basta con colocar el nuevo PDF en `data/raw_reports/` y ejecutar `process_all_reports()`. El extractor utiliza `upsert` basado en el `codigo_proyecto`, por lo que actualiza o inserta el nuevo proyecto sin duplicar ni corromper los existentes."*
