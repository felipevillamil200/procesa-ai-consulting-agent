import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, ExternalLink, FileText, Sparkles, Layers } from 'lucide-react';
import { api, getApiBase } from '../services/api';

export default function EvidenceInspector({ evidenceData, onClose, fichas = [] }) {
  const code = evidenceData?.projectCode || evidenceData?.activeSource || '';
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('text');

  useEffect(() => {
    let active = true;
    setPreview(null);
    setError('');
    setPage(evidenceData?.chunks?.[0]?.pagina || 1);
    if (code) {
      api.getDocumentPreview(code)
        .then((r) => {
          if (active) setPreview(r);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }
    return () => {
      active = false;
    };
  }, [code, evidenceData]);

  // Esc key closes inspector
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!evidenceData) return null;

  const ficha = fichas.find((f) => f.codigo_proyecto === code);
  const pages = preview?.pages || [];
  const current = pages.find((p) => p.page_number === page);
  const url = `${getApiBase()}/api/pdf/${encodeURIComponent(code)}#page=${page}`;
  const chunks = (evidenceData.chunks || []).filter((c) => c.codigo_proyecto === code && c.pagina === page);

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Inspector Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:static lg:z-auto lg:w-[400px] xl:w-[460px] 2xl:w-[500px] bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl lg:shadow-none transition-all duration-200 ease-out shrink-0 animate-in slide-in-from-right-4"
        role="region"
        aria-label="Visor de Evidencia Documental"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/70">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                <FileText size={12} />
                {code}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Evidencia
              </span>
            </div>
            <h2 className="font-bold text-sm text-slate-900 truncate">
              {preview?.cliente || ficha?.cliente || 'Documento de Referencia'}
            </h2>
            {preview?.filename && (
              <p className="text-xs text-slate-500 truncate mt-0.5" title={preview.filename}>
                {preview.filename}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar evidencia"
            className="min-h-9 min-w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-2.5 border-b border-slate-200 bg-white">
          {[
            ['text', 'Texto y Citas', Sparkles],
            ['pdf', 'PDF Original', FileText],
            ['fields', 'Campos Extraídos', Layers]
          ].map(([id, title, Icon]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 min-h-8.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={13} className={active ? 'text-cyan-300' : 'text-slate-400'} />
                <span className="truncate">{title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {error ? (
          <div className="p-6 text-center text-red-700 bg-red-50/50 flex-1 flex flex-col items-center justify-center">
            <p className="text-sm font-semibold">{error}</p>
            <p className="text-xs text-red-500 mt-1">El archivo original no pudo cargarse en este momento.</p>
          </div>
        ) : !preview ? (
          <div className="p-6 text-center text-slate-400 flex-1 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Cargando evidencia documental...</p>
          </div>
        ) : (
          <>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 bg-slate-50/50 text-xs font-medium text-slate-700">
              <button
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 text-slate-600 transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <span className="text-slate-500 font-mono text-[11px]">
                Página <strong className="text-slate-900">{page}</strong> de {pages.length || 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  aria-label="Página siguiente"
                  disabled={page >= (pages.length || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 px-2 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 text-slate-600 transition cursor-pointer"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight size={14} />
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir PDF original en pestaña nueva"
                  title="Abrir PDF en pestaña nueva"
                  className="h-7 w-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 hover:text-cyan-700 transition ml-1"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Tab: PDF Original */}
            {tab === 'pdf' ? (
              <iframe
                src={url}
                title={`PDF ${preview.filename || code}`}
                className="w-full flex-1 min-h-0 border-0 bg-slate-100"
              />
            ) : (
              /* Tab: Text & Chunks or Fields */
              <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-4 text-slate-800 text-xs leading-relaxed">
                {tab === 'fields' ? (
                  <>
                    {(ficha?.resumen || ficha?.objetivo_general) && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-normal">
                        <p className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
                          Resumen del Documento
                        </p>
                        {ficha.resumen || ficha.objetivo_general}
                      </div>
                    )}

                    <dl className="space-y-2.5">
                      {(ficha?.campos || []).map((f, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 p-3 bg-white hover:border-slate-300 transition">
                          <dt className="font-bold text-slate-900 text-xs text-cyan-900">{f.name}</dt>
                          <dd className="mt-1 text-slate-700 font-medium">{f.value}</dd>
                          {f.quote && (
                            <p className="text-[11px] text-slate-500 mt-1 italic border-l-2 border-cyan-400 pl-2">
                              «{f.quote}» <span className="font-mono text-[10px] text-slate-400">(Pág. {f.page_number})</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </dl>

                    {!ficha?.campos?.length && (
                      <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-center text-xs">
                        Este documento no tiene campos genéricos estructurados. Consulta la pestaña «Texto y Citas».
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {chunks.length > 0 && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 space-y-2 shadow-xs">
                        <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-amber-600 shrink-0" />
                          Fragmentos consultados por la IA en esta página
                        </h3>
                        {chunks.map((c, i) => (
                          <div key={i} className="text-xs whitespace-pre-wrap text-amber-950 bg-amber-100/70 p-2 rounded-lg border border-amber-200/80 font-sans">
                            <mark className="bg-yellow-200/90 text-slate-900 font-medium px-0.5 rounded">
                              {c.contenido}
                            </mark>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wide">
                        Texto extraído de la página {page}
                      </p>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-800 font-sans">
                        {current?.text || 'No hay texto digital disponible en esta página (documento visual o escaneado).'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
