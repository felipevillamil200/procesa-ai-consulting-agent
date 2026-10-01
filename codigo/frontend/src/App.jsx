import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import FichasView from './components/FichasView';
import SqlExplorerView from './components/SqlExplorerView';
import ArchitectureView from './components/ArchitectureView';
import LandingView from './components/LandingView';
import ConfigModal from './components/ConfigModal';
import UploadModal from './components/UploadModal';
import ConfirmModal from './components/ConfirmModal';
import { api } from './services/api';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `¡Hola! Soy tu asistente técnico de inteligencia artificial. Puedo responder preguntas sobre los informes de cierre de proyectos terminados (Financiero, Manufactura, Salud y Retail) combinando consultas a la **Base de Datos Relacional (SQLite)** y búsqueda profunda en los **PDFs originales (RAG)**.\n\nPrueba haciendo una pregunta abajo o eligiendo una opción del menú lateral.`,
  tools_used: [],
  sources: [],
  found_info: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['chat', 'fichas', 'sqlite', 'arquitectura', 'inicio'].includes(tabParam)) {
      return tabParam;
    }
    const hash = window.location.hash.replace('#', '');
    if (hash && ['chat', 'fichas', 'sqlite', 'arquitectura', 'inicio'].includes(hash)) {
      return hash;
    }
    return 'chat'; // Default direct entry to Chat Inteligente
  });
  const [projects, setProjects] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [config, setConfig] = useState(null);
  const [isMonochrome, setIsMonochrome] = useState(() => {
    return localStorage.getItem('ui_monochrome') === 'true';
  });
  const [uiDensity, setUiDensity] = useState(() => {
    return localStorage.getItem('ui_density') || 'comfortable';
  });
  const [uiScrollbarsVisible, setUiScrollbarsVisible] = useState(() => {
    return localStorage.getItem('ui_scrollbars') !== 'false';
  });
  const [uiAnimations, setUiAnimations] = useState(() => {
    return localStorage.getItem('ui_animations') !== 'false';
  });
  
  // Chat state
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // In-App Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    isLoading: false,
    onConfirm: null
  });

  // Load all initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [projRes, fichasRes, configRes] = await Promise.all([
        api.getProjects(),
        api.getFichas(),
        api.getConfig()
      ]);

      if (projRes.success) setProjects(projRes.proyectos || []);
      if (fichasRes.success) setFichas(fichasRes.fichas || []);
      if (configRes.success) setConfig(configRes);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle chat message sending
  const handleSendMessage = async (question, attachedDoc = null) => {
    const userMsg = { 
      role: 'user', 
      content: question,
      attachedDoc: attachedDoc ? { ...attachedDoc } : null
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // If an attached document is present and not explicitly mentioned, inject target focus
    let finalQuery = question;
    if (attachedDoc && attachedDoc.codigo_proyecto && !question.toUpperCase().includes(attachedDoc.codigo_proyecto.toUpperCase())) {
      finalQuery = `[Foco en informe ${attachedDoc.codigo_proyecto} - ${attachedDoc.cliente}]: ${question}`;
    }

    try {
      const res = await api.sendMessage(finalQuery);
      if (res.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.answer,
          tools_used: res.tools_used || [],
          sources: res.sources || [],
          found_info: res.found_info !== false,
          evidence_chunks: res.evidence_chunks || []
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `**Error:** ${res.detail || 'Ocurrió un error al procesar tu consulta.'}`,
            tools_used: [],
            sources: [],
            found_info: false
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**Error de Conexión:** No se pudo conectar con el servidor backend (${err.message}).`,
          tools_used: [],
          sources: [],
          found_info: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select quick prompt from sidebar
  const handleSelectPrompt = (promptText) => {
    setActiveTab('chat');
    setPendingPrompt(promptText);
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `**Chat Reiniciado.** ¿Qué otra pregunta deseas consultar sobre los informes históricos?`,
      tools_used: [],
      sources: [],
      found_info: true
    }]);
  };

  // Save config
  const handleSaveConfig = async (apiKey, model, provider, temperature) => {
    const res = await api.updateConfig(apiKey, model, provider, temperature);
    if (res.success) {
      const updatedConfig = await api.getConfig();
      if (updatedConfig.success) setConfig(updatedConfig);
    }
    return res;
  };

  // Upload PDF success
  const handleUploadSuccess = async (file) => {
    const res = await api.uploadPDF(file);
    if (res.success) {
      await loadInitialData();
    }
    return res;
  };

  // Delete project trigger
  const handleDeleteProject = (codigo) => {
    setConfirmModal({
      isOpen: true,
      title: `Eliminar Proyecto ${codigo}`,
      message: `¿Estás seguro de que deseas eliminar permanentemente el proyecto ${codigo}? Se eliminará del esquema relacional SQLite ('proyectos.db'), de las fichas estructuradas y del índice vectorial RAG.`,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await api.deleteProject(codigo);
          if (res.success) {
            await loadInitialData();
            setConfirmModal({ isOpen: false });
          } else {
            setConfirmModal((prev) => ({
              ...prev,
              isLoading: false,
              message: `Error al eliminar: ${res.detail || 'Ocurrió un error inesperado'}`
            }));
          }
        } catch (err) {
          setConfirmModal((prev) => ({
            ...prev,
            isLoading: false,
            message: `Error de conexión: ${err.message}`
          }));
        }
      }
    });
  };

  // Reset official projects trigger
  const handleResetProjects = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar Proyectos Oficiales',
      message: '¿Deseas restablecer la base de datos y el motor RAG a los 4 proyectos oficiales de la prueba técnica de Procesa Consultores?',
      confirmText: 'Sí, Restaurar',
      cancelText: 'Cancelar',
      type: 'warning',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await api.resetProjects();
          if (res.success) {
            await loadInitialData();
            setConfirmModal({ isOpen: false });
          } else {
            setConfirmModal((prev) => ({
              ...prev,
              isLoading: false,
              message: `Error al restaurar: ${res.detail || 'No se pudo completar la restauración'}`
            }));
          }
        } catch (err) {
          setConfirmModal((prev) => ({
            ...prev,
            isLoading: false,
            message: `Error de conexión: ${err.message}`
          }));
        }
      }
    });
  };

  const rootClasses = [
    'h-screen flex overflow-hidden text-slate-800 transition-all duration-200',
    isMonochrome ? 'monochrome-mode bg-slate-100' : 'bg-slate-50',
    uiDensity === 'compact' ? 'compact-mode' : '',
    !uiScrollbarsVisible ? 'hide-scrollbars' : '',
    !uiAnimations ? 'no-animations' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClasses}>
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        onSelectPrompt={handleSelectPrompt}
        config={config}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenConfig={() => setIsConfigOpen(true)}
          onClearChat={handleClearChat}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            pendingPrompt={pendingPrompt}
            onClearPendingPrompt={() => setPendingPrompt(null)}
            fichas={fichas}
          />
        )}

        {activeTab === 'fichas' && (
          <FichasView fichas={fichas} />
        )}

        {activeTab === 'sqlite' && (
          <SqlExplorerView
            projects={projects}
            onOpenUpload={() => setIsUploadOpen(true)}
            onResetProjects={handleResetProjects}
            onDeleteProject={handleDeleteProject}
            onAskChat={(q) => handleSelectPrompt(q)}
            onExecuteSql={(q) => api.executeSQL(q)}
          />
        )}

        {activeTab === 'arquitectura' && (
          <ArchitectureView />
        )}

        {(activeTab === 'inicio' || activeTab === 'leads') && (
          <LandingView onNavigateToChat={() => setActiveTab('chat')} />
        )}
      </main>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        isMonochrome={isMonochrome}
        onToggleMonochrome={(val) => setIsMonochrome(val)}
        uiDensity={uiDensity}
        onToggleDensity={(val) => setUiDensity(val)}
        uiScrollbarsVisible={uiScrollbarsVisible}
        onToggleScrollbars={(val) => setUiScrollbarsVisible(val)}
        uiAnimations={uiAnimations}
        onToggleAnimations={(val) => setUiAnimations(val)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
