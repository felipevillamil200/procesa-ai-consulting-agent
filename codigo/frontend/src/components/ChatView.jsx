import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Wrench, ShieldAlert, CheckCircle, Loader2, 
  ShieldCheck, ChevronRight, ExternalLink, Sparkles, FileText,
  Plus, ToggleLeft, ToggleRight, X, Layers, Check, Database,
  ArrowUpRight, CornerDownLeft, Search, FileCode2
} from 'lucide-react';
import { marked } from 'marked';
import { sanitizeHtml } from '../services/safeHtml';
import { api } from '../services/api';
import EvidenceInspector from './EvidenceInspector';

// Función para transformar citas y negritas en botones interactivos estilo Perplexity
function formatMarkdownWithPerplexityCitations(rawContent, isPerplexityEnabled = true) {
  if (!rawContent) return '';
  if (!isPerplexityEnabled) {
    return sanitizeHtml(marked.parse(rawContent));
  }

  let processed = rawContent;

  // 1. Reemplazar negritas de proyectos: **PC-XXXX-XXX - Nombre Cliente**
  processed = processed.replace(
    /\*\*((?:PC-\d{4}-\d{3}|DOC-[A-Fa-f0-9]{16}))(?:([^\*]*))?\*\*/g,
    (match, code, rest) => {
      const restClean = rest ? rest.trim() : '';
      return `<button type="button" class="perplexity-citation-btn inline-flex items-center gap-1.5 font-bold text-slate-900 bg-amber-100/90 hover:bg-yellow-300 border border-amber-300 hover:border-yellow-500 text-xs px-2.5 py-0.5 rounded-lg transition-all duration-150 shadow-2xs my-0.5 cursor-pointer ring-1 ring-amber-300/40 btn-tactile" data-project-code="${code}" title="Ver evidencia original de ${code} en el PDF"><span>${code}${restClean ? ` ${restClean}` : ''}</span><span class="text-[9px] bg-amber-600 text-white font-mono px-1 py-0.2 rounded font-bold">📄 PDF</span></button>`;
    }
  );

  // 2. Reemplazar códigos de proyecto sueltos: PC-2025-014, etc.
  [...new Set(processed.match(/\b(?:PC-\d{4}-\d{3}|DOC-[A-Fa-f0-9]{16})\b/g) || [])].forEach(code => {
    const regex = new RegExp(`(?<!data-project-code=")(?<!>)\\b(${code})\\b(?![^<]*>)`, 'g');
    processed = processed.replace(
      regex, 
      `<span class="perplexity-inline-code cursor-pointer font-mono font-bold text-amber-900 hover:text-slate-950 bg-amber-100 hover:bg-yellow-300 border border-amber-300 px-1.5 py-0.5 rounded-lg transition shadow-2xs btn-tactile inline-flex items-center gap-1" data-project-code="${code}" title="Hacer clic para ver el informe PDF de ${code}">$1 <span class="text-[10px]">↗</span></span>`
    );
  });

  return sanitizeHtml(marked.parse(processed));
}

