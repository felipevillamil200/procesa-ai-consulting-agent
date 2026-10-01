# 🤖 PROCESA AI Consulting Agent v1.0.0

Agente Inteligente de Consultoría con arquitectura híbrida (**SQL Relacional + RAG Semántico**) para análisis de proyectos históricos de consultoría.

---

## 🛠️ Stack Tecnológico
- **Backend:** FastAPI (Python 3.10+) + LangChain / ChromaDB / SQLite
- **Frontend:** React 18 + Vite + TailwindCSS + Lucide Icons

---

## 🚀 Guía rápida de ejecución local

### Paso 1: Backend (Terminal 1)
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn codigo.backend.main:app --port 8000 --reload
```
> 🌐 **Backend API:** `http://localhost:8000`  
> 📑 **Documentación Swagger:** `http://localhost:8000/docs`

---

### Paso 2: Frontend (Terminal 2)
```bash
cd codigo/frontend
npm install
npm run dev
```
> 💻 **Interfaz Web:** `http://localhost:5173`

---

> 📹 **Nota:** *Próximamente se subirá un video demostrativo explicando el flujo de trabajo y funcionamiento completo de este repositorio.*
