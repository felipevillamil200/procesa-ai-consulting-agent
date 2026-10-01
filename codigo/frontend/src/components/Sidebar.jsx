import React from 'react';
import { Brain, FileText, FileCode2, Sparkles, ChevronRight, Zap, FolderOpen } from 'lucide-react';

const PDF_NAMES = {
  'PC-2025-014': 'Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf',
  'PC-2025-027': 'Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf',
  'PC-2025-033': 'Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf',
  'PC-2026-006': 'Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf'
};

// Generador dinámico de preguntas sugeridas según la documentación indexada en memoria
const getDynamicPrompts = (projects) => {
  if (!projects || projects.length === 0) {
    return [
      {
        icon: '🛡️',
        label: 'Consultar proyectos disponibles (BD Vacía)',
        query: '¿Qué proyectos o informes tenemos disponibles en este momento?',
        isAntiHallucination: true
      }
    ];
  }

  const prompts = [];

  // 1. Pregunta analítica cuantitativa (SQL)
  prompts.push({
    icon: '📊',
    label: 'Proyectos y mayor duración',
    query: '¿Cuáles son los proyectos registrados en la base de datos y cuál tuvo la mayor duración en semanas?'
  });

  // 2. Pregunta específica sobre el primer proyecto indexado
  if (projects[0]) {
    const name = projects[0].cliente.length > 24 ? `${projects[0].cliente.slice(0, 22)}...` : projects[0].cliente;
    prompts.push({
      icon: '🎯',
      label: `Impacto en ${name}`,
      query: `¿Qué objetivos y resultados principales se alcanzaron en el proyecto ${projects[0].codigo_proyecto} (${projects[0].cliente})?`
    });
  }

  // 3. Pregunta específica sobre el segundo proyecto indexado
  if (projects[1]) {
    const name = projects[1].cliente.length > 24 ? `${projects[1].cliente.slice(0, 22)}...` : projects[1].cliente;
    prompts.push({
      icon: '⚙️',
      label: `Metodologías en ${name}`,
      query: `¿Qué metodologías y herramientas se aplicaron en ${projects[1].cliente} (${projects[1].codigo_proyecto})?`
    });
  } else {
    prompts.push({
      icon: '💡',
      label: 'Lecciones aprendidas críticas',
      query: '¿Cuáles fueron las lecciones aprendidas más importantes en los proyectos ejecutados?'
    });
  }

  // 4. Pregunta cualitativa de lecciones o KPIs
  if (projects[2]) {
    const name = projects[2].cliente.length > 24 ? `${projects[2].cliente.slice(0, 22)}...` : projects[2].cliente;
    prompts.push({
      icon: '💡',
      label: `Lecciones en ${name}`,
      query: `¿Qué lecciones aprendidas se documentaron en ${projects[2].cliente} (${projects[2].codigo_proyecto})?`
    });
  } else {
    prompts.push({
      icon: '📈',
      label: 'KPIs de impacto Antes vs Después',
      query: '¿Qué indicadores clave de impacto mejoraron entre la línea base y el resultado final?'
    });
  }

  // 5. Prueba de control anti-alucinación
  prompts.push({
    icon: '🛑',
    label: 'Prueba Anti-Alucinación (Minería)',
    query: '¿Qué proyectos o experiencia tenemos en sectores de minería o petróleo?',
    isAntiHallucination: true
  });

  return prompts;
};

export default function Sidebar({ projects = [], onSelectPrompt, config }) {
  const dynamicPrompts = getDynamicPrompts(projects);

  return (
    <aside className="w-80 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
            PROCESA
          </h1>
          <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
            Consultores • Agente IA
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          API Google Gemini / SQL
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-semibold">
          {config?.has_api_key ? 'Activo' : 'Local'}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 space-y-5">
        
        {/* Section: Source Documents */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              DOCUMENTOS FUENTE ({projects.length})
            </h2>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
              data/raw_reports/
            </span>
          </div>

          <div className="space-y-2">
            {projects.length === 0 ? (
              <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400 text-center">
                Sin documentos indexados
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.codigo_proyecto}
                  onClick={() => onSelectPrompt(`¿Qué objetivos, metodologías y resultados se lograron en el proyecto ${p.codigo_proyecto}?`)}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-cyan-400/60 hover:bg-slate-800 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                      <FileCode2 className="w-3 h-3 text-cyan-400" />
                      {p.codigo_proyecto}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-slate-700/80 text-slate-300 font-mono">
                      {p.duracion_semanas || '-'} sem
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-white truncate group-hover:text-cyan-300 transition">
                    {p.cliente}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate font-mono">
                    <FileText className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{PDF_NAMES[p.codigo_proyecto] || `${p.codigo_proyecto}_informe.pdf`}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Quick Prompts */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              PREGUNTAS RÁPIDAS ({dynamicPrompts.length})
            </h2>
            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">
              {projects.length > 0 ? 'Dinámicas' : 'Modo Vacío'}
            </span>
          </div>

          {projects.length === 0 && (
            <p className="text-[10px] text-slate-400 mb-2 px-1 leading-tight">
              Sube un PDF o restaura proyectos para generar sugerencias automáticas sobre los informes activos.
            </p>
          )}

          <div className="space-y-1.5 text-xs">
            {dynamicPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(item.query)}
                className={`w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition border ${
                  item.isAntiHallucination
                    ? 'border-red-900/40 hover:border-red-500/60 text-red-200'
                    : 'border-slate-700/40 hover:border-cyan-500/50'
                } flex items-center justify-between group`}
              >
                <span className="truncate flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="truncate font-medium">{item.label}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="font-medium text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Solución Documental Inteligente</span>
        </span>
        <span className="text-cyan-400 font-mono font-bold text-[10px] bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded">
          RAG + SQL
        </span>
      </div>
    </aside>
  );
}
