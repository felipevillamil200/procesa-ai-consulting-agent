/** Cliente API: los fallos nunca se convierten en cargas ni respuestas ficticias. */
export const getApiBase = () => (localStorage.getItem('custom_backend_url') || import.meta.env.VITE_API_BASE || (window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin)).replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${getApiBase()}${path}`, options);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `La API devolvió HTTP ${response.status}.`);
  if (!data) throw new Error('La API no devolvió JSON. Revisa la dirección del backend.');
  return data;
}
const post = (path, body) => request(path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

export const api = {
  sendMessage(question, history = null, documentIds = []) {
    return post('/api/chat', {question, history, document_ids: documentIds.length ? documentIds : undefined});
  },
  getProjects() { return request('/api/proyectos'); },
  getFichas() { return request('/api/fichas'); },
  getDocuments() { return request('/api/documentos'); },
  getDocumentPreview(code) { return request(`/api/proyectos/${encodeURIComponent(code)}/preview`); },
  executeSQL(query) { return post('/api/sql', {query}); },
  async getConfig() {
    try { return await request('/api/config'); }
    catch { return {success:false,backend_available:false,has_api_key:false,provider:localStorage.getItem('custom_provider') || 'gemini',model:localStorage.getItem('custom_model') || 'gemini-flash-latest',temperature:Number(localStorage.getItem('custom_temperature') || 0.1)}; }
  },
  async updateConfig(apiKey, model, provider, temperature) {
    const result = await post('/api/config', {api_key:apiKey || undefined,model,provider,temperature:Number(temperature)});
    if (result.success) {
      localStorage.setItem('custom_provider',provider); localStorage.setItem('custom_model',model); localStorage.setItem('custom_temperature',String(temperature));
      localStorage.removeItem('gemini_api_key'); localStorage.removeItem('openai_api_key');
    }
    return result;
  },
  deleteApiKey() {
    localStorage.removeItem('gemini_api_key'); localStorage.removeItem('openai_api_key');
    return request('/api/config/key', {method:'DELETE'});
  },
  uploadPDF(file) {
    const formData = new FormData(); formData.append('file',file);
    return request('/api/upload', {method:'POST',body:formData});
  },
  deleteProject(code) { return request(`/api/proyectos/${encodeURIComponent(code)}`, {method:'DELETE'}); },
  resetProjects() { return post('/api/proyectos/reset', {}); }
};
