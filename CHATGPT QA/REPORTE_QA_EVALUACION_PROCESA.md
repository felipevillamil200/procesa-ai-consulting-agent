# REPORTE QA Y EVALUACIÓN TÉCNICA - PROCESA

Validación final: 2026-10-01T13:55:00.424352-05:00 (America/Bogota). Se evalúa el árbol de trabajo actual, con cambios sin commit, HEAD 1afbd76 y 31 commits. Se conserva el reporte previo en historico_prevalidacion_final_20261001_134935/.

## 1. Veredicto actualizado

**NO APROBADO PARA CERTIFICACIÓN DEL 100%. Puntaje técnico normalizado: 75/100.**

Los 95 controles históricos pasan 95/95. La suite pytest incluida pasa 11/11 en el estado entregado y 11/11 con el corpus recargado. Sí se logró 100% de éxito en esos conjuntos; no se logró acreditar cierre completo de R01 a R10 ni cumplimiento universal de los requisitos.

La validación independiente adicional encuentra 9 fallos en 20 controles. Resultado final: 106/115 aprobados (92.17%). Persisten respuestas inventadas después de SQL con filas, extracción incompleta, identidad inconsistente entre SQLite y RAG, traversal en imágenes, HTML no sanitizado y rechazo de literales SQL válidos.

Las mejoras son verificables: 60/60 valores documentales cotejados correctos, promedio 22,5 semanas, arranque limpio con cuatro proyectos y 59 chunks de hasta 600 caracteres; temperatura enviada y validada en API/SDK, persistencia del nuevo PC-2026-099 y nueve rutas HTTP 200. Una prueba que solo comprueba existencia de código en SQLite no prueba extracción completa del documento.

El puntaje es juicio técnico QA, separado del porcentaje de tests, con los pesos del enunciado: 64/85 puntos observables. Los 15 puntos de la sesión presencial quedan pendientes. No hay umbral oficial de aprobación indicado en el PDF. El dictamen QA exige ausencia de fallos bloqueantes de fidelidad/grounding para certificar el 100%. Los extras visuales no compensan respuestas inventadas.

## 2. Método y reproducibilidad

El PDF extracted/Prueba_Tecnica_Consultor_IA.pdf es fuente de requisitos, no una orden de enviar correo o publicar. Se ejecutaron los scripts solicitados desde la raíz con Python 3.12.14 del runtime disponible. El intérprete exacto figura en evidencia_resultados.json. Se revisaron backend, frontend, datos, corpus, requisitos, documentación y Git. Las carpetas reales son data/, agent/ y bitacora/; Pydantic está en models.py, no schemas.py.

Todas las cargas, borrados, reset y configuraciones se ejecutaron en un sandbox. No se modificó producto ni data/ original. source_unchanged=True; el JSON conserva SHA-256 antes/después de backend, tests, data y frontend/src. No se inspeccionaron ni publicaron credenciales.

La primera ejecución falló al importar dependencias en los subprocesos porque el arnés eliminaba CHATGPT QA/_deps de PYTHONPATH. Se reparó únicamente esa configuración QA y se volvió a ejecutar. Se mantuvieron los 95 controles históricos y se añadieron 20 comprobaciones reproducibles en validaciones_finales.py. Se reemplazó el contenido del generador que asignaba 100/100 automáticamente y certificaba aspectos que los tests no probaban. El código de salida 0 del ejecutor indica finalización, no aprobación de todos los controles; debe comprobarse metrics.failed.

Las llamadas LLM son dobles locales del SDK: 0 llamadas reales a Gemini/OpenAI, sin red ni claves reales. El doble de cifra inventada prueba si la aplicación la rechaza; no demuestra que Gemini haya generado esa respuesta. La prueba HTML observa el atributo ejecutable conservado en la salida del formateador, sin ejecutar un evento en navegador. Traversal se probó con un marcador inocuo dentro del sandbox, sin acceder a secretos.

Comandos, con un intérprete que disponga de las dependencias:

python "CHATGPT QA/ejecutar_auditoria.py"

python "CHATGPT QA/recoger_evidencia_final.py"

python "CHATGPT QA/generar_reportes.py"

El recolector complementario registra build, revisión de fuente y smoke de consola. No cambia los 115 controles. No se reutilizan capturas ni evidencias de navegador anteriores como validación actual.

## 3. Métricas de ejecución

