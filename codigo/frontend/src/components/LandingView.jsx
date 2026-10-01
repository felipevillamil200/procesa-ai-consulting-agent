import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, ShieldCheck, FileText, Database, ArrowRight, 
  CheckCircle2, Users, Clock, DollarSign, Building, Mail, Phone, 
  Layers, Lock, Check, Send, Award, FileSpreadsheet, Scale, 
  TrendingUp, BarChart3, HelpCircle, ChevronDown, Cpu, FileCheck2,
  Shield, Eye, Flame, Search
} from 'lucide-react';

const REAL_CAPABILITIES = [
  {
    icon: FileSpreadsheet,
    tag: 'Finanzas & Contabilidad',
    title: 'Facturas de Servicios, Luz y Proveedores',
    problem: 'Tener que abrir 50 PDFs para buscar cuánto se pagó, qué cargo fijo cobraron y cuándo vence.',
    solution: 'Preguntas en lenguaje natural y el agente extrae montos, consumos en kWh, fechas de corte y compara meses.',
    exampleQuery: '¿Cuál fue el total facturado en energía eléctrica en enero y cuál fue el cargo fijo?',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  {
    icon: Scale,
    tag: 'Legal & Auditoría',
    title: 'Contratos, Pólizas y Acuerdos Comerciales',
    problem: 'Revisar contratos de 80 páginas buscando si hay penalidades por retraso o cláusulas de rescisión.',
    solution: 'El sistema localiza el párrafo legal exacto y lo resalta en amarillo con número de página para firma y auditoría.',
    exampleQuery: '¿Cuáles son las cláusulas de penalización por retraso en la entrega?',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  },
  {
    icon: TrendingUp,
    tag: 'Operaciones & Proyectos',
    title: 'Informes de Cierre, KPIs y Metodologías',
    problem: 'Perder el conocimiento de proyectos anteriores y repetir los mismos errores operacionales.',
    solution: 'Cruza metodologías Lean/SMED/TPM con datos de base de datos relacional (duración, ahorros económicos, lecciones).',
    exampleQuery: '¿Qué lecciones aprendimos sobre resistencia al cambio en mandos medios?',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  },
  {
    icon: ShieldCheck,
    tag: 'Cero Alucinación',
    title: 'Verificación Forense y Honestidad Estricta',
    problem: 'Herramientas como ChatGPT inventan datos cuando no saben la respuesta.',
    solution: 'Si el dato no está en el documento, el agente declara explícitamente que no existe. Cero alucinaciones garantizado.',
    exampleQuery: '¿Qué proyectos tenemos en minería o petróleo? → "No se dispone de información"',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  }
];

const FAQS = [
  {
    q: '¿Qué tipo de documentos PDF puede procesar esta herramienta?',
    a: 'Cualquier archivo PDF con texto digital o estructurado. Esto incluye facturas de servicios públicos (luz, agua, gas), extractos bancarios, contratos comerciales, pólizas, informes técnicos de consultoría, balances contables y manuales operativos.'
  },
  {
    q: '¿Cómo garantizan que la IA no invente datos (alucinaciones)?',
    a: 'El sistema utiliza una arquitectura estricta de Grounding y RAG Híbrido (BM25 + TF-IDF + Embeddings). Cada respuesta generada está obligada a respaldarse en fragmentos de texto exactos del documento con código de fuente, página y párrafo. Si una información no existe, el agente declara honestamente que no dispone de datos.'
  },
  {
    q: '¿Puede hacer sumas, promedios y cruzar datos matemáticos?',
    a: 'Sí. A diferencia de un chat convencional que suele fallar en matemáticas, esta herramienta cuenta con un motor relacional SQLite integrado mediante Function Calling. Puede calcular duraciones promedio, rankings de costos y filtros estructurados con precisión de base de datos.'
  },
  {
    q: '¿Mis documentos y datos están protegidos?',
    a: 'Absolutamente. El motor de extracción y la base de datos se ejecutan en un entorno seguro y aislado. Los documentos no se utilizan para re-entrenar modelos públicos y toda la trazabilidad queda bajo control estricto de tu organización.'
  },
  {
    q: '¿Necesito instalar software complicado en las computadoras del equipo?',
    a: 'No. La solución funciona 100% en el navegador web con una interfaz ultra-rápida e intuitiva. Cualquier colaborador puede arrastrar un PDF al chat y empezar a recibir respuestas fundamentadas en segundos.'
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
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-16">
      
      {/* Unified Hero (2-Column Side-by-Side: Text & Visual Proof) */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-2 pb-4">
        
        {/* Left: Value Proposition & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold shadow-lg shadow-cyan-950/40 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTELIGENCIA ARTIFICIAL DOCUMENTAL & RELACIONAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            De <span className="text-red-400 line-through decoration-red-500/70">4 horas leyendo PDFs</span> a <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">3 segundos de respuesta exacta</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Diseñado para que secretarias, analistas y directivos consulten <strong>facturas de servicios (luz/agua), balances, contratos e informes técnicos</strong> arrastrando el archivo al chat, con <strong>evidencia subrayada y cero alucinaciones</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onNavigateToChat}
              className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-sm transition-all duration-200 flex items-center gap-2.5 shadow-xl shadow-cyan-600/30 cursor-pointer btn-tactile hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              <span>Probar la Demo Interactiva</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <a
              href="#piloto"
              className="px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold rounded-2xl text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer btn-tactile"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Probar con mis Documentos</span>
            </a>
          </div>

          {/* Micro-Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Latencia: ~240 ms</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Grounding Forense</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>100% Confidencial</span>
            </div>
          </div>
        </div>

        {/* Right: Executive AI Workflow Visual Proof */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-cyan-950/40 bg-slate-900 group">
            <img 
              src="/images/executive_workflow.jpg" 
              alt="Ejecutiva procesando documentos con Inteligencia Artificial" 
              className="w-full h-72 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white text-[11px]">AI VERIFIED • DATA INTEGRITY</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  RAG + SQL
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Lo que la herramienta realmente hace (Problema Real -> Solución Concreta) */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ¿Qué problemas resuelve en el día a día de tu empresa?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            No necesitas ser un experto técnico para usarlo. Diseñado para simplificar el trabajo administrativo, financiero y operativo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {REAL_CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 shadow-xl space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${cap.badgeColor}`}>
                    {cap.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition">
                    {cap.title}
                  </h3>
                  
                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/40 text-red-200 flex items-start gap-2">
                      <span className="font-bold shrink-0 text-red-400">Antes:</span>
                      <span>{cap.problem}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 flex items-start gap-2">
                      <span className="font-bold shrink-0 text-emerald-400">Con Procesa AI:</span>
                      <span>{cap.solution}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-[11px] font-mono text-cyan-300 flex items-start gap-2">
                  <span className="text-slate-500 font-bold shrink-0">Ejemplo:</span>
                  <span className="italic">"{cap.exampleQuery}"</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de Confianza y Seguridad */}
      <div className="max-w-6xl mx-auto p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span>Diseñado con Principios de Confianza Empresarial</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Garantías arquitectónicas que protegen la integridad de tu información y evitan errores humanos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>Evidencia Subrayada</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              No tienes que confiar a ciegas: el sistema abre el visor lateral con el texto exacto del PDF subrayado en amarillo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Privacidad Estricta</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tus documentos financieros, balances o facturas permanecen privados y protegidos en tu propia infraestructura.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-blue-400 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Foco por Drag & Drop</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Arrastra el PDF que quieras analizar para que el agente filtre su búsqueda 100% a ese documento sin mezclar datos.
            </p>
          </div>
        </div>
      </div>

      {/* Preguntas Frecuentes (FAQ Accordion) */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Preguntas Frecuentes
          </h2>
          <p className="text-xs text-slate-400">
            Todo lo que necesitas saber sobre el funcionamiento del Agente
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/70 border border-slate-800/90 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-100 hover:text-cyan-300 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fade-in font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulario de Solicitud de Piloto / Probar con mis documentos */}
      <div id="piloto" className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 space-y-6 scroll-mt-20">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Pruébalo con los Documentos de tu Organización
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Déjanos tus datos para coordinar una prueba con tus facturas, contratos o informes internos sin compromiso.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-center space-y-3 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">¡Solicitud Registrada con Éxito!</h4>
            <p className="text-xs text-emerald-200">
              Hemos guardado tu solicitud en el sistema. Puedes probar el chat interactivo mientras nos contactamos.
            </p>
            <button
              onClick={() => { setSubmitted(false); onNavigateToChat(); }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer"
            >
              Ir al Chat en Vivo
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
                  placeholder="Ej. Sofía Hernández"
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
                  placeholder="Ej. Constructora del Valle S.A."
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
                  placeholder="sofia@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp o Celular</label>
                <input
                  type="tel"
                  placeholder="+57 310 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Documentos a Analizar</label>
                <select
                  value={formData.docType}
                  onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Facturas & Finanzas">Facturas de Servicios (Luz/Agua), Pagos y Balances</option>
                  <option value="Informes de Consultoría">Informes de Proyectos, Gestión y Operaciones</option>
                  <option value="Contratos & Legal">Contratos, Pólizas y Cláusulas Legales</option>
                  <option value="Auditoría">Auditorías, Actas y Certificaciones</option>
                  <option value="Mixto">Múltiples formatos</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Volumen Estimado</label>
                <select
                  value={formData.docVolume}
                  onChange={(e) => setFormData({ ...formData, docVolume: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="1 - 10 documentos">1 - 10 documentos / mes</option>
                  <option value="10 - 100 documentos">10 - 100 documentos / mes</option>
                  <option value="100 - 1,000 documentos">100 - 1,000 documentos / mes</option>
                  <option value="+1,000 documentos">+1,000 documentos / mes (Corporativo)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer btn-tactile"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Espacio de Demostración</span>
            </button>
          </form>
        )}
      </div>

      {/* Registro de Solicitudes Capturadas (Panel Demo) */}
      {leadsList.length > 0 && (
        <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solicitudes Registradas en este Entorno ({leadsList.length})</span>
            </span>
            <button
              onClick={() => { localStorage.removeItem('procesa_leads'); setLeadsList([]); }}
              className="text-[10px] text-slate-500 hover:text-red-400 transition cursor-pointer"
            >
              Limpiar registros demo
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {leadsList.map((lead) => (
              <div key={lead.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{lead.name}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {lead.company}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {lead.email} • {lead.phone || 'Sin cel'} • {lead.docType}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{lead.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 py-6 border-t border-slate-800/80 max-w-6xl mx-auto">
        PROCESA Consultores • Agente IA Empresarial de Documentos • RAG + SQLite + Gemini
      </div>
    </div>
  );
}
