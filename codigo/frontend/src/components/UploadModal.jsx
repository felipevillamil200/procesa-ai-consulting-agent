import React, {useState} from 'react';
import {X,UploadCloud,Loader2} from 'lucide-react';

export default function UploadModal({isOpen,onClose,onUploadSuccess}) {
  const [files,setFiles]=useState([]);
  const [busy,setBusy]=useState(false);
  const [results,setResults]=useState([]);
  if (!isOpen) return null;
  const choose = list => { setFiles(Array.from(list)); setResults([]); };
  const upload=async()=>{
    setBusy(true); setResults([]);
    for (const file of files) {
      try {
        if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Solo se admiten PDFs.');
        if (file.size > 15*1024*1024) throw new Error('El archivo supera 15 MB.');
        const result=await onUploadSuccess(file);
        if (!result.success) throw new Error(result.detail || 'No se pudo cargar.');
        setResults(prev=>[...prev,{name:file.name,ok:true,message:`Documento disponible: ${(result.documento || result.proyecto).cliente}`,warnings:result.warnings || []}]);
      } catch (error) { setResults(prev=>[...prev,{name:file.name,ok:false,message:error.message}]); }
    }
    setBusy(false);
  };
  return <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="upload-title" className="font-bold text-lg text-slate-900">Añadir documentos PDF</h2><p className="text-sm text-slate-500">Facturas, contratos, informes, manuales y otros documentos.</p></div>
        <button onClick={onClose} disabled={busy} aria-label="Cerrar" className="min-h-10 min-w-10 flex items-center justify-center rounded-lg hover:bg-slate-100"><X size={20}/></button>
      </div>
      <label className="block border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:border-cyan-500" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)choose(e.dataTransfer.files);}}>
        <UploadCloud className="text-cyan-600 mb-2"/><span className="font-medium">Selecciona varios PDFs o arrástralos aquí</span>
        <input type="file" multiple accept=".pdf,application/pdf" disabled={busy} onChange={e=>choose(e.target.files)} className="block w-full mt-3 text-sm"/>
      </label>
      <p className="text-xs text-slate-600">Hasta 15 MB y 200 páginas por archivo. La Inteligencia Artificial permite lectura visual de PDFs escaneados cuando está configurada. Si no hay texto legible ni lectura visual disponible, la carga se rechaza con una explicación.</p>
      <ul className="text-sm space-y-1">{files.map((f,i)=><li key={i}>{f.name} · {(f.size/1024/1024).toFixed(2)} MB</li>)}</ul>
      <div aria-live="polite" className="space-y-2">{results.map((r,i)=><div key={i} className={`p-3 rounded-lg text-sm ${r.ok?'bg-emerald-50 text-emerald-900':'bg-red-50 text-red-900'}`}><strong>{r.name}</strong><p>{r.message}</p>{r.warnings?.map((w,j)=><p key={j} className="text-amber-800 mt-1">{w}</p>)}</div>)}</div>
      <div className="flex justify-end gap-2"><button onClick={onClose} disabled={busy} className="min-h-10 px-4 rounded-lg border border-slate-200">Cerrar</button><button disabled={busy || !files.length} onClick={upload} className="min-h-10 px-4 rounded-lg bg-cyan-700 text-white disabled:opacity-50 flex items-center gap-2">{busy && <Loader2 className="animate-spin" size={16}/>} {busy?'Leyendo documentos…':`Cargar ${files.length || ''} documento(s)`}</button></div>
    </div>
  </div>;
}
