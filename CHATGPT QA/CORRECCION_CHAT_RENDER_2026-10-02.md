# Corrección del chat documental — 2026-10-02

## Diagnóstico

La factura DOC-D8CD838E68D33EF4 estaba cargada y era consultable. Antes de la corrección, la pregunta por el total respondía correctamente, pero el resumen era rechazado por el control de evidencia. Además, los dos botones «Consultar en Chat» del explorador SQL generaban una pregunta de lecciones y resultados de consultoría para cualquier archivo, incluidas facturas.

## Correcciones

- Preguntas de apertura por tipo: los documentos generales abren una consulta de contenido; las fichas de proyectos conservan su pregunta de lecciones.
- Verificación de citas contiguas que atraviesan chunks de una misma página original, sin aceptar otra fuente o página.
- Normalización de separadores de importes y exclusión de índices de listas, incluidos encabezados Markdown.
- En resúmenes, completar citas numéricas omitidas con fragmentos recuperados de las fuentes ya citadas. Si queda una cifra sin respaldo, mostrar extractos originales y advertir del rechazo de la síntesis.
- Indexar fragmentos cortos no vacíos: un importe breve también es evidencia.
- Abstención explicativa cuando se piden datos que no constan en una factura.
- El cliente no declara conexión ni configuración aplicada si la API falla. Se conservan las preferencias locales y se muestra el error del servidor.

## Validación

| Comprobación | Resultado |
|---|---|
| Suite Python | 50 pruebas aprobadas |
| Contratos del cliente | 10 comprobaciones aprobadas |
| Build Vite | Correcto |
| Factura real: contenido | Respuesta de IA verificada, con citas |
| Factura real: total | Respuesta verificada |
| Factura real: lecciones de consultoría | Abstención con explicación del tipo de archivo |
| Dos facturas nuevas de prueba | Carga, aislamiento y comparación con evidencia correctos; la primera prueba usó respaldo extractivo |
| Dato inexistente | Abstención sin fuentes ajenas |

Las facturas sintéticas se eliminaron al terminar la prueba; se conservó el archivo del usuario. Evidencia: `diagnostico_chat_render_local.json` (antes), `diagnostico_chat_corregido.json` (después), `comparacion_chat_corregido.json` y `diagnostico_validacion_modelo.json`. Estos archivos pueden contener datos de la factura; son evidencia local.

## Alcance y Render

Se verificó el backend local y se reconstruyó el frontend. No se desplegaron estos cambios ni se certificó el servicio remoto: el acceso a su endpoint de salud falló desde las herramientas de comprobación.

El `render.yaml` actual no configura un disco persistente. El estado de la API ya no afirma persistencia en Render salvo declaración explícita mediante `PROCESA_PERSISTENT_STORAGE=true`. Esa variable debe corresponder a almacenamiento realmente configurado, por ejemplo un disco montado con `PROCESA_DATA_DIR` apuntando a él.

Esta validación demuestra los casos probados. No certifica lectura perfecta de cualquier PDF ni la exactitud semántica de toda respuesta posible.
