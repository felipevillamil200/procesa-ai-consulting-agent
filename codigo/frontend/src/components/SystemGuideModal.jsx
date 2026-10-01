import React from 'react';
import { 
  X, MessageSquare, Table, Database, Network, Settings, Trash2, 
  Files, Zap, Sparkles, FileText, HelpCircle, ShieldCheck, Compass, ExternalLink
} from 'lucide-react';

export default function SystemGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-500/10 via-brand-500/5 to-amber-500/10 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Guía del Sistema • Procesa Consultores</h3>
              <p className="text-xs text-slate-500">Explicación de cada módulo y funcionalidad de la plataforma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Cerrar guía"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-700">
          
          {/* SECCIÓN 1: MÓDULOS PRINCIPALES DE NAVEGACIÓN */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Compass className="w-4 h-4 text-cyan-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                1. Módulos de Navegación Principal (Barra Superior)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Chat Inteligente */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                  <span>Chat Inteligente</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Asistente conversacional con IA (Gemini) que combina consultas SQL directas sobre la base de datos relacional y búsqueda semántica (RAG) en los informes oficiales en PDF.
                </p>
              </div>

              {/* Fichas Estructuradas */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
                  <Table className="w-4 h-4 text-brand-600" />
                  <span>Fichas Estructuradas</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Vista ejecutiva que sintetiza cada proyecto cerrado con sus métricas clave, clientes, sectores, directores, comparativas de KPIs antes vs después y lecciones aprendidas.
                </p>
              </div>

              {/* Explorador SQLite & CRUD */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Explorador SQLite & CRUD</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Consola de gestión de datos para visualizar tablas relacionales, ejecutar consultas SQL interactivas y realizar operaciones CRUD (subir PDFs, eliminar o restaurar proyectos).
                </p>
              </div>

              {/* Arquitectura & Costos */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                  <Network className="w-4 h-4 text-purple-600" />
                  <span>Arquitectura & Costos</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Diagrama interactivo de arquitectura del Agente Híbrido (RAG + SQL) y desglose económico de costo por consulta en producción ($0.000105/consulta).
                </p>
              </div>

              {/* Configuración AI */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>Configuración AI</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Panel para gestionar dinámicamente la API Key de Google Gemini, selección de modelos (Flash, Pro, Lite) y ajuste de temperatura del agente consultor.
                </p>
              </div>

              {/* Limpiar Chat */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Limpiar Chat</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Reinicia la conversación del asistente borrando el historial de mensajes de la sesión actual para iniciar una nueva consulta desde cero.
                </p>
              </div>

            </div>
          </section>

          {/* SECCIÓN 2: ELEMENTOS COMPLEMENTARIOS (BARRA LATERAL) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Files className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                2. Herramientas Complementarias (Barra Lateral Izquierda)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Documentación Fuente */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Files className="w-4 h-4 text-cyan-600" />
                  <span>Documentación Fuente</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Lista de los informes oficiales en PDF indexados en la base de datos con acceso directo para consultar cualquier proyecto cerrado.
                </p>
              </div>

              {/* Preguntas Rápidas */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Preguntas Rápidas</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Sugerencias automáticas adaptativas basadas en los proyectos activos para evaluar KPIs, OEE, lecciones y comprobar el guardrail anti-alucinación.
                </p>
              </div>

            </div>
          </section>

          {/* SECCIÓN 3: OPCIONES DE CONSULTA (GROUNDING & INSPECTOR) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                3. Opciones de Consulta (Barra Inferior de Chat)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Citas Grounding */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Citas Grounding</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  <strong>Citas clicables en texto:</strong> Transforma las menciones y códigos de proyectos en botones interactivos dentro de las respuestas del chat, permitiendo abrir el documento con un clic.
                </p>
              </div>

              {/* Inspector PDF */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-1">
                <div className="flex items-center gap-2 text-cyan-950 font-bold text-xs">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <span>Inspector PDF</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  <strong>Panel lateral de evidencia:</strong> Despliega la pantalla dividida (Split-View) que muestra la hoja oficial del proyecto con el texto original y las cifras clave subrayadas con resaltador amarillo.
                </p>
              </div>

            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <a
            href="./guia.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs text-decoration-none"
          >
            <span>Ver Guía Completa en nueva pestaña</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}

