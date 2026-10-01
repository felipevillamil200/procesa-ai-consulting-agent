# 📘 Bitácora de Sustentación - Paso 1: Estructura del Proyecto y Arquitectura Modular

---

## 🎯 ¿Qué se implementó en este paso?
1. **Definición de la arquitectura de directorios desacoplada:**
   - `codigo/backend/`: Núcleo en Python con FastAPI, motor RAG, gestión SQLite y orquestación del agente.
   - `codigo/frontend/`: Aplicación de interfaz moderna en React + Vite + Tailwind CSS.
   - `data/raw_reports/`: Almacén inmutable de los 4 informes de cierre oficiales en PDF.
   - `data/fichas/`: Almacenamiento de las fichas estructuradas extraídas en formato JSON.
   - `data/proyectos.db`: Base de datos relacional SQLite con esquema indexado.
   - `tests/`: Batería completa de pruebas unitarias y de integración con `pytest`.
   - `bitacora/`: Guía pedagógica y memoria técnica para defensa en entrevista.
2. **Seguridad con `.gitignore`:** Exclusión estricta de archivos `.env`, bases de datos binarias, cachés (`__pycache__`, `node_modules/`, `dist/`) y claves API.
3. **Gestión de dependencias:** 
   - `requirements.txt`: FastAPI, uvicorn, openai, google-genai, pydantic, pypdf, reportlab, python-multipart, pytest, rich.
   - `package.json`: React 18, Vite, Tailwind CSS, Lucide Icons.
4. **Módulo de Configuración (`codigo/backend/config.py`):** Centralización de rutas absolutas con `pathlib.Path` para portabilidad universal (Windows y Linux).

---

## 💡 Decisiones Técnicas Clave (Para Defender en la Entrevista)

| Decisión Técnica | Justificación para los Evaluadores |
| :--- | :--- |
| **Separación Backend (FastAPI) y Frontend (React)** | Arquitectura desacoplada de grado industrial. Permite escalar la API independientemente del cliente web o consumirla desde microservicios, terminales o bots. |
| **Uso de `pathlib.Path` en `config.py`** | Garantiza portabilidad entre sistemas operativos (Windows `\` vs Linux/Mac `/`), evitando rutas quemadas (*hardcoded*). |
| **`.gitignore` estricto** | Previene la fuga de secretos (`OPENAI_API_KEY`, `GEMINI_API_KEY`), cumpliendo con los estándares de seguridad de datos corporativos. |

---

## 🎤 Preguntas Frecuentes de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste no usar un framework monolítico como CrewAI o LangChain para el agente central?"*
> **Tu Respuesta:** *"Elegí implementar el orquestador en Python nativo con OpenAI/Gemini Function Calling y un motor de razonamiento determinista porque nos da **control total sobre el ciclo de razonamiento (ReAct loop)**, elimina sobrecarga de dependencias innecesarias, garantiza latencias mínimas y hace que cualquier cambio en vivo durante esta entrevista sea transparente, seguro y testeable en segundos."*

### 2. *"¿Cómo manejas las credenciales y configuración en entornos de producción?"*
> **Tu Respuesta:** *"Centralicé la configuración en `codigo/backend/config.py` usando `python-dotenv`. Las claves API se leen del entorno del sistema operativo o del archivo `.env` protegido. Adicionalmente, el frontend cuenta con un modal de configuración dinámica para inyectar o alternar claves y modelos en tiempo de ejecución sin reiniciar el servidor."*
