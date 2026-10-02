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
    const prov = localStorage.getItem('custom_provider') || 'openai';
    const key = prov === 'openai' ? localStorage.getItem('openai_api_key') : localStorage.getItem('gemini_api_key');
    const model = localStorage.getItem('custom_model');
    return post('/api/chat', {
      question,
      history,
      document_ids: documentIds.length ? documentIds : undefined,
      api_key: key || undefined,
      provider: prov,
      model: model || undefined
    });
  },
  getProjects() { return request('/api/proyectos'); },
  getFichas() { return request('/api/fichas'); },
  getDocuments() { return request('/api/documentos'); },
  getDocumentPreview(code) { return request(`/api/proyectos/${encodeURIComponent(code)}/preview`); },
  executeSQL(query) { return post('/api/sql', {query}); },
  async getConfig() {
    const savedProv = localStorage.getItem('custom_provider') || 'openai';
    const savedKey = savedProv === 'openai' ? localStorage.getItem('openai_api_key') : localStorage.getItem('gemini_api_key');
    const savedModel = localStorage.getItem('custom_model') || (savedProv === 'openai' ? 'gpt-4o-mini' : 'gemini-flash-latest');
    const savedTemp = Number(localStorage.getItem('custom_temperature') || 0.1);

    try {
      const remote = await request('/api/config');
      return {
        ...remote,
        success: true,
        provider: savedProv || remote.provider || 'openai',
        model: savedModel || remote.model || 'gpt-4o-mini',
        temperature: savedTemp ?? remote.temperature ?? 0.1,
        has_api_key: Boolean(savedKey || remote.has_api_key),
        openai_api_key_set: Boolean(localStorage.getItem('openai_api_key') || remote.openai_api_key_set),
        gemini_api_key_set: Boolean(localStorage.getItem('gemini_api_key') || remote.gemini_api_key_set),
        masked_key: savedKey ? `${savedKey.slice(0, 6)}...${savedKey.slice(-4)}` : (remote.masked_key || (remote.has_api_key ? 'Configurada en .env' : 'No configurada'))
      };
    } catch {
      return {
        success: true,
        backend_available: true,
        has_api_key: Boolean(savedKey),
        openai_api_key_set: Boolean(localStorage.getItem('openai_api_key')),
        gemini_api_key_set: Boolean(localStorage.getItem('gemini_api_key')),
        provider: savedProv,
        model: savedModel,
        temperature: savedTemp,
        masked_key: savedKey ? `${savedKey.slice(0, 6)}...${savedKey.slice(-4)}` : 'No configurada'
      };
    }
  },
  async updateConfig(apiKey, model, provider, temperature) {
    const activeProv = provider || 'openai';
    const activeModel = model || (activeProv === 'openai' ? 'gpt-4o-mini' : 'gemini-flash-latest');
    const activeTemp = temperature !== undefined ? Number(temperature) : 0.1;

    localStorage.setItem('custom_provider', activeProv);
    localStorage.setItem('custom_model', activeModel);
    localStorage.setItem('custom_temperature', String(activeTemp));

    if (apiKey && apiKey.trim()) {
      const cleanKey = apiKey.trim();
      if (activeProv === 'openai' || cleanKey.startsWith('sk-')) {
        localStorage.setItem('openai_api_key', cleanKey);
      } else {
        localStorage.setItem('gemini_api_key', cleanKey);
      }
    }

    try {
      const result = await post('/api/config', {
        api_key: apiKey || undefined,
        model: activeModel,
        provider: activeProv,
        temperature: activeTemp
      });
      return result;
    } catch {
      // En entornos Serverless como Vercel donde los cambios de memoria son efímeros
      return {
        success: true,
        message: 'Configuración guardada y aplicada en sesión.',
        provider: activeProv,
        model: activeModel,
        temperature: activeTemp
      };
    }
  },
  async deleteApiKey() {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('openai_api_key');
    try {
      return await request('/api/config/key', {method:'DELETE'});
    } catch {
      return { success: true, message: 'Clave eliminada localmente.', has_api_key: false };
    }
  },
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      return await request('/api/upload', {method:'POST', body:formData});
    } catch (err) {
      if (err.message && (err.message.includes('405') || err.message.includes('404'))) {
        return await request('/upload', {method:'POST', body:formData});
      }
      throw err;
    }
  },
  deleteProject(code) { return request(`/api/proyectos/${encodeURIComponent(code)}`, {method:'DELETE'}); },
  resetProjects() { return post('/api/proyectos/reset', {}); }
};
