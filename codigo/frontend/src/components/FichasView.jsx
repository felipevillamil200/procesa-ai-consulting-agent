import React, { useState } from 'react';
import { 
  MapPin, Clock, User, DollarSign, TrendingUp, Sparkles, 
  Layers, ChevronRight, CheckCircle2, Award, Briefcase, FileCode2,
  Wrench, ShieldCheck
} from 'lucide-react';

const SECTOR_THEMES = {
  'Financiero': { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', border: 'hover:border-emerald-400', accent: 'text-emerald-600' },
  'Manufactura': { badge: 'bg-blue-50 text-blue-800 border-blue-200', border: 'hover:border-blue-400', accent: 'text-blue-600' },
  'Salud': { badge: 'bg-rose-50 text-rose-800 border-rose-200', border: 'hover:border-rose-400', accent: 'text-rose-600' },
  'Retail': { badge: 'bg-amber-50 text-amber-800 border-amber-200', border: 'hover:border-amber-400', accent: 'text-amber-600' }
};

export default function FichasView({ fichas = [] }) {
  const [selectedSector, setSelectedSector] = useState('ALL');

  if (fichas.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-dot-grid bg-radial-ambient">
        <div className="max-w-4xl mx-auto p-12 text-center bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-elevated space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No hay fichas técnicas registradas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Ve a la pestaña "Explorador SQLite & CRUD" para restaurar los 4 proyectos oficiales de la prueba técnica o subir nuevos informes en PDF.
          </p>
        </div>
      </div>
    );
  }

  const sectors = ['ALL', ...Array.from(new Set(fichas.map(f => f.sector?.split(' - ')[0] || f.sector).filter(Boolean)))];
  const filteredFichas = selectedSector === 'ALL' 
    ? fichas 
    : fichas.filter(f => (f.sector || '').toLowerCase().includes(selectedSector.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-dot-grid bg-radial-ambient">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Summary Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Fichas Técnicas Estructuradas
              </h2>
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-800 border border-cyan-300/80 rounded-full text-xs font-mono font-bold">
                Pydantic v2 + SQLite
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Esquemas estructurados con métricas antes/después, metodologías y lecciones aprendidas extraídas de los informes PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-white text-cyan-800 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              {fichas.length} Proyectos Activos
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        {sectors.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer btn-tactile ${
                  selectedSector === sec
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {sec === 'ALL' ? 'Todos los Sectores' : sec}
              </button>
            ))}
          </div>
        )}

        {/* Fichas Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFichas.map((f) => {
            if (f.es_documento) return <article key={f.codigo_proyecto} className="glass-card p-6 rounded-3xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-mono text-cyan-700 break-all">{f.document_id}</span><span className="rounded-full px-3 py-1 bg-slate-100 text-xs">{f.tipo_documento}</span></div>
              <h3 className="font-bold text-lg">{f.cliente}</h3><p className="text-xs text-slate-500">{f.nombre_archivo} · {f.total_pages} página(s)</p>
              <p className="text-sm whitespace-pre-wrap text-slate-700">{f.resumen}</p>
              <dl className="space-y-2">{(f.campos || []).map((field,i)=><div key={i} className="border-t pt-2 text-sm"><dt className="font-semibold">{field.name}</dt><dd>{field.value} <span className="text-xs text-slate-500">· pág. {field.page_number}</span></dd></div>)}</dl>
              {f.warnings?.map((w,i)=><p key={i} className="text-xs text-amber-800">{w}</p>)}
            </article>;
            const rawSector = (f.sector || '').split(' - ')[0] || 'General';
            const theme = SECTOR_THEMES[rawSector] || { badge: 'bg-slate-100 text-slate-800 border-slate-200', border: 'hover:border-cyan-400', accent: 'text-cyan-600' };

            return (
              <div
                key={f.codigo_proyecto}
                className={`glass-card p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-4 ${theme.border} flex flex-col justify-between group`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-xs font-bold shadow-2xs">
                          {f.codigo_proyecto}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${theme.badge}`}>
                          {rawSector}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 mt-2 tracking-tight group-hover:text-cyan-800 transition">
                        {f.cliente}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{f.ubicacion || 'Ubicación corporativa'}</span>
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-full flex items-center gap-1.5 shadow-2xs shrink-0">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      {f.duracion_semanas || '-'} sem
                    </span>
                  </div>

                  {/* Objective Box */}
                  <div className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Objetivo del Proyecto:</div>
                    <p className="text-slate-800 font-medium leading-relaxed">{f.objetivo_general || 'Optimización integral de procesos y métricas clave.'}</p>
                  </div>

                  {/* Impact KPIs */}
                  {f.kpis_impacto && f.kpis_impacto.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Indicadores de Impacto (Antes vs Después):
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        {f.kpis_impacto.map((k, kIdx) => (
                          <div
                            key={kIdx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-200 transition"
                          >
                            <span className="font-semibold text-slate-700 truncate max-w-[200px]">{k.indicador}</span>
                            <span className="font-mono text-emerald-600 font-bold text-[11px] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                              {k.linea_base_antes} ➔ {k.resultado_despues} {k.variacion_porcentual ? `(${k.variacion_porcentual})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metodologías Tags */}
                  {f.metodologias_herramientas && f.metodologias_herramientas.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-slate-400" />
                        Herramientas:
                      </span>
                      {f.metodologias_herramientas.slice(0, 4).map((m, mIdx) => (
                        <span key={mIdx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-medium rounded-md border border-slate-200">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3.5 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <User className="w-3.5 h-3.5 text-cyan-600" />
                    <span><strong>Gerente:</strong> {f.gerente_proyecto || 'Equipo Consultor'}</span>
                  </span>
                  {f.beneficios_economicos && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg truncate max-w-[220px]" title={f.beneficios_economicos}>
                      <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{f.beneficios_economicos}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
