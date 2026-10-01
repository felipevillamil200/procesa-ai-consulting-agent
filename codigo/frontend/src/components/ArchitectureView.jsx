import React from 'react';
import { 
  Layers, Cpu, ShieldCheck, DollarSign, Activity, Server, Database, 
  Search, FileText, ArrowRight, Zap, CheckCircle2, Lock, BarChart3
} from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-dot-grid bg-radial-ambient">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Hero Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/90 shadow-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full text-xs font-mono font-bold">
                  High-Availability Architecture
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-bold">
                  Zero Cloud Vector Lock-in
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-2">
                Arquitectura Híbrida del Asistente Inteligente
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Diseño desacoplado de alto rendimiento: Ingesta Pydantic v2 + Text-to-SQL Relacional + Motor RAG BM25 con Chunks In-Memory + Grounding Citable.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl shrink-0 text-center">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Latencia Promedio</div>
              <div className="text-xl font-extrabold font-mono text-cyan-400">~240 ms</div>
              <div className="text-[9px] text-emerald-400 font-mono">⚡ 100% In-Memory Cache</div>
            </div>
          </div>
        </div>

        {/* Visual Topology Diagram */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>Flujo de Datos y Topología de Ejecución</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              End-to-End Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative group hover:border-cyan-400 transition">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">1. Informes PDF</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Extracción con <code>pypdf</code> + sanitización UTF-8 de caracteres especiales.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative group hover:border-cyan-400 transition">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">2. Estructuración</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Esquema Pydantic v2 normalizado persistido en SQLite (<code>proyectos.db</code>).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative group hover:border-cyan-400 transition">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">3. Agente Autónomo</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Function Calling automático: SQL SELECT para datos duros + RAG para lecciones.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 relative group hover:border-cyan-400 transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">4. Grounding & Anti-Alucinación</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Citas documentales interactivas y rechazo explícito a sectores inexistentes.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">1. Base Relacional SQLite</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Almacenamiento ACID local sin dependencias pesadas. Permite agregaciones SQL instantáneas (promedios, ordenamiento por semanas y conteos).
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">2. Motor RAG Semántico BM25</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Indexación por chunks con ponderación de frecuencia inversa. Recuperación sub-milisegundo sin requerir bases de datos vectoriales en la nube de alto costo.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">3. Guardrails de Seguridad</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protección de solo lectura en consola SQL (bloqueo de DROP/DELETE/INSERT), prevención de inyección de código y trazabilidad completa de herramientas.
            </p>
          </div>
        </div>

        {/* Cost Analysis Section */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Estimación Económica para 50 Consultores Diarios
                </h3>
                <p className="text-[11px] text-slate-500">
                  Modelo de consumo optimizado con Google Gemini Flash / GPT-4o-mini
                </p>
              </div>
            </div>

            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full font-mono font-bold shadow-2xs">
              ~$3.63 USD / mes
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Componente</th>
                  <th className="p-3.5">Volumen Estimado</th>
                  <th className="p-3.5">Consumo Mensual (22 días hábiles)</th>
                  <th className="p-3.5 text-right">Costo Operativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Consultas al Agente (RAG + SQL)
                  </td>
                  <td className="p-3.5">500 queries / día (10 por consultor)</td>
                  <td className="p-3.5">11,000 queries / mes</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600">~$3.63 USD</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Tokens de Entrada / Salida
                  </td>
                  <td className="p-3.5">~500k input / ~150k output</td>
                  <td className="p-3.5 font-mono">11M in / 3.3M out</td>
                  <td className="p-3.5 text-right font-mono text-slate-500">&lt; $1.00 USD</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-emerald-500" />
                    Infraestructura & Vector DB
                  </td>
                  <td className="p-3.5">SQLite Local + Chunks en Memoria</td>
                  <td className="p-3.5">0 dependencias externas pagas</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600">$0.00 USD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
