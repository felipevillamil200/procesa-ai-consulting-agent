import React, { useState } from 'react';
import { documentQuestion } from '../services/documentPrompts';
import { 
  Database, Play, Upload, RotateCcw, MessageSquare, Trash2, FileText, 
  CheckCircle2, AlertCircle, Terminal, Sparkles, Shield, Copy, Check
} from 'lucide-react';

const PDF_NAMES = {
  'PC-2025-014': 'Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf',
  'PC-2025-027': 'Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf',
  'PC-2025-033': 'Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf',
  'PC-2026-006': 'Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf'
};

const SECTOR_TAGS = {
  'PC-2025-014': { label: 'Financiero', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  'PC-2025-027': { label: 'Manufactura', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  'PC-2025-033': { label: 'Salud', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  'PC-2026-006': { label: 'Retail', color: 'text-amber-700 bg-amber-50 border-amber-200' }
};

const DEFAULT_QUERY = 'SELECT codigo_proyecto, cliente, sector, duracion_semanas, gerente_proyecto FROM proyectos ORDER BY duracion_semanas DESC;';

export default function SqlExplorerView({
  projects = [],
  onOpenUpload,
  onResetProjects,
  onClearProjects,
  onDeleteProject,
  onAskChat,
  onExecuteSql
}) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [sqlResults, setSqlResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  const handleRunSQL = async (queryToRun = query) => {
    setIsRunning(true);
    try {
      const res = await onExecuteSql(queryToRun);
      setSqlResults(res);
    } catch (err) {
      setSqlResults({ success: false, error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePreset = (presetQuery) => {
    setQuery(presetQuery);
    handleRunSQL(presetQuery);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(query);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  // Re-run query automatically whenever projects list changes (delete/upload/reset)
  React.useEffect(() => {
    handleRunSQL(query);
  }, [projects]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-6 space-y-4 sm:space-y-6 bg-dot-grid bg-radial-ambient">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Top Control Bar */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                    Gestor de Documentos y Base Relacional SQLite
                  </h2>
                  <span className="px-2.5 py-0.5 bg-emerald-100/80 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-mono font-bold">
                    proyectos.db
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  CRUD dinámico sincronizado bidireccionalmente con el índice vectorial RAG y las fichas estructuradas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              onClick={onOpenUpload}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-sm shadow-cyan-600/25 transition flex items-center justify-center gap-2 cursor-pointer btn-tactile min-h-[42px]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir PDF</span>
            </button>
            {onClearProjects && (
              <button
                onClick={onClearProjects}
                className="flex-1 sm:flex-none px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs border border-red-200/80 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer btn-tactile min-h-[42px]"
                title="Vacía por completo la base de datos (0 documentos) para empezar desde cero"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Vaciar Todo</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Documents CRUD Section */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              <span>Proyectos e Informes Activos en Base de Datos</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono font-bold border border-slate-200">
              {projects.length} Documento(s)
            </span>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              1. MOBILE ADAPTIVE VIEW: Clean stacked Cards (0% clipped content)
              ════════════════════════════════════════════════════════════════ */}
          <div className="md:hidden space-y-3">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
                <div className="text-sm font-semibold text-slate-600">No hay proyectos ni documentos registrados en SQLite.</div>
                <div className="text-xs text-slate-400">Haz clic en "Subir PDF" para cargar un documento y comenzar.</div>
              </div>
            ) : (
              projects.map((p) => {
                const code = p.codigo_proyecto || p.codigo || 'PC-DOC';
                const tag = SECTOR_TAGS[code] || { label: p.sector || 'General', color: 'text-slate-700 bg-slate-100 border-slate-200' };
                const pdfName = PDF_NAMES[code] || p.archivo_pdf || p.archivo || `${code}.pdf`;

                return (
                  <div key={code} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    
                    {/* Header: Code + Sector Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-mono font-bold text-cyan-800">
                          {code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tag.color}`}>
                          {tag.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 font-semibold">
                        ⏱️ {p.duracion_semanas || '-'} sem
                      </span>
                    </div>

                    {/* Client Name */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Cliente / Empresa</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{p.cliente}</div>
                    </div>

                    {/* PDF Source Document Badge */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Archivo Fuente</div>
                      <div className="mt-1 px-2.5 py-1.5 bg-red-50/80 text-red-700 border border-red-200/70 rounded-xl text-[11px] font-mono flex items-center gap-1.5 break-all font-medium">
                        <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{pdfName}</span>
                      </div>
                    </div>

                    {/* Actions: Consultar & Eliminar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => onAskChat(documentQuestion(p))}
                        className="flex-1 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-tactile min-h-[40px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> 
                        <span>Consultar en Chat</span>
                      </button>
                      <button
                        onClick={() => onDeleteProject(code)}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-tactile min-h-[40px]"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 
                        <span>Eliminar</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              2. DESKTOP / TABLET VIEW: Full Data Table with Custom Scrollbar
              ════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:block">
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-2xs bg-white custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Cliente / Empresa</th>
                    <th className="p-3.5">Sector</th>
                    <th className="p-3.5">Duración</th>
                    <th className="p-3.5">Documento Fuente PDF</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 space-y-2">
                        <div className="text-sm font-semibold text-slate-600">No hay proyectos ni documentos registrados en SQLite.</div>
                        <div className="text-xs text-slate-400">Haz clic arriba en "Subir PDF" para cargar un documento y comenzar.</div>
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => {
                      const code = p.codigo_proyecto || p.codigo || 'PC-DOC';
                      const tag = SECTOR_TAGS[code] || { label: p.sector || 'General', color: 'text-slate-700 bg-slate-100 border-slate-200' };
                      const pdfName = PDF_NAMES[code] || p.archivo_pdf || p.archivo || `${code}.pdf`;
                      return (
                        <tr key={code} className="hover:bg-cyan-50/40 transition">
                          <td className="p-3.5 font-mono font-bold text-cyan-700">
                            <span className="px-2 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200">
                              {code}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{p.cliente}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tag.color}`}>
                              {tag.label}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">{p.duracion_semanas || '-'} semanas</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200/80 rounded-xl text-[10px] font-mono flex items-center gap-1.5 w-fit font-semibold">
                              <FileText className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate max-w-[200px]" title={pdfName}>{pdfName}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => onAskChat(documentQuestion(p))}
                              className="px-3 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer btn-tactile"
                            >
                              <MessageSquare className="w-3 h-3" /> 
                              <span>Consultar</span>
                            </button>
                            <button
                              onClick={() => onDeleteProject(code)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer btn-tactile"
                            >
                              <Trash2 className="w-3 h-3" /> 
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Interactive SQL Console IDE */}
        <div className="bg-slate-950 text-slate-100 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Consola SQL Interactiva (Solo Lectura SELECT)
              </span>
              <span className="px-2 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-mono">
                SQLite 3
              </span>
            </div>

            {/* Presets Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[10px] text-slate-500 font-mono">Presets:</span>
              <button
                onClick={() => handlePreset('SELECT codigo_proyecto, cliente, sector, duracion_semanas, gerente_proyecto FROM proyectos ORDER BY duracion_semanas DESC;')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 rounded-lg text-[11px] font-mono transition cursor-pointer btn-tactile"
              >
                Por Duración
              </button>
              <button
                onClick={() => handlePreset('SELECT sector, count(*) as total, avg(duracion_semanas) as duracion_promedio FROM proyectos GROUP BY sector;')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 rounded-lg text-[11px] font-mono transition cursor-pointer btn-tactile"
              >
                Por Sector
              </button>
              <button
                onClick={() => handlePreset('SELECT * FROM proyectos;')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 rounded-lg text-[11px] font-mono transition cursor-pointer btn-tactile"
              >
                Todos
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full font-mono text-xs p-4 bg-slate-900/90 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-inner leading-relaxed"
              placeholder="Escribe tu consulta SQL SELECT aquí..."
            />
            <button
              type="button"
              onClick={handleCopyQuery}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
              title="Copiar consulta SQL"
            >
              {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Guardrails activos: Prevención de inyección SQL y bloqueo de mutaciones destructivas.</span>
            </div>
            
            <button
              onClick={() => handleRunSQL()}
              disabled={isRunning}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 cursor-pointer btn-tactile min-h-[42px]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Ejecutando...' : 'Ejecutar Consulta SQL'}</span>
            </button>
          </div>

          {/* SQL Query Results with Scroll Cue */}
          <div className="pt-2">
            {sqlResults && sqlResults.success && sqlResults.rows && (
              sqlResults.rows.length > 0 ? (
                <div className="space-y-2 animate-fade-in">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between flex-wrap gap-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{sqlResults.row_count} fila(s) retornada(s) con éxito</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 sm:hidden">
                      ⟷ Desliza la tabla para ver más
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">SQLite Engine</span>
                  </div>
                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/80 custom-scrollbar">
                    <table className="w-full text-xs text-left font-mono min-w-[500px]">
                      <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 text-[11px]">
                        <tr>
                          {Object.keys(sqlResults.rows[0]).map((col) => (
                            <th key={col} className="p-3 text-cyan-300 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
                        {sqlResults.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/50 transition">
                            {Object.keys(sqlResults.rows[0]).map((col) => (
                              <td key={col} className="p-3 whitespace-nowrap">
                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-amber-400 bg-amber-950/40 rounded-2xl border border-amber-900/60 flex items-center gap-2">
                  <span>La consulta se ejecutó con éxito pero no retornó registros.</span>
                </div>
              )
            )}

            {sqlResults && !sqlResults.success && (
              <div className="p-4 text-xs text-red-300 bg-red-950/50 rounded-2xl border border-red-900/60 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Error en ejecución SQL: {sqlResults.error || 'Sintaxis inválida o consulta bloqueada'}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
