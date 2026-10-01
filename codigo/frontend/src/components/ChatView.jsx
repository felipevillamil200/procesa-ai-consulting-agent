import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Wrench, ShieldAlert, CheckCircle, Loader2, 
  ShieldCheck, ChevronRight, ExternalLink, Sparkles, FileText,
  Plus, ToggleLeft, ToggleRight, X, Layers, Check
} from 'lucide-react';
import { marked } from 'marked';
import EvidenceInspector from './EvidenceInspector';

// Función para transformar citas y negritas en botones interactivos estilo Perplexity
function formatMarkdownWithPerplexityCitations(rawContent, isPerplexityEnabled = true) {
  if (!rawContent) return '';
  if (!isPerplexityEnabled) {
    return marked.parse(rawContent);
  }

  let processed = rawContent;

  // 1. Reemplazar negritas de proyectos: **PC-XXXX-XXX - Nombre Cliente**
  processed = processed.replace(
    /\*\*(PC-\d{4}-\d{3})(?:([^\*]*))?\*\*/g,
    (match, code, rest) => {
      const restClean = rest ? rest.trim() : '';
      return `<button type="button" class="perplexity-citation-btn inline-flex items-center gap-1.5 font-bold text-slate-900 bg-amber-100/80 hover:bg-yellow-300 border border-amber-300 hover:border-yellow-500 text-xs px-2 py-0.5 rounded-lg transition-all shadow-2xs my-0.5 cursor-pointer ring-1 ring-amber-300/40" data-project-code="${code}" title="Ver evidencia original de ${code} en el PDF"><span>${code}${restClean ? ` ${restClean}` : ''}</span><span class="text-[9px] bg-amber-600 text-white font-mono px-1 py-0.2 rounded font-bold">📄 PDF</span></button>`;
    }
  );

  // 2. Reemplazar códigos de proyecto sueltos: PC-2025-014, etc.
  ['PC-2025-014', 'PC-2025-027', 'PC-2025-033', 'PC-2026-006'].forEach(code => {
    const regex = new RegExp(`(?<!data-project-code=")(?<!>)\\b(${code})\\b(?![^<]*>)`, 'g');
    processed = processed.replace(
      regex, 
      `<span class="perplexity-inline-code cursor-pointer font-mono font-bold text-amber-900 hover:text-slate-950 bg-amber-100 hover:bg-yellow-300 border border-amber-300 px-1.5 py-0.5 rounded transition shadow-2xs" data-project-code="${code}" title="Hacer clic para ver el informe PDF de ${code}">$1 ↗</span>`
    );
  });

  return marked.parse(processed);
}

