# Contexto y Requerimientos - Prueba Técnica Consultor de Inteligencia Artificial

## 1. 🏢 Contexto del Caso Práctico
* **Empresa ficticia:** Procesa Consultores (firma de consultoría de optimización de procesos).
* **El problema:** Tienen informes de cierre de proyectos terminados que quedan archivados. Quieren que cualquier consultor pueda hacer preguntas en lenguaje natural (ej. *"¿Qué experiencia tenemos en el sector financiero?", "¿Qué resultados obtuvimos en reducción de tiempos?", "¿Cuáles fueron las lecciones aprendidas en manufactura?"*) y obtener respuestas confiables, precisas y con citas directas de la fuente.
* **Los 4 proyectos incluidos:**
  * **PC-2025-014:** Cooperativa Horizonte Andino (Sector Financiero / Aprobación de créditos).
  * **PC-2025-027:** Plásticos del Pacífico (Sector Manufactura / Mejora de OEE en planta).
  * **PC-2025-033:** Clínica Santa Lucía del Valle (Sector Salud / Admisión y espera en consulta externa).
  * **PC-2026-006:** Supermercados La Canasta (Sector Retail / Reposición de inventario).

---

## 2. 🛠️ Requisitos Obligatorios a Construir

| Componente | Requisito Detallado |
| :--- | :--- |
| **1. Extracción de Fichas Estructuradas** | Script/pipeline en Python que procese los 4 informes y use un LLM con Structured Outputs (JSON Schema/Pydantic) para extraer campos clave: código, cliente, sector, objetivos, metodologías, métricas/KPIs antes y después, lecciones aprendidas, equipo, etc. |
| **2. Base de Datos Relacional** | Guardar estas fichas estructuradas en una base de datos relacional (ej. SQLite). |
| **3. Herramientas del Agente (Tools)** | El agente en Python debe tener al menos dos herramientas:<br>• 🔍 **Búsqueda semántica/texto (RAG)** en el contenido completo de los informes.<br>• 📊 **Consulta SQL** sobre la base relacional de fichas.<br>El agente (LLM reasoning / Function Calling) debe decidir autónomamente cuál usar según la pregunta. |
| **4. Confiabilidad y Citas** | Cada respuesta debe citar explícitamente el informe de origen (código y nombre del proyecto). Si algo no existe en los informes, debe declarar que no tiene información (evitar alucinaciones). |
| **5. Trazabilidad** | Mostrar al usuario el flujo de ejecución (qué herramientas invocó, qué parámetros usó y qué retorno obtuvo antes de dar la respuesta). |
| **6. Interfaz** | Interfaz de consola interactiva (CLI clara y amigable). |

---

## 3. ⭐ Puntos Opcionales (Diferenciales)
La prueba menciona extras que dan ventaja:
* 🌐 **Interfaz Web sencilla** (por ejemplo en Streamlit o FastAPI + UI limpia).
* 🔌 **Servidor MCP (Model Context Protocol)** para exponer las herramientas del agente.
* 🧪 **Pruebas automatizadas (Testing suite)** con preguntas reales y validación de respuestas esperadas.
* 📑 **Propuesta de integración** con SharePoint / Power BI.
* ⚡ **Flujo de ingestión automatizada** (ej. n8n / webhook).

---

## 4. 📦 Entregables Requeridos (Plazo: 48 horas)
1. **Repositorio en GitHub** (con commits incrementales y código modular limpio).
2. **README.md completo**:
   - Instrucciones claras de instalación y ejecución.
   - Arquitectura y justificación de decisiones técnicas.
   - Justificación del esquema de datos de la ficha de proyecto.
   - Supuestos y limitaciones conocidas.
   - Estimación de costos de inferencia/API para 50 consultores usando la herramienta a diario.
3. **Fichas estructuradas generadas** de los 4 proyectos (JSON / SQLite).
4. **Video de demostración (máx. 5 min)** respondiendo al menos 5 preguntas clave.
5. **Preparación para la entrevista en vivo (45 min)**:
   - Presentación de la arquitectura.
   - Defensa de decisiones técnicas.
   - Capacidad de hacer un ajuste o cambio de código en vivo.

---

## 5. 🎯 Criterios de Evaluación y Ponderación
* **30%**: Funcionamiento del agente: respuestas correctas, buen uso de herramientas, no inventa.
* **20%**: Validación de la información: exactitud frente a lo que dicen los informes.
* **20%**: Calidad del código y uso de Git.
* **15%**: Documentación y README.
* **15%**: Sesión de revisión: explicación, criterio y cambio en vivo.
