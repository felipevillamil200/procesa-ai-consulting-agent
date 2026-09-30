import json
import sys
from pathlib import Path

# Asegurar que el directorio raíz esté en sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import streamlit as st
import pandas as pd

from src.agent import ConsultorAgent
from src.database import DatabaseManager
from src.config import FICHAS_DIR


# Configuración de página
st.set_page_config(
    page_title="Procesa Consultores - Agente IA de Proyectos",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inicializar componentes del agente en session_state
if "db_manager" not in st.session_state:
    st.session_state.db_manager = DatabaseManager()

if "agent" not in st.session_state:
    st.session_state.agent = ConsultorAgent(db_manager=st.session_state.db_manager)

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "¡Hola! Soy el **Agente Consultor de Procesa Consultores**. Puedo responder cualquier consulta sobre nuestros 4 proyectos históricos cerrados (Sector Financiero, Manufactura, Salud y Retail) combinando consultas SQL y búsqueda documental en los informes de cierre. ¿Qué deseas consultar?",
            "tools_used": [],
            "sources": []
        }
    ]

# ----------------- SIDEBAR -----------------
with st.sidebar:
    st.title("🏢 Procesa Consultores")
    st.caption("Sistema Experto de IA para Consulta de Proyectos")
    st.divider()

    st.subheader("📊 Proyectos en Base de Datos")
    proyectos = st.session_state.db_manager.get_all_proyectos()
    for p in proyectos:
        with st.expander(f"📌 {p['codigo_proyecto']} - {p['cliente'][:22]}..."):
            st.markdown(f"**Sector:** {p['sector']}")
            st.markdown(f"**Duración:** {p['duracion_semanas']} semanas")
            st.markdown(f"**Gerente:** {p['gerente_proyecto']}")

    st.divider()
    st.subheader("💡 Preguntas Rápidas de Ejemplo")
    sample_queries = [
        "¿Qué proyectos se ejecutaron en 2025 y cuál duró más semanas?",
        "¿Qué lecciones aprendimos sobre resistencia al cambio de mandos medios?",
        "¿Cuáles fueron los resultados de OEE en Plásticos del Pacífico?",
        "¿Qué metodologías se aplicaron en la Clínica Santa Lucía?",
        "¿Qué experiencia tenemos en proyectos del sector minero?"
    ]

    for sq in sample_queries:
        if st.button(f"👉 {sq[:40]}...", use_container_width=True):
            st.session_state.user_quick_input = sq

# ----------------- TABS PRINCIPALES -----------------
tab_chat, tab_fichas, tab_db = st.tabs(["💬 Chat Inteligente", "📑 Fichas Estructuradas", "💾 Explorador SQLite"])

# ----------------- TAB 1: CHAT -----------------
with tab_chat:
    st.subheader("💬 Asistente Conversacional con Citas y Trazabilidad")

    # Renderizar historial de mensajes
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

            # Renderizar trazabilidad de herramientas si existen
            if msg.get("tools_used"):
                with st.expander("🔧 Trazabilidad de Herramientas Invocadas", expanded=False):
                    for log in msg["tools_used"]:
                        st.markdown(f"**Herramienta:** `{log.tool_name}` (⚡ {log.execution_time_ms} ms)")
                        st.json(log.arguments)
                        st.info(f"**Resultado:** {log.result_summary}")

            # Renderizar fuentes si existen
            if msg.get("sources"):
                badges = " ".join([f"`{s}`" for s in msg["sources"]])
                st.caption(f"📌 **Fuentes Citadas:** {badges}")

    # Capturar entrada del usuario
    quick_input = st.session_state.pop("user_quick_input", None)
    user_prompt = st.chat_input("Escribe tu pregunta sobre los proyectos...") or quick_input

    if user_prompt:
        # Mostrar mensaje de usuario en UI
        st.session_state.messages.append({"role": "user", "content": user_prompt})
        with st.chat_message("user"):
            st.markdown(user_prompt)

        # Generar respuesta del agente
        with st.chat_message("assistant"):
            with st.spinner("🤖 Analizando pregunta y consultando herramientas..."):
                response = st.session_state.agent.ask(user_prompt)

            st.markdown(response.answer)

            if response.tools_used:
                with st.expander("🔧 Trazabilidad de Herramientas Invocadas", expanded=True):
                    for log in response.tools_used:
                        st.markdown(f"**Herramienta:** `{log.tool_name}` (⚡ {log.execution_time_ms} ms)")
                        st.json(log.arguments)
                        st.info(f"**Resultado:** {log.result_summary}")

            if response.sources:
                badges = " ".join([f"`{s}`" for s in response.sources])
                st.caption(f"📌 **Fuentes Citadas:** {badges}")

            # Guardar en sesión
            st.session_state.messages.append({
                "role": "assistant",
                "content": response.answer,
                "tools_used": response.tools_used,
                "sources": response.sources
            })

