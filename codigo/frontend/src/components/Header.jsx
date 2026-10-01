import React, { useState } from 'react';
import { MessageSquare, Table, Database, Network, Settings, Trash2, HelpCircle, Sparkles, Home } from 'lucide-react';
import SystemGuideModal from './SystemGuideModal';

const TABS = [
  { id: 'chat', label: 'Chat Inteligente', icon: MessageSquare, badge: 'IA' },
  { id: 'fichas', label: 'Fichas Estructuradas', icon: Table, badge: null },
  { id: 'sqlite', label: 'Explorador SQLite & CRUD', icon: Database, badge: 'SQL' },
  { id: 'arquitectura', label: 'Arquitectura & Costos', icon: Network, badge: null }
];

export default function Header({ activeTab, onTabChange, onOpenConfig, onClearChat }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="h-16 glass-panel border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-xs z-30 select-none">
        {/* Navigation Tabs Segmented Control */}
        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/70">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer btn-tactile ${
                  isActive
                    ? 'bg-white text-cyan-800 shadow-sm border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Top Actions Floating Bar */}
        <div className="flex items-center gap-2">
          {/* Botón de Inicio / Presentación Comercial */}
          <button
            onClick={() => onTabChange('inicio')}
            className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-150 flex items-center gap-1.5 font-bold border shadow-xs cursor-pointer btn-tactile ${
              activeTab === 'inicio'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                : 'text-slate-700 bg-white hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border-slate-200'
            }`}
            title="Ir a la página de Inicio y Presentación de la Solución"
          >
            <Home className={`w-3.5 h-3.5 ${activeTab === 'inicio' ? 'text-white' : 'text-cyan-600'}`} />
            <span>Inicio</span>
          </button>

          {/* Botón de Ayuda y Guía del Sistema */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 rounded-xl transition-all duration-150 flex items-center gap-1.5 font-semibold border border-slate-200 shadow-xs cursor-pointer btn-tactile"
            title="Guía del Sistema: Explicación de cada módulo y funcionalidad"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
            <span>Guía</span>
          </button>

          {/* Configuración AI */}
          <button
            onClick={onOpenConfig}
            className="px-3.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 rounded-xl transition-all duration-150 flex items-center gap-1.5 font-semibold border border-slate-200 shadow-xs cursor-pointer btn-tactile"
            title="Configurar Proveedor de IA, Modelo y Parámetros"
          >
            <Settings className="w-3.5 h-3.5 text-blue-600" />
            <span>Configuración AI</span>
          </button>

          {/* Limpiar Chat */}
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all duration-150 flex items-center gap-1.5 font-medium border border-transparent cursor-pointer btn-tactile"
            title="Limpiar mensajes del chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
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