| Comprobación | Resultado | Interpretación |
| --- | --- | --- |
| pytest estado actual | 11/11; exit 0; 3.995 s | Suite incluida |
| pytest corpus aislado | 11/11; exit 0; 3.357 s | Mismos tests, segundo escenario; no son 22 casos únicos |
| Regresiones anteriores | 27/27 | Casos anteriores corregidos |
| Ampliación histórica | 68/68 | Incluye 16 campos y 22 pares KPI |
| Base histórica | 95/95; 0 fallos | 100% de éxito de ese conjunto |
| Validación adicional | 11/20; 9 fallos | Casos que la base omitía |
| Total QA | 106/115; 9 fallos | 92.17% éxito; sin cobertura de líneas/ramas |
| Fidelidad oficial | 16/16 campos y 22/22 pares KPI | 60 valores coincidentes; no toda la prosa ni futuros PDFs |
| Estado inicial | {'rows': 4, 'pdfs': 4, 'fichas': 4, 'chunks': 59} | Cuatro oficiales en SQLite, JSON y PDFs |
| Arranque sin data | {'rows': 4, 'pdfs': 4, 'fichas': 4, 'chunks': 59, 'max_chars': 600} | Inicialización limpia en proceso separado |
| Chunking | 59 chunks; máximo 600 caracteres | Límite 600 pasa en corpus y texto extenso |
| Promedio | (21+23+21+25)/4 = 22,5 semanas | Calculado correctamente |
| Build actual | PASS; 1602 módulos; 10,40 s | JS 370,41 kB / gzip 101,64; CSS 66,54 / gzip 11,06 |
| Fuentes intactas | True | Manifiesto SHA-256 en JSON |
| Smoke CLI /salir | exit 1 | Falta rich en runtime QA; declarado en requirements; no fallo funcional acreditado |

Versiones: pydantic 2.13.5, pytest 9.1.1, fastapi 0.142.2, openai 3.22.1, pypdf 6.10.0. Se usaron dependencias aisladas en _deps, sin certificar instalación limpia completa. FastAPI, uvicorn, python-multipart y reportlab están declarados ahora en requirements.txt.

## 4. Comparación de datos oficiales

| Proyecto / sector | Semanas | Gerente | Resultado |
| --- | --- | --- | --- |
| PC-2025-014 / financiero | 21 | Ing. Daniela Cevallos | Coincide |
| PC-2025-027 / manufactura | 23 | Ing. Martín Aguirre | Coincide |
| PC-2025-033 / salud | 21 | Ing. Martín Aguirre | Coincide |
| PC-2026-006 / retail | 25 | Ing. Daniela Cevallos | Coincide |

| Proyecto | Campo | Esperado | Actual |
| --- | --- | --- | --- |
| PC-2025-014 | fecha_inicio | 2025-02-03 | 2025-02-03 |
| PC-2025-014 | fecha_fin | 2025-06-27 | 2025-06-27 |
| PC-2025-014 | duracion_semanas | 21 | 21 |
| PC-2025-014 | gerente_proyecto | Ing. Daniela Cevallos | Ing. Daniela Cevallos |
| PC-2025-027 | fecha_inicio | 2025-07-07 | 2025-07-07 |
| PC-2025-027 | fecha_fin | 2025-12-12 | 2025-12-12 |
| PC-2025-027 | duracion_semanas | 23 | 23 |
| PC-2025-027 | gerente_proyecto | Ing. Martín Aguirre | Ing. Martín Aguirre |
| PC-2025-033 | fecha_inicio | 2025-10-06 | 2025-10-06 |
| PC-2025-033 | fecha_fin | 2026-02-27 | 2026-02-27 |
| PC-2025-033 | duracion_semanas | 21 | 21 |
| PC-2025-033 | gerente_proyecto | Ing. Martín Aguirre | Ing. Martín Aguirre |
| PC-2026-006 | fecha_inicio | 2026-03-02 | 2026-03-02 |
| PC-2026-006 | fecha_fin | 2026-08-21 | 2026-08-21 |
| PC-2026-006 | duracion_semanas | 25 | 25 |
| PC-2026-006 | gerente_proyecto | Ing. Daniela Cevallos | Ing. Daniela Cevallos |

| Proyecto / indicador | Antes | Después | Coincide |
| --- | --- | --- | --- |
| PC-2025-014 / Tiempo promedio de aprobación | 12 días hábiles | 5 días hábiles | True |
| PC-2025-014 / Solicitudes con reproceso | 34% | 12% | True |
| PC-2025-014 / Productividad de analistas | 85 solicitudes/analista/mes | 124 solicitudes/analista/mes | True |
| PC-2025-014 / Satisfacción de socios | 3,2 / 5,0 | 4,1 / 5,0 | True |
| PC-2025-014 / Tasa de abandono de solicitudes | 18% | 11% | True |
| PC-2025-027 / OEE Global Línea 1 (Inyección) | 58% | 71% | True |
| PC-2025-027 / Tiempo promedio de cambio de formato | 95 min | 38 min | True |
| PC-2025-027 / Paradas no programadas | 64 h/mes | 31 h/mes | True |
| PC-2025-027 / Tasa de desperdicio (scrap) | 6,0% | 5,0% | True |
| PC-2025-027 / Disponibilidad | 72% | 82% | True |
| PC-2025-027 / Rendimiento | 86% | 91% | True |
| PC-2025-027 / Calidad | 94% | 95% | True |
| PC-2025-033 / Tiempo total de espera del paciente | 52 min | 39,5 min | True |
| PC-2025-033 / Tiempo de admisión en ventanilla | 14 min | 6 min | True |
| PC-2025-033 / Pacientes con pre-admisión digital | 0% | 41% | True |
| PC-2025-033 / Ausentismo de citas | 22% | 15% | True |
| PC-2025-033 / Satisfacción del paciente (NPS) | 18 | 37 | True |
| PC-2026-006 / Quiebre de stock, categoría A | 9,5% | 4,8% | True |
| PC-2026-006 / Días de inventario en tienda | 38 días | 31 días | True |
| PC-2026-006 / Integración de órdenes con proveedores | 0 de 3 | 0 de 3 | True |
| PC-2026-006 / Merma de perecibles | 4,1% | 3,4% | True |
| PC-2026-006 / Precisión de inventario en sistema | 78% | 93% | True |

