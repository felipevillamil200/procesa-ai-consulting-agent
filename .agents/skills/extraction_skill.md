# Skill: Extracción Estructurada y Validación de Fichas (Extraction Skill)

## Propósito
Guiar la extracción consistente y sin pérdidas de datos desde los documentos PDF hacia el modelo `ProyectoFicha` de Pydantic.

## Directrices de Implementación
1. **Lectura de PDF:** Usar `pypdf` para extraer el texto íntegro preservando el número de página.
2. **Extracción con LLM:** Enviar el texto completo al modelo LLM con el esquema JSON de `ProyectoFicha` usando Structured Outputs (`response_format={"type": "json_object"}` o Pydantic parser).
3. **Validaciones críticas:**
   - Asegurar que `codigo_proyecto` coincida con el patrón `PC-YYYY-NNN`.
   - Normalizar la duración a un número entero de semanas (`duracion_semanas`).
   - Mapear correctamente la lista de `kpis_impacto` extrayendo el valor de línea base antes y el resultado final después.
4. **Persistencia:** Guardar el archivo JSON en `data/fichas/{codigo_proyecto}.json`.