export default function ChatView({ 
  messages = [], 
  onSendMessage, 
  isLoading, 
  pendingPrompt, 
  onClearPendingPrompt,
  fichas = []
}) {
  const [input, setInput] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [perplexityMode, setPerplexityMode] = useState(() => {
    return localStorage.getItem('perplexity_mode') !== 'false';
  });
  const [inspectorEnabled, setInspectorEnabled] = useState(() => {
    return localStorage.getItem('inspector_enabled') !== 'false';
  });
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Cerrar el popover al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      onClearPendingPrompt();
    }
  }, [pendingPrompt, onClearPendingPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || isLoading) return;
    setInput('');
    onSendMessage(q);
  };

  const handleOpenEvidence = (data) => {
    setSelectedEvidence(data);
  };

  // Manejador de clics en las negritas y citas interactivas dentro del mensaje (Perplexity Style)
  const handleMessageClick = (e, msg, userQuestion) => {
    const target = e.target.closest('[data-project-code]');
    if (target) {
      const code = target.getAttribute('data-project-code');
      handleOpenEvidence({
        projectCode: code,
        activeSource: code,
        chunks: (msg.evidence_chunks || []).filter(c => c.codigo_proyecto === code || (msg.evidence_chunks || []).length === 0),
        query: userQuestion
      });
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50 relative">
      
      {/* Left / Center Chat Stream */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {messages.map((msg, index) => {
            if (msg.role === 'user') {
              return (
                <div key={index} className="flex gap-4 max-w-4xl ml-auto justify-end">
                  <div className="bg-brand-600 text-white p-4 rounded-2xl shadow-sm text-sm max-w-xl leading-relaxed">
                    {msg.content}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-md">
                    <User className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              );
            }

            // AI Response
            const isWarning = msg.found_info === false;
            const userQuestion = messages[index - 1]?.role === 'user' ? messages[index - 1].content : '';
            const htmlContent = formatMarkdownWithPerplexityCitations(msg.content || '', perplexityMode);
            const hasEvidence = (msg.sources && msg.sources.length > 0) || (msg.evidence_chunks && msg.evidence_chunks.length > 0);

            return (
              <div key={index} className="flex gap-4 max-w-4xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                
                <div
                  className={`chat-bubble-ai p-5 rounded-2xl shadow-sm text-sm space-y-3 border ${
                    isWarning ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-white'
                  } max-w-3xl flex-1`}
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Agente Consultor</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono font-semibold">
                        Gemini + SQL/RAG
                      </span>
                    </span>
                    {isWarning && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Anti-Alucinación Activo
                      </span>
                    )}
                  </div>

                  {/* Tool Traceability Logs - Solo visible cuando Grounding está Activo */}
                  {perplexityMode && msg.tools_used && msg.tools_used.length > 0 && (
                    <details className="text-xs bg-amber-50/80 border border-amber-200 rounded-xl p-3">
                      <summary className="font-bold text-amber-900 cursor-pointer flex items-center gap-2 select-none">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Trazabilidad: {msg.tools_used.length} herramienta(s) invocada(s)</span>
                      </summary>
                      <div className="mt-2 space-y-2 pt-2 border-t border-amber-200/60 font-mono text-[11px]">
                        {msg.tools_used.map((t, tIdx) => (
                          <div key={tIdx} className="p-2.5 bg-white rounded-lg border border-amber-200/60 shadow-xs">
                            <div className="flex justify-between font-bold text-amber-900">
                              <span>🔧 {t.tool_name}</span>
                              <span className="text-slate-400 font-normal">{t.execution_time_ms} ms</span>
                            </div>
                            <div className="text-slate-600 mt-1 text-[11px] leading-snug">
                              {t.result_summary}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Parsed Markdown Answer with Perplexity In-Text Clickable Badges */}
                  <div
                    onClick={(e) => handleMessageClick(e, msg, userQuestion)}
                    className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-2 select-text"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />

                  {/* Grounding & Evidence Callout Button - Solo visible cuando Grounding está Activo */}
                  {perplexityMode && hasEvidence && !isWarning && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Fuentes Validadas:
                        </span>
                        {msg.sources && msg.sources.map((s, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleOpenEvidence({
                              projectCode: s,
                              activeSource: s,
                              chunks: (msg.evidence_chunks || []).filter(c => c.codigo_proyecto === s || (msg.evidence_chunks || []).length === 0),
                              query: userQuestion
                            })}
                            className="px-2.5 py-0.5 rounded-lg bg-cyan-50 hover:bg-yellow-200 text-cyan-800 hover:text-yellow-950 border border-cyan-200 hover:border-yellow-400 font-mono text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title={`Inspeccionar fragmentos en PDF de ${s}`}
                          >
                            <span>{s}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        ))}
                      </div>

                      {/* Prominent Evidence Inspector Trigger Button */}
                      <button
                        onClick={() => handleOpenEvidence({
                          projectCode: msg.sources?.[0] || 'PC-2025-014',
                          activeSource: msg.sources?.[0] || 'PC-2025-014',
                          chunks: msg.evidence_chunks || [],
                          query: userQuestion
                        })}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/30 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs group cursor-pointer"
                        title="Abre el panel derecho con el texto original del PDF subrayado en amarillo"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                        <span>Ver Evidencia en PDF</span>
                        <ChevronRight className="w-3 h-3 text-yellow-600 group-hover:translate-x-0.5 transition" />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Loading Bubble */}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="chat-bubble-ai p-4 rounded-2xl shadow-sm text-xs flex items-center gap-3 text-slate-500 border border-slate-200 bg-white">
                <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                <span>Consultando base de datos SQLite y fragmentos de informes con Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
            
            {/* Botón de Opciones Grounding / Inspector */}
            <div className="relative shrink-0" ref={optionsMenuRef}>
              <button
                type="button"
                onClick={() => setShowOptionsMenu(prev => !prev)}
                className={`h-11 px-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition select-none cursor-pointer ${
                  perplexityMode || inspectorEnabled
                    ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs'
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
                title="Configuración de Grounding e Inspector de Evidencia"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold ${
                  perplexityMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                
                <span className="font-semibold text-xs text-slate-800">Grounding</span>
                
                <span className={`w-2 h-2 rounded-full ${
                  perplexityMode ? 'bg-emerald-500 shadow-xs' : 'bg-slate-400'
                }`} />
              </button>

              {/* Popover Minimalista y Limpio */}
              {showOptionsMenu && (
                <div className="absolute bottom-full left-0 mb-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Opciones de Consulta</span>
                    <button
                      type="button"
                      onClick={() => setShowOptionsMenu(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Item 1: Citas Grounding */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-2.5 pr-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          perplexityMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">Citas Grounding</div>
                          <div className="text-[10px] text-slate-400">Citas clicables en texto</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !perplexityMode;
                          setPerplexityMode(nextVal);
                          localStorage.setItem('perplexity_mode', String(nextVal));
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out ${
                          perplexityMode ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 m-0.5 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out ${
                            perplexityMode ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Item 2: Inspector de Evidencia PDF */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-2.5 pr-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          inspectorEnabled ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">Inspector PDF</div>
                          <div className="text-[10px] text-slate-400">Panel lateral de evidencia</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !inspectorEnabled;
                          setInspectorEnabled(nextVal);
                          localStorage.setItem('inspector_enabled', String(nextVal));
                          if (!nextVal) {
                            setSelectedEvidence(null);
                          }
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out ${
                          inspectorEnabled ? 'bg-cyan-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 m-0.5 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out ${
                            inspectorEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta sobre los proyectos (ej. ¿Qué resultados de OEE obtuvimos en Plásticos del Pacífico?)..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm shadow-brand-500/20 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Consultar</span>
            </button>
          </form>
        </div>

      </div>

      {/* Right Side-by-Side Evidence Inspector (Grounding Viewer) */}
      {selectedEvidence && inspectorEnabled && (
        <EvidenceInspector
          evidenceData={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          fichas={fichas}
        />
      )}

    </div>
  );
}
