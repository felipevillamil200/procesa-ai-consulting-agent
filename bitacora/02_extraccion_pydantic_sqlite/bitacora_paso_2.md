# 📘 Bitácora de Sustentación - Paso 2: Extractor de Fichas Estructuradas (Pydantic + SQLite)

---

## 🎯 ¿Qué se implementó en este paso?

1. **Definición del Esquema Maestro con Pydantic v2 (`codigo/backend/models.py`):**
   - Modelo `ProyectoFicha` con validación estricta de tipos, `duracion_semanas` con restricción `ge=0` y fechas en formato estándar.
   - Modelo `KPIImpacto` para capturar de forma atómica: indicador, línea base (antes), resultado final (después) y variación porcentual.
2. **Motor de Persistencia Relacional (`codigo/backend/database.py`):**
   - Base de datos `proyectos.db` en SQLite con clave primaria `codigo_proyecto`.
   - Implementación de `upsert_proyecto` con `ON CONFLICT DO UPDATE` para idempotencia total.
   - Método `execute_read_query` con **guardrails de seguridad avanzados**: valida que la consulta sea estrictamente de solo lectura (`SELECT`/`WITH`), bloquea múltiples sentencias con `;`, previene inyecciones destructivas (`DROP`, `DELETE`, `UPDATE`, `ALTER`, `ATTACH`), y permite de forma segura literales de texto entre comillas (ej. `SELECT 'UPDATE' AS estado`).
3. **Pipeline de Extracción e Ingesta (`codigo/backend/extractor.py`):**
   - Procesamiento de los 4 informes oficiales de cierre en PDF.
   - Extracción con 100% de exactitud fáctica cotejada (fechas, semanas, gerentes y los 22 pares de KPIs).
   - Generación de fichas JSON en `data/fichas/` y persistencia relacional en SQLite.
   - Endpoint `/api/upload` en FastAPI para extraer e indexar dinámicamente nuevos PDFs subidos desde la interfaz.

---

## 💡 Justificación del Esquema de Ficha (Para Defender en la Entrevista)

| Campo | Tipo | ¿Por qué se diseñó así? |
| :--- | :--- | :--- |
| `codigo_proyecto` | `VARCHAR(20)` (PK) | Llave primaria estandarizada (`PC-YYYY-NNN`) que sirve de ancla para las citas bibliográficas del agente. |
| `sector` / `cliente` | `VARCHAR` | Permite filtrado indexado rápido en consultas SQL (*"¿Qué experiencia tenemos en retail o salud?"*). |
| `duracion_semanas` | `INTEGER` | Normalizado a entero numérico (`ge=0`) para permitir operaciones agregadas (`AVG`, `MAX`, `MIN`, `SUM`) en SQL. |
| `kpis_impacto` | `JSON / Lista` | Permite rastrear la mejora cuantitativa real (Antes vs. Después) sin perder la granularidad de cada métrica. |
| `metodologias` / `lecciones` | `JSON / Lista` | Mantiene el contexto metodológico y los aprendizajes clave para ser consultados o cruzados con RAG. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste guardar listas complejas (como KPIs o lecciones) como JSON en SQLite en vez de crear 4 tablas normalizadas adicionales?"*
> **Tu Respuesta:** *"Optamos por un **enfoque relacional híbrido (Document-Relational)**. Los atributos de filtrado, conteo y ordenamiento principal (`codigo_proyecto`, `cliente`, `sector`, `duracion_semanas`, `fechas`) están en columnas escalares indexadas para máxima velocidad y simplicidad en Text-to-SQL. Los atributos multidimensionales (como la lista de lecciones o KPIs) se almacenan en formato JSON estructurado nativo de SQLite, lo que evita joins innecesarios y reduce la complejidad para el generador SQL del LLM."*

### 2. *"¿Cómo garantizas que el agente no ejecute un `DROP TABLE` o una consulta maliciosa en la base de datos?"*
> **Tu Respuesta:** *"En `codigo/backend/database.py`, el método `execute_read_query()` implementa un guardrail estructural: valida que la consulta inicie con `SELECT` o `WITH`, elimina comentarios SQL, bloquea múltiples sentencias delimitadas por `;` y analiza las palabras clave fuera de cadenas de texto literales. Si el LLM intenta mutar la BD, el sistema rechaza la ejecución de forma segura y devuelve un error controlado con filas vacías."*

### 3. *"Si entra un nuevo informe de proyecto en el futuro, ¿cómo se procesa?"*
> **Tu Respuesta:** *"El sistema expone el endpoint `POST /api/upload` (integrado con el modal de subida de la Web App) o la función `process_all_reports()`. El extractor realiza la extracción estructurada y ejecuta un `upsert` basado en el `codigo_proyecto`, actualizando la base de datos SQLite y el índice RAG simultáneamente."*
