import React, { useState, useEffect } from 'react';
import { 
  Sliders, X, Eye, EyeOff, Save, CheckCircle2, AlertCircle, 
  Lock, Sparkles, Cpu, ShieldCheck, Terminal, RotateCcw, Info,
  Layout, Monitor, Palette, SlidersHorizontal, Zap
} from 'lucide-react';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'API Gratuita de Google AI Studio. Máxima velocidad y optimización en Function Calling.',
    icon: Sparkles,
    badge: 'Activo & Disponible',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    enabled: true,
    models: [
      { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (Recomendado - Ultrarrápido & Gratuito)', desc: 'Excelente para Function Calling y SQL en tiempo real' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Alta fidelidad & Baja Latencia)', desc: 'Balance óptimo entre costo y velocidad' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Razonamiento Complejo & Contexto 2M)', desc: 'Para análisis de contexto masivo y reportes densos' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen Multimodal)', desc: 'Generación de última generación' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    description: 'Modelos GPT-4o y GPT-4o-mini con Structured Outputs nativos.',
    icon: Cpu,
    badge: 'Bloqueado / Pro',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-300',
    enabled: false,
    lockReason: 'Requiere licencia Enterprise o clave OPENAI_API_KEY activa.'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Modelos Claude 3.5 Sonnet y Haiku con razonamiento avanzado.',
    icon: ShieldCheck,
    badge: 'Bloqueado / Pro',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-300',
    enabled: false,
    lockReason: 'Requiere suscripción corporativa Anthropic API.'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    description: 'Modelos DeepSeek-V3 y DeepSeek-R1 para razonamiento matemático profundo.',
    icon: Terminal,
    badge: 'Bloqueado / Pro',
    badgeColor: 'bg-slate-100 text-slate-500 border-slate-300',
    enabled: false,
    lockReason: 'Integración en cola de desarrollo para versión v2.5.'
  }
];

