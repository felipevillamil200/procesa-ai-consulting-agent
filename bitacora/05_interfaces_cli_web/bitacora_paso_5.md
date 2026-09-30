# 📘 Bitácora de Sustentación - Paso 5: Interfaces de Usuario (CLI Rich + Web Streamlit)

---

## 🎯 ¿Qué hicimos en este paso?

1. **Interfaz de Consola Interactiva (CLI) con Rich (`src/cli.py`):**
   - Panel de bienvenida con el branding institucional de *Procesa Consultores*.
   - Tabla interactiva que lista los proyectos cargados al iniciar (`PC-2025-014`, `PC-2025-027`, `PC-2025-033`, `PC-2026-006`).
   - Comandos del sistema: `/proyectos`, `/ayuda`, `/limpiar`, `/salir`.
   - Indicador de estado animado (*spinner*) mientras el agente razona e interactúa con las herramientas.
   - Panel dedicado a la **Trazabilidad** (muestra qué herramienta se invocó, los argumentos enviados, la latencia en milisegundos y el resultado).
   - Panel final de respuesta formateada con Markdown e insignias de **Fuentes Validadas** en color cyan.

2. **Aplicación Web Interactiva con Streamlit (`src/app.py`):**
   - **Pestaña 1 (Chat Inteligente):** Historial conversacional interactivo, menú lateral de preguntas rápidas sugeridas, visualizador expandible de herramientas ejecutadas e insignias de citas de proyectos.
   - **Pestaña 2 (Fichas Estructuradas):** Visor en tarjetas desplegables de las 4 fichas JSON con tablas de impacto (Línea Base vs Resultado Final) y lecciones aprendidas.
   - **Pestaña 3 (Explorador SQLite):** Tabla interactiva con el contenido de `data/proyectos.db` y un ejecutor interactivo de consultas SQL en vivo.

---

## 💡 ¿Por qué tomamos estas decisiones técnicas? (Defensa para la Entrevista)

| Decisión Técnica | Justificación para los Evaluadores |
| :--- | :--- |
| **Doble Capa de Presentación (CLI + Web)** | El enunciado solicita como mínimo una interfaz de consola. Implementar una CLI visualmente atractiva con `Rich` cumple al 100% el requisito base, mientras que la app en `Streamlit` cubre el **punto adicional opcional**, demostrando versatilidad y orientación al usuario final. |
| **Expanders de Trazabilidad en la UI** | Permite que tanto un consultor de negocios (que solo quiere leer la respuesta limpia) como un auditor técnico (que desea inspeccionar el query SQL o la búsqueda RAG) tengan la experiencia perfecta en un solo lugar. |
| **Explorador SQLite Integrado** | Durante la entrevista en vivo, facilita demostrar inmediatamente cómo las fichas extraídas están persistidas en la base de datos sin necesidad de abrir un cliente SQL externo (como DBeaver o SQLite Browser). |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Cómo se comporta la interfaz si el agente demora en responder?"*
> **Tu Respuesta:** *"Tanto en la CLI (`console.status`) como en Streamlit (`st.spinner`), implementamos indicadores de carga visuales que informan al usuario que el agente está analizando la pregunta y consultando las herramientas. Esto mejora la experiencia de usuario (UX) al evitar la sensación de congelamiento."*

### 2. *"Si te pido agregar una nueva pestaña en la aplicación web para comparar dos proyectos frente a frente, ¿dónde lo harías?"*
> **Tu Respuesta:** *"En `src/app.py`, agregaría un nuevo tab `st.tabs([...])` llamado 'Comparador de Proyectos', donde usaría `st.selectbox` para elegir dos `codigo_proyecto`, consultaría la base de datos con `db_manager.execute_read_query()` y renderizaría una tabla comparativa de sus `kpis_impacto` y duraciones en paralelo."*
