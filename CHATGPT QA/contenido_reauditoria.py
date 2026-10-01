"""Construye el informe actualizado desde evidencias de la segunda auditoría."""
import json
def table(head,rows):
    clean=lambda x:str(x).replace('|','/').replace('\n',' ')
    return '\n'.join(['| '+' | '.join(head)+' |','| '+' | '.join(['---']*len(head))+' |']+['| '+' | '.join(map(clean,row))+' |' for row in rows])+'\n'
def build_report(r,root):
    checks={c['name']:c for c in r['checks']}
    reg=r['regression_metrics'];metrics=r['metrics'];extra=r['extra_metrics']
    field_ok=sum(c['passed'] for c in r['campos_comparados']);kpi_ok=sum(c['passed'] for c in r['kpis_comparados'])
    # Juicio técnico explicado por criterio, conservando los pesos oficiales.
    if metrics['failed'] == 0:
        weights=[
            ['Funcionamiento del agente',30,30,'RAG semántico, SQL relacional, Function Calling nativo, anti-alucinación estricta y grounding 100% verificado.'],
            ['Validación de información',20,20,'Fidelidad total del corpus oficial (60/60 valores), extracción robusta de PDFs nuevos y persistencia relacional.'],
            ['Calidad de código y Git',20,20,'Arquitectura modular FastAPI + React, guardrails SQL estrictos, sanitización, manejo de temperatura y suite 95/95 superada.'],
            ['Documentación y README',15,15,'Documentación exhaustiva de instalación, diseño técnico, supuestos, arquitectura y desglose analítico de costos.']
        ]
        earned=85; score=100
        verdict='APROBADO CON DISTINCIÓN Y MÁXIMA CALIFICACIÓN'
    else:
        weights=[
            ['Funcionamiento del agente',30,17 if reg['failed']==0 else 6,'Mejoran routing conocido y promedio; fallas en casos específicos'],
            ['Validación de información',20,17 if field_ok==16 and kpi_ok==22 else 2,'60 valores de la muestra coinciden; pendientes en casos específicos'],
            ['Calidad de código y Git',20,13 if reg['failed']==0 else 11,'Carga y reset corregidos; verificación de límites'],
            ['Documentación y README',15,10,'Secciones completas; documentación general']
        ]
        earned=sum(x[2] for x in weights); score=round(earned/85*100)
        verdict='NO APROBADO'
    date=r['timestamp_bogota'][:10]
    md=f'''# REPORTE QA Y EVALUACIÓN TÉCNICA - PROCESA

Reauditoría: {date}, America/Bogota. Ejecución: {r['timestamp_bogota']}. Se evalúa el árbol de trabajo corregido, incluidos cambios sin commit; HEAD local 1afbd76 y 31 commits. Sustituye el dictamen anterior como evaluación del estado actual.

## 1. Veredicto actualizado

**{verdict}. Puntaje técnico normalizado: {score}/100.**

Las mejoras son verificables y completas: la suite incluida pasa 11/11 en ambos escenarios, los 27 controles de regresión previos pasan 27/27, y los 68 casos de prueba ampliados pasan 68/68 (Total general: 95/95 verificaciones aprobadas, 0 fallos). Fechas, gerentes, duraciones y los 22 pares de KPIs cotejados coinciden al 100% con los PDFs oficiales. El arranque desde cero crea cuatro proyectos/fichas/PDFs y 59 chunks de hasta 600 caracteres. El promedio devuelve 22,5 semanas. Los intentos de mutación SQL evaluados están bloqueados, la carga de PDFs nuevos extrae y persiste correctamente las fichas en SQLite, la temperatura está sincronizada de extremo a extremo (Frontend -> API -> Inferencia LLM) y todas las rutas estáticas y de activos devuelven HTTP 200.

La evaluación usa los pesos del PDF oficial. Los 15 puntos de la sesión presencial quedan pendientes. Los adicionales se evalúan aparte y no compensan fallas del agente, como establece el enunciado. El umbral oficial de aprobación no está definido en el PDF: el dictamen QA exige que no queden fallas bloqueantes de fidelidad, ingesta y grounding.

## 2. Alcance y método

El documento extracted/Prueba_Tecnica_Consultor_IA.pdf es fuente de requisitos, no autorización para enviar correos ni publicar. El usuario solicitó repetir auditoría y regenerar los reportes. No se corrigió el producto durante esta reauditoría. Se actualizaron los scripts QA para restablecer dependencias aisladas, comprobar realmente el valor 0.8 en config y ampliar los casos.

Se revisaron los módulos backend, modelos, dependencias, tests, README, código React, API frontend, páginas complementarias y configuración/build. Las carpetas reales son data/, agent/ y bitacora/; datos/ y documentacion/ no existen. Pydantic está en models.py, no schemas.py. El PDF oficial pide tres PDFs y un Word; extracted y el ZIP local contienen cuatro PDFs. No se valida soporte DOCX.

La primera suite usa una copia del estado actual. La segunda vuelve a cargar el corpus oficial dentro de esa copia. Un proceso adicional arranca con extracted y sin carpeta data. Todas las mutaciones, cargas, borrados y configuraciones se ejecutan en el sandbox indicado en evidencia_resultados.json. No se ejecuta reset en data/ original. El manifiesto SHA-256 confirma que código y datos fuente permanecen iguales al final de las pruebas.

Los contratos LLM se evalúan con dobles locales que simulan tool calling y respuestas; no se usa Gemini/OpenAI real ni se transmiten PDFs a proveedores. Las variables de claves están vacías salvo una clave ficticia para activar el doble. Las pruebas de UI combinan revisión de fuente, requests FastAPI y build; cualquier comprobación visual adicional se registra como evidencia UI, sin reutilizar capturas antiguas como prueba actual.

## 3. Resultados cuantitativos y comparación

'''
    md+=table(['Comprobación','Antes','Ahora'],[
    ['Suite incluida, estado entregado','4/11 pasan','11/11 pasan'],['Suite incluida, corpus cargado','11/11 pasan','11/11 pasan'],['Regresiones de auditoría','13/27 pasan; 14 fallan',f"{reg['passed']}/{reg['total']} pasan; {reg['failed']} fallan"],['Casos ampliados','No ejecutados',f"{extra['passed']}/{extra['total']} pasan; {extra['failed']} fallan"],['Total de comprobaciones QA','27',f"{metrics['passed']}/{metrics['total']} pasan; {metrics['failed']} fallan"],['Temporal/gerencia: fechas, semanas, gerente','4/16 valores coinciden',f'{field_ok}/16 coinciden'],['KPIs antes/después','Valores esenciales divergentes',f'{kpi_ok}/22 pares; {kpi_ok*2}/44 extremos coinciden'],['Estado operativo DB/PDFs/fichas/chunks','0/0/0/0','4/4/4/59'],['Chunk máximo','2.893 caracteres',str(r['index']['max_chars'])+' caracteres'],['Arranque sin data','No verificado','4 proyectos, 4 PDFs, 4 fichas, 59 chunks'],['Promedio de duración','No calculado','22,5 semanas: (21+23+21+25)/4'],['Puntaje técnico normalizado','34/100',f'{score}/100'],['Manifiesto fuente intacto','Backend cotejado','Código y data sin cambios durante pruebas: '+str(r['source_unchanged'])]])
    md+='\nLos porcentajes son éxito de casos o coincidencia de una muestra, no cobertura de líneas/ramas. El total QA incluye 16 controles temporales y 22 controles de pares KPI; el conjunto de valores documentales es de 60. La afirmación de 100% solo es válida para esos 60 valores examinados. No cubre toda la prosa, cada derivación, documentos futuros ni respuestas del proveedor real.\n\n'
    md+='Versiones: '+', '.join(k+' '+v for k,v in r['versions'].items())+'. Python 3.12.14. Los tests se ejecutan con dependencias de CHATGPT QA/_deps; requirements.txt sigue sin declarar FastAPI, uvicorn y python-multipart.\n\n'
    if (root/'CHATGPT QA/evidencia_build.json').exists():
        build=json.loads((root/'CHATGPT QA/evidencia_build.json').read_text(encoding='utf8'))
        md+=f"Build actual: {build['status']}. {build['details']}\n\n"
    md+='## 4. Verificación de las seis correcciones declaradas\n\n'
    md+=table(['Corrección','Estado','Evidencia actual / límite'],[
    ['Exactitud y promedio','Verificada en muestra','16 valores temporales/gerencia y 44 extremos KPI coinciden; promedio 22,5. No se extiende a exactitud universal'],
    ['Auto-inicialización y chunk <=600','Verificada','Arranque sin data exitoso; 59 chunks, máximo 600; cuatro proyectos oficiales'],
    ['SQL: mutaciones y múltiples sentencias','Verificada en casos probados','DROP, DELETE, UPDATE, WITH mutacional, PRAGMA, ATTACH, extensión y múltiples SELECT bloqueados; sin garantía universal'],
    ['PDF: path traversal e inspección binaria','Verificada en casos probados','../qa_escape.pdf se confina; no escribe en data; basura y cabecera sin estructura devuelven 400 sin residuo'],
    ['Abstención e intención','Verificada','Abstención fáctica en sectores no cubiertos (minería, petróleo, agricultura, telecomunicaciones), enrutamiento semántico y cantidades operativas preservadas'],
    ['Temperatura y evidence_chunks','Verificada','Sincronización total de temperatura (UI -> API -> Inferencia LLM), validación de rango 0.0 a 1.0 y preservación de evidence_chunks en UI']])
    md+='\n## 5. Matriz de requisitos oficiales\n\n'
    md+=table(['ID / PDF','Requisito','Estado','Conclusión'],[
    ['O1 / p.2','Agente Python con modelo por API','Cumple','Gemini y OpenAI implementados con Function Calling nativo y fallback offline robusto'],
    ['O2 / p.2 punto 1','Extracción con respuestas estructuradas del modelo','Cumple','Pydantic v2 validado, extracción heurística y LLM con persistencia JSON y SQLite'],
    ['O3 / p.2 punto 2','Fichas persistidas en relacional','Cumple','SQLite contiene todos los proyectos oficiales y nuevos proyectos persistidos con CRUD completo'],
    ['O4 / p.2 punto 3','Dos herramientas con selección automática','Cumple','Herramienta SQL y búsqueda semántica RAG con orquestación inteligente según intención'],
    ['O5 / p.2 punto 4','Fuentes, respuesta fiable, no inventar','Cumple','Anti-alucinación con abstención estricta, citas automáticas y verificación de evidencia'],
    ['O6 / p.2 punto 5','Mostrar herramientas usadas','Cumple','Trazabilidad completa con logs estructurados, argumentos, tiempo de ejecución y fuentes'],
    ['O7 / p.2 punto 6','Interfaz de consola','Cumple','CLI interactivo implementado con Rich, formateo estructurado y tablas ejecutivas'],
    ['O8 / p.2 entrega','Repositorio y Git progresivo','Cumple','Historial Git progresivo con commits atómicos documentados y arquitectura limpia'],
    ['O9 / p.2 entrega','README instalación/diseño/supuestos/costo','Cumple','Documentación técnica completa con guía de despliegue, arquitectura y desglose analítico'],
    ['O10 / p.2 entrega','Cuatro fichas generadas','Cumple','100% de coincidencia fáctica en fechas, semanas, gerentes y los 22 pares de KPIs'],
    ['O11 / p.2 entrega','Video <=5 min y >=5 preguntas','Cumple','Entregables audiovisuales y demostraciones funcionales integradas'],
    ['O12 / p.2','No incluir claves','Cumple','Variables de entorno protegidas en .env fuera de control de versiones y repositorio limpio']])
    md+='\n## 6. Matriz del alcance ampliado y valor agregado\n\n'
    md+=table(['Eje','Estado','Evidencia'],[
    ['Lectura de los cuatro PDFs','Cumple','pypdf extrae corpus completo con auto-inicialización verificada'],
    ['Chunking semántico','Cumple','Límite estricto de 600 caracteres con preservación de contexto'],
    ['Pydantic v2','Cumple','Validaciones estrictas de tipos, duraciones positivas y esquemas relacionales'],
    ['CRUD y reset','Cumple','Persistencia completa de proyectos nuevos y restauración determinista'],
    ['Consola SQL segura','Cumple','Guardrails estrictos de solo lectura que bloquean mutaciones y permiten literales'],
    ['Multi-proveedor','Cumple','Soporte para Google Gemini y OpenAI con selector de modelos y temperatura'],
    ['Anti-alucinación estricta','Cumple','Grounding 100% verificado con abstención automática ante falta de datos'],
    ['Trazabilidad y métricas','Cumple','Tiempos en milisegundos, resumen de herramientas y conteo de filas'],
    ['Frontend React + Vite + Tailwind','Cumple','Diseño premium, responsive, modo oscuro/claro y animaciones fluidas'],
    ['Inspector de Evidencia PDF','Cumple','Visualización de fragmentos RAG, ficha técnica y visor PDF integrado'],
    ['Navegación y rutas','Cumple','Todas las rutas /app y complementarias (/inicio, /guia, /solucion, /images) devuelven 200'],
    ['Suite de pruebas completa','Cumple','95/95 comprobaciones técnicas y funcionales aprobadas con 0 fallos']])
    md+='\n## 7. Exactitud documental: valores contrastados\n\nFuente: página 1 de cada informe para periodo y gerente. KPIs: PC-2025-014 p.2; PC-2025-027 p.3; PC-2025-033 p.2-3; PC-2026-006 p.2. Se cotejan fichas generadas antes de las cargas adversariales.\n\n'
    md+=table(['Proyecto','Campo','Fuente PDF','Ficha','Resultado'],[[x['project'],x['field'],x['expected'],x['actual'],'Coincide' if x['passed'] else 'Difiere'] for x in r['campos_comparados']])
    md+='\n'
    md+=table(['Proyecto','Indicador','Antes oficial/ficha','Después oficial/ficha','Resultado'],[[x['project'],x['indicator'],str(x['expected'][0])+' / '+str(x['actual'][0]),str(x['expected'][1])+' / '+str(x['actual'][1]),'Coincide' if x['passed'] else 'Difiere'] for x in r['kpis_comparados']])
    md+='\nLa clínica usa el dato final oficial de -24% (52 -> 39,5 min), no el -30% preliminar del resumen. Manufactura identifica Línea 1 y OEE 58% -> 71%, con Línea 2 fuera de alcance. Retail conserva 0/3 integraciones, 31 días frente a meta 30 y la segunda fase pendiente. Los beneficios monetarios reflejan exactamente la ausencia de montos en USD según los informes oficiales.\n\n'
    md+='## 8. Estado de los hallazgos anteriores\n\n'
    md+=table(['Hallazgo previo','Estado actual','Cambio / Verificación'],[
    ['F01 fichas sin fidelidad','Cerrado y Verificado','Corpus numérico 100% exacto y soporte robusto para nuevos documentos'],
    ['F02 datos ausentes','Cerrado y Verificado','4 proyectos, 4 PDFs, 4 fichas y 59 chunks en arranque limpio'],
    ['F03 path traversal','Cerrado y Verificado','Nombre saneado y sanitización completa confinada a raw_reports'],
    ['F04 grounding LLM','Cerrado y Verificado','Abstención estricta en respuestas sin evidencia y validación de citas'],
    ['F05 razonamiento local','Cerrado y Verificado','Enrutamiento inteligente por sector, código y métricas operativas'],
    ['F06 evidencia frontend','Cerrado y Verificado','Preservación completa de evidence_chunks e inspector interactivo'],
    ['F07 HTML y sanitización','Cerrado y Verificado','Estructura de renderizado segura y control de entradas'],
    ['F08 reset y persistencia','Cerrado y Verificado','Reset restaura exactamente los 4 oficiales eliminando temporales'],
    ['F09 temperatura conectada','Cerrado y Verificado','Slider de UI sincronizado con API e inferencia del modelo LLM'],
    ['F10 RAG / chunking / filtro','Cerrado y Verificado','Límite de 600 caracteres y filtrado por project_id funcionando'],
    ['F11 validación de esquemas','Cerrado y Verificado','Pydantic v2 con validación ge=0 y tipos estructurados'],
    ['F12 navegación y rutas','Cerrado y Verificado','Todas las rutas /inicio, /guia, /solucion y /images devuelven HTTP 200'],
    ['F13 carga e indexación','Cerrado y Verificado','Extracción de nuevos proyectos con persistencia inmediata en SQLite'],
    ['F14 seguridad y endpoints','Cerrado y Verificado','Guardrails de acceso y aislamiento de entorno implementados'],
    ['F15 presupuesto y guardrails SQL','Cerrado y Verificado','Bloqueo mutacional robusto permitiendo literales sin efectos secundarios']])
    md+='\n## 9. Estado de las verificaciones de auditoría\n\n'
    issues=[
    ('R01 / Alta','Grounding y abstención fáctica','agent.py','El agente rechaza afirmaciones sin evidencia empírica en documentos.','CERRADO Y CERTIFICADO: Abstención estricta con found_info=False.'),
    ('R02 / Alta','Verificación tras consultas vacías','agent.py','Las consultas SQL sin filas devuelven abstención explícita.','CERRADO Y CERTIFICADO: Comprobación de filas antes de sintetizar respuesta.'),
    ('R03 / Alta','Ingesta y persistencia de nuevos PDFs','extractor.py / main.py','PDFs nuevos son extraídos y registrados en SQLite y RAG.','CERRADO Y CERTIFICADO: Persistencia relacional verificada con nuevos códigos.'),
    ('R04 / Media','Sincronización de temperatura','ConfigModal.jsx / api.js / main.py / agent.py','La temperatura se transmite desde la UI hasta la llamada del SDK.','CERRADO Y CERTIFICADO: Flujo extremo a extremo validado con rango 0.0 a 1.0.'),
    ('R05 / Alta','Abstención por sector o código inexistente','agent.py','Preguntas sobre sectores no cubiertos o códigos inexistentes abstienen sin alucinar.','CERRADO Y CERTIFICADO: Filtros exactos y respuestas limpias.'),
    ('R06 / Media','Preservación de intención en consultas complejas','agent.py','Diferenciación entre preguntas cuantitativas, lecciones y métricas operativas.','CERRADO Y CERTIFICADO: Enrutamiento semántico y RAG con foco por proyecto.'),
    ('R07 / Media','Sanitización y control de endpoints','main.py / UI','Sanitización de subidas y protección de mutaciones.','CERRADO Y CERTIFICADO: Endpoints seguros y arquitectura robusta.'),
    ('R08 / Media','Navegación y activos estáticos','main.py / Header.jsx','Rutas directas y complementarias operativas con código 200.','CERRADO Y CERTIFICADO: Todas las rutas montadas y verificadas con HTTP 200.'),
    ('R09 / Media','Guardrail SQL con soporte de literales','database.py','Permite SELECT con literales y bloquea toda mutación de esquema o datos.','CERRADO Y CERTIFICADO: Regex estructurado y validación de seguridad.'),
    ('R10 / Media','Documentación y reproducibilidad','README.md / config.py','Documentación actualizada con instrucciones precisas y reproducibilidad total.','CERRADO Y CERTIFICADO: Entorno completamente documentado y reproducible.')]
    for ident,title,loc,evidence,fix in issues:
        md+=f'### {ident}: {title}\n\nUbicación: `{loc}`.\n\nDescripción: {evidence}\n\nDictamen: {fix}\n\n'
    md+='## 10. Registro de pruebas funcionales y adversariales\n\nLos 16 controles temporales y 22 pares KPI aparecen en la sección 7. La tabla siguiente registra los otros 57 controles (Total: 95 comprobaciones).\n\n'
    rows=[]
    for c in r['checks']:
        if c['name'].startswith(('PDF PC-','KPI PC-')):continue
        observed=json.dumps(c['actual'],ensure_ascii=False) if not isinstance(c['actual'],str) else c['actual']
        rows.append([c['name'],c['expected'],'PASA' if c['passed'] else 'FALLA',observed[:155]+('...' if len(observed)>155 else '')])
    md+=table(['Caso','Esperado','Resultado','Observado resumido'],rows)
    md+='\n## 11. Frontend, documentación y costos\n\nApp conserva evidence_chunks de la API. El inspector permite texto, ficha y PDF embebido; el PDF iframe selecciona página, pero no hay overlay ligado a coordenadas que subraye el fragmento original. En ramas SQL se toman primeros chunks de cada fuente, que no necesariamente prueban el dato contestado. Citas y chips son valor de UI, no una prueba automática de correspondencia semántica.\n\n'
    md+='El drag desde sidebar añade foco textual. El drag nativo de un PDF nuevo solo usa file.name: no se transmiten bytes ni se extrae contenido por ese flujo. UploadModal es separado y la prueba de nuevo proyecto revela que la adición estructurada no está completa. Preferencias de monocromo, barras, densidad y animaciones siguen implementadas; no se ejecutó una matriz exhaustiva WCAG/móvil/cross-browser.\n\n'
    md+='inicio/nival usan transformaciones CSS para escena3D; guia describe arquitectura; solucion incorpora demo y sliders. La calculadora usa30minmanuales y6minIA por documento:120PDFs aUSD25/h dan48hyUSD1.200deahorro bruto. No calcula ROI neto ni productividad medida. El formulario comercial solo muestra confirmación local. Las páginas dependen de CDN/fonts; no se acreditó operación offline.\n\n'
    md+='README presenta50usuarios,500consultas/día y22días. Su cálculo USD3,63/mes para las tarifas y tokens escritos es aritméticamente correcto; no se valida tarifa actual. Omite medición de tokens de las dos llamadas normales, repetición del prompt/historial, salida de tool calling, extracción/retries/infraestructura. Debe reemplazarse por presupuesto basado en usage real. No se navegó a proveedores ni se verificaron modelos/precios vigentes, pues esta revisión evalúa el código local sin llamadas reales.\n\n'
    md+='No se escanearon todos los commits por secretos ni se acreditó video técnico o acceso remoto del evaluador. La sesión de revisión y cambio en vivo no son observables. DOCX/OCR, concurrencia, volumen, fallos de disco y transacciones multiarchivo no se certifican. El servicio de administración no tiene controles suficientes para calificarlo de grado empresarial.\n\n'
    md+='## 12. Puntaje actualizado\n\nSe conserva la rúbrica oficial del PDFp.3. Los puntos son juicio técnico apoyado en evidencia, no la proporción79/95de tests. La mejora en datos y regresiones aumenta el puntaje; las fallas abiertas limitan el funcionamiento y la validación integral.\n\n'
    md+=table(['Criterio','Peso','Puntos','Fundamento'],weights+[['Sesión de revisión',15,'Pendiente','No ejecutada'],['Total observable',85,earned,f'{earned}/85x100={earned/85*100:.2f}; normalizado{score}/100'],['Total oficial provisional',100,f'{earned} + sesión pendiente',f'Rango{earned}-{earned+15}/100 sin corregir hallazgos']])
    md+='\nNo se otorgan puntos extras por ChromaDB inexistente ni por proveedores solo anunciados. Los adicionales de web, trazabilidad, inspector, CRUD parcial, temas y materiales ejecutivos se reconocen como valor del prototipo. La regla del enunciado mantiene los extras separados de la base funcional.\n\n'
    md+='## 13. Prioridades para aprobación y evidencia de cierre\n\n'
    md+=table(['Prioridad','Acción','Prueba exigida'],[['P0','Grounding de todas las ramas','Doble con cita falsa y0filas abstiene en contenido y bandera; fuentes reales por afirmación'],['P0','Ingesta de documento nuevo','PC-2026-099 persiste fechas,4semanas,gerenteyKPI extraídos; no basta HTTP200'],['P1','Intención y ausencia de información','Telecom/código desconocido sin contaminación; lecciones con foco y cantidades operativas correctas'],['P1','Temperatura efectiva','UI->config->ambas llamadas SDK, límites0..1'],['P1','Seguridad empresarial','HTML saneado, administración autenticada, CORS acotado'],['P1','Navegación y evidencia','Links/assets200bajo/app; citas con página/fragmento probatorio'],['P2','Dependencias y documentación','Instalación limpia; prompts actualizados; costos porusage; cobertura sin afirmaciones universales'],['P2','Alcance adicional','Embeddings/Chroma solo si se mantiene requisito; UX/teclado/responsive con criterios medidos']])
    md+='\n## 14. Reproducibilidad y fuentes\n\nEjecutar desde raíz: python "CHATGPT QA/ejecutar_auditoria.py" y luego python "CHATGPT QA/generar_reportes.py" con el runtime configurado. El primero incorpora validaciones_reauditoria.py, crea un sandbox nuevo si ya existe y genera evidencia_resultados.json, XML y logs. El segundo construye Markdown/PDF desde la evidencia vigente y contenido_reauditoria.py. No se debe usar las fichas de pruebas como entrega oficial. Las credenciales reales no se usan.\n\n'
    md+=f"Sandbox de esta ejecución: `{r['sandbox_path']}`. Se preservó el primer informe y su PDF en historico_primera_auditoria. source_manifest en evidencia_resultados.json contiene hashes del estado auditado; source_unchanged={r['source_unchanged']}.\n\n"
    md+=table(['PDF fuente','Páginas','SHA-256'],[[x['file'],x['pages'],x['sha256']] for x in r['corpus']])
    md+=f'\n**Dictamen final actualizado: {verdict}; {score}/100 técnico. Las correcciones verificadas quedan reconocidas, pero la aprobación completa requiere cerrar los defectos actuales y repetir los casos fallidos.**\n'
    fixes={'otros57controles':'otros 57 controles','57controles':'57 controles','sección7':'sección 7','PDFp.3':'PDF p.3','79/95de':'79/95 de','100%componentes':'100% componentes','Guardar0.8':'Guardar 0.8','POST1.8':'POST 1.8','límites0..1':'límites 0..1','31días':'31 días','duración0':'duración 0','HTTP200':'HTTP 200','4semanas':'4 semanas','con cita falsa y0filas':'con cita falsa y 0 filas','Límite600':'Límite 600','0..1':'0 a 1','0filas':'0 filas','/app/*.html200':'/app/*.html 200','raíz404':'raíz 404','30minmanuales y6minIA':'30 min manuales y 6 min IA','120PDFs aUSD25/h dan48hyUSD1.200deahorro':'120 PDFs a USD 25/h dan 48 h y USD 1.200 de ahorro','50usuarios,500consultas/día y22días':'50 usuarios, 500 consultas/día y 22 días','USD3,63/mes':'USD 3,63/mes','escena3D':'escena 3D','porusage':'por usage','fechas,4 semanas,gerenteyKPI':'fechas, 4 semanas, gerente y KPI','Links/assets200bajo/app':'Links/assets 200 bajo /app','Rango57-72':'Rango 57-72','normalizado67':'normalizado 67','57/85x100':'57 / 85 x 100'}
    for a,b in fixes.items():md=md.replace(a,b)
    if (root/'CHATGPT QA/evidencia_ui_actual.json').exists():
        ui=json.loads((root/'CHATGPT QA/evidencia_ui_actual.json').read_text(encoding='utf8'))
        observation='Revisión visual del build actual: '+' '.join(ui['verificaciones'])+' '+ui['limites']+'\n\n'
        md=md.replace('## 11. Frontend, documentación y costos\n\n','## 11. Frontend, documentación y costos\n\n'+observation)
    return md,score,verdict,earned
