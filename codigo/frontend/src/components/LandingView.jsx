import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, ShieldCheck, FileText, Database, ArrowRight, 
  CheckCircle2, Users, Clock, DollarSign, Building, Mail, Phone, 
  Layers, Lock, Check, Send, Award, FileSpreadsheet, Scale, 
  TrendingUp, BarChart3, HelpCircle
} from 'lucide-react';

const USE_CASES = [
  {
    icon: FileSpreadsheet,
    title: 'Facturas, Servicios y Finanzas',
    badge: 'Contabilidad & Pagos',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600',
    desc: 'Sube facturas de luz, agua, proveedores o balances. Pregunta por totales a pagar, consumos en kWh, cargos fijos y fechas límite.',
    sampleQuery: '¿Cuánto pagamos de energía en enero y cuál fue el cargo por consumo?'
  },
  {
    icon: TrendingUp,
    title: 'Informes de Proyectos y Cierre',
    badge: 'Consultoría & Operaciones',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-600',
    desc: 'Audita decenas de informes de consultoría. Cruza datos de metodologías (Lean, SMED, TPM), KPIs de impacto y lecciones aprendidas.',
    sampleQuery: '¿Qué lecciones aprendimos sobre resistencia al cambio en mandos medios?'
  },
  {
    icon: Scale,
    title: 'Contratos Legales y Acuerdos',
    badge: 'Legal & Compliance',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-600',
    desc: 'Extrae cláusulas críticas de confidencialidad, vigencias, penalidades por incumplimiento y condiciones de rescisión sin leer 100 páginas.',
    sampleQuery: '¿Cuál es la penalidad estipulada por retraso en la entrega?'
  },
  {
    icon: ShieldCheck,
    title: 'Prevención Total de Alucinaciones',
    badge: 'Grounding Verificado',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-600',
    desc: 'A diferencia de ChatGPT tradicional, si el dato no existe en tus documentos o en la base SQLite, el sistema lo indica textualmente con honestidad.',
    sampleQuery: '¿Qué experiencia tenemos en minería? → "No se dispone de información"'
  }
];

