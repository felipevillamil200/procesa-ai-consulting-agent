import React from 'react';
import { Layers, Cpu, ShieldCheck, DollarSign, Activity } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-slate-50">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Arquitectura Híbrida del Sistema</h2>
          <p className="text-sm text-slate-500 mt-1">
            Diseño desacoplado: Ingesta Estructurada + Text-to-SQL Relacional + RAG Semántico BM25 + Control de Trazabilidad.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Ingesta y Extracción</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los PDFs son procesados por <code>pypdf</code> y transformados en fichas tipadas mediante <strong>Pydantic v2</strong>, guardadas en <strong>SQLite</strong> e indexadas por fragmentos semánticos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. Agente con Function Calling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El LLM (Google Gemini / OpenAI) decide autónomamente si consultar la base de datos (<code>query_project_database</code>) o buscar texto en los PDFs (<code>search_project_documents</code>).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Citas y Anti-Alucinación</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toda afirmación incluye el código y nombre del proyecto. Si una consulta indaga sobre temas inexistentes, el agente declara explícitamente que no hay datos disponibles.
            </p>
          </div>
        </div>

        {/* Cost Analysis Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Estimación Económica para 50 Consultores Diarios
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              ~$3.63 USD / mes
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Métrica</th>
                  <th className="p-3">Valor Diario</th>
                  <th className="p-3">Valor Mensual (22 días)</th>
                  <th className="p-3">Costo con Gemini / GPT-4o-mini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-medium">Volumen de Consultas</td>
                  <td className="p-3">500 queries/día (10 por consultor)</td>
                  <td className="p-3">11,000 queries/mes</td>
                  <td className="p-3 text-emerald-600 font-bold font-mono">~$3.63 USD / mes</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Tokens Consumidos</td>
                  <td className="p-3">~500k input / ~150k output</td>
                  <td className="p-3">11M input / 3.3M output</td>
                  <td className="p-3 text-slate-500 font-mono">Costo casi nulo</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Infraestructura Base</td>
                  <td className="p-3">SQLite Local + RAG en Memoria</td>
                  <td className="p-3">0 servidores externos de vectores</td>
                  <td className="p-3 text-emerald-600 font-bold font-mono">$0.00 USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
