import React, { useState } from 'react';
import SystemGuideModal from './SystemGuideModal';

// ════════════════════════════════════════════════════════════════════════
// BESPOKE SVG ICONS (Exact Geometric Style from Nival.html / MotionSites)
// ════════════════════════════════════════════════════════════════════════

// 1. Home Pentagon House Icon (Identical to Nival.html n-home)
function IconHome({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 8.4 10 2l8 6.4V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
    </svg>
  );
}

// 2. 4-Square Rounded Grid Icon (Identical to Nival.html n-grid)
function IconGrid({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="6.8" height="6.8" rx="1.8" />
      <rect x="11.7" y="1.5" width="6.8" height="6.8" rx="1.8" />
      <rect x="1.5" y="11.7" width="6.8" height="6.8" rx="1.8" />
      <rect x="11.7" y="11.7" width="6.8" height="6.8" rx="1.8" />
    </svg>
  );
}

// 3. Intelligent Chat Balloon (Geometric Apple/Nival standard)
function IconChat({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 9.5c0 3.866-3.134 7-7 7a7.2 7.2 0 0 1-2.9-.6L3 17l1.1-3.8A6.8 6.8 0 0 1 3 9.5C3 5.634 6.134 2.5 10 2.5s7 3.134 7 7z" />
    </svg>
  );
}

// 4. Relational Database / SQLite Cylinder
function IconDatabase({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className} aria-hidden="true">
      <ellipse cx="10" cy="4.8" rx="7.2" ry="2.6" />
      <path d="M2.8 4.8v4.8c0 1.4 3.2 2.6 7.2 2.6s7.2-1.2 7.2-2.6V4.8" />
      <path d="M2.8 9.6v4.8c0 1.4 3.2 2.6 7.2 2.6s7.2-1.2 7.2-2.6V9.6" />
    </svg>
  );
}

// 5. Architecture & Neural Nodes Network
function IconArchitecture({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10" cy="4.2" r="2.4" />
      <circle cx="4.5" cy="15.2" r="2.4" />
      <circle cx="15.5" cy="15.2" r="2.4" />
      <path d="M10 6.6v3.8m0 0-3.8 2.6m3.8-2.6 3.8 2.6" />
    </svg>
  );
}

// 6. Guía & Knowledge Circle
function IconGuide({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.8 7.8a2.4 2.4 0 0 1 4.2 1.6c0 1.4-2 1.9-2 3.2" />
      <circle cx="10" cy="15" r="0.5" fill="currentColor" />
    </svg>
  );
}

// 7. Settings / AI Config Gear
function IconSettings({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="2.8" />
      <path d="M10 2.2v2.2m0 11.2v2.2M2.2 10h2.2m11.2 0h2.2m-2.7-5.1-1.6 1.6m-7.6 7.6-1.6 1.6m0-10.8 1.6 1.6m7.6 7.6 1.6 1.6" />
    </svg>
  );
}

// 8. Trash / Clean Minimalist Bin
function IconTrash({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3.5 5.5h13M8 5.5V3.8a1.3 1.3 0 0 1 1.3-1.3h1.4a1.3 1.3 0 0 1 1.3 1.3v1.7m2.8 0v10.4a2 2 0 0 1-2 2h-5.6a2 2 0 0 1-2-2V5.5" />
    </svg>
  );
}

const TABS = [
  { id: 'chat', label: 'Chat Inteligente', icon: IconChat, badge: 'IA' },
  { id: 'fichas', label: 'Fichas Estructuradas', icon: IconGrid, badge: null },
  { id: 'sqlite', label: 'Explorador SQLite & CRUD', icon: IconDatabase, badge: 'SQL' },
  { id: 'arquitectura', label: 'Arquitectura & Costos', icon: IconArchitecture, badge: null }
];

export default function Header({ activeTab, onTabChange, onOpenConfig, onClearChat }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/70 px-6 flex items-center justify-between shrink-0 shadow-[0_2px_12px_rgba(28,52,92,0.03)] z-30 select-none">
        
        {/* Navigation Tabs Styled in Nival Pill Aesthetics */}
        <nav className="flex items-center gap-1.5 bg-white/85 p-1.5 rounded-full border border-white shadow-[0_0_0_1.2px_rgba(120,145,180,0.18),0_4px_14px_rgba(28,52,92,0.04)] backdrop-blur-xl">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <React.Fragment key={tab.id}>
                {idx > 0 && (
                  <div className="w-[1.2px] h-4 bg-slate-200/80 my-auto" />
                )}
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer btn-tactile ${
                    isActive
                      ? 'bg-[#0F1B31] text-white shadow-md shadow-[#0B1A32]/20 font-bold'
                      : 'text-[#202940] hover:text-black hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-cyan-300' : 'text-[#202940]'}`} />
                  <span className="tracking-tight">{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Top Actions Floating Pill */}
        <div className="flex items-center gap-2">
          
          {/* Action Pills Container (Inicio, Guía, Solución & Config) */}
          <div className="flex items-center gap-1 bg-white/85 p-1 rounded-full border border-white shadow-[0_0_0_1.2px_rgba(120,145,180,0.18),0_4px_14px_rgba(28,52,92,0.04)] backdrop-blur-xl">
            
            {/* Inicio Hero 3D */}
            <a
              href="/inicio.html"
              className="px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile"
              title="Ir a la página de Inicio Hero 3D"
            >
              <IconHome className="w-3.5 h-3.5 text-[#202940]" />
              <span>Inicio</span>
            </a>

            <div className="w-[1.2px] h-4 bg-slate-200/80 my-auto" />

            {/* Guía Técnica */}
            <a
              href="/guia.html"
              className="px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile"
              title="Ver la Guía Técnica & Arquitectura"
            >
              <IconGuide className="w-3.5 h-3.5 text-[#202940]" />
              <span>Guía</span>
            </a>

            <div className="w-[1.2px] h-4 bg-slate-200/80 my-auto" />

            {/* Solución & Demostración */}
            <a
              href="/solucion.html"
              className="px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile"
              title="Ver la Solución & Simulador"
            >
              <IconGrid className="w-3.5 h-3.5 text-[#202940]" />
              <span>Solución</span>
            </a>

            <div className="w-[1.2px] h-4 bg-slate-200/80 my-auto" />

            {/* Configuración AI */}
            <button
              onClick={onOpenConfig}
              className="px-3 py-1.5 text-xs text-[#202940] hover:bg-slate-100/70 rounded-full transition-all duration-150 flex items-center gap-1 font-semibold cursor-pointer btn-tactile"
              title="Configurar Proveedor de IA, Modelo y Parámetros"
            >
              <IconSettings className="w-3.5 h-3.5 text-[#202940]" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>

          {/* Limpiar Chat */}
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-full transition-all duration-150 flex items-center gap-1.5 font-medium border border-slate-200/70 bg-white/70 shadow-2xs cursor-pointer btn-tactile"
            title="Limpiar mensajes del chat"
          >
            <IconTrash className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
      </header>

      {/* Modal de Guía Explicativa del Sistema */}
      <SystemGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
