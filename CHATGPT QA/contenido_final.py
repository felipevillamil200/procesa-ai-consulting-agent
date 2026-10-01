"""Informe independiente: tests aprobados no equivalen a certificación total."""
import statistics

def table(head,rows):
    clean=lambda x:str(x).replace('|','/').replace('\n',' ')
    return '\n'.join(['| '+' | '.join(head)+' |','| '+' | '.join(['---']*len(head))+' |']+['| '+' | '.join(map(clean,row))+' |' for row in rows])+'\n'

def build_report(r,root):
    m=r['metrics']; base=r['metrics_95_originales']; ext=r['final_metrics']
    assert len([c for c in r['checks'] if not c['passed']])==m['failed']
    weights=[
        ['Funcionamiento del agente',30,23,'Routing y abstenciones corregidos; SQL con filas permite síntesis de cifra inventada.'],
        ['Validación de información',20,17,'60/60 valores oficiales; pérdida de KPI, fechas y gerente en documentos nuevos.'],
        ['Calidad del código y Git',20,13,'Modularidad, Pydantic, build, 31 commits; traversal, HTML sin sanitizar y falsos rechazos SQL.'],
        ['Documentación y README',15,11,'Secciones completas y dependencias web; sobreafirmaciones, ejemplos DDL viejos y presupuesto simplificado.']]
    earned=sum(w[2] for w in weights); score=round(earned/85*100)
    verdict='NO APROBADO PARA CERTIFICACIÓN DEL 100%'
    md=f'''# REPORTE QA Y EVALUACIÓN TÉCNICA - PROCESA

Validación final: {r['timestamp_bogota']} (America/Bogota). Se evalúa el árbol de trabajo actual, con cambios sin commit, HEAD 1afbd76 y 31 commits. Se conserva el reporte previo en historico_prevalidacion_final_20261001_134935/.

## 1. Veredicto actualizado

**{verdict}. Puntaje técnico normalizado: {score}/100.**

Los 95 controles históricos pasan 95/95. La suite pytest incluida pasa 11/11 en el estado entregado y 11/11 con el corpus recargado. Sí se logró 100% de éxito en esos conjuntos; no se logró acreditar cierre completo de R01 a R10 ni cumplimiento universal de los requisitos.

La validación independiente adicional encuentra {ext['failed']} fallos en {ext['total']} controles. Resultado final: {m['passed']}/{m['total']} aprobados ({m['passed']/m['total']*100:.2f}%). Persisten respuestas inventadas después de SQL con filas, extracción incompleta, identidad inconsistente entre SQLite y RAG, traversal en imágenes, HTML no sanitizado y rechazo de literales SQL válidos.

Las mejoras son verificables: 60/60 valores documentales cotejados correctos, promedio 22,5 semanas, arranque limpio con cuatro proyectos y 59 chunks de hasta 600 caracteres; temperatura enviada y validada en API/SDK, persistencia del nuevo PC-2026-099 y nueve rutas HTTP 200. Una prueba que solo comprueba existencia de código en SQLite no prueba extracción completa del documento.

El puntaje es juicio técnico QA, separado del porcentaje de tests, con los pesos del enunciado: {earned}/85 puntos observables. Los 15 puntos de la sesión presencial quedan pendientes. No hay umbral oficial de aprobación indicado en el PDF. El dictamen QA exige ausencia de fallos bloqueantes de fidelidad/grounding para certificar el 100%. Los extras visuales no compensan respuestas inventadas.

## 2. Método y reproducibilidad

El PDF extracted/Prueba_Tecnica_Consultor_IA.pdf es fuente de requisitos, no una orden de enviar correo o publicar. Se ejecutaron los scripts solicitados desde la raíz con Python 3.12.14 del runtime disponible. El intérprete exacto figura en evidencia_resultados.json. Se revisaron backend, frontend, datos, corpus, requisitos, documentación y Git. Las carpetas reales son data/, agent/ y bitacora/; Pydantic está en models.py, no schemas.py.

Todas las cargas, borrados, reset y configuraciones se ejecutaron en un sandbox. No se modificó producto ni data/ original. source_unchanged={r['source_unchanged']}; el JSON conserva SHA-256 antes/después de backend, tests, data y frontend/src. No se inspeccionaron ni publicaron credenciales.

La primera ejecución falló al importar dependencias en los subprocesos porque el arnés eliminaba CHATGPT QA/_deps de PYTHONPATH. Se reparó únicamente esa configuración QA y se volvió a ejecutar. Se mantuvieron los 95 controles históricos y se añadieron 20 comprobaciones reproducibles en validaciones_finales.py. Se reemplazó el contenido del generador que asignaba 100/100 automáticamente y certificaba aspectos que los tests no probaban. El código de salida 0 del ejecutor indica finalización, no aprobación de todos los controles; debe comprobarse metrics.failed.

Las llamadas LLM son dobles locales del SDK: 0 llamadas reales a Gemini/OpenAI, sin red ni claves reales. El doble de cifra inventada prueba si la aplicación la rechaza; no demuestra que Gemini haya generado esa respuesta. La prueba HTML observa el atributo ejecutable conservado en la salida del formateador, sin ejecutar un evento en navegador. Traversal se probó con un marcador inocuo dentro del sandbox, sin acceder a secretos.

Comandos, con un intérprete que disponga de las dependencias:

python "CHATGPT QA/ejecutar_auditoria.py"

python "CHATGPT QA/recoger_evidencia_final.py"

python "CHATGPT QA/generar_reportes.py"

El recolector complementario registra build, revisión de fuente y smoke de consola. No cambia los 115 controles. No se reutilizan capturas ni evidencias de navegador anteriores como validación actual.

## 3. Métricas de ejecución

'''
    md+=table(['Comprobación','Resultado','Interpretación'],[
        ['pytest estado actual',f"11/11; exit {r['suite_estado_actual']['exit_code']}; {r['suite_estado_actual']['seconds']} s",'Suite incluida'],
        ['pytest corpus aislado',f"11/11; exit {r['suite_corpus_aislado']['exit_code']}; {r['suite_corpus_aislado']['seconds']} s",'Mismos tests, segundo escenario; no son 22 casos únicos'],
        ['Regresiones anteriores',f"{r['regression_metrics']['passed']}/27",'Casos anteriores corregidos'],
        ['Ampliación histórica',f"{r['extra_metrics']['passed']}/68",'Incluye 16 campos y 22 pares KPI'],
        ['Base histórica',f"{base['passed']}/95; {base['failed']} fallos",'100% de éxito de ese conjunto'],
        ['Validación adicional',f"{ext['passed']}/{ext['total']}; {ext['failed']} fallos",'Casos que la base omitía'],
        ['Total QA',f"{m['passed']}/{m['total']}; {m['failed']} fallos",f"{m['passed']/m['total']*100:.2f}% éxito; sin cobertura de líneas/ramas"],
        ['Fidelidad oficial','16/16 campos y 22/22 pares KPI','60 valores coincidentes; no toda la prosa ni futuros PDFs'],
        ['Estado inicial',str(r['estado_actual']),'Cuatro oficiales en SQLite, JSON y PDFs'],
        ['Arranque sin data',str(r['cold_start']),'Inicialización limpia en proceso separado'],
        ['Chunking',f"{r['index']['chunks']} chunks; máximo {r['index']['max_chars']} caracteres",'Límite 600 pasa en corpus y texto extenso'],
        ['Promedio','(21+23+21+25)/4 = 22,5 semanas','Calculado correctamente'],
        ['Build actual','PASS; 1602 módulos; 10,40 s','JS 370,41 kB / gzip 101,64; CSS 66,54 / gzip 11,06'],
        ['Fuentes intactas',r['source_unchanged'],'Manifiesto SHA-256 en JSON'],
        ['Smoke CLI /salir',f"exit {r.get('cli_smoke',{}).get('exit_code','no ejecutado')}",'Falta rich en runtime QA; declarado en requirements; no fallo funcional acreditado']])
    md+='\nVersiones: '+', '.join(k+' '+v for k,v in r['versions'].items())+'. Se usaron dependencias aisladas en _deps, sin certificar instalación limpia completa. FastAPI, uvicorn, python-multipart y reportlab están declarados ahora en requirements.txt.\n\n'
    md+='## 4. Comparación de datos oficiales\n\n'
    md+=table(['Proyecto / sector','Semanas','Gerente','Resultado'],[
        ['PC-2025-014 / financiero',21,'Ing. Daniela Cevallos','Coincide'],['PC-2025-027 / manufactura',23,'Ing. Martín Aguirre','Coincide'],['PC-2025-033 / salud',21,'Ing. Martín Aguirre','Coincide'],['PC-2026-006 / retail',25,'Ing. Daniela Cevallos','Coincide']])
    md+='\n'+table(['Proyecto','Campo','Esperado','Actual'],[[c['project'],c['field'],c['expected'],c['actual']] for c in r['campos_comparados']])
    md+='\n'+table(['Proyecto / indicador','Antes','Después','Coincide'],[[c['project']+' / '+c['indicator'],c['actual'][0],c['actual'][1],c['passed']] for c in r['kpis_comparados']])
    md+='\nLos cuatro informes se leyeron y los valores de la muestra coinciden. El extractor determinista devuelve fichas codificadas en ramas de reconocimiento; su coincidencia no acredita extracción generalizada. Los nuevos documentos requieren comprobación propia. Retail mantiene 31 días frente a 38, no informa monto monetario, y ambos casos pasan.\n\n'
    md+='## 5. Estado real de R01 a R10\n\n'
    md+=table(['Hallazgo','Estado','Evidencia y pendiente'],[
        ['R01 Grounding','ABIERTO / alta','Sin tools abstiene; SQL constante o fila válida permite 999 millones y found_info=True.'],
        ['R02 SQL vacío','CERRADO en caso','0 filas: abstención y eliminación de respuesta inventada. No acredita datos no vacíos.'],
        ['R03 PDF nuevo','PARCIAL / alta','PC-2026-099 y seis campos persisten; KPI 10->5 se pierde; etiquetas/acentos y filename neutro fallan.'],
        ['R04 Temperatura','PARCIAL / media','Envío UI/API/SDK y rango pasan. ConfigModal inicia 0.1 y no hidrata config.temperature al cargar.'],
        ['R05 Sectores/códigos','CERRADO en casos locales','Agricultura, minería, petróleo, telecomunicaciones y código desconocido abstienen.'],
        ['R06 Intención','CERRADO en casos','Lecciones PC-2025-027 con foco y 31 días retail correctos.'],
        ['R07 Sanitización/endpoints','ABIERTO / alta','Traversal GET images y HTML con onerror conservado. Visor también usa HTML sin escape.'],
        ['R08 Navegación','CERRADO HTTP','Nueve rutas dan 200; build nuevo pasa. Falta prueba de navegador actual; dist y bundle nuevo difieren.'],
        ['R09 SQL literal','PARCIAL / media','Literal UPDATE permitido; literal con ; rechazado incorrectamente. Sin presupuesto CPU aplicado.'],
        ['R10 Reproducibilidad','PARCIAL / media','Dependencias web declaradas; README sobreafirma cobertura; DDL viejo y costos simplificados.']])
    md+='\nCuatro cierres acotados (R02, R05, R06 y R08 HTTP), cuatro parciales y dos abiertos. No se acredita cierre 10/10. Los límites de proveedor real y navegador siguen explícitos.\n\n'
    md+='## 6. Fallos reproducidos y criterios de cierre\n\n'
    groups=[
        ('QA-F01 / alta: grounding tras SQL','codigo/backend/agent.py','LLM_SQL_constante_no_es_evidencia y LLM_SQL_real_no_valida_cifra','El doble ejecuta SELECT 1 AS n o SELECT codigo_proyecto,cliente para PC-2025-014 y afirma 999 millones USD. La aplicación acepta found_info=True. Con fuente oficial añade chunks iniciales que no sustentan el monto.','Exigir evidencia pertinente, verificar las cifras y generar citas derivadas del resultado. Probar respuestas verdaderas e inventadas con filas relevantes, irrelevantes y vacías.'),
        ('QA-F02 / alta: extracción nueva incompleta','codigo/backend/extractor.py','PDF_nuevo_KPI_preservado y PDF_nuevo_etiquetas_y_acentos','Omega incluye Resultado: 10 a 5 minutos, pero kpis_impacto=[]. Texto con Cliente:, Sector:, Fecha inicio:, Fecha fin:, Gerente: Ing. José Muñoz pierde nombres y fechas presentes.','Usar extracción estructurada, validar cada campo frente al texto y ampliar formatos/acentos. No basta encontrar el código.'),
        ('QA-F03 / alta: identidad DB/RAG','codigo/backend/rag.py','PDF_codigo_en_contenido_RAG','informe_neutro.pdf contiene PC-2026-097. SQLite conserva ese código, pero el indexador toma PC-DOC del nombre y el filtro PC-2026-097 devuelve [].','Compartir código extraído del contenido/ficha con el indexador y validar búsqueda, citas, preview y PDF en nombres neutros.'),
        ('QA-F04 / alta: traversal imágenes','codigo/backend/main.py','images_path_traversal','GET /images/..%2Fqa_marcador.txt responde 200 con el marcador fuera de images. El handler une base/image_name sin confinamiento y precede al StaticFiles seguro.','Usar StaticFiles seguro o resolve + comprobación de pertenencia; rechazar rutas padres, absolutas y separadores alternativos.'),
        ('QA-F05 / alta: HTML sin sanitizar','ChatView.jsx y EvidenceInspector.jsx','HTML_chat_sanitizado','El formateador real devuelve <img src=x onerror="window.qaMarker=1"> intacto; llega a dangerouslySetInnerHTML. El visor parte de texto PDF sin escape. No se ejecutó el evento en navegador.','Sanitizar el HTML permitido del chat; escapar texto PDF antes de añadir marcado. Probar atributos ejecutables, URLs peligrosas y contenido HTML de PDF.'),
        ('QA-F06 / media: SQL válido rechazado','codigo/backend/database.py','Los dos controles SQL_literal_punto_coma','SELECT con uno;dos o DELETE;UPDATE dentro de comillas contiene una sola sentencia. split(";") lo rechaza como varias. No se reprodujo una mutación permitida.','Analizar sentencias respetando comillas/comentarios; reforzar readonly/query_only, authorizer y presupuesto de ejecución.')]
    for title,path,cases,observed,fix in groups:
        md+=f'### {title}\n\nUbicación: {path}. Casos: {cases}.\n\nObservado: {observed}\n\nCierre exigido: {fix}\n\n'
    md+='Estos seis grupos contienen los nueve controles fallidos. Hidratación de temperatura, presupuesto SQL y bundle distinto son observaciones de fuente/build y no se suman artificialmente a esos nueve fallos ejecutados.\n\n'
    md+='## 7. Matriz de requisitos del enunciado oficial\n\n'
    md+=table(['Requisito / PDF','Estado','Evidencia y límite'],[
        ['Agente Python con LLM por API / p.2','PARCIAL','Gemini vía compatibilidad OpenAI y OpenAI implementados; contratos simulados, 0 llamadas reales.'],
        ['Extracción con respuestas estructuradas / p.2.1','PARCIAL','Existe completions.parse con Pydantic. Upload usa process_single_pdf(use_llm=False); rama LLM solo OpenAI y no acreditada en el flujo normal.'],
        ['Persistencia relacional / p.2.2','CUMPLE','SQLite contiene oficiales y nuevos; KPI/lecciones son arrays JSON dentro de proyectos.'],
        ['Dos herramientas y routing / p.2.3','CUMPLE en casos','SQL y búsqueda BM25; routing local y SDK simulado.'],
        ['Respuesta fiable con fuente / p.2.4','NO CUMPLE','Los dos casos de 999 millones se aceptan. Una cita no acredita sustento de la cifra.'],
        ['Trazabilidad / p.2.5','CUMPLE','Nombre, argumentos, resumen y execution_time_ms.'],
        ['Consola / p.2.6','PARCIAL','CLI Rich implementado; smoke no ejecuta por rich ausente en QA, ver log.'],
        ['GitHub, Git y organización / p.2 entrega','PARCIAL','31 commits y módulos; no se validó acceso remoto del evaluador ni calidad de todos los commits.'],
        ['README, decisiones, supuestos y costos / p.2','PARCIAL','Secciones presentes; presupuesto incompleto y afirmación de cobertura 100% sin coverage.'],
        ['Cuatro fichas generadas / p.2','CUMPLE en muestra','Cuatro JSON/SQLite y 60 valores cotejados exactos.'],
        ['Video <=5 min con >=5 preguntas / p.2','NO ACREDITADO','hero_workflow.mp4 es activo visual; no se acreditó video técnico de cinco preguntas.'],
        ['No API keys en repositorio / p.2','PARCIAL','git ls-files .env* solo devuelve .env.example; no se auditó todo el historial ni se inspeccionaron claves.'],
        ['Formatos PDF y Word / p.1','PARCIAL','Material local: cuatro PDFs; enunciado: tres PDFs/un Word. DOCX no certificado.'],
        ['Sesión revisión y cambio vivo / p.3','NO EVALUADO','15% pendiente presencial.']])
    md+='\nChromaDB, React y estilo Apple son alcance ampliado del usuario. El enunciado mínimo permite cualquier librería y exige búsqueda textual; BM25 puede satisfacer ese mínimo sin acreditar embeddings. El PDF no autoriza al auditor a enviar entregables a terceros.\n\n'
    md+='## 8. Alcance ampliado y valor agregado\n\n'
    md+=table(['Eje solicitado','Estado','Conclusión'],[
        ['ETL 4 PDFs / chunk 600','CUMPLE en muestra','59 chunks, metadatos de página y cuatro oficiales.'],
        ['Embeddings / ChromaDB','NO IMPLEMENTADO','Búsqueda por tokenización y BM25; no embeddings ni ChromaDB en ejecución.'],
        ['SQLite / Pydantic v2','CUMPLE','Modelos en models.py; duración >=0 y KPI/lecciones en JSON.'],
        ['CRUD / SQL / reset','PARCIAL','Operaciones básicas pasan; extracción nueva/RAG y literales SQL tienen fallas.'],
        ['Gemini / extensibilidad','PARCIAL','Gemini/OpenAI backend; Claude/DeepSeek UI deshabilitados, no integraciones terminadas.'],
        ['Anti-alucinación / tools','PARCIAL','Abstenciones conocidas y trazas pasan; grounding con SQL no vacío falla.'],
        ['React/Vite/Tailwind / diseño','BUILD PASS','1602 módulos y estilos presentes; sin prueba visual de navegador nueva.'],
        ['Citas / visor evidencia PDF','PARCIAL','evidence_chunks preservados, PDF/preview 200. Marcado de texto extraído; iframe no prueba resaltado geométrico en el PDF.'],
        ['Drag/drop PDF y fichas','EN FUENTE','Handlers/dataTransfer presentes; sin interacción de navegador ejecutada en esta validación.'],
        ['Panel IA / interfaz','PARCIAL','Slider enviado y validado; modo monocromo, densidad, scrollbars y animaciones en fuente; temperatura no hidratada.'],
        ['Landing / guía / solución / ROI','HTTP PASS','Páginas y calculadora presentes; no se certifica toda interacción ni ROI monetario real.'],
        ['Grado empresarial','NO ACREDITADO','Traversal, HTML sin sanitizar, administración sin autenticación en main.py y CORS amplio; sin carga concurrente.'],
        ['MCP / n8n / Power Automate','NO ACREDITADO','FastAPI no equivale a servidor MCP; no hay automatización externa ejecutada.'],
        ['SharePoint / Power BI','PROPUESTA','Integración documentada, no operativa verificada.']])
    md+='\nValor añadido real al mínimo de consola: web React, FastAPI, CRUD/reset, SQL interactivo, inspector de evidencia, configurador, páginas ejecutivas y simulador ROI. Los puntos opcionales son un diferencial; el enunciado indica que no compensan un agente incorrecto.\n\n'
    md+='## 9. Rutas y build actual\n\n'
    md+=table(['Ruta','HTTP','Alcance'],[[c['url'],c['status'],'TestClient / dist copiado al sandbox'] for c in r['routes']])
    md+='\nEl test monta /app en la copia después de importar main.py. HTTP 200 no prueba que todos los assets y controles interactivos funcionen. El build nuevo está en CHATGPT QA/frontend-build-final/; no reemplaza el dist de producción. El índice dist servido y el recién compilado tienen distinto SHA-256/nombre de JS: no se acredita equivalencia entre el bundle entregado y las fuentes actuales.\n\n'
    if 'build_final' in r:
        md+=r['build_final']['details']+'\n\n'
        md+=table(['Índice','SHA-256'],[['dist entregado',r['build_final']['delivered_index_sha256']],['build nuevo',r['build_final']['fresh_index_sha256']]])
    md+='\nConfigModal sincroniza model/provider desde config, pero temperature nace con useState(0.1) y no se actualiza desde config.temperature. Al cargar con API en 0.8, el estado inicial no refleja ese valor y guardar podría sobrescribirlo. Es observación de fuente; el envío UI -> API -> SDK y la validación de rango sí pasan.\n\n'
    md+='## 10. Preguntas y tiempos del motor local\n\n'
    md+=table(['Pregunta','found_info / fuentes','Tools / ms'],[[p['question'],str(p['found_info'])+' / '+', '.join(p['sources']),', '.join(t['tool_name'] for t in p['tools_used'])+' / '+str(p['total_ms'])] for p in r['preguntas']])
    times=[p['total_ms'] for p in r['preguntas']]
    md+=f'\nSiete preguntas locales: mínimo {min(times):.2f} ms, mediana {statistics.median(times):.2f} ms, máximo {max(times):.2f} ms. No incluye latencia de proveedor ni red; no constituye SLA ni prueba de 50 usuarios.\n\n'
    md+='## 11. Documentación, costos y guardrails\n\n'
    md+='README dimensiona 50 consultores x 10 consultas/día x 22 días = 11.000 consultas/mes. Con sus tarifas supuestas (0,15 y 0,60 USD/millón) y 1.000 tokens entrada/300 salida, la aritmética de 3,63 USD/mes es correcta. No se verificó vigencia de tarifas/modelos; se auditan hipótesis del repositorio, no se ofrecen precios actuales.\n\n'
    md+='El ciclo con tools hace dos llamadas y reenvía sistema/historial/contexto. Si los 1.000 tokens solo cuentan 600 de prompt inicial y 400 de contexto, faltan al menos los 600 reenviados: 1.600 entrada/300 salida darían 4,62 USD/mes bajo las mismas tarifas, antes de tool calls, historial, extracción y reintentos. El costo real exige medir usage.\n\n'
    md+='El DDL de get_schema_description aún muestra ejemplos 20/24/18/25 semanas y fecha fin 2025-06-20, frente al corpus corregido 21/23/21/25 y 2025-06-27. No son filas DB incorrectas, pero pueden contaminar contexto. README afirma 100% de componentes sin medir coverage. SQL_QUERY_TIMEOUT_SECONDS=5 está declarado y execute_read_query no lo aplica ni instala progress handler. No se realizó una prueba de consumo adversarial.\n\n'
    md+='FastAPI, uvicorn, python-multipart y reportlab están declarados; no se certificó pip install limpio. El smoke CLI falló por rich ausente en el runtime QA, aunque está declarado: no permite afirmar que la CLI funcione ni que el producto esté roto. No se examinó todo Git por secretos ni se validaron acceso remoto, video técnico o sesión presencial.\n\n'
    md+='## 12. Puntaje y acciones para cierre\n\n'
    md+=table(['Criterio oficial','Peso','Acreditado','Justificación'],weights+[['Sesión presencial',15,'Pendiente','No observable']])
    md+=f'\nTotal observable {earned}/85; normalizado {earned/85*100:.2f}, redondeado **{score}/100**. No es una nota garantizada del evaluador. Éxito de controles {m["passed"]}/{m["total"]} es otra métrica.\n\n'
    md+='Orden de cierre: corregir grounding de cifras y confinamiento de archivos/HTML; completar extracción e identidad SQLite/RAG; respetar literales SQL; hidratar temperatura y recompilar dist; repetir suite y todos los controles añadidos. Acreditar extracción estructurada del proveedor activo y los entregables pendientes. No anunciar cierre R01-R10 ni 100/100 mientras existan reproducciones FAIL.\n\n'
    md+='## 13. Catálogo completo de comprobaciones\n\n'
    md+='Los resultados íntegros expected/actual están en evidencia_resultados.json. Los primeros 95 casos son históricos; los últimos 20 son nuevos. La suite pytest se reporta aparte para no inflar el denominador con dos ejecuciones de los mismos tests.\n\n'
    md+=table(['N.º / caso','Conjunto','Resultado'],[[str(i+1)+' / '+c['name'],'Histórico' if i<95 else 'Final','PASS' if c['passed'] else 'FAIL'] for i,c in enumerate(r['checks'])])
    md+='\n## 14. Evidencias y límites\n\n'
    md+=table(['Archivo en CHATGPT QA/','Uso'],[
        ['evidencia_resultados.json','115 controles, métricas, fichas, preguntas, sandbox, source_manifest y fuente intacta'],
        ['suite_estado_actual.log / .xml','Salida pytest y JUnit del estado entregado'],
        ['suite_corpus_aislado.log / .xml','Salida pytest y JUnit después de recargar corpus'],
        ['evidencia_rutas_ui.json','Nueve rutas HTTP'],
        ['evidencia_build.json','Build nuevo e índices SHA-256'],
        ['evidencia_html_render.json','HTML generado con atributo ejecutable conservado; no ejecución en navegador'],
        ['cli_final.log','Smoke de consola con limitación de dependencia'],
        ['validaciones_finales.py / validar_html.mjs','Reproducciones incorporadas al ejecutor'],
        ['historico_prevalidacion_final_20261001_134935/','Reporte, scripts y evidencias anteriores']])
    md+='\nNo se reutilizaron evidencia_ui_actual.json ni verificacion_final.json antiguos. No se certifican cobertura de líneas/ramas, toda la prosa del corpus, proveedores/modelos reales, instalación limpia, DOCX/OCR, concurrencia, transacciones multiarchivo, despliegue ni pentest completo. Los nueve fallos reproducidos sí están verificados; estos límites no los convierten en hipotéticos.\n\n'
    md+=table(['Documento','Páginas','SHA-256'],[[c['file'],c['pages'],c['sha256']] for c in r['corpus']])
    return md,score,verdict,earned
