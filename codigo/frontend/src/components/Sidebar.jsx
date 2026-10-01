import React, { useState } from 'react';
import { 
  Brain, FileText, FileCode2, Sparkles, ChevronRight, ChevronDown, 
  Zap, FolderOpen, ShieldCheck, Activity 
} from 'lucide-react';

const PDF_NAMES = {
  'PC-2025-014': 'Informe_Cierre_PC-2025-014_Cooperativa_Horizonte_Andino.pdf',
  'PC-2025-027': 'Informe_Cierre_PC-2025-027_Plasticos_del_Pacifico.pdf',
  'PC-2025-033': 'Informe_Cierre_PC-2025-033_Clinica_Santa_Lucia.pdf',
  'PC-2026-006': 'Informe_Cierre_PC-2026-006_Supermercados_La_Canasta.pdf'
};

const SECTOR_TAGS = {
  'PC-2025-014': { label: 'Financiero', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'PC-2025-027': { label: 'Manufactura', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  'PC-2025-033': { label: 'Salud', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  'PC-2026-006': { label: 'Retail', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
};

// Generador dinámico de preguntas sugeridas según la documentación indexada en memoria
const getDynamicPrompts = (projects) => {
  if (!projects || projects.length === 0) {
    return [
      {
        icon: '🛡️',
        label: 'Consultar estado (BD Vacía)',
        badge: 'Anti-Alucinación',
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
    badge: 'SQL Relacional',
    query: '¿Cuáles son los proyectos registrados en la base de datos y cuál tuvo la mayor duración en semanas?'
  });

  // 2. Pregunta específica sobre el primer proyecto indexado
  if (projects[0]) {
    const name = projects[0].cliente.length > 22 ? `${projects[0].cliente.slice(0, 20)}...` : projects[0].cliente;
    prompts.push({
      icon: '🎯',
      label: `Impacto en ${name}`,
      badge: projects[0].codigo_proyecto,
      query: `¿Qué objetivos y resultados principales se alcanzaron en el proyecto ${projects[0].codigo_proyecto} (${projects[0].cliente})?`
    });
  }

  // 3. Pregunta específica sobre el segundo proyecto indexado
  if (projects[1]) {
    const name = projects[1].cliente.length > 22 ? `${projects[1].cliente.slice(0, 20)}...` : projects[1].cliente;
    prompts.push({
      icon: '⚙️',
      label: `Metodologías en ${name}`,
      badge: 'Metodologías',
      query: `¿Qué metodologías y herramientas se aplicaron en ${projects[1].cliente} (${projects[1].codigo_proyecto})?`
    });
  } else {
    prompts.push({
      icon: '💡',
      label: 'Lecciones aprendidas críticas',
      badge: 'RAG Semántico',
      query: '¿Cuáles fueron las lecciones aprendidas más importantes en los proyectos ejecutados?'
    });
  }

  // 4. Pregunta cualitativa de lecciones o KPIs
  if (projects[2]) {
    const name = projects[2].cliente.length > 22 ? `${projects[2].cliente.slice(0, 20)}...` : projects[2].cliente;
    prompts.push({
      icon: '💡',
      label: `Lecciones en ${name}`,
      badge: 'Lecciones',
      query: `¿Qué lecciones aprendidas se documentaron en ${projects[2].cliente} (${projects[2].codigo_proyecto})?`
    });
  } else {
    prompts.push({
      icon: '📈',
      label: 'KPIs Antes vs Después',
      badge: 'Impacto OEE',
      query: '¿Qué indicadores clave de impacto mejoraron entre la línea base y el resultado final?'
    });
  }

  // 5. Prueba de control anti-alucinación
  prompts.push({
    icon: '🛑',
    label: 'Prueba Anti-Alucinación (Minería)',
    badge: 'Control',
    query: '¿Qué proyectos o experiencia tenemos en sectores de minería o petróleo?',
    isAntiHallucination: true
  });

  return prompts;
};

export default function Sidebar({ projects = [], onSelectPrompt, config }) {
  const dynamicPrompts = getDynamicPrompts(projects);
  const [isDocsOpen, setIsDocsOpen] = useState(true);
  const [isPromptsOpen, setIsPromptsOpen] = useState(true);

  return (
    <aside className="w-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col border-r border-slate-800/80 shrink-0 select-none shadow-2xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shadow-lg">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">
                PROCESA
              </h1>
              <span className="px-1.5 py-0.2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono font-bold rounded">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Consultores • Agente IA
            </p>
          </div>
        </div>
      </div>

      {/* Live Status Badge Bar */}
      <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-slate-300 font-medium text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Google Gemini & SQLite</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold tracking-wide">
          {config?.has_api_key ? '● CONECTADO' : '● LOCAL/DEV'}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 space-y-6">
        
        {/* Section: Source Documents (Collapsible Accordion) */}
        <div>
          <button
            type="button"
            onClick={() => setIsDocsOpen(prev => !prev)}
            className="w-full flex items-center justify-between mb-3 px-1 py-1 rounded-lg text-left group/header hover:bg-slate-800/50 transition cursor-pointer"
            title={isDocsOpen ? 'Plegar lista de documentos' : 'Desplegar lista de documentos'}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover/header:text-slate-200 transition">
                DOCUMENTOS FUENTE ({projects.length})
              </h2>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover/header:text-cyan-400 transition-transform duration-200 ${
                isDocsOpen ? 'rotate-0' : '-rotate-90'
              }`} />
            </div>

            <span className="text-[9px] bg-slate-900/80 text-cyan-400 px-2 py-0.5 rounded font-mono border border-cyan-900/50">
              PDF / RAG
            </span>
          </button>

          {isDocsOpen && (
            <div className="space-y-2 animate-fade-in">
              {projects.length === 0 ? (
                <div className="p-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-400 text-center space-y-1">
                  <p className="font-semibold text-slate-300">Base de datos vacía</p>
                  <p className="text-[10px] text-slate-500">Usa "Explorador SQLite" para restaurar o subir informes.</p>
                </div>
              ) : (
                projects.map((p) => {
                  const tag = SECTOR_TAGS[p.codigo_proyecto] || { label: p.sector || 'Proyecto', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
                  return (
                    <div
                      key={p.codigo_proyecto}
                      onClick={() => onSelectPrompt(`¿Qué objetivos, metodologías y resultados se lograron en el proyecto ${p.codigo_proyecto}?`)}
                      className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-850 hover:shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 group cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                          {p.codigo_proyecto}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold font-mono ${tag.color}`}>
                          {tag.label}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-white transition line-clamp-1">
                        {p.cliente}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <FileText className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{PDF_NAMES[p.codigo_proyecto] ? 'PDF Original' : 'Informe'}</span>
                        </span>
                        <span className="text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded text-[9px]">
                          {p.duracion_semanas || '-'} sem
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Section: Quick Prompts Bento (Collapsible Accordion) */}
        <div>
          <button
            type="button"
            onClick={() => setIsPromptsOpen(prev => !prev)}
            className="w-full flex items-center justify-between mb-3 px-1 py-1 rounded-lg text-left group/header hover:bg-slate-800/50 transition cursor-pointer"
            title={isPromptsOpen ? 'Plegar consultas sugeridas' : 'Desplegar consultas sugeridas'}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover/header:text-slate-200 transition">
                CONSULTAS SUGERIDAS ({dynamicPrompts.length})
              </h2>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover/header:text-amber-400 transition-transform duration-200 ${
                isPromptsOpen ? 'rotate-0' : '-rotate-90'
              }`} />
            </div>

            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
              Instantáneo
            </span>
          </button>

          {isPromptsOpen && (
            <div className="space-y-2 text-xs animate-fade-in">
              {dynamicPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(item.query)}
                  className={`w-full text-left p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all duration-200 border ${
                    item.isAntiHallucination
                      ? 'border-red-950/80 hover:border-red-500/60 bg-red-950/10 text-red-200'
                      : 'border-slate-800/80 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-950/20'
                  } flex items-center justify-between group active:scale-[0.98] cursor-pointer`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="truncate">
                      <p className="truncate font-semibold text-xs leading-tight group-hover:text-cyan-200 transition">
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-cyan-400 transition-all transform group-hover:translate-x-0.5 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer System Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-slate-300">Grounding Verificado</span>
        </div>
        <span className="text-cyan-400 font-mono font-bold text-[10px] bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-full shadow-xs">
          RAG + SQL
        </span>
      </div>
    </aside>
  );
}