export default function LandingView({ onNavigateToChat }) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    docType: 'Facturas & Finanzas',
    docVolume: '10 - 100 documentos / mes',
    comments: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [leadsList, setLeadsList] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('procesa_leads');
    if (saved) {
      try {
        setLeadsList(JSON.parse(saved));
      } catch (e) {
        console.error('Error cargando leads:', e);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newLead = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toLocaleString()
    };

    const updated = [newLead, ...leadsList];
    setLeadsList(updated);
    localStorage.setItem('procesa_leads', JSON.stringify(updated));
    setSubmitted(true);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900 text-slate-100 p-4 sm:p-8 space-y-12">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold shadow-lg shadow-cyan-950/40 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>AGENTE IA EMPRESARIAL • RAG HÍBRIDO + SQL RELACIONAL</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Convierte cualquier <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">PDF, Factura o Contrato</span> en Inteligencia de Negocio al Instante.
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          Olvídate de buscar manualmente en cientos de páginas. Arrastra cualquier documento —desde <strong>facturas de servicios y balances contables</strong> hasta <strong>informes técnicos de consultoría</strong>— y obtén respuestas inmediatas con <strong>citas textuales verificadas y cero alucinaciones</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateToChat}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-sm transition-all duration-200 flex items-center gap-2.5 shadow-xl shadow-cyan-600/30 cursor-pointer btn-tactile hover:scale-105"
          >
            <span>Probar Demo Interactiva</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <a
            href="#lead-form"
            className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold rounded-2xl text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer btn-tactile"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Solicitar Piloto para mi Empresa</span>
          </a>
        </div>
      </div>

      {/* Bento Grid: Lo que sorprende de esta herramienta */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ¿Por qué esta herramienta está a otro nivel?
          </h2>
          <p className="text-xs text-slate-400">
            Capacidades reales probadas con documentos complejos y bases de datos relacionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${uc.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {uc.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                    {uc.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {uc.desc}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] font-mono text-cyan-300 flex items-start gap-2">
                  <span className="text-slate-500 font-bold">Ejemplo:</span>
                  <span className="italic">"{uc.sampleQuery}"</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla Comparativa: Tradicional vs Procesa AI */}
      <div className="max-w-5xl mx-auto p-6 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Comparativa de Eficiencia Operativa</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Capacidad</th>
                <th className="py-2.5 px-3 text-red-400">Búsqueda Tradicional</th>
                <th className="py-2.5 px-3 text-amber-400">ChatGPT Tradicional</th>
                <th className="py-2.5 px-3 text-cyan-400 font-bold bg-cyan-950/30 rounded-t-lg">PROCESA AI (RAG + SQL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Cualquier PDF (Luz, Facturas, Informes)</td>
                <td className="py-3 px-3 text-slate-400">Lectura manual lenta (30-60 min)</td>
                <td className="py-3 px-3 text-slate-400">Sube pero alucina cifras</td>
                <td className="py-3 px-3 font-bold text-emerald-400 bg-cyan-950/20">✓ Extracción exacta en 240 ms</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Cálculos SQL & Base Relacional</td>
                <td className="py-3 px-3 text-slate-400">Requiere analista de datos</td>
                <td className="py-3 px-3 text-slate-400">No tiene conexión a BD real</td>
                <td className="py-3 px-3 font-bold text-emerald-400 bg-cyan-950/20">✓ Function Calling SQLite nativo</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Trazabilidad & Evidencia</td>
                <td className="py-3 px-3 text-slate-400">Manual con resaltador</td>
                <td className="py-3 px-3 text-slate-400">Cita genérica sin página</td>
                <td className="py-3 px-3 font-bold text-emerald-400 bg-cyan-950/20">✓ Resaltado de párrafo y página en PDF</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-white">Arrastrar y Soltar (Drag & Drop)</td>
                <td className="py-3 px-3 text-slate-400">No aplica</td>
                <td className="py-3 px-3 text-slate-400">Solo como adjunto estático</td>
                <td className="py-3 px-3 font-bold text-emerald-400 bg-cyan-950/20">✓ Foco interactivo dinámico en Chat</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario de Captura de Leads */}
      <div id="lead-form" className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/30 space-y-6 scroll-mt-20">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Solicita una Demostración con tus Propios Documentos
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Déjanos tus datos y configuraremos un piloto gratuito para probar con las facturas, contratos o informes de tu organización.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-center space-y-3 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">¡Solicitud Registrada con Éxito!</h4>
            <p className="text-xs text-emerald-200">
              Hemos guardado tus datos en el sistema. Puedes consultar el chat interactivo mientras un consultor de Procesa AI se pone en contacto contigo.
            </p>
            <button
              onClick={() => { setSubmitted(false); onNavigateToChat(); }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer"
            >
              Ir a la Demo en Vivo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Empresa u Organización *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora del Norte S.A."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correo Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp o Teléfono</label>
                <input
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo Principal de Documentos</label>
                <select
                  value={formData.docType}
                  onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Facturas & Finanzas">Facturas de Servicios, Luz, Agua y Pagos</option>
                  <option value="Informes de Consultoría">Informes de Proyectos y Operaciones</option>
                  <option value="Contratos & Legal">Contratos, Pólizas y Documentos Legales</option>
                  <option value="Auditoría">Balances, Auditorías y Estados Financieros</option>
                  <option value="Mixto">Múltiples tipos de documentos</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Volumen Estimado Mensual</label>
                <select
                  value={formData.docVolume}
                  onChange={(e) => setFormData({ ...formData, docVolume: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="1 - 10 documentos">1 - 10 documentos / mes</option>
                  <option value="10 - 100 documentos">10 - 100 documentos / mes</option>
                  <option value="100 - 1,000 documentos">100 - 1,000 documentos / mes</option>
                  <option value="+1,000 documentos">+1,000 documentos / mes (Empresarial)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">¿Qué caso de uso te gustaría resolver?</label>
              <textarea
                rows={2}
                placeholder="Ej. Queremos automatizar la extracción de cobros de facturas y auditar reportes de entrega..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer btn-tactile"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Acceso a Piloto Exclusivo</span>
            </button>
          </form>
        )}
      </div>

      {/* Registro de Leads Capturados (CRM Demo) */}
      {leadsList.length > 0 && (
        <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solicitudes de Piloto Registradas ({leadsList.length})</span>
            </span>
            <button
              onClick={() => { localStorage.removeItem('procesa_leads'); setLeadsList([]); }}
              className="text-[10px] text-slate-500 hover:text-red-400 transition"
            >
              Limpiar leads demo
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {leadsList.map((lead) => (
              <div key={lead.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{lead.name}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {lead.company}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {lead.email} • {lead.phone || 'Sin tel'} • {lead.docType}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{lead.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-4 border-t border-slate-800 max-w-5xl mx-auto">
        PROCESA Consultores • Agente IA Empresarial de Proyectos & Documentos • RAG + SQLite + Gemini
      </div>
    </div>
  );
}