Los cuatro informes se leyeron y los valores de la muestra coinciden. El extractor determinista devuelve fichas codificadas en ramas de reconocimiento; su coincidencia no acredita extracción generalizada. Los nuevos documentos requieren comprobación propia. Retail mantiene 31 días frente a 38, no informa monto monetario, y ambos casos pasan.

## 5. Estado real de R01 a R10

| Hallazgo | Estado | Evidencia y pendiente |
| --- | --- | --- |
| R01 Grounding | ABIERTO / alta | Sin tools abstiene; SQL constante o fila válida permite 999 millones y found_info=True. |
| R02 SQL vacío | CERRADO en caso | 0 filas: abstención y eliminación de respuesta inventada. No acredita datos no vacíos. |
| R03 PDF nuevo | PARCIAL / alta | PC-2026-099 y seis campos persisten; KPI 10->5 se pierde; etiquetas/acentos y filename neutro fallan. |
| R04 Temperatura | PARCIAL / media | Envío UI/API/SDK y rango pasan. ConfigModal inicia 0.1 y no hidrata config.temperature al cargar. |
| R05 Sectores/códigos | CERRADO en casos locales | Agricultura, minería, petróleo, telecomunicaciones y código desconocido abstienen. |
| R06 Intención | CERRADO en casos | Lecciones PC-2025-027 con foco y 31 días retail correctos. |
| R07 Sanitización/endpoints | ABIERTO / alta | Traversal GET images y HTML con onerror conservado. Visor también usa HTML sin escape. |
| R08 Navegación | CERRADO HTTP | Nueve rutas dan 200; build nuevo pasa. Falta prueba de navegador actual; dist y bundle nuevo difieren. |
| R09 SQL literal | PARCIAL / media | Literal UPDATE permitido; literal con ; rechazado incorrectamente. Sin presupuesto CPU aplicado. |
| R10 Reproducibilidad | PARCIAL / media | Dependencias web declaradas; README sobreafirma cobertura; DDL viejo y costos simplificados. |

Cuatro cierres acotados (R02, R05, R06 y R08 HTTP), cuatro parciales y dos abiertos. No se acredita cierre 10/10. Los límites de proveedor real y navegador siguen explícitos.

## 6. Fallos reproducidos y criterios de cierre

### QA-F01 / alta: grounding tras SQL

Ubicación: codigo/backend/agent.py. Casos: LLM_SQL_constante_no_es_evidencia y LLM_SQL_real_no_valida_cifra.

Observado: El doble ejecuta SELECT 1 AS n o SELECT codigo_proyecto,cliente para PC-2025-014 y afirma 999 millones USD. La aplicación acepta found_info=True. Con fuente oficial añade chunks iniciales que no sustentan el monto.

Cierre exigido: Exigir evidencia pertinente, verificar las cifras y generar citas derivadas del resultado. Probar respuestas verdaderas e inventadas con filas relevantes, irrelevantes y vacías.

### QA-F02 / alta: extracción nueva incompleta

Ubicación: codigo/backend/extractor.py. Casos: PDF_nuevo_KPI_preservado y PDF_nuevo_etiquetas_y_acentos.

Observado: Omega incluye Resultado: 10 a 5 minutos, pero kpis_impacto=[]. Texto con Cliente:, Sector:, Fecha inicio:, Fecha fin:, Gerente: Ing. José Muñoz pierde nombres y fechas presentes.

Cierre exigido: Usar extracción estructurada, validar cada campo frente al texto y ampliar formatos/acentos. No basta encontrar el código.

### QA-F03 / alta: identidad DB/RAG

Ubicación: codigo/backend/rag.py. Casos: PDF_codigo_en_contenido_RAG.

Observado: informe_neutro.pdf contiene PC-2026-097. SQLite conserva ese código, pero el indexador toma PC-DOC del nombre y el filtro PC-2026-097 devuelve [].

Cierre exigido: Compartir código extraído del contenido/ficha con el indexador y validar búsqueda, citas, preview y PDF en nombres neutros.

### QA-F04 / alta: traversal imágenes

Ubicación: codigo/backend/main.py. Casos: images_path_traversal.

