import React,{useState,useEffect} from 'react';
import {X,ArrowLeft,ArrowRight,ExternalLink} from 'lucide-react';
import {api,getApiBase} from '../services/api';

export default function EvidenceInspector({evidenceData,onClose,fichas=[]}) {
  const code=evidenceData?.projectCode || evidenceData?.activeSource || '';
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState('');
  const [page,setPage]=useState(1);
  const [tab,setTab]=useState('text');
  useEffect(()=>{
    let active=true;setPreview(null);setError('');
    setPage(evidenceData?.chunks?.[0]?.pagina || 1);
    if(code) api.getDocumentPreview(code).then(r=>{if(active)setPreview(r);}).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;};
  },[code]);
  if(!evidenceData) return null;
  const ficha=fichas.find(f=>f.codigo_proyecto===code);
  const pages=preview?.pages || [];
  const current=pages.find(p=>p.page_number===page);
  const url=`${getApiBase()}/api/pdf/${encodeURIComponent(code)}#page=${page}`;
  const chunks=(evidenceData.chunks || []).filter(c=>c.codigo_proyecto===code && c.pagina===page);
  return <aside className="w-full md:w-[540px] lg:w-[620px] bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-30">
    <div className="p-4 border-b flex justify-between gap-2"><div><h2 className="font-bold text-slate-900">{preview?.cliente || ficha?.cliente || 'Evidencia documental'}</h2><p className="text-xs text-slate-500 break-all">{code} · {preview?.filename}</p></div><button onClick={onClose} aria-label="Cerrar evidencia" className="min-h-10 min-w-10"><X size={20}/></button></div>
    <div className="flex gap-2 p-3 border-b">{[['text','Texto y citas'],['pdf','PDF original'],['fields','Campos extraídos']].map(([id,title])=><button key={id} onClick={()=>setTab(id)} className={`min-h-10 px-3 rounded-lg text-sm ${tab===id?'bg-slate-900 text-white':'bg-slate-100 text-slate-700'}`}>{title}</button>)}</div>
    {error?<p role="alert" className="p-5 text-red-700">{error}. No se sustituirá por otro documento.</p>:!preview?<p className="p-5 text-slate-500">Cargando documento…</p>:<>
      <div className="flex justify-between items-center gap-2 p-3 border-b text-sm"><button aria-label="Página anterior" disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="min-h-10 px-3 disabled:opacity-30"><ArrowLeft size={18}/></button><span>Página {page} de {pages.length}</span><button aria-label="Página siguiente" disabled={page>=pages.length} onClick={()=>setPage(p=>p+1)} className="min-h-10 px-3 disabled:opacity-30"><ArrowRight size={18}/></button><a href={url} target="_blank" rel="noopener noreferrer" aria-label="Abrir PDF original" className="min-h-10 px-3 flex items-center"><ExternalLink size={18}/></a></div>
      {tab==='pdf'?<iframe src={url} title={`PDF ${preview.filename}`} className="w-full flex-1 min-h-0"/>:<div className="p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
        {tab==='fields'?<><p className="text-sm text-slate-600">{ficha?.resumen || ficha?.objetivo_general}</p><dl className="space-y-3">{(ficha?.campos || []).map((f,i)=><div key={i} className="rounded-lg border p-3 text-sm"><dt className="font-semibold">{f.name}</dt><dd>{f.value}<p className="text-xs text-slate-500 mt-1">Página {f.page_number} · {f.quote}</p></dd></div>)}</dl>{!ficha?.campos?.length && <p className="text-sm text-slate-500">Consulta el texto original; este documento no tiene campos genéricos extraídos.</p>}</>:<>
          {chunks.length>0 && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 space-y-2"><h3 className="text-sm font-semibold">Fragmentos consultados en esta página</h3>{chunks.map((c,i)=><p key={i} className="text-sm whitespace-pre-wrap"><mark className="bg-yellow-200">{c.contenido}</mark></p>)}</div>}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{current?.text || 'No hay texto disponible en esta página.'}</p>
        </>}
      </div>}
    </>}
  </aside>;
}
