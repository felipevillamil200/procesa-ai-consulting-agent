# Roadmap de Ejecución: 6 Pasos Oficiales

Este documento define la secuencia estricta de desarrollo sin desviaciones:

---

## 📌 Paso 1: Estructura del Proyecto y Git
- [ ] Inicializar repositorio Git local con `.gitignore` adecuado (excluyendo `.env`, `__pycache__`, `.venv`).
- [ ] Crear la estructura modular de carpetas:
  - `src/` (código fuente modular: `config.py`, `models.py`, `extractor.py`, `database.py`, `rag.py`, `agent.py`, `cli.py`, `app.py`).
  - `data/` (`raw_reports/`, `fichas/`, `proyectos.db`).
  - `tests/` (`test_extractor.py`, `test_database.py`, `test_rag.py`, `test_agent.py`).
- [ ] Crear `requirements.txt` con todas las dependencias necesarias.
- [ ] Crear `.env.example` con variables de entorno para API Keys y configuración.
- [ ] Realizar el primer commit en Git: `"feat: initial project structure, requirements and environment configuration"`.

---

## 📌 Paso 2: Extractor de Fichas Estructuradas (Pydantic + SQLite)
- [ ] Definir modelo de datos Pydantic `ProyectoFicha` con validación estricta de tipos.
- [ ] Crear extractor robusto con `pypdf` + LLM con `Structured Outputs` (JSON Schema) para procesar los 4 informes.
- [ ] Guardar las 4 fichas en formato JSON en `data/fichas/`.
- [ ] Crear el esquema de base de datos SQLite y poblar la tabla `proyectos` con las fichas generadas (`sqlite:///data/proyectos.db`).
- [ ] Commit en Git: `"feat: pydantic models, structured extraction pipeline and sqlite persistence"`.

---

## 📌 Paso 3: Motor de Búsqueda RAG (Texto de los Informes)
- [ ] Implementar segmentador de texto (chunking) preservando metadatos (código de proyecto, página, sección).
- [ ] Crear motor de búsqueda híbrida/semántica (`search_project_documents`) sobre el corpus de texto.
- [ ] Commit en Git: `"feat: semantic chunking and hybrid document search engine"`.

---

## 📌 Paso 4: Agente Inteligente y Herramientas (SQL + RAG)
- [ ] Implementar herramienta 1: `query_project_database` (ejecución segura de SQL solo lectura `SELECT`).
- [ ] Implementar herramienta 2: `search_project_documents` (búsqueda textual con filtros opcionales de proyecto).
- [ ] Implementar el orquestador del agente con Function Calling nativo.
- [ ] Incorporar mecanismos de trazabilidad (logging de herramientas) y citas obligatorias de fuentes.
- [ ] Commit en Git: `"feat: ai agent orchestrator with sql and rag tools and strict grounding"`.

---

## 📌 Paso 5: Interfaces de Usuario
- [ ] Implementar **CLI interactiva** en consola usando `Rich` (colores, paneles, estado de pensamiento, trazabilidad y citas).
- [ ] Implementar **Web App** con `Streamlit` (chat conversacional interactivo, visualizador de fichas y tabla de base de datos).
- [ ] Commit en Git: `"feat: rich terminal cli and streamlit interactive web application"`.

---

## 📌 Paso 6: Tests Automatizados (pytest) y README.md Final
- [ ] Desarrollar suite de pruebas con `pytest` que evalúe:
  - Extracción y guardado en SQLite.
  - Queries de SQL analíticos.
  - Recuperación de documentos RAG.
  - Evaluación de preguntas clave (sin alucinaciones).
- [ ] Redactar `README.md` exhaustivo con:
  - Guía de instalación y ejecución.
  - Arquitectura y justificación de decisiones.
  - Supuestos y limitaciones.
  - Memoria técnica de estimación de costos para 50 consultores diarios.
- [ ] Commit final en Git: `"docs: comprehensive test suite and detailed architecture readme"`.