export default function ConfigModal({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig,
  isMonochrome,
  onToggleMonochrome,
  uiDensity = 'comfortable',
  onToggleDensity,
  uiScrollbarsVisible = true,
  onToggleScrollbars,
  uiAnimations = true,
  onToggleAnimations
}) {
  // Tab selector: 'ai' (Estado de la IA) | 'ui' (Interfaz)
  const [modalTab, setModalTab] = useState('ai');

  // AI Core State
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(config?.model || 'gemini-flash-latest');
  const [temperature, setTemperature] = useState(0.1);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // UI / Interface Preferences Local Sync
  const [monochromeLocal, setMonochromeLocal] = useState(isMonochrome || false);
  const [densityLocal, setDensityLocal] = useState(uiDensity);
  const [scrollbarsLocal, setScrollbarsLocal] = useState(uiScrollbarsVisible);
  const [animationsLocal, setAnimationsLocal] = useState(uiAnimations);

  useEffect(() => {
    setMonochromeLocal(isMonochrome);
  }, [isMonochrome]);

  useEffect(() => {
    setDensityLocal(uiDensity);
  }, [uiDensity]);

  useEffect(() => {
    setScrollbarsLocal(uiScrollbarsVisible);
  }, [uiScrollbarsVisible]);

  useEffect(() => {
    setAnimationsLocal(uiAnimations);
  }, [uiAnimations]);

  useEffect(() => {
    if (config?.model) {
      setModel(config.model);
    }
    if (config?.provider) {
      setSelectedProvider(config.provider);
    }
  }, [config]);

  if (!isOpen) return null;

  // Real-time Handlers with immediate visual feedback
  const handleToggleMonochrome = (val) => {
    setMonochromeLocal(val);
    if (onToggleMonochrome) onToggleMonochrome(val);
  };

  const handleToggleDensity = (val) => {
    setDensityLocal(val);
    if (onToggleDensity) onToggleDensity(val);
  };

  const handleToggleScrollbars = (val) => {
    setScrollbarsLocal(val);
    if (onToggleScrollbars) onToggleScrollbars(val);
  };

  const handleToggleAnimations = (val) => {
    setAnimationsLocal(val);
    if (onToggleAnimations) onToggleAnimations(val);
  };

  const handleResetDefaults = () => {
    if (modalTab === 'ai') {
      setSelectedProvider('gemini');
      setModel('gemini-flash-latest');
      setTemperature(0.1);
      setApiKey('');
      setSaveStatus({
        type: 'info',
        message: '↺ Parámetros de IA reconfigurados a los valores predeterminados (Gemini Flash, Temp: 0.1).'
      });
    } else {
      handleToggleMonochrome(false);
      handleToggleDensity('comfortable');
      handleToggleScrollbars(true);
      handleToggleAnimations(true);

      localStorage.setItem('ui_monochrome', 'false');
      localStorage.setItem('ui_density', 'comfortable');
      localStorage.setItem('ui_scrollbars', 'true');
      localStorage.setItem('ui_animations', 'true');

      setSaveStatus({
        type: 'info',
        message: '↺ Interfaz restablecida a valores recomendados (Colores Vivos, Cómodo, Scrollbars y Animaciones Activas).'
      });
    }
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    // Save UI settings to local storage
    localStorage.setItem('ui_monochrome', String(monochromeLocal));
    localStorage.setItem('ui_density', densityLocal);
    localStorage.setItem('ui_scrollbars', String(scrollbarsLocal));
    localStorage.setItem('ui_animations', String(animationsLocal));

    try {
      const res = await onSaveConfig(apiKey, model, selectedProvider, temperature);
      if (res.success) {
        setSaveStatus({ 
          type: 'success', 
          message: '✓ ¡Configuración de IA e Interfaz guardada y aplicada exitosamente!' 
        });
        setTimeout(() => {
          onClose();
          setSaveStatus(null);
        }, 1200);
      } else {
        setSaveStatus({ type: 'error', message: res.detail || 'Error al guardar configuración.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const activeProviderObj = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Panel de Configuración del Sistema</h3>
                <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-full text-[10px] font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ajusta el Estado del Motor de IA y las Preferencias de la Interfaz.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar (Opción 1: Estado de la IA | Opción 2: Interfaz) */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalTab('ai')}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              modalTab === 'ai'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Cpu className={`w-4 h-4 ${modalTab === 'ai' ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span>1. Estado de la IA</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9px] font-mono font-bold">
              Motor Activo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('ui')}
            className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              modalTab === 'ui'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200 ring-2 ring-cyan-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Palette className={`w-4 h-4 ${modalTab === 'ui' ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span>2. Interfaz</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
              monochromeLocal 
                ? 'bg-slate-900 text-white border-slate-700' 
                : 'bg-cyan-100 text-cyan-800 border-cyan-300'
            }`}>
              {monochromeLocal ? 'B/N Activo' : 'Color Vivo'}
            </span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs text-slate-700">
          
          {/* ══════════════════════════════════════════════════════
              OPCIÓN 1: ESTADO DE LA IA
             ══════════════════════════════════════════════════════ */}
          {modalTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              {/* Status Bar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Estado de Conexión IA:</span>
                  <span className="font-mono text-slate-500">[`config.py`]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1.5 border ${
                    config?.has_api_key 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${config?.has_api_key ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {config?.has_api_key ? `Activo (${config.masked_key})` : 'Sin Clave Configurada'}
                  </span>
                </div>
              </div>

              {/* 1. SELECCIÓN DE PROVEEDORES LLM */}
              <div className="space-y-2.5">
                <label className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    1. Proveedor de Modelo de Lenguaje (LLM Provider)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Selecciona el motor de inferencia
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROVIDERS.map((prov) => {
                    const Icon = prov.icon;
                    const isSelected = selectedProvider === prov.id;
                    const isEnabled = prov.enabled;

                    return (
                      <div
                        key={prov.id}
                        onClick={() => {
                          if (isEnabled) setSelectedProvider(prov.id);
                        }}
                        className={`relative p-3.5 rounded-2xl border transition-all ${
                          isEnabled
                            ? isSelected
                              ? 'border-cyan-500 bg-cyan-50/40 shadow-sm ring-2 ring-cyan-500/20 cursor-pointer'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                            : 'border-slate-200 bg-slate-100/70 opacity-65 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isEnabled
                                ? isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{prov.name}</h4>
                              <span className={`inline-block text-[9px] font-bold px-2 py-0.2 border rounded-md mt-0.5 ${prov.badgeColor}`}>
                                {prov.badge}
                              </span>
                            </div>
                          </div>

                          {!isEnabled ? (
                            <div className="text-slate-400 p-1" title={prov.lockReason}>
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            isSelected && (
                              <div className="text-cyan-600">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                          {prov.description}
                        </p>

                        {!isEnabled && (
                          <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 flex items-center gap-1 font-medium">
                            <Lock className="w-2.5 h-2.5 shrink-0" />
                            <span>{prov.lockReason}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. PARÁMETROS DEL MODELO (GEMINI ACTIVO) */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  2. Parámetros del Motor Activo ({activeProviderObj.name})
                </label>

                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Modelo LLM</span>
                    <span className="text-[10px] text-cyan-600 font-bold">Variable `LLM_MODEL`</span>
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition shadow-sm"
                  >
                    {activeProviderObj.models ? (
                      activeProviderObj.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))
                    ) : (
                      <option value="gemini-flash-latest">Google Gemini Flash Latest</option>
                    )}
                  </select>
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800">
                      Google Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-600 hover:text-cyan-700 font-bold underline"
                    >
                      Obtener Clave Gratis en Google AI Studio ↗
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Ingresa tu clave AIzaSy... (o déjalo vacío para usar la de .env)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition pr-10 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showKey ? "Ocultar clave" : "Mostrar clave"}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    La clave se inyecta en caliente en la variable de entorno `GEMINI_API_KEY` de Python.
                  </p>
                </div>

                {/* Anti-Hallucination Temperature Slider */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-800">Temperatura / Modo Anti-Alucinación:</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md text-[11px]">
                      {temperature} (Fiel a los Documentos)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.7"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>0.0 (Estricto / Determinista)</span>
                    <span>0.1 (Recomendado)</span>
                    <span>0.7 (Creativo)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              OPCIÓN 2: INTERFAZ (UI / UX - 100% FUNCIONAL Y REAL)
             ══════════════════════════════════════════════════════ */}
          {modalTab === 'ui' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* 1. HERO FEATURE: CONMUTADOR BLANCO Y NEGRO / MONOCROMÁTICO */}
              <div className={`p-5 rounded-3xl border transition-all duration-200 ${
                monochromeLocal 
                  ? 'bg-slate-950 text-white border-slate-800 shadow-xl' 
                  : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-slate-700 shadow-xl'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                      monochromeLocal ? 'bg-white text-slate-950' : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                    }`}>
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white">
                          Modo Blanco y Negro (Monocromático)
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          monochromeLocal 
                            ? 'bg-white text-slate-950 border-white' 
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                        }`}>
                          {monochromeLocal ? '● ACTIVADO' : '○ APAGADO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed max-w-md">
                        Convierte toda la interfaz en escala de grises sobria y de alto contraste, eliminando la redundancia de colores vivos.
                      </p>
                    </div>
                  </div>

                  {/* Switch Encendido / Apagado */}
                  <button
                    type="button"
                    onClick={() => handleToggleMonochrome(!monochromeLocal)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      monochromeLocal ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    title={monochromeLocal ? "Desactivar modo Blanco y Negro" : "Activar modo Blanco y Negro"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 m-0.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        monochromeLocal ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 2. BARRAS DESLIZADORAS VISIBLES (*SCROLLBARS*) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-xs">Barras Deslizadoras Visibles (*Scrollbars*)</h5>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                          scrollbarsLocal ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {scrollbarsLocal ? 'Visibles' : 'Ocultas'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {scrollbarsLocal ? 'Barras visibles con resplandor neón en sidebar, chat y tablas.' : 'Oculta todas las barras de scroll para una vista ultra-limpia sin líneas.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleScrollbars(!scrollbarsLocal)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      scrollbarsLocal ? 'bg-cyan-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 m-0.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        scrollbarsLocal ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 3. DENSIDAD Y ESPACIADO DEL ESPACIO DE TRABAJO */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-cyan-600" />
                    <h5 className="font-bold text-slate-900 text-xs">Densidad y Tamaño del Espacio de Trabajo</h5>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-700 bg-cyan-100 font-bold px-2 py-0.5 rounded-full">
                    {densityLocal === 'compact' ? 'Modo Compacto Activo' : 'Espaciado Cómodo Activo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => handleToggleDensity('comfortable')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      densityLocal === 'comfortable'
                        ? 'border-cyan-500 bg-cyan-50/60 shadow-sm ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">Espaciado Cómodo</span>
                      {densityLocal === 'comfortable' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Paddings generosos y burbujas amplias para lectura descansada.
                    </p>
                  </div>

                  <div
                    onClick={() => handleToggleDensity('compact')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      densityLocal === 'compact'
                        ? 'border-cyan-500 bg-cyan-50/60 shadow-sm ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs">Modo Compacto</span>
                      {densityLocal === 'compact' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Reduce márgenes y paddings un 30% para ver más datos simultáneos.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. ANIMACIONES Y MICRO-INTERACCIONES */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-xs">Animaciones de Entrada y Transiciones</h5>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                          animationsLocal ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {animationsLocal ? 'Activas' : 'Desactivadas'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {animationsLocal ? 'Transiciones suaves y efectos táctiles al interactuar.' : 'Renderizado instantáneo sin demoras de animación.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleAnimations(!animationsLocal)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      animationsLocal ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 m-0.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        animationsLocal ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Feedback message */}
          {saveStatus && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              saveStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : saveStatus.type === 'info'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-300'
                : 'bg-red-50 text-red-800 border border-red-300'
            }`}>
              {saveStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : saveStatus.type === 'info' ? (
                <Info className="w-4 h-4 text-cyan-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{saveStatus.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-cyan-700 bg-white hover:bg-cyan-50 border border-slate-300 hover:border-cyan-300 font-bold transition flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
            title="Restablecer valores predeterminados de la pestaña actual"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Predeterminado</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold transition text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold shadow-md shadow-cyan-500/20 transition flex items-center gap-2 text-xs cursor-pointer"
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
