import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import FichasView from './components/FichasView';
import SqlExplorerView from './components/SqlExplorerView';
import ArchitectureView from './components/ArchitectureView';
import ConfigModal from './components/ConfigModal';
import UploadModal from './components/UploadModal';
import { api } from './services/api';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `¡Hola! Soy tu asistente técnico de inteligencia artificial. Puedo responder preguntas sobre los informes de cierre de proyectos terminados (Financiero, Manufactura, Salud y Retail) combinando consultas a la **Base de Datos Relacional (SQLite)** y búsqueda profunda en los **PDFs originales (RAG)**.\n\nPrueba haciendo una pregunta abajo o eligiendo una opción del menú lateral.`,
  tools_used: [],
  sources: [],
  found_info: true
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [projects, setProjects] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [config, setConfig] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

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
  const handleSendMessage = async (question) => {
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(question);
      if (res.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.answer,
          tools_used: res.tools_used || [],
          sources: res.sources || [],
          found_info: res.found_info !== false
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
  const handleSaveConfig = async (apiKey, model) => {
    const res = await api.updateConfig(apiKey, model);
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

  // Delete project
  const handleDeleteProject = async (codigo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el proyecto ${codigo} de SQLite y del motor RAG?`)) {
      return;
    }
    try {
      const res = await api.deleteProject(codigo);
      if (res.success) {
        await loadInitialData();
      } else {
        alert('Error eliminando proyecto: ' + (res.detail || ''));
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    }
  };

  // Reset official projects
  const handleResetProjects = async () => {
    if (!window.confirm('¿Deseas restaurar la base de datos a los 4 proyectos oficiales de Procesa Consultores?')) {
      return;
    }
    try {
      const res = await api.resetProjects();
      if (res.success) {
        await loadInitialData();
        alert('✓ ¡Base de datos y RAG restaurados con los 4 proyectos oficiales!');
      }
    } catch (err) {
      alert('Error restaurando proyectos: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden">
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
      </main>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
