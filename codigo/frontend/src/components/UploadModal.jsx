import React, { useState, useRef } from 'react';
import { 
  UploadCloud, X, FileText, CheckCircle2, AlertCircle, 
  Loader2, HelpCircle, Info, Sparkles, Database, 
  Layers, HardDrive, AlertTriangle, BookOpen, ArrowRight, ExternalLink
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadStatus({ type: 'error', message: 'Solo se permiten archivos PDF (.pdf).' });
        return;
      }
      // Validar límite máximo de 15 MB
      if (file.size > 15 * 1024 * 1024) {
        setUploadStatus({ 
          type: 'error', 
          message: `El archivo supera el tamaño máximo permitido (15 MB). Tu archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB.` 
        });
        return;
      }
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Por favor selecciona un archivo PDF primero.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({
      type: 'loading',
      message: 'Extrayendo texto con pypdf, tipando con Pydantic, persistiendo en SQLite y reindexando RAG...'
    });

    try {
      const res = await onUploadSuccess(selectedFile);
      if (res.success) {
        setUploadStatus({
          type: 'success',
          message: `✓ ¡Documento procesado con éxito! Se indexó el proyecto ${res.proyecto?.codigo_proyecto || ''}.`
        });
        setTimeout(() => {
          onClose();
          setSelectedFile(null);
          setUploadStatus(null);
          setShowHelp(false);
        }, 1800);
      } else {
        setUploadStatus({ type: 'error', message: res.detail || 'Error procesando documento.' });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Subir Nuevo Informe de Cierre (PDF)</h3>
                <p className="text-[11px] text-slate-300">Extracción Pydantic + SQLite + RAG Automático</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {/* Botón de Ayuda / Pregunta */}
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                title={showHelp ? "Ocultar guía de límites y formato" : "Ver límites de tamaño, páginas y formato"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  showHelp 
                    ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/30 font-bold' 
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Botón Cerrar */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel de Ayuda Desplegable */}
          {showHelp && (
            <div className="bg-gradient-to-b from-cyan-950/95 via-slate-900 to-slate-900 text-slate-200 p-4 border-b border-cyan-800/40 text-xs space-y-3 animate-in slide-in-from-top-2 duration-200 shrink-0 overflow-y-auto max-h-[50vh]">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold text-[13px]">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>¿Qué documentos puedes subir y cómo los procesa la IA?</span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                Sube <strong>informes oficiales de cierre de consultoría</strong> en formato <code className="bg-slate-800 text-cyan-300 px-1 py-0.5 rounded font-mono text-[10px]">.pdf</code>. El sistema leerá el informe y extraerá automáticamente:
              </p>

              {/* Columnas de Información Extraída */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                {/* Columna 1: SQLite Relacional */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>1. Base Relacional (SQLite)</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 pl-0.5">
                    <li><strong>Código:</strong> Formato <code className="text-cyan-200 font-mono">PC-YYYY-NNN</code></li>
                    <li><strong>Cliente, sector y ubicación</strong></li>
                    <li><strong>Duración en semanas</strong></li>
                    <li><strong>Tabla de KPIs:</strong> Línea Base vs. Resultado</li>
                  </ul>
                </div>

                {/* Columna 2: RAG Semántico */}
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-2.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>2. Motor RAG (Chat con IA)</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 pl-0.5">
                    <li><strong>Metodologías:</strong> Lean, SMED, 5S, TPM</li>
                    <li><strong>Lecciones aprendidas</strong> del proyecto</li>
                    <li><strong>Factores de riesgo</strong> y gestión de cambio</li>
                    <li><strong>Beneficios económicos</strong> logrados</li>
                  </ul>
                </div>
              </div>

              {/* Límites técnicos y rendimiento */}
              <div className="bg-slate-800/60 border border-cyan-800/40 rounded-lg p-2.5 text-[10.5px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-cyan-400" />
                    Límites recomendados para el análisis de IA:
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-1.5 py-0.5 rounded font-semibold">
                    Máx. 10 MB / Hasta 30 páginas
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  <strong>¿Por qué estos límites?</strong> Mantener el informe en hasta 30 páginas y menos de 10 MB evita la saturación de la ventana de contexto de la IA, asegurando que no se corte información y que los KPIs se extraigan con 100% de fidelidad numérica.
                </p>
              </div>

              {/* Enlace simple */}
              <div className="pt-1 text-center">
                <a
                  href="./guia.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11.5px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  <span>📖 Ver Guía Técnica y Límites de la IA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-6 space-y-4 text-xs overflow-y-auto">
            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/40 rounded-2xl p-6 text-center transition cursor-pointer space-y-2.5"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl shadow-sm">
                <FileText className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="font-bold text-slate-800 text-sm">
                {selectedFile ? `📄 ${selectedFile.name}` : 'Haz clic o arrastra un archivo PDF aquí'}
              </div>
              
              {/* Badges de Límites */}
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium text-[10px]">
                  <HardDrive className="w-3 h-3 text-slate-500" />
                  Máx. 10 MB
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium text-[10px]">
                  <Layers className="w-3 h-3 text-slate-500" />
                  Hasta 30 páginas
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-medium text-[10px]">
                  Formato .PDF
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB listo para procesar`
                  : 'Informes de cierre de proyectos de consultoría oficiales'}
              </p>
            </div>

            {/* Banner Resumen de Límites e Información para el Usuario */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-slate-600">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] leading-tight truncate">
                  <span className="font-bold text-slate-700">Límite recomendado: </span>
                  <span className="text-slate-600">Máx. 10 MB / 30 páginas por informe</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-cyan-600 hover:text-cyan-700 font-bold text-[11px] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showHelp ? "Ocultar guía" : "Ver detalles"}
              </button>
            </div>

            {/* Status message */}
            {uploadStatus && (
              <div
                className={`p-3 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
                  uploadStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : uploadStatus.type === 'loading'
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {uploadStatus.type === 'loading' ? (
                  <Loader2 className="w-4 h-4 text-cyan-600 animate-spin shrink-0" />
                ) : uploadStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-cyan-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploading ? 'Procesando...' : 'Iniciar Ingesta'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}



