# 📋 Contexto del Proyecto: Arquitectura, Problemas con Vercel y Migración a Render

**Fecha de registro:** 1 de Octubre de 2026 / 2 de Octubre de 2026  
**Repositorio:** `felipevillamil200/procesa-ai-consulting-agent`  
**Stack Tecnológico:**
- **Backend:** Python 3.11, FastAPI, SQLite (`proyectos.db`), PyPDF, RAG Documental + SQL Relacional, LangChain/OpenAI (`gpt-4o-mini`, `gpt-4o`) y Google Gemini.
- **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons, Marked / Sanitize-HTML.

---

## 🛑 1. El Problema con Vercel (¿Por qué falló?)

Durante el intento de despliegue en Vercel (`procesa-ai-consulting-agent.vercel.app`), se presentaron bloqueos arquitectónicos graves debidos a la naturaleza **Serverless / Estática** de la plataforma:

1. **Error HTTP 405 Method Not Allowed en subida de PDFs y Configuración:**
   - Vercel utiliza un motor de enrutamiento estático para aplicaciones SPA (`index.html`).
   - Cuando el frontend enviaba peticiones `POST` a `/api/upload` o `/api/config` con archivos multipart (`multipart/form-data`) o JSON, el proxy de reescritura de Vercel interceptaba la solicitud y la redirigía al archivo estático `index.html`.
   - Dado que los archivos HTML estáticos en el CDN de Vercel rechazan cualquier método que no sea `GET`, arrojaba un error bloqueante: `La API devolvió HTTP 405`.

2. **Sistema de Archivos Efímero (`/tmp`) y Pérdida de Datos al Refrescar:**
   - Vercel ejecuta funciones Serverless (AWS Lambdas) que son *stateless* (sin estado).
   - Cada vez que el usuario recargaba la página o subía un nuevo archivo PDF, la instancia serverless se reiniciaba o cambiaba de contenedor, perdiendo la base de datos SQLite y los documentos procesados.
   - La API Key inyectada en memoria se borraba con cada ciclo de vida de la lambda si no estaba en las variables de entorno del servidor.

3. **Límites de Carga Serverless:**
   - Vercel tiene un límite estricto de 4.5 MB en el body de peticiones HTTP en su plan gratuito, lo que limitaba la carga de informes PDF y facturas reales.

---

## 💡 2. La Solución Técnica Implementada

Para resolver esto y garantizar que la aplicación funcione al 100% tanto en local como en producción:

1. **Sincronización y Persistencia en `localStorage` (Frontend):**
   - Se modificó `codigo/frontend/src/services/api.js` y `ConfigModal.jsx` para almacenar la API Key (`OpenAI` o `Gemini`), el modelo y el proveedor en el almacenamiento seguro del navegador.
   - Cada consulta al chat (`/api/chat`) ahora viaja con las credenciales y parámetros de sesión del cliente.

2. **Rutas Duales y Tolerancia a Fallos en FastAPI:**
   - En `codigo/backend/main.py` se definieron decoradores duales para todas las rutas:
     - `/api/config` y `/config`
     - `/api/upload` y `/upload`
     - `/api/chat` y `/chat`
     - `/api/proyectos` y `/proyectos`
     - `/api/fichas` y `/fichas`
     - `/api/documentos` y `/documentos`
     - `/` que sirve directamente el build de React (`codigo/frontend/dist/index.html`).

3. **Desacoplamiento de Vercel y Preparación para Render / Docker:**
   - Se crearon los archivos [`render.yaml`](./render.yaml) y [`Dockerfile`](./Dockerfile) para ejecutar el backend en un servidor Linux continuo (Web Service real) con SQLite persistente y subida de archivos ilimitada.

---

## 🚀 3. Instrucciones para Desplegar en Render (Plan de Acción de Mañana)

Render es la plataforma nativa recomendada para esta arquitectura completa (FastAPI + React + SQLite).

### Pasos exactos:
1. Iniciar sesión en **[https://dashboard.render.com](https://dashboard.render.com)** con GitHub.
2. Hacer clic en **"New +"** ➔ **"Web Service"**.
3. Conectar el repositorio: `felipevillamil200/procesa-ai-consulting-agent`.
4. Render leerá automáticamente el archivo `render.yaml` o se configuran los siguientes campos:
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     npm --prefix codigo/frontend install && npm --prefix codigo/frontend run build && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     python -m uvicorn codigo.backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** `Free`
5. **Variables de Entorno (Environment Variables):**
   - `OPENAI_API_KEY` = `sk-...` (tu clave de OpenAI)
   - `LLM_PROVIDER` = `openai`
   - `LLM_MODEL` = `gpt-4o-mini`
6. Hacer clic en **"Create Web Service"**.

---

## 📂 4. Estado de los Archivos Clave del Repositorio

* [`codigo/backend/main.py`](./codigo/backend/main.py): Servidor FastAPI con rutas duales, servidor de estáticos y endpoints de IA.
* [`codigo/frontend/src/services/api.js`](./codigo/frontend/src/services/api.js): Cliente API con fallback y persistencia de credenciales.
* [`codigo/frontend/src/components/ConfigModal.jsx`](./codigo/frontend/src/components/ConfigModal.jsx): Panel de control con soporte de OpenAI (GPT-4o-mini / GPT-4o) y Google Gemini.
* [`render.yaml`](./render.yaml): Blueprint de despliegue automático para Render.
* [`Dockerfile`](./Dockerfile): Contenedor multi-stage de producción (Node 20 + Python 3.11).
* [`.env`](./.env): Configuración local con `LLM_PROVIDER=openai` y `LLM_MODEL=gpt-4o-mini`.