# ----------------- TAB 2: FICHAS ESTRUCTURADAS -----------------
with tab_fichas:
    st.subheader("📑 Fichas Técnicas de Proyectos Extraídas")
    st.caption("Fichas generadas con Structured Outputs (Pydantic) a partir de los informes de cierre en PDF.")

    json_files = sorted(list(FICHAS_DIR.glob("*.json")))
    for jf in json_files:
        with open(jf, "r", encoding="utf-8") as f:
            data = json.load(f)

        with st.expander(f"📋 {data['codigo_proyecto']} - {data['cliente']}", expanded=False):
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"**Sector:** {data['sector']}")
                st.markdown(f"**Ubicación:** {data['ubicacion']}")
                st.markdown(f"**Duración:** {data['duracion_semanas']} semanas ({data['fecha_inicio']} al {data['fecha_fin']})")
                st.markdown(f"**Gerente:** {data['gerente_proyecto']}")
                st.markdown(f"**Equipo:** {', '.join(data.get('equipo_consultor', []))}")
            with col2:
                st.markdown(f"**Beneficios Económicos:** {data['beneficios_economicos']}")
                st.markdown(f"**Objetivo:** {data['objetivo_general']}")

            st.markdown("#### 📈 Indicadores Clave de Impacto (Antes vs Después)")
            if data.get("kpis_impacto"):
                kpi_df = pd.DataFrame(data["kpis_impacto"])
                st.dataframe(kpi_df, use_container_width=True, hide_index=True)

            st.markdown("#### 💡 Lecciones Aprendidas Críticas")
            for lec in data.get("lecciones_aprendidas", []):
                st.markdown(f"- {lec}")

            st.markdown("#### ⚙️ Metodologías Aplicadas")
            st.markdown(", ".join([f"`{m}`" for m in data.get("metodologias_herramientas", [])]))

# ----------------- TAB 3: EXPLORADOR SQLITE -----------------
with tab_db:
    st.subheader("💾 Explorador de la Base de Datos Relacional (`proyectos.db`)")
    st.caption("Tabla `proyectos` administrada mediante SQLite y consultada dinámicamente por la herramienta SQL del agente.")

    all_proyectos = st.session_state.db_manager.get_all_proyectos()
    if all_proyectos:
        df_db = pd.DataFrame(all_proyectos)
        st.dataframe(df_db, use_container_width=True)

        st.subheader("🔍 Probador de Consultas SQL (Solo Lectura)")
        sample_sql = st.text_area("Consulta SQL:", value="SELECT codigo_proyecto, cliente, sector, duracion_semanas FROM proyectos WHERE duracion_semanas >= 20 ORDER BY duracion_semanas DESC")
        if st.button("Ejecutar Consulta SQL"):
            res = st.session_state.db_manager.execute_read_query(sample_sql)
            if res["success"]:
                st.success(f"Consulta ejecutada con éxito: {res['row_count']} fila(s).")
                st.dataframe(pd.DataFrame(res["rows"]), use_container_width=True)
            else:
                st.error(f"Error: {res['error']}")
