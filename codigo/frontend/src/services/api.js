/**
 * Servicio API de comunicación con el Backend FastAPI de Procesa Consultores.
 */

// Detectar base URL dinámicamente según el entorno o variable VITE_API_BASE
const API_BASE = import.meta.env.VITE_API_BASE || (window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin);

export const api = {
  /**
   * Envía una pregunta al Agente de IA
   */
  async sendMessage(question, history = null) {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history })
    });
    return res.json();
  },

  /**
   * Obtiene todos los proyectos registrados
   */
  async getProjects() {
    const res = await fetch(`${API_BASE}/api/proyectos`);
    return res.json();
  },

  /**
   * Obtiene las fichas técnicas estructuradas
   */
  async getFichas() {
    const res = await fetch(`${API_BASE}/api/fichas`);
    return res.json();
  },

  /**
   * Obtiene la vista previa completa del documento PDF con páginas y chunks
   */
  async getDocumentPreview(codigo) {
    const res = await fetch(`${API_BASE}/api/proyectos/${codigo}/preview`);
    return res.json();
  },

  /**
   * Ejecuta una consulta SQL segura (solo lectura)
   */
  async executeSQL(query) {
    const res = await fetch(`${API_BASE}/api/sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return res.json();
  },

  /**
   * Obtiene el estado de configuración de la API Key y Modelo
   */
  async getConfig() {
    const res = await fetch(`${API_BASE}/api/config`);
    return res.json();
  },

  /**
   * Actualiza la API Key de Gemini o el modelo activo y temperatura
   */
  async updateConfig(apiKey, model, provider, temperature) {
    const res = await fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey || undefined,
        model,
        provider: provider || (model && model.startsWith('gemini') ? 'gemini' : 'openai'),
        temperature: temperature !== undefined ? Number(temperature) : undefined
      })
    });
    return res.json();
  },

  /**
   * Sube un archivo PDF para extracción e indexación
   */
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  /**
   * Elimina un proyecto y su documento asociado
   */
  async deleteProject(codigo) {
    const res = await fetch(`${API_BASE}/api/proyectos/${codigo}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  /**
   * Restaura los 4 proyectos oficiales de la prueba técnica
   */
  async resetProjects() {
    const res = await fetch(`${API_BASE}/api/proyectos/reset`, {
      method: 'POST'
    });
    return res.json();
  }
};
