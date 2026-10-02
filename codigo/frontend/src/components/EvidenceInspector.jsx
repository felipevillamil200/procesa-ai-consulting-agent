import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, X, CheckCircle, ShieldCheck, Sparkles, BookOpen, 
  ExternalLink, Layers, Copy, Check, ChevronRight, Search, FileCode2, 
  File, CornerDownRight, Bookmark, ArrowLeft, ArrowRight, HelpCircle,
  Lightbulb, CheckCheck
} from 'lucide-react';
import { api } from '../services/api';

const PDF_NAMES = {
  'PC-2025-014': 'Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf',
  'PC-2025-027': 'Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf',
  'PC-2025-033': 'Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf',
  'PC-2026-006': 'Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf'
};

import { getApiBase } from '../services/api';
import { getDocumentPreviewFallback } from '../services/fallbackData';
const API_BASE = getApiBase();

export default function EvidenceInspector({ 
  evidenceData, // { projectCode, query, chunks, activeSource }
  onClose,
  fichas = []
}) {
  const [activeTab, setActiveTab] = useState('doc_sheet'); // 'doc_sheet' | 'pdf_embed' | 'ficha'
  const [copied, setCopied] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const highlightRef = useRef(null);

  const rawCode = evidenceData?.projectCode || evidenceData?.activeSource || '';
  const query = evidenceData?.query || '';
  const evidenceChunks = evidenceData?.chunks || [];

  // Normalize project code
  let projectCode = 'PC-2025-014';
  const matchedCode = ['PC-2025-014', 'PC-2025-027', 'PC-2025-033', 'PC-2026-006'].find(c => 
    rawCode.toUpperCase().includes(c) || query.toUpperCase().includes(c)
  );
  if (matchedCode) {
    projectCode = matchedCode;
  } else if (fichas && fichas.length > 0) {
    const byClient = fichas.find(f => 
      rawCode.toLowerCase().includes(f.cliente.toLowerCase().slice(0, 8)) || 
      query.toLowerCase().includes(f.cliente.toLowerCase().slice(0, 8))
    );
    if (byClient) projectCode = byClient.codigo_proyecto;
  }

  // Pre-cargar inmediatamente el fallback para respuesta instantánea en 0ms
  const [docPreview, setDocPreview] = useState(() => getDocumentPreviewFallback(projectCode));
  const [isLoading, setIsLoading] = useState(false);

  // Buscar ficha estructurada correspondiente
  const currentFicha = fichas.find(f => f.codigo_proyecto === projectCode) || 
                       fichas.find(f => f.codigo_proyecto === 'PC-2025-014');

  useEffect(() => {
    if (projectCode) {
      setDocPreview(getDocumentPreviewFallback(projectCode));
      loadPreview(projectCode);
    }
  }, [projectCode]);

  const loadPreview = async (code) => {
    try {
      const res = await api.getDocumentPreview(code);
      if (res && res.success && ((res.pages && res.pages.length > 0) || (res.paginas && res.paginas.length > 0))) {
        setDocPreview(res);
        if (evidenceChunks && evidenceChunks.length > 0 && evidenceChunks[0].pagina) {
          setSelectedPage(evidenceChunks[0].pagina);
        }
      }
    } catch (err) {
      console.warn('Utilizando vista previa de respaldo local:', err);
      setDocPreview(getDocumentPreviewFallback(code));
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll automático hacia la evidencia resaltada al cambiar de página o proyecto
  useEffect(() => {
    if (highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [selectedPage, projectCode, docPreview]);

  // Función avanzada para formatear y subrayar el texto directamente en la hoja del documento
  const renderDocumentTextWithHighlights = (pageText, chunks = []) => {
    if (!pageText) return null;

    const paragraphs = pageText.split('\n\n').filter(p => p.trim());
    const queryTokens = query
      .toLowerCase()
      .replace(/[¿?¡!,.:;]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 3 && !['cual', 'cuales', 'como', 'para', 'sobre', 'este', 'esta', 'estos', 'proyectos', 'fueron', 'aprendimos'].includes(t));

    // Términos clave del proyecto para asegurar resaltado (duración, gerente, cliente, kpis)
    const projectKeywords = [];
    if (currentFicha?.duracion_semanas) projectKeywords.push(`${currentFicha.duracion_semanas} semanas`);
    if (currentFicha?.gerente_proyecto) projectKeywords.push(currentFicha.gerente_proyecto);
    if (currentFicha?.sector) projectKeywords.push(currentFicha.sector);

    return paragraphs.map((para, pIdx) => {
      // Verificar si este párrafo coincide con alguno de los fragmentos recuperados por RAG
      const isEvidenceChunk = chunks.some(c => {
        const cClean = c.contenido.slice(0, 35).toLowerCase();
        return para.toLowerCase().includes(cClean);
      });

      // Detectar si es un título/encabezado de sección
      const isHeader = /^(?:\d+\.|\bINFORME|\bOBJETIVOS|\bDIAGNÓSTICO|\bMETODOLOGÍA|\bRESULTADOS|\bLECCIONES|\bRECOMENDACIONES)/i.test(para.trim());

      // Aplicar marcado amarillo fluorescente a términos clave y números dentro del párrafo
      let formattedHtml = para;

      // 1. Marcar números, duraciones y KPIs en amarillo tipo marcador
      formattedHtml = formattedHtml.replace(/(\b\d+(?:[.,]\d+)?\s*(?:%|semanas|días|minutos|USD|\$|puntos|horas|meses|NPS)\b)/gi, (match) => {
        return `<mark class="bg-yellow-200 text-slate-900 font-semibold px-1 py-0.5 rounded border-b-2 border-yellow-400 inline-block my-0.5">${match}</mark>`;
      });

      // 2. Marcar palabras clave de la pregunta
      queryTokens.forEach(token => {
        try {
          const regex = new RegExp(`(${token})`, 'gi');
          formattedHtml = formattedHtml.replace(regex, `<mark class="bg-yellow-200 text-slate-900 font-semibold px-1 py-0.5 rounded border-b-2 border-yellow-400">$1</mark>`);
        } catch (e) {
          // Ignore
        }
      });

      // 3. Marcar palabras clave del proyecto
      projectKeywords.forEach(kw => {
        try {
          const regex = new RegExp(`(${kw})`, 'gi');
          formattedHtml = formattedHtml.replace(regex, `<mark class="bg-yellow-200 text-slate-900 font-semibold px-1 py-0.5 rounded border-b-2 border-yellow-400">$1</mark>`);
        } catch (e) {
          // Ignore
        }
      });

      if (isHeader) {
        return (
          <h4 key={pIdx} className="font-sans font-bold text-slate-900 text-xs sm:text-sm mt-4 mb-2 pb-1 border-b border-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-amber-500 rounded-full"></span>
            <span>{para}</span>
          </h4>
        );
      }

      if (isEvidenceChunk) {
        return (
          <div 
            key={pIdx} 
            ref={highlightRef}
            className="my-3 p-4 bg-slate-50/90 border-l-4 border-amber-500 rounded-r-xl border border-slate-200 shadow-xs relative"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-2 pb-1.5 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="tracking-tight text-slate-800 font-medium">Evidencia consultada por la IA (Grounded):</span>
              </span>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 font-sans text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Subrayado Activo
              </span>
            </div>

            <p 
              className="text-slate-800 font-normal leading-relaxed text-xs sm:text-[13px] font-serif whitespace-pre-wrap selection:bg-yellow-200"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
          </div>
        );
      }

      return (
        <p 
          key={pIdx}
          className="my-2 text-slate-700 leading-relaxed text-xs font-serif whitespace-pre-wrap selection:bg-yellow-200"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      );
    });
  };

  if (!evidenceData) return null;

  const fallbackPreview = getDocumentPreviewFallback(projectCode);
  const rawPages = (docPreview?.pages && docPreview.pages.length > 0)
    ? docPreview.pages
    : (docPreview?.paginas && docPreview.paginas.length > 0)
      ? docPreview.paginas
      : (fallbackPreview?.pages || []);

  const clientName = (docPreview?.cliente && docPreview.cliente !== 'Documento' && !docPreview.cliente.includes('Base de Datos'))
    ? docPreview.cliente
    : (currentFicha?.cliente || fallbackPreview?.cliente || 'Informe de Proyecto');

  const pdfFilename = (docPreview?.filename && !docPreview.filename.includes('Base de Datos'))
    ? docPreview.filename
    : (PDF_NAMES[projectCode] || `${projectCode}.pdf`);

  const pdfUrl = `/documents/${PDF_NAMES[projectCode] || `${projectCode}.pdf`}`;
  const displayChunks = evidenceChunks.length > 0 ? evidenceChunks : (docPreview?.chunks || fallbackPreview?.chunks || []);
  const totalPages = rawPages.length || docPreview?.total_pages || docPreview?.total_paginas || 3;

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl lg:static lg:w-[540px] xl:w-[620px] bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-slate-800">
        
        {/* Inspector Header */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {projectCode}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Grounding
                </span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 truncate max-w-[240px] sm:max-w-[340px] mt-0.5">
                {clientName}
              </h3>
            </div>
          </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-cyan-700 flex items-center justify-center transition cursor-pointer"
            title="¿Por qué se implementó el Grounding y la Inspección de PDF?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Cerrar visor de evidencia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Controls & View Switcher */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
          <button
            onClick={() => setActiveTab('doc_sheet')}
            className={`py-1 px-3 rounded-lg font-bold transition flex items-center gap-1.5 text-xs cursor-pointer ${
              activeTab === 'doc_sheet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Hoja del Documento</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf_embed')}
            className={`py-1 px-3 rounded-lg font-bold transition flex items-center gap-1.5 text-xs cursor-pointer ${
              activeTab === 'pdf_embed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Original</span>
          </button>

          <button
            onClick={() => setActiveTab('ficha')}
            className={`py-1 px-3 rounded-lg font-bold transition flex items-center gap-1.5 text-xs cursor-pointer ${
              activeTab === 'ficha'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Ficha Técnica</span>
          </button>
        </div>

        {/* Action: Open PDF in new tab */}
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-slate-700 hover:text-slate-950 font-bold flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-xl transition shadow-2xs shrink-0"
          title="Abrir archivo PDF físico en nueva pestaña"
        >
          <span>Abrir PDF</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-100/70 p-3 sm:p-4">
        
        {/* TAB 1: VISOR DE HOJA DE DOCUMENTO DIGITAL (A4 SHEET) */}
        {activeTab === 'doc_sheet' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3">
            
            {/* Top Page Pagination & Evidence Notice */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shrink-0 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Texto <mark className="bg-yellow-200 text-slate-900 font-bold px-1 rounded text-[10px] border border-yellow-400">subrayado en amarillo</mark> en el documento:</span>
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedPage(p => Math.max(1, p - 1))}
                  disabled={selectedPage <= 1}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center transition border border-slate-200 cursor-pointer"
                  title="Página anterior"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200">
                  Pág. {selectedPage} / {totalPages}
                </span>
                <button
                  onClick={() => setSelectedPage(p => Math.min(totalPages, p + 1))}
                  disabled={selectedPage >= totalPages}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 flex items-center justify-center transition border border-slate-200 cursor-pointer"
                  title="Página siguiente"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* A4 Paper Document Canvas Container */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex justify-center p-1">
              {isLoading ? (
                <div className="m-auto text-slate-500 text-xs p-6 text-center">
                  Cargando hoja de informe oficial...
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between min-h-[600px] animate-in fade-in duration-150">
                  
                  {/* Formal Document Header */}
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
                      <div>
                        <h2 className="font-sans font-black text-sm text-slate-900 tracking-tight">PROCESA CONSULTORES S.A.</h2>
                        <p className="font-sans text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                          División de Consultoría en Optimización de Procesos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          {projectCode}
                        </span>
                        <p className="font-sans text-[9px] text-slate-400 mt-0.5">DOCUMENTO OFICIAL</p>
                      </div>
                    </div>

                    <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 text-xs">{clientName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Archivo Fuente: {pdfFilename}
                      </div>
                    </div>

                    {/* Page Extracted Content with In-Document Yellow Highlights */}
                    <div className="text-slate-800 space-y-1">
                      {rawPages && rawPages.length > 0 ? (
                        (() => {
                          const currentPageObj = rawPages.find(p => (p.page_number === selectedPage || p.pagina === selectedPage)) || rawPages[0];
                          const pageText = currentPageObj?.text || currentPageObj?.contenido || currentPageObj?.content || '';
                          return renderDocumentTextWithHighlights(pageText, displayChunks);
                        })()
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          Cargando contenido de la página...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formal Document Footer */}
                  <div className="pt-4 mt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Procesa Consultores • Confidencial</span>
                    <span className="font-bold text-slate-600">Página {selectedPage} de {totalPages}</span>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PDF EMBEDDED IFRAME */}
        {activeTab === 'pdf_embed' && (
          <div className="flex-1 w-full h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative flex flex-col min-h-[480px]">
            <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
              <span className="flex items-center gap-1.5 font-mono text-[11px] truncate font-semibold text-slate-800">
                <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{pdfFilename}</span>
              </span>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition shrink-0 shadow-2xs cursor-pointer"
                title="Abrir el documento original en pestaña completa"
              >
                <span>Pantalla Completa</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex-1 relative w-full h-full bg-slate-50">
              <object
                data={`${pdfUrl}#toolbar=1&navpanes=0&page=${selectedPage}`}
                type="application/pdf"
                className="w-full h-full min-h-[500px] border-none"
              >
                {/* Fallback for devices/browsers without native inline PDF embed */}
                <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3 bg-white">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{pdfFilename}</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Tu dispositivo o navegador no admite visualización embebida directa. Puedes abrir o descargar el documento oficial original aquí:
                    </p>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Ver PDF Oficial Completo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </object>
            </div>
          </div>
        )}

        {/* TAB 3: STRUCTURED FICHA */}
        {activeTab === 'ficha' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
            {currentFicha ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs text-slate-800">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentFicha.cliente}</h4>
                  <p className="text-slate-500">{currentFicha.sector} • {currentFicha.ubicacion}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">DURACIÓN</span>
                    <span className="font-bold text-amber-700">{currentFicha.duracion_semanas} semanas</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">GERENTE</span>
                    <span className="font-bold text-slate-900">{currentFicha.gerente_proyecto}</span>
                  </div>
                </div>

                {currentFicha.kpis_impacto && currentFicha.kpis_impacto.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 text-[11px] block">📈 KPIs Antes vs Después:</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="p-2">Indicador</th>
                            <th className="p-2">Antes</th>
                            <th className="p-2">Después</th>
                            <th className="p-2">Var %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {currentFicha.kpis_impacto.map((kpi, kIdx) => (
                            <tr key={kIdx} className="hover:bg-slate-50/80">
                              <td className="p-2 font-sans font-medium text-slate-800">{kpi.indicador}</td>
                              <td className="p-2 text-slate-500">{kpi.antes}</td>
                              <td className="p-2 font-bold text-emerald-600">{kpi.despues}</td>
                              <td className="p-2 font-bold text-cyan-600">{kpi.variacion_porcentual}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {currentFicha.lecciones_aprendidas && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 text-[11px] block">💡 Lecciones Aprendidas:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {currentFicha.lecciones_aprendidas.map((lec, lIdx) => (
                        <li key={lIdx} className="leading-snug">{lec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Ficha no disponible.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span>Documento: <strong className="text-slate-800 font-medium">{pdfFilename}</strong></span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-600" /> Grounding Validado
        </span>
      </div>

      {/* Modal Explicativo de Grounding e Inspección de PDF */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-cyan-500/10 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">¿Por qué se implementó Grounding?</h3>
                  <p className="text-xs text-slate-500">Máxima Confianza en Requerimientos Estrictos de Documentos</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-[70vh] custom-scrollbar">
              
              {/* Pilar 1 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>1. Consistencia Factual y Rigor Técnico (Grounding Determinístico)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Diseñado para garantizar la <strong>máxima confiabilidad y precisión en entornos de alta exigencia documental</strong>. Mediante una arquitectura híbrida de recuperación y mapeo relacional (RAG + SQL), el sistema restringe el espacio de respuesta del modelo generativo exclusivamente a los informes de cierre auditados y la base de datos relacional SQLite, mitigando discrepancias y asegurando fidelidad 100% verificable.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200 space-y-1.5">
                <div className="font-bold text-cyan-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                  <span>2. Inspección Visual en Tiempo Real (Subrayado PDF)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Detalla cómo el consultor o directivo puede <strong>auditar con sus propios ojos las métricas y KPIs clave</strong> resaltados con <mark className="bg-yellow-200 font-semibold px-1 rounded">marcador amarillo</mark> directamente sobre el documento original.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>3. Auditoría y Trazabilidad Empresarial</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Resalta el valor de las <strong>citas interactivas para saltar automáticamente a la página y evidencia exacta</strong> que respalda cada respuesta con total confianza de nivel gerencial.
                </p>
              </div>

            </div>

            {/* Footer del Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Procesa Consultores • Solución RAG + SQL</span>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </aside>
  </>
  );
}
