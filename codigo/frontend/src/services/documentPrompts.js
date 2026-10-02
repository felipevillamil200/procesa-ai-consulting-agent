/** El chat debe preguntar por el tipo de archivo que el usuario abrió. */
export function documentQuestion(document) {
  const code = document.codigo_proyecto || document.codigo || document.document_id;
  const generic = document.es_documento || code?.startsWith('DOC-');
  return generic
    ? `¿Qué contiene el documento ${code}? Resume sus datos principales con citas del archivo.`
    : `¿Cuáles fueron las lecciones aprendidas y resultados del proyecto ${code}?`;
}
