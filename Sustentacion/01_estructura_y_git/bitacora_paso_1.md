# 📘 Bitácora de Sustentación - Paso 1: Estructura del Proyecto y Git

---

## 🎯 ¿Qué hicimos en este paso?
1. **Definición de la arquitectura de directorios modular:**
   - `src/`: Código fuente encapsulado por capas y responsabilidades únicas.
   - `data/raw_reports/`: Almacén inmutable de los informes originales en PDF.
   - `data/fichas/`: Almacenamiento de las fichas extraídas en formato JSON.
   - `tests/`: Batería de pruebas automatizadas con `pytest`.
   - `agent/`: Directivas, prompts y skills del agente.
   - `Sustentacion/`: Bitácora y guía de defensa técnica.
2. **Seguridad con `.gitignore`:** Exclusión estricta de archivos `.env`, bases de datos locales, cachés (`__pycache__`) y claves API.
3. **Gestión de dependencias con `requirements.txt`:** Especificación de librerías modernas y ligeras sin dependencias innecesarias.
4. **Módulo de Configuración (`src/config.py`):** Centralización de rutas absolutas con `pathlib.Path` para evitar errores de ruta en Windows/Linux.

---

## 💡 ¿Por qué tomamos estas decisiones técnicas? (Defensa para la Entrevista)

| Decisión Técnica | Justificación para los Evaluadores |
| :--- | :--- |
| **Separar `src/` de `data/`** | Sigue el principio de separación de datos y código. Los reportes PDF son tratados como activos de solo lectura y las fichas generadas son reproducibles. |
| **Uso de `pathlib.Path` en `src/config.py`** | Garantiza portabilidad entre sistemas operativos (Windows `\` vs Linux/Mac `/`), evitando rutas quemadas (*hardcoded*). |
| **`.gitignore` estricto** | Previene la fuga de secretos (`OPENAI_API_KEY`), cumpliendo con los estándares de seguridad de datos corporativos. |

---

## 🎤 Preguntas Frecuentes de los Evaluadores y Cómo Responderlas:

### 1. *"¿Por qué decidiste no usar un framework monolítico como CrewAI o AutoGen desde el inicio?"*
> **Tu Respuesta:** *"Elegí una arquitectura modular en Python con OpenAI Function Calling nativo porque nos da **control total sobre el ciclo de razonamiento (ReAct loop)**, minimiza la sobrecarga de dependencias (menos riesgo de bugs o cambios de API de terceros), y hace que cualquier modificación en vivo durante esta sesión sea transparente, limpia y testeable en segundos."*

### 2. *"¿Cómo manejas las credenciales y configuración en entornos de producción?"*
> **Tu Respuesta:** *"Centralicé la configuración en `src/config.py` usando `python-dotenv`. Las variables críticas como `OPENAI_API_KEY` se leen directamente del entorno o de un archivo `.env` que está protegido en el `.gitignore`. Además, incluí un `.env.example` para facilitar el despliegue a nuevos desarrolladores."*