Observado: GET /images/..%2Fqa_marcador.txt responde 200 con el marcador fuera de images. El handler une base/image_name sin confinamiento y precede al StaticFiles seguro.

Cierre exigido: Usar StaticFiles seguro o resolve + comprobación de pertenencia; rechazar rutas padres, absolutas y separadores alternativos.

### QA-F05 / alta: HTML sin sanitizar

Ubicación: ChatView.jsx y EvidenceInspector.jsx. Casos: HTML_chat_sanitizado.

Observado: El formateador real devuelve <img src=x onerror="window.qaMarker=1"> intacto; llega a dangerouslySetInnerHTML. El visor parte de texto PDF sin escape. No se ejecutó el evento en navegador.

Cierre exigido: Sanitizar el HTML permitido del chat; escapar texto PDF antes de añadir marcado. Probar atributos ejecutables, URLs peligrosas y contenido HTML de PDF.

### QA-F06 / media: SQL válido rechazado

Ubicación: codigo/backend/database.py. Casos: Los dos controles SQL_literal_punto_coma.

Observado: SELECT con uno;dos o DELETE;UPDATE dentro de comillas contiene una sola sentencia. split(";") lo rechaza como varias. No se reprodujo una mutación permitida.

Cierre exigido: Analizar sentencias respetando comillas/comentarios; reforzar readonly/query_only, authorizer y presupuesto de ejecución.

Estos seis grupos contienen los nueve controles fallidos. Hidratación de temperatura, presupuesto SQL y bundle distinto son observaciones de fuente/build y no se suman artificialmente a esos nueve fallos ejecutados.

## 7. Matriz de requisitos del enunciado oficial

| Requisito / PDF | Estado | Evidencia y límite |
| --- | --- | --- |
| Agente Python con LLM por API / p.2 | PARCIAL | Gemini vía compatibilidad OpenAI y OpenAI implementados; contratos simulados, 0 llamadas reales. |
| Extracción con respuestas estructuradas / p.2.1 | PARCIAL | Existe completions.parse con Pydantic. Upload usa process_single_pdf(use_llm=False); rama LLM solo OpenAI y no acreditada en el flujo normal. |
| Persistencia relacional / p.2.2 | CUMPLE | SQLite contiene oficiales y nuevos; KPI/lecciones son arrays JSON dentro de proyectos. |
| Dos herramientas y routing / p.2.3 | CUMPLE en casos | SQL y búsqueda BM25; routing local y SDK simulado. |
| Respuesta fiable con fuente / p.2.4 | NO CUMPLE | Los dos casos de 999 millones se aceptan. Una cita no acredita sustento de la cifra. |
| Trazabilidad / p.2.5 | CUMPLE | Nombre, argumentos, resumen y execution_time_ms. |
| Consola / p.2.6 | PARCIAL | CLI Rich implementado; smoke no ejecuta por rich ausente en QA, ver log. |
| GitHub, Git y organización / p.2 entrega | PARCIAL | 31 commits y módulos; no se validó acceso remoto del evaluador ni calidad de todos los commits. |
| README, decisiones, supuestos y costos / p.2 | PARCIAL | Secciones presentes; presupuesto incompleto y afirmación de cobertura 100% sin coverage. |
| Cuatro fichas generadas / p.2 | CUMPLE en muestra | Cuatro JSON/SQLite y 60 valores cotejados exactos. |
| Video <=5 min con >=5 preguntas / p.2 | NO ACREDITADO | hero_workflow.mp4 es activo visual; no se acreditó video técnico de cinco preguntas. |
| No API keys en repositorio / p.2 | PARCIAL | git ls-files .env* solo devuelve .env.example; no se auditó todo el historial ni se inspeccionaron claves. |
| Formatos PDF y Word / p.1 | PARCIAL | Material local: cuatro PDFs; enunciado: tres PDFs/un Word. DOCX no certificado. |
| Sesión revisión y cambio vivo / p.3 | NO EVALUADO | 15% pendiente presencial. |

ChromaDB, React y estilo Apple son alcance ampliado del usuario. El enunciado mínimo permite cualquier librería y exige búsqueda textual; BM25 puede satisfacer ese mínimo sin acreditar embeddings. El PDF no autoriza al auditor a enviar entregables a terceros.

## 8. Alcance ampliado y valor agregado