export default function ChatView({ 
  messages = [], 
  onSendMessage, 
  isLoading, 
  pendingPrompt, 
  onClearPendingPrompt,
  fichas = [],
  onUploadPDF,
  config
}) {
  const [input, setInput] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [attachedDoc, setAttachedDoc] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
  const dragCounterRef = useRef(0);

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
    if (!q || isLoading || uploadBusy) return;
    setInput('');
    onSendMessage(q, attachedDoc);
  };

  const handleOpenEvidence = (data) => {
    setSelectedEvidence(data);
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    // 1. Verificar si se arrastró un objeto JSON de proyecto desde el Sidebar
    const rawJson = e.dataTransfer.getData('application/json');
    if (rawJson) {
      try {
        const projData = JSON.parse(rawJson);
        if (projData && projData.codigo_proyecto) {
          setAttachedDoc(projData);
          return;
        }
      } catch (err) {
        console.error('Error parseando drag JSON:', err);
      }
    }

    // 2. Verificar si se arrastró texto plano con código de proyecto
    const plainText = e.dataTransfer.getData('text/plain');
    if (plainText && /^(PC-|DOC-)/.test(plainText)) {
      const match = fichas.find(f => f.codigo_proyecto === plainText);
      if (match) {
        setAttachedDoc({
          codigo_proyecto: match.codigo_proyecto,
          cliente: match.cliente,
          sector: match.sector,
          duracion_semanas: match.duracion_semanas
        });
        return;
      }
    }

    // 3. Verificar si se arrastró un archivo PDF nativo
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onUploadPDF) {
        if (uploadBusy) return;
        setUploadBusy(true);
        setUploadNotice('Leyendo documentos…');
        const documents = [];
        const errors = [];
          for (const file of Array.from(e.dataTransfer.files)) {
            try {
            if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Solo se admiten archivos PDF.');
            const result = await onUploadPDF(file);
            if (!result.success) throw new Error(result.detail || 'No se pudo cargar el PDF.');
            documents.push(result.documento || result.proyecto);
            errors.push(...(result.warnings || []).map(w => `${file.name}: ${w}`));
            } catch (err) { errors.push(`${file.name}: ${err.message}`); }
          }
          if (documents.length)
          setAttachedDoc({codigo_proyecto:documents[0].codigo_proyecto,cliente:documents.map(d=>d.cliente).join(', '),document_ids:documents.map(d=>d.codigo_proyecto)});
        setUploadNotice([documents.length ? `${documents.length} documento(s) cargado(s).` : '', ...errors].filter(Boolean).join(' '));
        setUploadBusy(false);
        return;
      }
      setUploadNotice('La carga de documentos no está disponible.');
    }
  };

  // Helper to resolve real project code from source strings, query, or message content
  const resolveProjectCode = (sourceStr, msgObj, userQ) => {
    if (sourceStr && /(?:PC-\d{4}-\d{3}|DOC-[A-Fa-f0-9]{16})/i.test(sourceStr)) {
      return sourceStr.match(/(?:PC-\d{4}-\d{3}|DOC-[A-Fa-f0-9]{16})/i)[0].toUpperCase();
    }
    if (attachedDoc?.codigo_proyecto) {
      return attachedDoc.codigo_proyecto;
    }
    const chunkWithCode = (msgObj?.evidence_chunks || []).find(c => c.codigo_proyecto);
    if (chunkWithCode) {
      return chunkWithCode.codigo_proyecto;
    }
    const combined = `${sourceStr || ''} ${msgObj?.content || ''} ${userQ || ''}`;
    const matched = ['PC-2025-014', 'PC-2025-027', 'PC-2025-033', 'PC-2026-006'].find(c =>
      combined.toUpperCase().includes(c)
    );
    if (matched) return matched;

    if (fichas && fichas.length > 0) {
      const byClient = fichas.find(f =>
        combined.toLowerCase().includes(f.cliente.toLowerCase().slice(0, 8))
      );
      if (byClient) return byClient.codigo_proyecto;
    }
    return null;
  };

  // Manejador de clics en las negritas y citas interactivas dentro del mensaje (Perplexity Style)
  const handleMessageClick = (e, msg, userQuestion) => {
    const target = e.target.closest('[data-project-code]');
    if (target) {
      const raw = target.getAttribute('data-project-code');
      const code = resolveProjectCode(raw, msg, userQuestion);
      handleOpenEvidence({
        projectCode: code,
        activeSource: code,
        chunks: (msg.evidence_chunks || []).filter(c => c.codigo_proyecto === code || (msg.evidence_chunks || []).length === 0),
        query: userQuestion
      });
    }
  };

  return (
    <div 
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex h-full overflow-hidden bg-dot-grid bg-radial-ambient relative"
    >
      {/* Visual Drag & Drop Overlay Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in pointer-events-none border-4 border-dashed border-cyan-400/90 rounded-3xl m-3 shadow-2xl shadow-cyan-500/30">
          <div className="p-5 rounded-3xl bg-slate-900 border border-cyan-400/60 shadow-2xl flex flex-col items-center text-center max-w-md space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300 animate-bounce">
              <FileText className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Suelta el PDF aquí</h3>
              <p className="text-xs text-cyan-200 mt-1">
                El asistente fijará este documento en el chat para enfocar las consultas con evidencia RAG y datos de SQLite.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950 border border-cyan-700/80 rounded-full text-[11px] font-mono text-cyan-300 font-bold">
              <span>📎 Adjuntar al Chat</span>
            </div>
          </div>
        </div>
      )}

      {/* Left / Center Chat Stream */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-3.5 sm:space-y-6">
          
          {messages.map((msg, index) => {
            if (msg.role === 'user') {
              return (
                <div key={index} className="flex gap-2.5 sm:gap-3.5 max-w-[92%] sm:max-w-2xl ml-auto justify-end animate-slide-up">
                  <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white p-3 sm:p-4 px-3.5 sm:px-5 rounded-2xl rounded-tr-sm shadow-md shadow-blue-500/15 text-xs sm:text-sm font-medium leading-relaxed">
                    {/* Attached Doc Pill inside User message if present */}
                    {msg.attachedDoc && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20 text-[11px] font-bold text-cyan-100">
                        <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-mono bg-cyan-900/60 border border-cyan-300/40 px-1.5 py-0.5 rounded text-[10px]">
                          {msg.attachedDoc.codigo_proyecto}
                        </span>
                        <span className="truncate">{msg.attachedDoc.cliente}</span>
                      </div>
                    )}
                    <div>{msg.content}</div>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shrink-0 shadow-md">
                    <User className="w-4 h-4 text-cyan-300" />
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
              <div key={index} className="flex gap-2.5 sm:gap-3.5 max-w-[98%] sm:max-w-4xl animate-slide-up">
                {/* Avatar with subtle glow */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 overflow-hidden">
                    <img src="/images/procesa_ai_agent_avatar.jpg" alt="IA" className="w-full h-full object-cover rounded-[10px]" />
                  </div>
                </div>
                
                <div
                  className={`chat-bubble-ai p-3.5 sm:p-5 rounded-2xl rounded-tl-sm text-xs sm:text-sm space-y-3 sm:space-y-3.5 border ${
                    isWarning 
                      ? 'border-red-300/80 bg-red-50/40 shadow-xs' 
                      : 'border-slate-200/90 bg-white/95 backdrop-blur-md shadow-elevated'
                  } max-w-3xl flex-1 min-w-0`}
                >
                  {/* Message Header */}
                  <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold tracking-tight text-slate-900">Agente Consultor</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200/80 font-mono font-bold">
                        {config?.provider === 'openai' 
                          ? (config?.model ? `ChatGPT (${config.model}) + SQL/RAG` : 'ChatGPT + SQL/RAG')
                          : (config?.provider === 'gemini' 
                            ? (config?.model ? `Gemini (${config.model}) + SQL/RAG` : 'Gemini + SQL/RAG')
                            : 'Proveedor IA + SQL/RAG')}
                      </span>
                    </div>
                    {isWarning && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Anti-Alucinación Activo
                      </span>
                    )}
                  </div>

                  {/* Tool Traceability Logs */}
                  {perplexityMode && msg.tools_used && msg.tools_used.length > 0 && (
                    <details className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 group">
                      <summary className="font-bold text-slate-800 cursor-pointer flex items-center justify-between select-none">
                        <span className="flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Trazabilidad: {msg.tools_used.length} herramienta(s) invocada(s)</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/60 font-semibold">
                          Ver detalles
                        </span>
                      </summary>
                      <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-200/60 font-mono text-[11px]">
                        {msg.tools_used.map((t, tIdx) => (
                          <div key={tIdx} className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span className="flex items-center gap-1 text-cyan-800">
                                <span>🔧</span>
                                <span>{t.tool_name}</span>
                              </span>
                              <span className="text-slate-400 font-normal">{t.execution_time_ms} ms</span>
                            </div>
                            <div className="text-slate-600 mt-1 text-[11px] leading-relaxed">
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
                    className="ai-prose text-slate-700 text-xs sm:text-sm select-text"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />

                  {/* Grounding & Evidence Callout Button */}
                  {perplexityMode && hasEvidence && !isWarning && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Fuentes:
                        </span>
                        {msg.sources && msg.sources.map((s, sIdx) => {
                          const targetCode = resolveProjectCode(s, msg, userQuestion);
                          return (
                            <button
                              key={sIdx}
                              onClick={() => handleOpenEvidence({
                                projectCode: targetCode,
                                activeSource: targetCode,
                                chunks: (msg.evidence_chunks || []).filter(c => c.codigo_proyecto === targetCode || (msg.evidence_chunks || []).length === 0),
                                query: userQuestion
                              })}
                              className="px-2.5 py-0.5 rounded-lg bg-cyan-50 hover:bg-yellow-200 text-cyan-800 hover:text-yellow-950 border border-cyan-200 hover:border-yellow-400 font-mono text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer btn-tactile"
                              title={`Inspeccionar fragmentos en PDF de ${targetCode}`}
                            >
                              <span>{s}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Prominent Evidence Inspector Trigger Button */}
                      {(() => {
                        const targetCode = resolveProjectCode(msg.sources?.[0], msg, userQuestion);
                        return (
                          <button
                            onClick={() => handleOpenEvidence({
                              projectCode: targetCode,
                              activeSource: targetCode,
                              chunks: msg.evidence_chunks || [],
                              query: userQuestion
                            })}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-500/15 hover:from-amber-500/30 hover:to-yellow-500/40 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs group cursor-pointer btn-tactile"
                            title="Abre el panel derecho con el texto original del PDF subrayado en amarillo"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                            <span>Ver Evidencia en PDF</span>
                            <ChevronRight className="w-3.5 h-3.5 text-yellow-600 group-hover:translate-x-0.5 transition" />
                          </button>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Loading Bubble with Pulse */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-4xl animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center text-white shrink-0 shadow-md overflow-hidden">
                <img src="/images/procesa_ai_agent_avatar.jpg" alt="IA" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <div className="chat-bubble-ai p-4 px-5 rounded-2xl rounded-tl-sm text-xs flex items-center gap-3 text-slate-600 border border-cyan-200 bg-white/90 shadow-elevated">
                <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                <span className="font-medium">
                  Consultando base de datos SQLite y analizando documentos con {config?.provider === 'openai' ? 'ChatGPT' : (config?.provider === 'gemini' ? 'Gemini' : 'el Proveedor IA')}...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Chat Input Dock */}
        <div className="p-4 pt-2 bg-gradient-to-t from-slate-100/90 via-slate-100/50 to-transparent shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            <details className="rounded-xl border border-slate-200 bg-white p-2 text-xs">
              <summary className="cursor-pointer font-medium text-slate-700">Seleccionar documentos para consultar o comparar</summary>
              <div className="mt-2 max-h-36 overflow-y-auto space-y-1">
                {fichas.map(f => {
                  const ids = attachedDoc?.document_ids || (attachedDoc?.codigo_proyecto ? [attachedDoc.codigo_proyecto] : []);
                  return <label key={f.codigo_proyecto} className="flex items-center gap-2 min-h-9 cursor-pointer">
                    <input type="checkbox" checked={ids.includes(f.codigo_proyecto)} onChange={e => {
                      const next = e.target.checked ? [...ids,f.codigo_proyecto] : ids.filter(id=>id!==f.codigo_proyecto);
                      setAttachedDoc(next.length ? {codigo_proyecto:next[0],document_ids:next,cliente:`${next.length} documento(s) seleccionados`} : null);
                    }}/><span>{f.cliente} <span className="text-slate-500">({f.tipo_documento || f.sector})</span></span>
                  </label>;
                })}
              </div>
            </details>
            
            {/* Attached PDF Badge Pill */}
            {attachedDoc && (
              <div className="flex items-center justify-between bg-slate-900/95 border border-cyan-500/50 text-white px-3.5 py-2 rounded-2xl shadow-xl shadow-cyan-950/20 text-xs backdrop-blur-md animate-scale-up">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="font-mono font-bold text-cyan-300 text-xs shrink-0">
                    {attachedDoc.codigo_proyecto}
                  </span>
                  <span className="text-slate-200 font-medium truncate max-w-xs sm:max-w-md">
                    {attachedDoc.cliente}
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/80 px-2 py-0.5 rounded-full font-mono font-bold shrink-0 hidden sm:inline">
                    PDF Enfocado
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-cyan-400/90 hidden md:inline font-mono">
                    ● Análisis dirigido a este documento
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedDoc(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title="Desvincular PDF enfocado"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {uploadNotice && <div role="status" className="mb-2 p-3 text-xs rounded-xl bg-amber-50 text-amber-900 border border-amber-200">{uploadNotice}</div>}
            <form onSubmit={handleSubmit} className="glass-panel p-1.5 rounded-2xl shadow-elevated border border-slate-200/90 flex items-center gap-2">
              
              {/* Botón de Opciones Grounding / Inspector */}
              <div className="relative shrink-0" ref={optionsMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu(prev => !prev)}
                  className={`h-10 px-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition select-none cursor-pointer btn-tactile ${
                    perplexityMode || inspectorEnabled || attachedDoc
                      ? 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100 shadow-2xs'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Configuración de Grounding e Inspector de Evidencia"
                >
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center text-xs font-bold ${
                    perplexityMode ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  
                  <span className="font-bold text-xs text-slate-800 hidden sm:inline">Grounding</span>
                  
                  <span className={`w-2 h-2 rounded-full ${
                    attachedDoc ? 'bg-cyan-500 shadow-xs ring-2 ring-cyan-500/20' : (perplexityMode ? 'bg-emerald-500 shadow-xs ring-2 ring-emerald-500/20' : 'bg-slate-400')
                  }`} />
                </button>

                {/* Popover Minimalista y Limpio */}
                {showOptionsMenu && (
                  <div className="absolute bottom-full left-0 mb-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-40 animate-scale-up">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900">Opciones de Consulta & RAG</span>
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

                      {/* Item 3: Fijar PDF para Foco */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 px-1">
                          Enfocar Documento PDF:
                        </div>
                        <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                          {fichas.map(f => (
                            <button
                              key={f.codigo_proyecto}
                              type="button"
                              onClick={() => {
                                setAttachedDoc({
                                  codigo_proyecto: f.codigo_proyecto,
                                  cliente: f.cliente,
                                  sector: f.sector,
                                  duracion_semanas: f.duracion_semanas
                                });
                                setShowOptionsMenu(false);
                              }}
                              className={`w-full text-left p-1.5 px-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                                attachedDoc?.codigo_proyecto === f.codigo_proyecto
                                  ? 'bg-cyan-50 text-cyan-900 font-bold border border-cyan-200'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3 h-3 text-red-500 shrink-0" />
                                <span className="font-mono text-[10px] text-cyan-700 font-bold">{f.codigo_proyecto}</span>
                                <span className="truncate text-[11px]">{f.cliente}</span>
                              </div>
                              {attachedDoc?.codigo_proyecto === f.codigo_proyecto && (
                                <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachedDoc ? `Preguntar sobre ${attachedDoc.codigo_proyecto}...` : "Pregunta sobre proyectos o arrastra un PDF..."}
                className="flex-1 px-2.5 sm:px-3 py-2 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-10 px-3 sm:px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-sm shadow-cyan-600/30 shrink-0 cursor-pointer btn-tactile"
              >
                <span className="hidden sm:inline">Consultar</span>
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
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
