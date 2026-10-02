import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Settings } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, onOpenConfig }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [providerWarning, setProviderWarning] = useState(false);

  // Reset state when opening or closing
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setResults([]);
      setBusy(false);
      setCompleted(false);
      setProviderWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const choose = (list) => {
    setFiles(Array.from(list));
    setResults([]);
    setCompleted(false);
    setProviderWarning(false);
  };

  const upload = async () => {
    if (busy || !files.length) return;
    setBusy(true);
    setResults([]);
    setProviderWarning(false);
    
    const currentResults = [];
    let hasErrors = false;
    let hasWarnings = false;

    for (const file of files) {
      try {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          throw new Error('Solo se admiten archivos en formato PDF.');
        }
        if (file.size > 15 * 1024 * 1024) {
          throw new Error('El archivo supera el límite de 15 MB.');
        }
        
        const result = await onUploadSuccess(file);
        if (!result.success) {
          throw new Error(result.detail || 'No se pudo procesar el documento.');
        }

        const clienteName = (result.documento || result.proyecto)?.cliente || 'Documento procesado';
        const docWarnings = result.warnings || [];
        if (docWarnings.length > 0) {
          hasWarnings = true;
        }

        currentResults.push({
          name: file.name,
          ok: true,
          message: `Documento disponible: ${clienteName}`,
          warnings: docWarnings
        });
      } catch (error) {
        hasErrors = true;
        currentResults.push({
          name: file.name,
          ok: false,
          message: error.message
        });
      }
    }

    setResults(currentResults);
    setBusy(false);

    if (hasWarnings) {
      setProviderWarning(true);
    }

    // Auto-cerrar ÚNICAMENTE si no hubo errores NI advertencias de proveedor
    if (!hasErrors && !hasWarnings && currentResults.length > 0) {
      setCompleted(true);
      setFiles([]); // Vaciar selección para evitar re-envíos
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="upload-title" className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <UploadCloud className="text-cyan-600" size={22} />
              Añadir documentos PDF
            </h2>
            <p className="text-sm text-slate-500">Facturas, contratos, informes, manuales y otros documentos.</p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Zona de Arrastre */}
        {!completed ? (
          <label
            className={`block border-2 border-dashed rounded-xl p-5 cursor-pointer text-center transition-colors ${
              busy ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/30'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!busy) choose(e.dataTransfer.files);
            }}
          >
            <UploadCloud className="text-cyan-600 mx-auto mb-2" size={32} />
            <span className="font-medium text-slate-700 block text-sm">
              Selecciona varios PDFs o arrástralos aquí
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,application/pdf"
              disabled={busy}
              onChange={(e) => choose(e.target.files)}
              className="block w-full mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer"
            />
          </label>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
            <div>
              <p className="font-semibold text-sm">¡Documentos procesados e indexados con éxito al 100%!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Cerrando ventana automáticamente...</p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Hasta 15 MB y 200 páginas por archivo. La Inteligencia Artificial permite lectura visual de PDFs escaneados cuando está configurada.
        </p>

        {/* Banner de Advertencia si el proveedor de IA tuvo error de cuota/saturación */}
        {providerWarning && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle size={17} className="text-amber-600 shrink-0" />
              <span>Aviso del Proveedor de Inteligencia Artificial</span>
            </div>
            <p className="leading-relaxed">
              El proveedor de IA configurado no pudo completar la extracción visual o clasificación avanzada (por saturación, cuota o error 503/429). 
              <strong> El sistema guardó el texto digital del archivo</strong>, pero te recomendamos cambiar de proveedor para un análisis completo.
            </p>
            {onOpenConfig && (
              <button
                type="button"
                onClick={onOpenConfig}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-bold text-xs transition cursor-pointer shadow-2xs"
              >
                <Settings size={14} />
                <span>Abrir Configuración y Cambiar Proveedor (OpenAI / Gemini)</span>
              </button>
            )}
          </div>
        )}

        {/* Lista de Archivos Seleccionados */}
        {files.length > 0 && !completed && (
          <ul className="text-xs space-y-1.5 max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            {files.map((f, i) => (
              <li key={i} className="flex justify-between items-center text-slate-700">
                <span className="truncate pr-2 font-medium">{f.name}</span>
                <span className="text-slate-400 shrink-0">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
        )}

        {/* Mensajes de Resultado */}
        <div aria-live="polite" className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                r.ok ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200 shadow-xs'
              }`}
            >
              {r.ok ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <strong className="block truncate font-semibold text-slate-900">{r.name}</strong>
                <p className="mt-1 leading-relaxed text-slate-800">{r.message}</p>
                {r.warnings?.map((w, j) => (
                  <p key={j} className="text-amber-800 mt-1 font-medium">
                    ⚠️ {w}
                  </p>
                ))}
                {!r.ok && onOpenConfig && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenConfig();
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Settings size={14} />
                    <span>⚙️ Abrir Configuración y Cambiar Proveedor (OpenAI / Gemini)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={busy}
            className="min-h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
          {!completed && (
            <button
              disabled={busy || !files.length}
              onClick={upload}
              className="min-h-10 px-5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Leyendo documentos...</span>
                </>
              ) : (
                <span>Cargar {files.length > 0 ? `${files.length} documento(s)` : ''}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
