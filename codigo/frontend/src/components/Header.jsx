import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// 8. Admin / Shield Settings Badge
function IconAdmin({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 2.5 3.5 5.5v5c0 4.5 3.5 7 6.5 7.5 3-.5 6.5-3 6.5-7.5v-5L10 2.5z" />
      <path d="M7.5 10.2 9.2 12l3.6-3.8" />
    </svg>
  );
}

// 9. Hamburger Menu Icon for Mobile
function IconMenu({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

// 10. Collapse / Expand Arrow Toggle Icon
function IconCollapseToggle({ isCollapsed, className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`${className} transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true">
      {/* Default: points right > to collapse rightwards; Rotated 180: points left < to expand */}
      <path d="M7.5 4.5l5.5 5.5-5.5 5.5" />
    </svg>
  );
}

const TABS = [
  { id: 'chat', label: 'Chat Inteligente', shortLabel: 'Chat', icon: IconChat, badge: 'IA' },
  { id: 'fichas', label: 'Fichas Estructuradas', shortLabel: 'Fichas', icon: IconGrid, badge: null },
  { id: 'sqlite', label: 'Explorador SQLite', shortLabel: 'SQLite', icon: IconDatabase, badge: 'SQL' },
  { id: 'arquitectura', label: 'Arquitectura & Costos', shortLabel: 'Arquitectura', icon: IconArchitecture, badge: null }
];

export default function Header({ activeTab, onTabChange, onOpenConfig, onClearChat, onToggleMobileSidebar }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showInitialHint, setShowInitialHint] = useState(true);
  const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);
  const navRef = useRef(null);

  // El indicador fantasma solo aparece UNA SOLA VEZ cuando se recarga la página
  useEffect(() => {
    setShowInitialHint(true);
    const timer = setTimeout(() => {
      setShowInitialHint(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  // Si el usuario toca o desliza la barra antes del tiempo, se desvanece de inmediato
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const handleInteract = () => {
      setShowInitialHint(false);
    };

    el.addEventListener('scroll', handleInteract, { passive: true });
    el.addEventListener('touchstart', handleInteract, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleInteract);
      el.removeEventListener('touchstart', handleInteract);
    };
  }, []);

  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  return (
    <>
      <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-2 sm:px-6 flex items-center justify-between shrink-0 shadow-[0_2px_12px_rgba(28,52,92,0.03)] z-30 select-none gap-2">
        
        {/* Left Section: Mobile Hamburger Toggle + Navigation Tabs (takes flex-1 to expand dynamically) */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 transition-all duration-300 ease-out">
          {/* Mobile Hamburger Drawer Button */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-black hover:bg-slate-100/90 active:bg-slate-200 transition shrink-0 cursor-pointer btn-tactile min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Abrir menú y documentos fuente"
              aria-label="Abrir menú lateral"
            >
              <IconMenu className="w-5 h-5 text-slate-800" />
            </button>
          )}

          {/* Navigation Tabs Container with Interactive Scroll (grows to fill all available width) */}
          <div className="relative flex items-center min-w-0 flex-1 transition-all duration-300 ease-out">
            
            {/* Navigation Tabs Styled in Nival Pill Aesthetics */}
            <nav 
              ref={navRef}
              className="flex items-center gap-1 bg-white/85 p-1 rounded-full border border-white shadow-[0_0_0_1.2px_rgba(120,145,180,0.18),0_4px_14px_rgba(28,52,92,0.04)] backdrop-blur-xl overflow-x-auto no-scrollbar touch-pan-x min-w-0 max-w-full scroll-smooth w-full"
            >
              {TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <React.Fragment key={tab.id}>
                    {idx > 0 && (
                      <div className="w-[1.2px] h-3.5 sm:h-4 bg-slate-200/80 my-auto shrink-0 hidden sm:block" />
                    )}
                    <button
                      onClick={() => onTabChange(tab.id)}
                      data-active={isActive ? 'true' : 'false'}
                      className={`relative px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer btn-tactile shrink-0 ${
                        isActive
                          ? 'bg-[#0F1B31] text-white shadow-md shadow-[#0B1A32]/20 font-bold'
                          : 'text-[#202940] hover:text-black hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 transition-colors shrink-0 ${isActive ? 'text-cyan-300' : 'text-[#202940]'}`} />
                      <span className="tracking-tight hidden md:inline">{tab.label}</span>
                      <span className="tracking-tight md:hidden">{tab.shortLabel}</span>
                      {tab.badge && (
                        <span className={`text-[9px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
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

            {/* Right Ghost Cue Indicator: ONLY appears ONCE on page reload, then disappears forever */}
            {showInitialHint && (
              <div
                className="absolute right-0 inset-y-0 z-20 flex items-center pr-1 pl-6 bg-gradient-to-l from-white via-white/95 to-transparent rounded-r-full md:hidden select-none pointer-events-none transition-all duration-700 ease-out animate-fade-in"
              >
                <span className="flex items-center gap-1 bg-[#0F1B31] text-cyan-300 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-md shadow-cyan-950/30 border border-cyan-400/40 animate-pulse">
                  <span>Desliza</span>
                  <svg className="w-3 h-3 text-cyan-300 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Right Section: Action Pills + Toggle Collapse/Expand Button */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Collapsible Action Pills Container (Inicio, Guía, Solución & Config) */}
          <div className={`flex items-center gap-1 bg-white/85 p-1 rounded-full border border-white shadow-[0_0_0_1.2px_rgba(120,145,180,0.18),0_4px_14px_rgba(28,52,92,0.04)] backdrop-blur-xl transition-all duration-300 ease-out overflow-hidden ${
            isActionsCollapsed 
              ? 'max-w-0 opacity-0 p-0 m-0 border-0 pointer-events-none' 
              : 'max-w-[420px] opacity-100'
          }`}>
            
            {/* Inicio Hero 3D */}
            <a
              href="/inicio.html"
              className="px-2.5 sm:px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile shrink-0"
              title="Ir a la página de Inicio Hero 3D"
            >
              <IconHome className="w-3.5 h-3.5 text-[#202940]" />
              <span className="hidden md:inline">Inicio</span>
            </a>

            <div className="w-[1.2px] h-3.5 sm:h-4 bg-slate-200/80 my-auto shrink-0" />

            {/* Guía Técnica */}
            <a
              href="/guia.html"
              className="px-2.5 sm:px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile shrink-0"
              title="Ver la Guía Técnica & Arquitectura"
            >
              <IconGuide className="w-3.5 h-3.5 text-[#202940]" />
              <span className="hidden md:inline">Guía</span>
            </a>

            <div className="w-[1.2px] h-3.5 sm:h-4 bg-slate-200/80 my-auto shrink-0" />

            {/* Solución & Demostración */}
            <a
              href="/solucion.html"
              className="px-2.5 sm:px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 flex items-center gap-1.5 font-semibold text-[#202940] hover:text-sky-700 hover:bg-slate-100/70 cursor-pointer btn-tactile shrink-0"
              title="Ver la Solución & Simulador"
            >
              <IconGrid className="w-3.5 h-3.5 text-[#202940]" />
              <span className="hidden md:inline">Solución</span>
            </a>

            <div className="w-[1.2px] h-3.5 sm:h-4 bg-slate-200/80 my-auto shrink-0" />

            {/* Configuración AI */}
            <button
              onClick={onOpenConfig}
              className="px-2.5 sm:px-3 py-1.5 text-xs text-[#202940] hover:bg-slate-100/70 rounded-full transition-all duration-150 flex items-center gap-1 font-semibold cursor-pointer btn-tactile shrink-0"
              title="Configurar Proveedor de IA, Modelo y Parámetros"
            >
              <IconSettings className="w-3.5 h-3.5 text-[#202940]" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>

          {/* Toggle Button: Ocultar / Mostrar Accesos para dar Máximo Espacio a las Pestañas */}
          <button
            type="button"
            onClick={() => setIsActionsCollapsed(prev => !prev)}
            className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer btn-tactile shrink-0 ${
              isActionsCollapsed
                ? 'bg-[#0F1B31] text-cyan-300 border-[#0F1B31] shadow-md shadow-[#0F1B31]/20'
                : 'bg-white/85 text-[#202940] hover:text-black border-white shadow-[0_0_0_1.2px_rgba(120,145,180,0.18),0_2px_8px_rgba(28,52,92,0.04)] hover:bg-slate-100/80'
            }`}
            title={isActionsCollapsed ? "Mostrar accesos directos (Inicio, Guía, Config)" : "Ocultar accesos para dar máximo espacio a las pestañas"}
            aria-label={isActionsCollapsed ? "Mostrar accesos" : "Ocultar accesos"}
          >
            <IconCollapseToggle isCollapsed={isActionsCollapsed} className="w-4 h-4" />
          </button>

          {/* Badge Admin (Informativo / Decorativo) */}
          <div
            className="px-2.5 sm:px-3 py-1.5 text-xs text-slate-700 bg-white/80 rounded-full border border-slate-200/70 shadow-2xs flex items-center gap-1.5 font-semibold shrink-0 select-none cursor-default"
            title="Usuario Administrador"
          >
            <IconAdmin className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Admin</span>
          </div>
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
