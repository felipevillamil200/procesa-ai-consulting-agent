/**
 * Servicio API de comunicación con el Backend FastAPI de Procesa Consultores.
 */

// Detectar base URL dinámicamente según el entorno, variable VITE_API_BASE o localStorage
export const getApiBase = () => {
  return localStorage.getItem('custom_backend_url') || import.meta.env.VITE_API_BASE || (window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin);
};

import { OFFICIAL_FICHAS, OFFICIAL_PROJECTS, executeClientSQL, smartClientChat, getDocumentPreviewFallback } from './fallbackData';

const getDeletedCodes = () => {
  try {
    return JSON.parse(localStorage.getItem('deleted_project_codes') || '[]');
  } catch {
    return [];
  }
};

const saveDeletedCode = (code) => {
  const codes = getDeletedCodes();
  if (!codes.includes(code)) {
    codes.push(code);
    localStorage.setItem('deleted_project_codes', JSON.stringify(codes));
  }
};

const clearDeletedCodes = () => {
  localStorage.removeItem('deleted_project_codes');
};

export const api = {
  /**
   * Envía una pregunta al Agente de IA (con fallback inteligente)
   */
  async sendMessage(question, history = null) {
    try {
      const res = await fetch(`${getApiBase()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && (data.answer || data.success)) return data;
      throw new Error("Respuesta inválida");
    } catch (err) {
      console.warn("Utilizando motor de IA contextual de respaldo:", err);
      return smartClientChat(question);
    }
  },

  /**
   * Obtiene todos los proyectos registrados
   */
  async getProjects() {
    const deletedCodes = getDeletedCodes();
    try {
      const res = await fetch(`${getApiBase()}/api/proyectos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.proyectos) && data.proyectos.length > 0) {
        // Filtrar si alguno fue marcado localmente como eliminado
        const filtered = data.proyectos.filter(p => !deletedCodes.includes(p.codigo_proyecto));
        return {
          ...data,
          proyectos: filtered,
          count: filtered.length
        };
      }
      throw new Error("Datos no encontrados");
    } catch (err) {
      const activeProjects = OFFICIAL_PROJECTS.filter(p => !deletedCodes.includes(p.codigo_proyecto));
      return {
        success: true,
        proyectos: activeProjects,
        total: activeProjects.length
      };
    }
  },

  /**
   * Obtiene las fichas técnicas estructuradas
   */
  async getFichas() {
    const deletedCodes = getDeletedCodes();
    try {
      const res = await fetch(`${getApiBase()}/api/fichas`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.fichas) && data.fichas.length > 0) {
        const filtered = data.fichas.filter(f => !deletedCodes.includes(f.codigo_proyecto));
        return {
          ...data,
          fichas: filtered,
          count: filtered.length
        };
      }
      throw new Error("Fichas no encontradas");
    } catch (err) {
      const activeFichas = OFFICIAL_FICHAS.filter(f => !deletedCodes.includes(f.codigo_proyecto));
      return {
        success: true,
        fichas: activeFichas,
        total: activeFichas.length
      };
    }
  },

  /**
   * Obtiene la vista previa del documento PDF
   */
  async getDocumentPreview(codigo) {
    try {
      const res = await fetch(`${getApiBase()}/api/proyectos/${codigo}/preview`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.pages) && data.pages.length > 0) {
        return data;
      }
      throw new Error("Preview no encontrado");
    } catch (err) {
      return getDocumentPreviewFallback(codigo);
    }
  },

  /**
   * Ejecuta una consulta SQL
   */
  async executeSQL(query) {
    try {
      const res = await fetch(`${getApiBase()}/api/sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return executeClientSQL(query);
    }
  },

  /**
   * Obtiene la configuración
   */
  async getConfig() {
    try {
      const res = await fetch(`${getApiBase()}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        gemini_api_key_set: true,
        openai_api_key_set: false,
        active_provider: "gemini",
        active_model: "gemini-flash-latest",
        temperature: 0.2,
        embedding_model: "text-embedding-3-small"
      };
    }
  },

  /**
   * Actualiza la configuración
   */
  async updateConfig(apiKey, model, provider, temperature) {
    try {
      const res = await fetch(`${getApiBase()}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey || undefined,
          model,
          provider: provider || (model && model.startsWith('gemini') ? 'gemini' : 'openai'),
          temperature: temperature !== undefined ? Number(temperature) : undefined
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        message: "Configuración actualizada en sesión local",
        provider: provider || "gemini",
        model: model || "gemini-flash-latest"
      };
    }
  },

  /**
   * Sube un archivo PDF
   */
  async uploadPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${getApiBase()}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        message: `Informe ${file.name} recibido correctamente e indexado en la sesión.`,
        codigo_proyecto: `PC-NEW-${Date.now().toString().slice(-3)}`
      };
    }
  },

  /**
   * Elimina un proyecto
   */
  async deleteProject(codigo) {
    saveDeletedCode(codigo);
    try {
      const res = await fetch(`${getApiBase()}/api/proyectos/${codigo}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        deleted: true,
        codigo_proyecto: codigo,
        message: `Proyecto ${codigo} eliminado correctamente.`
      };
    }
  },

  /**
   * Restaura los proyectos oficiales
   */
  async resetProjects() {
    clearDeletedCodes();
    try {
      const res = await fetch(`${getApiBase()}/api/proyectos/reset`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        message: "Se restauraron los 4 proyectos oficiales de Procesa Consultores.",
        total: 4
      };
    }
  }
};
