import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wrench, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { marked } from 'marked';

export default function ChatView({ messages = [], onSendMessage, isLoading, pendingPrompt, onClearPendingPrompt }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
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
          const htmlContent = marked.parse(msg.content || '');

          return (
            <div key={index} className="flex gap-4 max-w-4xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div
                className={`chat-bubble-ai p-5 rounded-2xl shadow-sm text-sm space-y-3 border ${
                  isWarning ? 'border-red-300 bg-red-50/40' : 'border-slate-200'
                } max-w-3xl`}
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
                      <ShieldAlert className="w-3 h-3" /> Anti-Alucinación
                    </span>
                  )}
                </div>

                {/* Tool Traceability Logs */}
                {msg.tools_used && msg.tools_used.length > 0 && (
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

                {/* Parsed Markdown Answer */}
                <div
                  className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Verified Citations & Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 text-xs flex-wrap">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Fuentes Validadas:
                    </span>
                    {msg.sources.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
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
            <div className="chat-bubble-ai p-4 rounded-2xl shadow-sm text-xs flex items-center gap-3 text-slate-500 border border-slate-200">
              <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
              <span>Consultando base de datos SQLite y fragmentos de informes con Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
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
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
            <span>Consultar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
