# 📘 Bitácora de Sustentación - Paso 7: Frontend React, Vite, Tailwind y Visor de Evidencia

---

## 🎯 ¿Qué se implementó en este paso?

1. **Arquitectura Frontend Moderna (`codigo/frontend/`):**
   - Construido con **React 18 + Vite** para tiempos de carga y respuesta instantáneos.
   - Diseño con **Tailwind CSS**, soporte para modo oscuro profundo, variables de diseño corporativo y micro-animaciones fluidas.
2. **Componentes Clave de la Plataforma:**
   - `ChatView.jsx`: Asistente conversacional con sugerencias automáticas dinámicas basadas en los proyectos activos, chips de herramientas ejecutadas, tiempos de respuesta y citas interactivas.
   - `EvidenceInspector.jsx`: Panel lateral en pantalla dividida (*Split-View*) que permite inspeccionar la evidencia fáctica con 3 vistas:
     1. *Texto del Fragmento RAG* con número de página y proyecto.
     2. *Ficha Técnica Estructurada* con indicadores antes vs. después.
     3. *Visor PDF Original Embebido* para validación directa del documento.
   - `SQLiteExplorer.jsx`: Consola de administración de datos con ejecución de consultas SQL libres, visualización de tablas en tiempo real, subida de nuevos PDFs (Drag & Drop), eliminación y restauración determinista.
   - `FichasView.jsx`: Resumen ejecutivo de cada proyecto con comparativa visual de KPIs y factores de cambio.
   - `ConfigModal.jsx`: Panel de configuración en tiempo real para inyectar API Keys, alternar modelos (Gemini Flash, Pro, OpenAI GPT-4o-mini) y ajustar la temperatura del agente.
3. **Páginas Ejecutivas de Presentación:**
   - `/inicio.html` / `/nival.html`: Escena Hero 3D con estética moderna.
   - `/guia.html`: Guía técnica y de arquitectura del sistema.
   - `/solucion.html`: Simulador de retorno de inversión (ROI) para consultoría.

---

## 💡 Decisiones de Diseño UI/UX (Para Defender en la Entrevista)

| Elemento UI/UX | Justificación Técnica y de Negocio |
| :--- | :--- |
| **Citas Clicables en Texto** | Convierte las menciones de proyectos en botones interactivos que abren el inspector de evidencia en la página exacta del informe. |
| **Inspector Split-View** | Permite a los consultores y evaluadores auditar la fuente original sin salir del flujo de conversación. |
| **Feedback de Trazabilidad Visual** | Muestra qué herramienta fue llamada (`query_project_database` o `search_project_documents`), sus argumentos y los milisegundos que tomó. |

---

## 🎤 Preguntas Clave de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste crear una aplicación completa en React en lugar de quedarte solo con la consola CLI o Streamlit?"*
> **Tu Respuesta:** *"El enunciado solicitaba una interfaz de usuario (consola o web). Decidí construir un Frontend profesional en React + Vite desacoplado del backend FastAPI para demostrar una arquitectura de nivel de producción. Esto nos permitió incorporar capacidades avanzadas como el inspector de evidencia en pantalla dividida (Split-View), renderizado de citas interactivas y administración visual de SQLite con subida de PDFs por arrastrar y soltar."*

### 2. *"¿Cómo se conecta el Frontend con el Backend y cómo maneja las llamadas en tiempo real?"*
> **Tu Respuesta:** *"Toda la comunicación está encapsulada en `codigo/frontend/src/services/api.js`. Consume los endpoints REST de FastAPI (`/api/chat`, `/api/proyectos`, `/api/fichas`, `/api/sql`, `/api/config`, `/api/upload`). El estado se gestiona de forma reactiva con hooks de React (`useState`, `useEffect`, `useCallback`), asegurando que las actualizaciones de configuración o subida de nuevos proyectos se sincronicen de inmediato en toda la UI."*
