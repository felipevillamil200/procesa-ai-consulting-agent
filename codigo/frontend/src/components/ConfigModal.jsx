import React, { useState, useEffect } from 'react';
import { Sliders, X, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose, config, onSaveConfig }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(config?.model || 'gemini-flash-latest');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (config?.model) {
      setModel(config.model);
    }
  }, [config]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await onSaveConfig(apiKey, model);
      if (res.success) {
        setSaveStatus({ type: 'success', message: '✓ ¡Configuración actualizada! El agente aplicará los cambios de inmediato.' });
        setTimeout(() => {
          onClose();
          setSaveStatus(null);
        }, 1500);
      } else {
        setSaveStatus({ type: 'error', message: res.detail || 'Error al guardar configuración.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Configuración de API & Modelo</h3>
              <p className="text-[11px] text-slate-300">Google Gemini / OpenAI Provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-600 font-medium">Estado del Servicio IA:</span>
            <span className={`px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 ${
              config?.has_api_key ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${config?.has_api_key ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {config?.has_api_key ? `Activo (${config.masked_key})` : 'Sin Clave (Modo Local)'}
            </span>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <span className="text-[10px] text-cyan-600 font-semibold">Gratuita en AI Studio</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu clave AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              ¿No tienes clave? Puedes generarla gratis en{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-600 underline font-bold"
              >
                Google AI Studio
              </a>.
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Modelo LLM Activo</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
            >
              <option value="gemini-flash-latest">Google Gemini Flash Latest (Recomendado - Ultrarrápido & Gratuito)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Razonamiento Complejo)</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
            </select>
          </div>

          {/* Alert */}
          {saveStatus && (
            <div className={`p-3 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-cyan-500/20 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar y Aplicar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