| Eje solicitado | Estado | Conclusión |
| --- | --- | --- |
| ETL 4 PDFs / chunk 600 | CUMPLE en muestra | 59 chunks, metadatos de página y cuatro oficiales. |
| Embeddings / ChromaDB | NO IMPLEMENTADO | Búsqueda por tokenización y BM25; no embeddings ni ChromaDB en ejecución. |
| SQLite / Pydantic v2 | CUMPLE | Modelos en models.py; duración >=0 y KPI/lecciones en JSON. |
| CRUD / SQL / reset | PARCIAL | Operaciones básicas pasan; extracción nueva/RAG y literales SQL tienen fallas. |
| Gemini / extensibilidad | PARCIAL | Gemini/OpenAI backend; Claude/DeepSeek UI deshabilitados, no integraciones terminadas. |
| Anti-alucinación / tools | PARCIAL | Abstenciones conocidas y trazas pasan; grounding con SQL no vacío falla. |
| React/Vite/Tailwind / diseño | BUILD PASS | 1602 módulos y estilos presentes; sin prueba visual de navegador nueva. |
| Citas / visor evidencia PDF | PARCIAL | evidence_chunks preservados, PDF/preview 200. Marcado de texto extraído; iframe no prueba resaltado geométrico en el PDF. |
| Drag/drop PDF y fichas | EN FUENTE | Handlers/dataTransfer presentes; sin interacción de navegador ejecutada en esta validación. |
| Panel IA / interfaz | PARCIAL | Slider enviado y validado; modo monocromo, densidad, scrollbars y animaciones en fuente; temperatura no hidratada. |
| Landing / guía / solución / ROI | HTTP PASS | Páginas y calculadora presentes; no se certifica toda interacción ni ROI monetario real. |
| Grado empresarial | NO ACREDITADO | Traversal, HTML sin sanitizar, administración sin autenticación en main.py y CORS amplio; sin carga concurrente. |
| MCP / n8n / Power Automate | NO ACREDITADO | FastAPI no equivale a servidor MCP; no hay automatización externa ejecutada. |
| SharePoint / Power BI | PROPUESTA | Integración documentada, no operativa verificada. |

Valor añadido real al mínimo de consola: web React, FastAPI, CRUD/reset, SQL interactivo, inspector de evidencia, configurador, páginas ejecutivas y simulador ROI. Los puntos opcionales son un diferencial; el enunciado indica que no compensan un agente incorrecto.

## 9. Rutas y build actual

| Ruta | HTTP | Alcance |
| --- | --- | --- |
| /app/ | 200 | TestClient / dist copiado al sandbox |
| /app/inicio.html | 200 | TestClient / dist copiado al sandbox |
| /app/nival.html | 200 | TestClient / dist copiado al sandbox |
| /app/guia.html | 200 | TestClient / dist copiado al sandbox |
| /app/solucion.html | 200 | TestClient / dist copiado al sandbox |
| /inicio.html | 200 | TestClient / dist copiado al sandbox |
| /guia.html | 200 | TestClient / dist copiado al sandbox |
| /solucion.html | 200 | TestClient / dist copiado al sandbox |
| /images/procesa_brand_logo.jpg | 200 | TestClient / dist copiado al sandbox |

El test monta /app en la copia después de importar main.py. HTTP 200 no prueba que todos los assets y controles interactivos funcionen. El build nuevo está en CHATGPT QA/frontend-build-final/; no reemplaza el dist de producción. El índice dist servido y el recién compilado tienen distinto SHA-256/nombre de JS: no se acredita equivalencia entre el bundle entregado y las fuentes actuales.

1602 módulos; build 10.40 s; JavaScript 370.41 kB (gzip 101.64); CSS 66.54 kB (gzip 11.06). Primera ejecución EPERM del sandbox; reintento permitido y exitoso.

| Índice | SHA-256 |
| --- | --- |
| dist entregado | 8199d56d85dd97f56af4b7aba89e83379ec574e9b32ea569aadb99967078d256 |
| build nuevo | f0aeb5de410dc284348cf0505da005247d1e25a607d8fc93ab0c7222f08af1f0 |

ConfigModal sincroniza model/provider desde config, pero temperature nace con useState(0.1) y no se actualiza desde config.temperature. Al cargar con API en 0.8, el estado inicial no refleja ese valor y guardar podría sobrescribirlo. Es observación de fuente; el envío UI -> API -> SDK y la validación de rango sí pasan.

## 10. Preguntas y tiempos del motor local

| Pregunta | found_info / fuentes | Tools / ms |
| --- | --- | --- |
| ¿Qué proyectos se ejecutaron en el año 2025 y cuál duró más? | True / PC-2025-014, PC-2025-027, PC-2025-033 | query_project_database / 390.82 |
| ¿Qué lecciones aprendidas tuvimos sobre mandos medios y resistencia al cambio? | True / PC-2025-014, PC-2025-027 | search_project_documents / 5.7 |
| ¿Qué proyectos tenemos en minería o petróleo? | False /  |  / 0.07 |
| ¿Qué proyectos tenemos en agricultura? | False /  |  / 0.03 |
| ¿Cuál es el promedio de duración en semanas? | True / PC-2025-014, PC-2025-027, PC-2025-033, PC-2026-006 | query_project_database / 1.28 |
| ¿Cuánto dinero se ahorró en retail? | False / PC-2026-006 | query_project_database / 1.12 |
| ¿Cuál es el proyecto PC-2025-014? | True / PC-2025-014 | query_project_database / 1.25 |

