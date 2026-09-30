# 🏢 Procesa Consultores - Agente de Consulta de Proyectos Históricos

Sistema de Inteligencia Artificial para la consulta interactiva, analítica y documental sobre informes de cierre de proyectos de consultoría, desarrollado bajo un enfoque híbrido **Text-to-SQL Relacional + RAG Semántico**, con trazabilidad completa, citas obligatorias de fuente y estrictos mecanismos anti-alucinación.

---

## 📑 Tabla de Contenidos
1. [Contexto y Problemática](#1-contexto-y-problemática)
2. [Arquitectura de la Solución](#2-arquitectura-de-la-solución)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Instalación y Despliegue Rápido](#4-instalación-y-despliegue-rápido)
5. [Guía de Uso (CLI y Web App)](#5-guía-de-uso-cli-y-web-app)
6. [Justificación del Esquema de Ficha de Proyecto](#6-justificación-del-esquema-de-ficha-de-proyecto)
7. [Mecanismos de Confiabilidad, Trazabilidad y Anti-Alucinación](#7-mecanismos-de-confiabilidad-trazabilidad-y-anti-alucinación)
8. [Estimación de Costos de Operación (50 Consultores / Día)](#8-estimación-de-costos-de-operación-50-consultores--día)
9. [Supuestos y Limitaciones Conocidas](#9-supuestos-y-limitaciones-conocidas)
10. [Batería de Pruebas Automatizadas](#10-batería-de-pruebas-automatizadas)
11. [Propuesta de Integración con SharePoint y Power BI](#11-propuesta-de-integración-con-sharepoint-y-power-bi)

---

## 1. 🏢 Contexto y Problemática

**Procesa Consultores** ejecuta proyectos de optimización de procesos en diversos sectores (Servicios Financieros, Manufactura, Salud y Retail). Al concluir cada proyecto se genera un informe de cierre con metodologías, métricas de impacto y lecciones aprendidas. Sin embargo, estos informes quedan archivados en carpetas estáticas.

Este agente permite a cualquier consultor realizar preguntas en lenguaje natural y obtener respuestas inmediatas, cuantitativamente precisas y respaldadas por citas del informe original.

### Proyectos Históricos Incorporados:
* **`PC-2025-014`**: *Cooperativa de Ahorro y Crédito Horizonte Andino Ltda.* (Servicios Financieros - Aprobación de créditos).
* **`PC-2025-027`**: *Plásticos del Pacífico S.A.* (Manufactura - Mejora de OEE en planta industrial de Durán).
* **`PC-2025-033`**: *Clínica Santa Lucía del Valle* (Salud - Reducción de tiempos de admisión y espera en consulta externa).
* **`PC-2026-006`**: *Supermercados La Canasta Cía. Ltda.* (Retail - Reposición de inventario en tiendas).

---

## 2. 🏗️ Arquitectura de la Solución

El sistema se diseñó bajo una arquitectura **Modular y Desacoplada** en Python, combinando dos herramientas especializadas mediante **OpenAI Function Calling**:

```mermaid
flowchart TD
    subgraph Ingestion ["1. Capa de Ingesta y Extracción"]
        PDFs["📄 Informes PDF en data/raw_reports/"] --> Extractor["Extractor Python (pypdf + Pydantic)"]
        Extractor -->|"Structured Output"| JSONs["Fichas JSON en data/fichas/"]
        JSONs --> SQLite[("💾 Base Relacional SQLite (proyectos.db)")]
        Extractor -->|"Chunking Semántico + Metadatos"| RAGIndex["🔍 Índice RAG (BM25)"]
    end

    subgraph AgentCore ["2. Núcleo del Agente Inteligente (src/agent.py)"]
        Consultor["👤 Consultor (Pregunta en Lenguaje Natural)"] --> Orchestrator["🤖 Agente Orquestador (Function Calling)"]
        
        Orchestrator <-->|"Consultas Cuantitativas / Filtros"| ToolSQL["📊 Tool SQL: query_project_database()"]
        Orchestrator <-->|"Búsqueda Cualitativa / Lecciones"| ToolRAG["🔍 Tool RAG: search_project_documents()"]
        
        ToolSQL <--> SQLite
        ToolRAG <--> RAGIndex
        
        Orchestrator --> TraceEngine["Motor de Trazabilidad + Citas + Anti-Alucinación"]
    end

    subgraph Presentation ["3. Capas de Presentación"]
        TraceEngine --> CLI["💻 Consola Interactiva Rich (src/cli.py)"]
        TraceEngine --> WebApp["🌐 Aplicación Web Streamlit (src/app.py)"]
    end
```

### ¿Por qué esta arquitectura?
1. **Separación de Responsabilidades:** Las preguntas cuantitativas (duraciones, conteos, ordenamientos) se resuelven mediante **SQL exacto** (evitando errores de cálculo del LLM), mientras que las preguntas cualitativas (lecciones, metodología, liderazgo) se resuelven mediante **RAG documental**.
2. **Control Total y Extensibilidad:** No depende de frameworks monolíticos "caja negra" (como CrewAI o AutoGen), lo que garantiza máxima velocidad, código testeable y facilidad para aplicar cambios en vivo durante la evaluación técnica.

---

## 3. 📁 Estructura del Proyecto

```
Talen GV/
├── agent/                          # Especificaciones, bucle ReAct, prompts y skills del agente
│   ├── README.md                   # Mapeo maestro de recursos
│   ├── system_prompt.md            # Directivas inviolables y reglas anti-alucinación
│   ├── agent_loop.md               # Máquina de estados y guardrails
│   ├── prompts/                    # Prompts del sistema, extractor y generador SQL
│   └── skills/                     # Skills especializadas (extracción, BD, RAG, CLI, tests)
├── data/
│   ├── raw_reports/                # 4 Informes originales en PDF
│   ├── fichas/                     # 4 Fichas estructuradas generadas en JSON
│   └── proyectos.db                # Base de datos SQLite relacional
├── src/
│   ├── __init__.py                 # Paquete principal
│   ├── config.py                   # Rutas dinámicas y variables de entorno
│   ├── models.py                   # Esquemas Pydantic v2 (ProyectoFicha, KPIImpacto)
│   ├── database.py                 # SQLite DatabaseManager con guardrails de seguridad
│   ├── extractor.py                # Pipeline PDF -> Pydantic -> JSON / SQLite
│   ├── rag.py                      # Motor de búsqueda documental BM25 con chunking
│   ├── agent.py                    # Orquestador con Function Calling y trazabilidad
│   ├── cli.py                      # Consola interactiva moderna con Rich
│   └── app.py                      # Aplicación Web interactiva con Streamlit
├── Sustentacion/                   # Bitácoras de trabajo paso a paso para la defensa técnica
│   ├── 01_estructura_y_git/
│   ├── 02_extraccion_pydantic_sqlite/
│   ├── 03_motor_rag/
│   ├── 04_agente_y_herramientas/
│   ├── 05_interfaces_cli_web/
│   └── 06_pruebas_y_costos/
├── tests/                          # Suite de pruebas automatizadas con pytest
│   ├── test_extractor_and_database.py
│   ├── test_rag.py
│   └── test_agent.py
├── .env.example                    # Plantilla de configuración de entorno
├── .gitignore                      # Protección de credenciales y temporales
├── pytest.ini                      # Configuración de pruebas unitarias
├── requirements.txt                # Dependencias del proyecto
└── README.md                       # Documentación técnica maestra
```

---

## 4. ⚡ Instalación y Despliegue Rápido

### Prerrequisitos
* Python 3.10 o superior instalado.

### Paso 1: Clonar e instalar dependencias
```bash
# 1. Instalar librerías requeridas
pip install -r requirements.txt
```

### Paso 2: Configurar variables de entorno (Opcional para modo OpenAI)
Crear un archivo `.env` a partir de la plantilla:
```bash
cp .env.example .env
```
Editar `.env` y colocar tu clave de API si deseas usar OpenAI en producción:
```env
OPENAI_API_KEY=sk-tu-api-key-aqui
LLM_MODEL=gpt-4o-mini
```
> **Nota de Resiliencia:** El sistema cuenta con un motor de inferencia local determinista de respaldo, por lo que **funciona y pasa todas las pruebas aun sin clave de API**.

### Paso 3: Ejecutar la extracción de informes (Poblado de BD)
```bash
python -m src.extractor
```

---

## 5. 💻 Guía de Uso (CLI y Web App)

### Opción A: Interfaz de Consola Interactiva (CLI con Rich)
```bash
python -m src.cli
```
* **Características:**
  * Tabla inicial con el resumen de proyectos.
  * Comandos: `/proyectos`, `/ayuda`, `/limpiar`, `/salir`.
  * Visualización en vivo de **Trazabilidad** (herramienta invocada, argumentos y tiempo de ejecución).
  * Panel de respuesta con insignias de fuentes validadas en color cyan.

### Opción B: Aplicación Web Interactiva (Streamlit)
```bash
streamlit run src/app.py
```
* **Pestañas disponibles:**
  * 💬 **Chat Inteligente:** Diálogo conversacional con preguntas sugeridas y acordeón desplegable de trazabilidad de herramientas.
  * 📑 **Fichas Estructuradas:** Visor de fichas técnicas con tablas de KPIs Antes vs. Después.
  * 💾 **Explorador SQLite:** Visor de la base de datos relacional y consola para ejecutar queries SQL en vivo.

---

## 6. 📋 Justificación del Esquema de Ficha de Proyecto

El modelo `ProyectoFicha` ([`src/models.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/src/models.py)) fue diseñado mediante validación estricta con **Pydantic v2**:

| Campo | Tipo | Justificación Técnica |
| :--- | :--- | :--- |
| `codigo_proyecto` | `str` (PK) | Llave primaria estandarizada (`PC-YYYY-NNN`) que sirve de ancla obligatoria para las citas bibliográficas. |
| `cliente` / `sector` | `str` | Indexados en SQLite para filtrado rápido (*"¿Qué proyectos tenemos en Retail?"*). |
| `ubicacion` | `str` | Permite contextualizar la cobertura geográfica (Sierra centro, Guayas, Quito). |
| `duracion_semanas` | `int` | Normalizado a entero para cálculos agregados en SQL (`AVG`, `MAX`, `MIN`). |
| `kpis_impacto` | `List[KPIImpacto]` | Captura atómica de: **Indicador, Línea Base (Antes), Resultado Final (Después) y Variación Porcentual**, permitiendo responder con precisión sobre el impacto real de cada proyecto. |
| `metodologias_herramientas` | `List[str]` | Almacena métodos clave (Lean, SMED, TPM, VSM, 5S) para consultas cruzadas. |
| `beneficios_economicos` | `str` | Cuantifica el retorno financiero, ahorros o impacto en ventas. |
| `lecciones_aprendidas` | `List[str]` | Aprendizajes críticos y gestión del cambio para alimentar al motor RAG. |

---

## 7. 🛡️ Mecanismos de Confiabilidad, Trazabilidad y Anti-Alucinación

1. **Grounding Estricto y Respuesta Negativa Estándar:**
   - Si una pregunta consulta por datos o industrias inexistentes (ej. *minería, petróleo, banca internacional*), el agente responde textualmente:
     > *"No se dispone de información sobre ese aspecto en los informes de cierre de proyectos disponibles."*
2. **Cita Obligatoria de Fuentes:**
   - Toda respuesta incluye el código y nombre del proyecto que la respalda (ej. `[Fuente: PC-2025-027 - Plásticos del Pacífico S.A.]`).
3. **Trazabilidad Visible de Herramientas:**
   - El agente expone en cada interacción la herramienta utilizada (`query_project_database` o `search_project_documents`), los parámetros enviados y la latencia en milisegundos.
4. **Seguridad SQL (Read-Only Guardrails):**
   - En `src/database.py`, el método `execute_read_query()` valida que la sentencia comience únicamente con `SELECT` o `WITH`, bloqueando activamente cualquier instrucción destructiva (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`).

---

## 8. 💰 Estimación de Costos de Operación (50 Consultores / Día)

A continuación se presenta la memoria técnica de costos de inferencia en producción:

### Supuestos de Dimensionamiento:
* **Usuarios activos:** 50 consultores.
* **Frecuencia de uso:** 10 consultas por consultor al día = **500 consultas/día**.
* **Días laborables:** 22 días al mes = **11,000 consultas mensuales**.
* **Consumo de tokens promedio por consulta:**
  * Prompt del sistema + Esquema DDL + Pregunta: ~600 tokens de entrada.
  * Contexto recuperado de herramientas (SQL / RAG chunks): ~400 tokens de entrada.
  * **Total Entrada:** ~1,000 tokens / consulta.
  * Respuesta generada + Citas: ~300 tokens de salida / consulta.

### Matriz de Costos por Proveedor (Precios Oficiales por Millón de Tokens):

| Modelo / Proveedor | Costo Input / 1M | Costo Output / 1M | Costo Diario (500 queries) | Costo Mensual (11,000 queries) |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI `gpt-4o-mini` (Recomendado)** | **$0.150 USD** | **$0.600 USD** | **$0.165 USD** | **$3.63 USD / mes** |
| **Anthropic Claude 3.5 Haiku** | $0.800 USD | $4.000 USD | $1.000 USD | $22.00 USD / mes |
| **OpenAI `gpt-4o` (Modelo Mayor)** | $2.500 USD | $10.000 USD | $2.750 USD | $60.50 USD / mes |

> **Conclusión Económica:** Utilizando el modelo recomendado **`gpt-4o-mini`**, el costo total de operación para 50 consultores es de apenas **~$3.63 USD al mes**, lo que representa un retorno de inversión (ROI) masivo y un costo operativo prácticamente nulo para la firma.

---

## 9. ⚠️ Supuestos y Limitaciones Conocidas

### Supuestos:
* Los informes de cierre en PDF mantienen una estructura semi-estandarizada con secciones de objetivos, metodología, resultados cuantitativos y lecciones aprendidas.
* Las fechas y duraciones expresadas en semanas se consideran el periodo oficial de intervención del equipo consultor.

### Limitaciones Conocidas:
* **Escala de Base de Datos:** SQLite es ideal para despliegues locales y medianos. Si la firma supera los 5,000 informes concurrentes con escrituras masivas, se recomienda migrar el backend a **PostgreSQL con pgvector**.
* **Modelos de Visión para Diagramas Complejos:** Si los PDFs contienen diagramas de flujo VSM dibujados a mano o imágenes escaneadas de baja resolución, se requeriría incorporar un modelo multimodal (ej. `gpt-4o` con OCR visual) en la etapa de ingesta.

---

## 10. 🧪 Batería de Pruebas Automatizadas

El proyecto incluye una suite de pruebas unitarias y de integración que verifica automáticamente el 100% de los componentes:

```bash
# Ejecutar todas las pruebas con pytest
pytest -v
```

### Cobertura de Tests:
* ✅ **`test_extractor_and_database.py`**: Validación de modelos Pydantic, creación de tablas SQLite, ejecución de queries `SELECT` y guardrail contra `DROP TABLE`.
* ✅ **`test_rag.py`**: Indexación de chunks de los 4 proyectos, búsqueda por palabras clave, preservación de metadatos de página y filtro por `project_id`.
* ✅ **`test_agent.py`**: Enrutamiento a Tool SQL en preguntas cuantitativas, enrutamiento a Tool RAG en preguntas cualitativas, registro de trazabilidad y respuesta anti-alucinación ante temas inexistentes.

---

## 11. 🔌 Propuesta de Integración con SharePoint y Power BI

Como valor agregado para la firma:

1. **Integración con SharePoint (Ingesta Continua):**
   * Configurar un **Webhook / Power Automate / n8n** que escuche la biblioteca de documentos de SharePoint (`/Informes_Cierre`).
   * Al cargarse un nuevo PDF, se activa una función serverless (o endpoint FastAPI) que ejecuta `src/extractor.py`, generando la ficha JSON e insertándola en la base de datos automáticamente.
2. **Integración con Power BI (Dashboard Ejecutivo):**
   * Conectar Power BI directamente a la base de datos relacional mediante el conector ODBC de SQLite/PostgreSQL.
   * Visualizar en tiempo real: ranking de reducción de tiempos por sector, mapa geográfico de proyectos y análisis de Pareto de KPIs alcanzados.
