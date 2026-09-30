import React from 'react';
import { MapPin, Clock, User, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export default function FichasView({ fichas = [] }) {
  if (fichas.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          No hay fichas técnicas estructuradas cargadas.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fichas Técnicas Estructuradas de Proyectos</h2>
            <p className="text-xs text-slate-500 mt-1">
              Esquemas Pydantic v2 extraídos de los informes PDF y almacenados de forma relacional en SQLite.
            </p>
          </div>
          <span className="px-3.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-bold">
            {fichas.length} Proyectos Indexados
          </span>
        </div>

        {/* Fichas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fichas.map((f) => (
            <div
              key={f.codigo_proyecto}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-mono text-xs font-bold">
                      {f.codigo_proyecto}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-2">{f.cliente}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {f.ubicacion || 'No especificada'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {f.duracion_semanas || '-'} semanas
                  </span>
                </div>

                {/* Sector & Objective */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <div><strong>Sector:</strong> {f.sector}</div>
                  <div><strong>Objetivo:</strong> {f.objetivo_general}</div>
                </div>

                {/* Impact KPIs */}
                {f.kpis_impacto && f.kpis_impacto.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Indicadores de Impacto (Antes vs Después):
                    </h4>
                    <div className="space-y-1.5 text-xs">
                      {f.kpis_impacto.map((k, kIdx) => (
                        <div
                          key={kIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100"
                        >
                          <span className="font-medium text-slate-700 max-w-[200px] truncate">{k.indicador}</span>
                          <span className="font-mono text-emerald-600 font-bold text-[11px]">
                            {k.linea_base_antes} ➔ {k.resultado_despues} {k.variacion_porcentual ? `(${k.variacion_porcentual})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Gerente:</strong> {f.gerente_proyecto}
                </span>
                {f.beneficios_economicos && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px] max-w-[220px] truncate" title={f.beneficios_economicos}>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {f.beneficios_economicos}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
