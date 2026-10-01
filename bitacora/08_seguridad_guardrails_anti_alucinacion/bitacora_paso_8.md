# 📘 Bitácora de Sustentación - Paso 8: Seguridad, Guardrails y Anti-Alucinación

---

## 🎯 ¿Qué se implementó en este paso?

1. **Guardrails en la Capa SQL (`codigo/backend/database.py`):**
   - **Validación Estructural:** La consulta debe comenzar obligatoriamente con `SELECT` o `WITH`.
   - **Bloqueo de Mutaciones:** Detección de palabras clave destructivas (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `ATTACH`, `PRAGMA`, `LOAD_EXTENSION`).
   - **Aislamiento de Literales:** Se evalúan las palabras reservadas fuera de cadenas de texto literales (comillas simples `'...'`), permitiendo consultas válidas como `SELECT 'UPDATE' AS estado`.
   - **Prevención de Múltiples Sentencias:** Rechaza consultas que contengan `;` para evitar ataques de inyección SQL encadenada.
2. **Sanitización de Archivos y Subidas (`codigo/backend/main.py`):**
   - Validación del nombre de archivo utilizando `Path(file.filename).name` para neutralizar ataques de *Path Traversal* (ej. `../../escape.pdf`).
   - Confinamiento estricto de los PDFs dentro del directorio `data/raw_reports/`.
   - Verificación previa de cabecera binaria (`%PDF-`) y estructura de páginas con `pypdf` antes de persistir cualquier archivo.
3. **Mecanismo Anti-Alucinación y Grounding (`codigo/backend/agent.py`):**
   - **Abstención Determinista:** Si la pregunta consulta por sectores o temas ausentes en los informes (ej. *minería, petróleo, agricultura, telecomunicaciones*), el agente responde de forma explícita: *"No se dispone de información sobre ese aspecto en los informes de cierre disponibles"* y emite `found_info=False`.
   - **Verificación de Retorno de Herramientas:** Si una consulta SQL devuelve 0 filas o el LLM no invoca herramientas, el agente no sintetiza datos ni afirma cifras no respaldadas.
   - **Validación de Rangos de Configuración:** El endpoint `/api/config` valida mediante Pydantic que la temperatura se mantenga estrictamente en el rango `[0.0, 1.0]`, retornando `HTTP 422` ante valores fuera de rango.

---

## 💡 Defensa Técnica para la Entrevista

| Guardrail | Riesgo Mitigado | Implementación Concreta |
| :--- | :--- | :--- |
| **SQL Read-Only Regex** | Destrucción o alteración de datos por prompt injection. | Validación previa a la ejecución en `DatabaseManager.execute_read_query()`. |
| **Path Traversal Sanitizer** | Sobrescritura de archivos del sistema operativo al subir PDFs. | `Path(filename).name` + verificación de directorio padre en `main.py`. |
| **Grounding Checker** | Alucinaciones fácticas o invento de cifras económicas. | Verificación de `had_successful_data` y abstención con `found_info=False` en `agent.py`. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Cómo evitas que el modelo invente ahorros o beneficios económicos que no están en el informe?"*
> **Tu Respuesta:** *"Los informes oficiales (como el de retail PC-2026-006 o banca PC-2025-014) no cuantifican ahorros en USD, sino métricas operativas (días de inventario o tiempos de espera). Tanto en el System Prompt como en el motor determinista de `agent.py`, tenemos una directiva estricta: si una consulta solicita dinero o montos y el informe no los contiene, el agente declara explícitamente que el informe no incluye montos monetarios y cita las métricas reales documentadas."*

### 2. *"¿Qué sucede si un usuario intenta enviar código malicioso o comandos de sistema a través de la consola SQL?"*
> **Tu Respuesta:** *"La capa de acceso a datos implementa el principio de privilegio mínimo (*Least Privilege*). La conexión SQLite se abre exclusivamente para lectura y el método `execute_read_query()` valida sintácticamente la sentencia antes de enviarla al driver. Si detecta palabras de mutación, comentarios de bypass o múltiples comandos separados por punto y coma, la llamada es abortada inmediatamente retornando un mensaje de error seguro y 0 filas."*
