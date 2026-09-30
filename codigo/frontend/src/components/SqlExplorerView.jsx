import React, { useState } from 'react';
import { Database, Play, Upload, RotateCcw, MessageSquare, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const PDF_NAMES = {
  'PC-2025-014': 'Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf',
  'PC-2025-027': 'Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf',
  'PC-2025-033': 'Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf',
  'PC-2026-006': 'Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf'
};

const DEFAULT_QUERY = 'SELECT codigo_proyecto, cliente, sector, duracion_semanas, gerente_proyecto FROM proyectos ORDER BY duracion_semanas DESC;';

export default function SqlExplorerView({
  projects = [],
  onOpenUpload,
  onResetProjects,
  onDeleteProject,
  onAskChat,
  onExecuteSql
}) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [sqlResults, setSqlResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

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

  // Run initial query if not run yet
  React.useEffect(() => {
    if (!sqlResults) {
      handleRunSQL(DEFAULT_QUERY);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Control Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Gestor de Documentos y Base Relacional SQLite (`proyectos.db`)</h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-mono font-bold">
                SQLite 3
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Añade o elimina informes de proyectos dinámicamente; las fichas estructuradas y el índice RAG se sincronizan automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Informe PDF</span>
            </button>
            <button
              onClick={onResetProjects}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-300 transition flex items-center gap-2"
              title="Restaura los 4 proyectos oficiales de la prueba técnica"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Originales</span>
            </button>
          </div>
        </div>

        {/* Project Documents CRUD Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              Proyectos e Informes Activos en Base de Datos
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold border border-slate-200">
              {projects.length} Proyecto(s)
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th class="p-3">Cliente / Empresa</th>
                  <th class="p-3">Sector</th>
                  <th class="p-3">Duración</th>
                  <th class="p-3">Documento Fuente PDF</th>
                  <th class="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No hay proyectos registrados en SQLite. Haz clic en "Restaurar Originales" o "Subir Informe PDF".
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.codigo_proyecto} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-cyan-700">{p.codigo_proyecto}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.cliente}</td>
                      <td className="p-3 text-slate-600">{p.sector}</td>
                      <td className="p-3 font-mono">{p.duracion_semanas || '-'} semanas</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10px] font-mono flex items-center gap-1.5 w-fit">
                          <FileText className="w-3 h-3 text-red-500" />
                          {PDF_NAMES[p.codigo_proyecto] || `${p.codigo_proyecto}.pdf`}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => onAskChat(`¿Cuáles fueron las lecciones aprendidas y resultados del proyecto ${p.codigo_proyecto}?`)}
                          className="px-2.5 py-1 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg font-semibold transition inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Consultar
                        </button>
                        <button
                          onClick={() => onDeleteProject(p.codigo_proyecto)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive SQL Console */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Consola SQL Interactiva (Solo Lectura SELECT):
            </label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => handlePreset('SELECT codigo_proyecto, cliente, sector, duracion_semanas, gerente_proyecto FROM proyectos ORDER BY duracion_semanas DESC;')}
                className="text-cyan-600 hover:underline"
              >
                Por Duración
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => handlePreset('SELECT sector, count(*) as total, avg(duracion_semanas) as duracion_promedio FROM proyectos GROUP BY sector;')}
                className="text-cyan-600 hover:underline"
              >
                Por Sector
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => handlePreset('SELECT * FROM proyectos;')}
                className="text-cyan-600 hover:underline"
              >
                Todos los Datos
              </button>
            </div>
          </div>

          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full font-mono text-xs p-3.5 bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              Guardrails activos: Prevención de SQL Injection y bloqueo de mutaciones (INSERT/UPDATE/DELETE por consola).
            </span>
            <button
              onClick={() => handleRunSQL()}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Ejecutando...' : 'Ejecutar Consulta SQL'}</span>
            </button>
          </div>

          {/* SQL Query Results */}
          <div className="pt-2">
            {sqlResults && sqlResults.success && sqlResults.rows && (
              sqlResults.rows.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {sqlResults.row_count} fila(s) retornada(s) con éxito:
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          {Object.keys(sqlResults.rows[0]).map((col) => (
                            <th key={col} className="p-2.5 border-b border-slate-200">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                        {sqlResults.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {Object.keys(sqlResults.rows[0]).map((col) => (
                              <td key={col} className="p-2.5">
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
                <div className="p-4 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                  La consulta no retornó registros.
                </div>
              )
            )}

            {sqlResults && !sqlResults.success && (
              <div className="p-4 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>Error: {sqlResults.error || 'Error en consulta SQL'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