Siete preguntas locales: mínimo 0.03 ms, mediana 1.25 ms, máximo 390.82 ms. No incluye latencia de proveedor ni red; no constituye SLA ni prueba de 50 usuarios.

## 11. Documentación, costos y guardrails

README dimensiona 50 consultores x 10 consultas/día x 22 días = 11.000 consultas/mes. Con sus tarifas supuestas (0,15 y 0,60 USD/millón) y 1.000 tokens entrada/300 salida, la aritmética de 3,63 USD/mes es correcta. No se verificó vigencia de tarifas/modelos; se auditan hipótesis del repositorio, no se ofrecen precios actuales.

El ciclo con tools hace dos llamadas y reenvía sistema/historial/contexto. Si los 1.000 tokens solo cuentan 600 de prompt inicial y 400 de contexto, faltan al menos los 600 reenviados: 1.600 entrada/300 salida darían 4,62 USD/mes bajo las mismas tarifas, antes de tool calls, historial, extracción y reintentos. El costo real exige medir usage.

El DDL de get_schema_description aún muestra ejemplos 20/24/18/25 semanas y fecha fin 2025-06-20, frente al corpus corregido 21/23/21/25 y 2025-06-27. No son filas DB incorrectas, pero pueden contaminar contexto. README afirma 100% de componentes sin medir coverage. SQL_QUERY_TIMEOUT_SECONDS=5 está declarado y execute_read_query no lo aplica ni instala progress handler. No se realizó una prueba de consumo adversarial.

FastAPI, uvicorn, python-multipart y reportlab están declarados; no se certificó pip install limpio. El smoke CLI falló por rich ausente en el runtime QA, aunque está declarado: no permite afirmar que la CLI funcione ni que el producto esté roto. No se examinó todo Git por secretos ni se validaron acceso remoto, video técnico o sesión presencial.

## 12. Puntaje y acciones para cierre

| Criterio oficial | Peso | Acreditado | Justificación |
| --- | --- | --- | --- |
| Funcionamiento del agente | 30 | 23 | Routing y abstenciones corregidos; SQL con filas permite síntesis de cifra inventada. |
| Validación de información | 20 | 17 | 60/60 valores oficiales; pérdida de KPI, fechas y gerente en documentos nuevos. |
| Calidad del código y Git | 20 | 13 | Modularidad, Pydantic, build, 31 commits; traversal, HTML sin sanitizar y falsos rechazos SQL. |
| Documentación y README | 15 | 11 | Secciones completas y dependencias web; sobreafirmaciones, ejemplos DDL viejos y presupuesto simplificado. |
| Sesión presencial | 15 | Pendiente | No observable |

Total observable 64/85; normalizado 75.29, redondeado **75/100**. No es una nota garantizada del evaluador. Éxito de controles 106/115 es otra métrica.

Orden de cierre: corregir grounding de cifras y confinamiento de archivos/HTML; completar extracción e identidad SQLite/RAG; respetar literales SQL; hidratar temperatura y recompilar dist; repetir suite y todos los controles añadidos. Acreditar extracción estructurada del proveedor activo y los entregables pendientes. No anunciar cierre R01-R10 ni 100/100 mientras existan reproducciones FAIL.

## 13. Catálogo completo de comprobaciones

Los resultados íntegros expected/actual están en evidencia_resultados.json. Los primeros 95 casos son históricos; los últimos 20 son nuevos. La suite pytest se reporta aparte para no inflar el denominador con dos ejecuciones de los mismos tests.

