import React from 'react';
import { 
  X, Users, Sparkles, Building2, TrendingUp, ShieldCheck, 
  Target, Award, Lightbulb, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function AboutUsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-cyan-600/20 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">Nosotros • Procesa Consultores</h3>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold px-2 py-0.5 rounded-full uppercase">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-600">Consultoría en Excelencia Operacional e Inteligencia Artificial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer btn-tactile"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-700">
          
          {/* Mensaje de Bienvenida */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 border border-cyan-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-900 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>¡Te damos la más cordial bienvenida!</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              En <strong>Procesa Consultores</strong> transformamos organizaciones optimizando sus procesos clave, eliminando desperdicios y potenciando sus resultados mediante metodologías de clase mundial y tecnología de Inteligencia Artificial aplicada.
            </p>
          </div>

          {/* ¿Qué es Procesa? */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-cyan-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                ¿Quiénes Somos y Qué Hacemos?
              </h4>
            </div>

            <p className="text-slate-600">
              Somos una firma consultora líder especializada en la <strong>optimización de procesos de negocio, mejora continua y transformación digital</strong>. Ayudamos a empresas de diversos sectores a maximizar su eficiencia, reducir costos operativos y acelerar sus tiempos de respuesta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Excelencia Operacional</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Implementación de Lean, Six Sigma, SMED, TPM y Rediseño de flujos de valor en planta y servicios.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <Target className="w-4 h-4 text-cyan-600" />
                  <span>Resultados Cuantificables</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Mejoras tangibles con métricas antes vs. después, reducciones de ciclo y retorno de inversión medible.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Gestión del Conocimiento</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Capitalizamos cada lección aprendida e informe de cierre en activos digitales vivos para toda la firma.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>IA con Trazabilidad</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Agentes inteligentes de consulta con verificación de fuentes originales y 0% margen de alucinación.
                </p>
              </div>

            </div>
          </section>

          {/* Sectores de Impacto */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Award className="w-4 h-4 text-cyan-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Sectores en los que Generamos Valor
              </h4>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 font-semibold text-blue-900 text-[11px]">
                🏦 Servicios Financieros
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 font-semibold text-emerald-900 text-[11px]">
                🏥 Salud & Clínicas
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 font-semibold text-purple-900 text-[11px]">
                🏭 Manufactura Industrial
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 font-semibold text-amber-900 text-[11px]">
                🛒 Retail & Comercio
              </div>
            </div>
          </section>

          {/* Compromiso con la Calidad */}
          <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-800">Propósito de esta plataforma:</strong> Poner a disposición de nuestros consultores y clientes un asistente virtual capaz de consultar al instante cualquier informe, balance o contrato combinando bases de datos relacionales y lectura profunda de PDFs.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Procesa Consultores © {new Date().getFullYear()} • Excelencia en Procesos
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-600/30 transition cursor-pointer btn-tactile"
          >
            <span>Explorar Asistente</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
