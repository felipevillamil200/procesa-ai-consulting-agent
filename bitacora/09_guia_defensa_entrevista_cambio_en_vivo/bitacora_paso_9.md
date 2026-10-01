# 🎓 Guía Maestra para la Entrevista Técnica y Prueba de "Cambio en Vivo" (45 min)

---

## ⏱️ Estructura Típica de la Sesión de 45 Minutos

```
[00-10 min] Introducción y Demostración en Vivo de la Solución
[10-25 min] Preguntas de Arquitectura, Decisiones Técnicas y Código
[25-40 min] Prueba de "Cambio en Vivo" (Modificación de código en tiempo real)
[40-45 min] Conclusión, Preguntas del Candidato y Cierre
```

---

## 🎯 1. Demostración Inicial (Pitch de 5 Minutos)

**Guión Recomendado:**
> *"Buenas tardes. Para Procesa Consultores desarrollé un **Agente de IA Consultora con arquitectura híbrida** que combina **SQL Relacional sobre SQLite** para consultas cuantitativas y analíticas, y **RAG Semántico** sobre los informes oficiales en PDF para lecciones aprendidas y contexto cualitativo.*
> 
> *La solución está construida 100% en código modular con **FastAPI** en el backend y **React + Vite** en el frontend. Implementa Function Calling nativo con OpenAI/Gemini, guardrails estrictos de seguridad de solo lectura, trazabilidad en milisegundos, citas interactivas y un inspector de evidencia en pantalla dividida que permite auditar el documento original. Todo el sistema cuenta con pruebas unitarias en `pytest` y 100% de coincidencia fáctica con el corpus oficial."*

---

## 🛠️ 2. Guía Rápida para la Prueba de "Cambio en Vivo"

En la entrevista es muy probable que te pidan realizar una modificación en directo. Aquí tienes los casos más comunes y exactamente dónde tocarlos:

---

### Caso A: *"Agrega una nueva herramienta al agente (ej. calcular ROI o días entre fechas)"*
**Archivo:** [`codigo/backend/agent.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/codigo/backend/agent.py)

1. En `AGENT_TOOLS_SCHEMA`, agrega la definición de la función:
```python
{
    "type": "function",
    "function": {
        "name": "calculate_roi_estimate",
        "description": "Calcula el ahorro económico estimado basado en horas ahorradas y tarifa por hora.",
        "parameters": {
            "type": "object",
            "properties": {
                "horas_ahorradas": {"type": "number", "description": "Horas ahorradas al mes"},
                "tarifa_hora_usd": {"type": "number", "description": "Tarifa por hora en USD (ej: 25.0)"}
            },
            "required": ["horas_ahorradas", "tarifa_hora_usd"]
        }
    }
}
```
2. En el método `execute_tool(self, tool_name, args)` de `ConsultorAgent`:
```python
elif tool_name == "calculate_roi_estimate":
    horas = args.get("horas_ahorradas", 0)
    tarifa = args.get("tarifa_hora_usd", 25.0)
    ahorro = horas * tarifa
    tool_result = f"Ahorro estimado: ${ahorro:,.2f} USD al mes ({horas} horas x ${tarifa}/h)."
    raw_payload = {"ahorro_mensual_usd": ahorro}
```

---

### Caso B: *"Agrega un nuevo campo o columna a la ficha de proyecto (ej. `pais` o `presupuesto_usd`)"*
**Archivos:** 
1. [`codigo/backend/models.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/codigo/backend/models.py): Agregar `pais: str = Field(default="Ecuador", description="País del cliente")` en `ProyectoFicha`.
2. [`codigo/backend/database.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/codigo/backend/database.py): Agregar la columna `pais TEXT DEFAULT 'Ecuador'` en `CREATE TABLE IF NOT EXISTS proyectos` y en el `INSERT INTO`.

---

### Caso C: *"Filtra o agrega una regla en la herramienta SQL para ordenar siempre por duración"*
**Archivo:** [`codigo/backend/agent.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/codigo/backend/agent.py)
* En `execute_tool` bajo `tool_name == "query_project_database"`, puedes inspeccionar `sql_query` y añadir `ORDER BY duracion_semanas DESC` si no está presente.

---

### Caso D: *"Modifica el System Prompt para forzar un tono más ejecutivo o agregar una regla de negocio"*
**Archivo:** [`codigo/backend/agent.py`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/codigo/backend/agent.py)
* En el método `_build_system_prompt()`, edita el bloque de texto con las nuevas instrucciones o directivas de formato (por ejemplo: *"Siempre incluye viñetas y destaca los KPIs en negrita"*).

---

## 🎤 3. Respuestas Maestras para Preguntas Teóricas

| Pregunta Típica | Concepto Clave a Mencionar |
| :--- | :--- |
| **¿Cómo funciona el ciclo ReAct del agente?** | *Reason + Act*. El LLM recibe la pregunta, analiza el catálogo de Function Calling, decide invocar una herramienta (SQL o RAG), recibe el resultado de la ejecución, y realiza una segunda pasada para formular la respuesta final con grounding. |
| **¿Por qué usar RAG léxico/semántico en vez de solo embeddings vectoriales?** | En un corpus de 4 informes de cierre estructurados con terminología técnica precisa (*SMED, OEE, VSM, Lean Healthcare*), la combinación de búsqueda léxica BM25/TF-IDF con chunking semántico por párrafos garantiza que las siglas y términos exactos no se diluyan en el espacio vectorial. |
| **¿Cómo garantizas la reproducibilidad de los resultados?** | El pipeline cuenta con auto-inicialización determinista: si se borra la base de datos o la carpeta `data/`, el sistema se auto-puebla desde `extracted/` procesando los PDFs y reconstruyendo los índices SQLite y RAG en segundos. |