| N.º / caso | Conjunto | Resultado |
| --- | --- | --- |
| 1 / extraccion_grounded | Histórico | PASS |
| 2 / nuevo_pdf_sin_inventar | Histórico | PASS |
| 3 / validacion_duracion_negativa | Histórico | PASS |
| 4 / limite_chunk_600 | Histórico | PASS |
| 5 / filtro_proyecto_inexistente | Histórico | PASS |
| 6 / agricultura_abstencion | Histórico | PASS |
| 7 / promedio_calculado | Histórico | PASS |
| 8 / ahorro_retail | Histórico | PASS |
| 9 / foco_codigo_sql | Histórico | PASS |
| 10 / SQL DROP TABLE proyectos | Histórico | PASS |
| 11 / SQL DELETE FROM proyectos | Histórico | PASS |
| 12 / SQL SELECT 1; DROP TABLE proyectos | Histórico | PASS |
| 13 / SQL WITH a AS (SELECT 1) DELETE FROM proyectos | Histórico | PASS |
| 14 / SQL PRAGMA writable_schema=1 | Histórico | PASS |
| 15 / SQL count | Histórico | PASS |
| 16 / LLM_sin_tools_grounding | Histórico | PASS |
| 17 / GET /health | Histórico | PASS |
| 18 / GET /api/proyectos | Histórico | PASS |
| 19 / GET /api/fichas | Histórico | PASS |
| 20 / GET /api/proyectos/PC-2025-014/preview | Histórico | PASS |
| 21 / GET /api/pdf/PC-2025-014 | Histórico | PASS |
| 22 / API SQL DROP | Histórico | PASS |
| 23 / temperatura_contrato | Histórico | PASS |
| 24 / delete_aislado | Histórico | PASS |
| 25 / reset_exactamente_oficiales | Histórico | PASS |
| 26 / pdf_invalido_rechazado | Histórico | PASS |
| 27 / upload_path_traversal | Histórico | PASS |
| 28 / PDF PC-2025-014 fecha_inicio | Histórico | PASS |
| 29 / PDF PC-2025-014 fecha_fin | Histórico | PASS |
| 30 / PDF PC-2025-014 duracion_semanas | Histórico | PASS |
| 31 / PDF PC-2025-014 gerente_proyecto | Histórico | PASS |
| 32 / PDF PC-2025-027 fecha_inicio | Histórico | PASS |
| 33 / PDF PC-2025-027 fecha_fin | Histórico | PASS |
| 34 / PDF PC-2025-027 duracion_semanas | Histórico | PASS |
| 35 / PDF PC-2025-027 gerente_proyecto | Histórico | PASS |
| 36 / PDF PC-2025-033 fecha_inicio | Histórico | PASS |
| 37 / PDF PC-2025-033 fecha_fin | Histórico | PASS |
| 38 / PDF PC-2025-033 duracion_semanas | Histórico | PASS |
| 39 / PDF PC-2025-033 gerente_proyecto | Histórico | PASS |
| 40 / PDF PC-2026-006 fecha_inicio | Histórico | PASS |
| 41 / PDF PC-2026-006 fecha_fin | Histórico | PASS |
| 42 / PDF PC-2026-006 duracion_semanas | Histórico | PASS |
| 43 / PDF PC-2026-006 gerente_proyecto | Histórico | PASS |
| 44 / KPI PC-2025-014 Tiempo promedio de aprobación | Histórico | PASS |
| 45 / KPI PC-2025-014 Solicitudes con reproceso | Histórico | PASS |
| 46 / KPI PC-2025-014 Productividad de analistas | Histórico | PASS |
| 47 / KPI PC-2025-014 Satisfacción de socios | Histórico | PASS |
| 48 / KPI PC-2025-014 Tasa de abandono de solicitudes | Histórico | PASS |
| 49 / KPI PC-2025-027 OEE Global Línea 1 (Inyección) | Histórico | PASS |
| 50 / KPI PC-2025-027 Tiempo promedio de cambio de formato | Histórico | PASS |
| 51 / KPI PC-2025-027 Paradas no programadas | Histórico | PASS |
| 52 / KPI PC-2025-027 Tasa de desperdicio (scrap) | Histórico | PASS |
| 53 / KPI PC-2025-027 Disponibilidad | Histórico | PASS |
| 54 / KPI PC-2025-027 Rendimiento | Histórico | PASS |
| 55 / KPI PC-2025-027 Calidad | Histórico | PASS |
| 56 / KPI PC-2025-033 Tiempo total de espera del paciente | Histórico | PASS |
| 57 / KPI PC-2025-033 Tiempo de admisión en ventanilla | Histórico | PASS |
| 58 / KPI PC-2025-033 Pacientes con pre-admisión digital | Histórico | PASS |
| 59 / KPI PC-2025-033 Ausentismo de citas | Histórico | PASS |
| 60 / KPI PC-2025-033 Satisfacción del paciente (NPS) | Histórico | PASS |
| 61 / KPI PC-2026-006 Quiebre de stock, categoría A | Histórico | PASS |
| 62 / KPI PC-2026-006 Días de inventario en tienda | Histórico | PASS |
| 63 / KPI PC-2026-006 Integración de órdenes con proveedores | Histórico | PASS |
| 64 / KPI PC-2026-006 Merma de perecibles | Histórico | PASS |
| 65 / KPI PC-2026-006 Precisión de inventario en sistema | Histórico | PASS |
| 66 / arranque_sin_data | Histórico | PASS |
| 67 / LLM_cita_sin_evidencia_texto | Histórico | PASS |
| 68 / LLM_tools_vacios_abstencion | Histórico | PASS |
| 69 / temperatura_inferencia | Histórico | PASS |
| 70 / codigo_inexistente_abstencion | Histórico | PASS |
| 71 / sector_nuevo_abstencion | Histórico | PASS |
| 72 / retail_cantidad_no_monetaria | Histórico | PASS |
| 73 / foco_codigo_preserva_intencion | Histórico | PASS |
| 74 / temperatura_rango | Histórico | PASS |
| 75 / frontend_evidence_chunks | Histórico | PASS |
| 76 / frontend_envia_temperatura | Histórico | PASS |
| 77 / mencion_no_fabrica_ficha | Histórico | PASS |
| 78 / SQL ampliado UPDATE proyectos SET cliente='x' | Histórico | PASS |
| 79 / SQL ampliado SELECT 1; SELECT 2 | Histórico | PASS |
| 80 / SQL ampliado ATTACH DATABASE 'qa.db' AS other | Histórico | PASS |
| 81 / SQL ampliado SELECT load_extension('not_installed') | Histórico | PASS |
| 82 / SQL ampliado WITH x AS (SELECT 1) SELECT * FROM x | Histórico | PASS |
| 83 / SQL ampliado SELECT 1 AS n; | Histórico | PASS |
| 84 / SQL_literal_no_mutacion | Histórico | PASS |
| 85 / upload_proyecto_nuevo_persistido | Histórico | PASS |
| 86 / pdf_cabecera_sin_estructura | Histórico | PASS |
| 87 / Ruta /app/ | Histórico | PASS |
| 88 / Ruta /app/inicio.html | Histórico | PASS |
| 89 / Ruta /app/nival.html | Histórico | PASS |
| 90 / Ruta /app/guia.html | Histórico | PASS |
| 91 / Ruta /app/solucion.html | Histórico | PASS |
| 92 / Ruta /inicio.html | Histórico | PASS |
| 93 / Ruta /guia.html | Histórico | PASS |
| 94 / Ruta /solucion.html | Histórico | PASS |
| 95 / Ruta /images/procesa_brand_logo.jpg | Histórico | PASS |
| 96 / LLM_SQL_constante_no_es_evidencia | Final | FAIL |
| 97 / LLM_SQL_real_no_valida_cifra | Final | FAIL |
| 98 / PDF_nuevo_campo_cliente | Final | PASS |
| 99 / PDF_nuevo_campo_sector | Final | PASS |
| 100 / PDF_nuevo_campo_fecha_inicio | Final | PASS |
| 101 / PDF_nuevo_campo_fecha_fin | Final | PASS |
| 102 / PDF_nuevo_campo_duracion_semanas | Final | PASS |
| 103 / PDF_nuevo_campo_gerente_proyecto | Final | PASS |
| 104 / PDF_nuevo_KPI_preservado | Final | FAIL |
| 105 / PDF_nuevo_JSON_SQL_identicos | Final | PASS |
| 106 / PDF_nuevo_etiquetas_y_acentos | Final | FAIL |
| 107 / PDF_codigo_en_contenido_RAG | Final | FAIL |
| 108 / SQL_literal_punto_coma_SELECT 'uno;dos' AS texto | Final | FAIL |
| 109 / SQL_literal_punto_coma_SELECT 'DELETE;UPDATE' AS texto | Final | FAIL |
| 110 / images_path_traversal | Final | FAIL |
| 111 / temperatura_limite_-0.01 | Final | PASS |
| 112 / temperatura_limite_1.01 | Final | PASS |
| 113 / temperatura_limite_0.0 | Final | PASS |
| 114 / temperatura_limite_1.0 | Final | PASS |
| 115 / HTML_chat_sanitizado | Final | FAIL |

