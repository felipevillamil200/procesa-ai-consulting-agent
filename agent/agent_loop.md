# Ciclo de Ejecución y Guardrails del Agente (Agent Loop)

Este documento define el ciclo de razonamiento y validación del agente para responder consultas de manera determinista y sin alucinaciones.

---

## 🔄 Diagrama del Ciclo de Ejecución (ReAct Loop)

```mermaid
stateDiagram-v2
    [*] --> RecibirPregunta: Usuario ingresa consulta
    RecibirPregunta --> AnalisisIntencion: Clasificar si requiere SQL, RAG o Ambos
    
    state DecisionTools <<choice>>
    AnalisisIntencion --> DecisionTools
    
    DecisionTools --> EjecutarSQL: Pregunta Cuantitativa / Filtros / Métricas
    DecisionTools --> EjecutarRAG: Pregunta Cualitativa / Lecciones / Narrativa
    DecisionTools --> EjecutarAmbos: Pregunta Compleja Mixta
    
    EjecutarSQL --> ValidarResultados
    EjecutarRAG --> ValidarResultados
    EjecutarAmbos --> ValidarResultados
    
    state ValidarResultados {
        [*] --> VerificarDatos: ¿Hay información relevante encontrada?
        VerificarDatos --> ConInformacion: Si hay datos
        VerificarDatos --> SinInformacion: Vacío / No encontrado
    }
    
    SinInformacion --> RespuestaSinDatos: "No se dispone de información sobre ese aspecto..."
    ConInformacion --> SintetizarRespuesta: Formatear respuesta + Citar fuentes explícitas
    
    RespuestaSinDatos --> LogTrazabilidad: Registrar herramientas usadas y respuesta
    SintetizarRespuesta --> LogTrazabilidad
    
    LogTrazabilidad --> [*]: Entregar al usuario (CLI / Web)
```

---

## 🛡️ Guardrails y Verificaciones en Cada Paso

| Fase | Regla de Control | Acción en caso de Fallo |
| :--- | :--- | :--- |
| **1. SQL Query** | Solo sentencias `SELECT`. Prohibido `INSERT`, `UPDATE`, `DELETE`, `DROP`. | Rechazar la consulta antes de ejecutar y registrar advertencia. |
| **2. RAG Retrieval** | Limitar a fragmentos con score de relevancia suficiente sobre los 4 informes. | Si el score es bajo, no inventar contexto. |
| **3. Síntesis** | Verificar que cada afirmación tenga su cita `[Fuente: Codigo - Proyecto]`. | Si falta la fuente, no incluir la afirmación. |
| **4. Anti-Alucinación** | Si el resultado de las herramientas está vacío, responder que no hay información. | Prohibido usar conocimiento general del LLM no respaldado en los informes. |
