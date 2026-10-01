import React, { useState } from 'react';
import { MessageSquare, Table, Database, Network, Settings, Trash2, HelpCircle } from 'lucide-react';
import SystemGuideModal from './SystemGuideModal';

const TABS = [
  { id: 'chat', label: 'Chat Inteligente', icon: MessageSquare },
  { id: 'fichas', label: 'Fichas Estructuradas', icon: Table },
  { id: 'sqlite', label: 'Explorador SQLite & CRUD', icon: Database },
  { id: 'arquitectura', label: 'Arquitectura & Costos', icon: Network }
];

export default function Header({ activeTab, onTabChange, onOpenConfig, onClearChat }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {/* Botón de Ayuda y Guía del Sistema */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 rounded-xl transition flex items-center gap-1.5 font-semibold border border-slate-200 shadow-xs cursor-pointer"
            title="Guía del Sistema: Explicación de cada módulo y funcionalidad"
          >
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>Guía del Sistema</span>
          </button>

          <button
            onClick={onOpenConfig}
            className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 rounded-xl transition flex items-center gap-2 font-semibold border border-slate-300 shadow-sm cursor-pointer"
            title="Configurar Proveedor de IA, Modelo y Parámetros"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-600" />
            <span>Configuración AI</span>
          </button>

          <button
            onClick={onClearChat}
            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 font-medium border border-slate-200 cursor-pointer"
            title="Limpiar mensajes del chat"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
            <span>Limpiar Chat</span>
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
