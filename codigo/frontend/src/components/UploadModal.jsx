import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadStatus({ type: 'error', message: 'Solo se permiten archivos PDF.' });
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Subir Nuevo Informe de Cierre (PDF)</h3>
              <p className="text-[11px] text-slate-300">Extracción Pydantic + SQLite + RAG Automático</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/40 rounded-2xl p-6 text-center transition cursor-pointer space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="font-bold text-slate-800 text-sm">
              {selectedFile ? `📄 ${selectedFile.name}` : 'Haz clic o arrastra un archivo PDF aquí'}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(1)} KB listo para procesar`
                : 'Soporta informes de consultoría oficiales (.pdf)'}
            </p>
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
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-cyan-500/20 transition flex items-center gap-2"
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
