# 🎓 Bitácora y Guía de Sustentación para la Entrevista Técnica

Esta carpeta contiene la documentación pedagógica y estratégica diseñada para que **domines y defiendas cada línea de código, decisión arquitectónica y tecnología utilizada** durante la entrevista técnica de 45 minutos.

---

## 🗺️ Índice Maestro de Módulos de Sustentación

| Carpeta / Módulo | Tema / Paso | Objetivo para tu Entrevista |
| :--- | :--- | :--- |
| [`01_estructura_y_git/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/01_estructura_y_git/bitacora_paso_1.md) | **Paso 1: Estructura del Proyecto y Arquitectura** | Explicar el diseño modular (FastAPI + React), separación de responsabilidades y variables de entorno. |
| [`02_extraccion_pydantic_sqlite/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/02_extraccion_pydantic_sqlite/bitacora_paso_2.md) | **Paso 2: Extracción y Base de Datos Relacional** | Defender el esquema Pydantic v2, Structured Outputs, persistencia SQLite y guardrails de solo lectura. |
| [`03_motor_rag/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/03_motor_rag/bitacora_paso_3.md) | **Paso 3: Chunking y Búsqueda RAG** | Explicar la fragmentación de documentos ($\le 600$ car.), preservación de páginas y recuperación semántica. |
| [`04_agente_y_herramientas/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/04_agente_y_herramientas/bitacora_paso_4.md) | **Paso 4: Orquestador y Function Calling** | Explicar cómo el LLM decide entre SQL y RAG, prevención de alucinaciones y generación de citas. |
| [`05_interfaces_cli_web/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/05_interfaces_cli_web/bitacora_paso_5.md) | **Paso 5: Interfaces de Usuario (CLI y Web)** | Demostrar la trazabilidad en vivo, usabilidad de la consola Rich y la aplicación web. |
| [`06_pruebas_y_costos/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/06_pruebas_y_costos/bitacora_paso_6.md) | **Paso 6: Testing y Memoria de Costos** | Sustentar la batería de pruebas en `pytest` y la justificación económica para 50 consultores. |
| [`07_frontend_react_vite_tailwind/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/07_frontend_react_vite_tailwind/bitacora_paso_7.md) | **Paso 7: Frontend React, Vite y Visor de Evidencia** | Explicar el inspector Split-View, renderizado interactivo, explorador SQLite CRUD y escenas 3D. |
| [`08_seguridad_guardrails_anti_alucinacion/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/08_seguridad_guardrails_anti_alucinacion/bitacora_paso_8.md) | **Paso 8: Seguridad, Guardrails y Grounding** | Explicar la protección anti-inyección SQL, sanitización de subidas y abstención determinista. |
| [`09_guia_defensa_entrevista_cambio_en_vivo/`](file:///d:/Program%20Files/Felipe/Downloads/Talen%20GV/bitacora/09_guia_defensa_entrevista_cambio_en_vivo/bitacora_paso_9.md) | **Paso 9: Guía Maestra para el Cambio en Vivo** | Cheat-sheet para resolver peticiones de código en vivo durante los 45 minutos de la entrevista. |

---

## 🎯 Consejos Clave para tu Sesión en Vivo (45 min):
1. **Confianza en la Arquitectura:** Demuestra que no usaste soluciones "caja negra"; cada componente tiene un propósito claro y desacoplado.
2. **Preparación para el Cambio en Vivo:** Usa el **Paso 9** para saber exactamente qué archivo y función modificar ante cualquier solicitud del evaluador.
3. **Lenguaje Consultor de IA:** Habla de *Grounding, Structured Outputs, Function Calling, ReAct Loop, Token Economics y Trazabilidad en milisegundos*.