## 14. Evidencias y límites

| Archivo en CHATGPT QA/ | Uso |
| --- | --- |
| evidencia_resultados.json | 115 controles, métricas, fichas, preguntas, sandbox, source_manifest y fuente intacta |
| suite_estado_actual.log / .xml | Salida pytest y JUnit del estado entregado |
| suite_corpus_aislado.log / .xml | Salida pytest y JUnit después de recargar corpus |
| evidencia_rutas_ui.json | Nueve rutas HTTP |
| evidencia_build.json | Build nuevo e índices SHA-256 |
| evidencia_html_render.json | HTML generado con atributo ejecutable conservado; no ejecución en navegador |
| cli_final.log | Smoke de consola con limitación de dependencia |
| validaciones_finales.py / validar_html.mjs | Reproducciones incorporadas al ejecutor |
| historico_prevalidacion_final_20261001_134935/ | Reporte, scripts y evidencias anteriores |

No se reutilizaron evidencia_ui_actual.json ni verificacion_final.json antiguos. No se certifican cobertura de líneas/ramas, toda la prosa del corpus, proveedores/modelos reales, instalación limpia, DOCX/OCR, concurrencia, transacciones multiarchivo, despliegue ni pentest completo. Los nueve fallos reproducidos sí están verificados; estos límites no los convierten en hipotéticos.

| Documento | Páginas | SHA-256 |
| --- | --- | --- |
| Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf | 3 | b84a2ca48244080c0fdcbb230c455eb95fd213e6d3cfb39b010a9b2e321833ad |
| Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf | 4 | 7ab0985717fef2ae5d7f59dab029f4411be75b6305bbc55063dd9a4423ac8309 |
| Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf | 3 | 253a8b672a3d37ce915bc5fdcbe3217232efc2c83e7389aa20af23e548002430 |
| Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf | 3 | ff21376be517966440241b4f134ac74d0aa79aafea70e107ade700256784fa71 |
| Prueba_Tecnica_Consultor_IA.pdf | 3 | aa838d5cdcbbd64728b151e2a539a77867050cd7ab0012c7f802cae41149ed22 |
