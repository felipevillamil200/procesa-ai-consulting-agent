# Skill: Interfaces de Usuario CLI y Web (CLI & Web Skill)

## Propósito
Guiar la construcción de las capas de presentación visual del sistema: una interfaz de terminal interactiva con `Rich` y una aplicación web interactiva con `Streamlit`.

---

## 1. 💻 Interfaz de Consola Interactiva (CLI con Rich)
- **Componentes visuales:**
  - Panel de bienvenida con el branding de *Procesa Consultores*.
  - Tabla de proyectos cargados al iniciar (`PC-2025-014`, `PC-2025-027`, `PC-2025-033`, `PC-2026-006`).
  - Spinner animado durante el razonamiento y llamada de herramientas.
  - Bloque visual de **Trazabilidad** (mostrando la herramienta invocada, consulta enviada y resumen de datos).
  - Bloque de **Respuesta Final** formateada con citas resaltadas en color cyan.
  - Comando `/salir` o `exit` para cerrar.

---

## 2. 🌐 Aplicación Web (Streamlit)
- **Pestaña 1: Chat con el Agente:**
  - Historial de conversación interactivo con `st.chat_message`.
  - Expandible con el log de trazabilidad de herramientas utilizadas por el agente.
  - Insignias (badges) de fuentes citadas.
- **Pestaña 2: Fichas de Proyectos:**
  - Tarjetas desplegables con las fichas estructuradas de los 4 proyectos.
- **Pestaña 3: Explorador de Base de Datos:**
  - Visor interactivo de la tabla SQLite `proyectos`.
