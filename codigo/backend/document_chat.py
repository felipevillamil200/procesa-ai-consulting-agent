"""Consulta de documentos heterogéneos con citas verificadas por página y soporte LLM universal."""
import os
import re
import time
from codigo.backend.documents import (
    DocumentStore,
    DocumentCitation,
    GroundedAnswer,
    gemini_json,
    openai_json,
    normalized,
    provider_error_reason,
)
from codigo.backend.prompts import load_prompt

STOPWORDS = set('que cual cuales es el la los las un una de del en a y o por para como mi este esta esto documento documentos informe informes factura facturas contrato contratos contiene cual cuanto cuantos sobre foco resume resumir resumen dime dar detalle favor exclusivamente analiza'.split())


class UnverifiedSummary(ValueError):
    """Una síntesis amplia inválida puede sustituirse por extractos, nunca inventarse."""


def number_tokens(text, *, answer=False):
    """Extrae tokens numéricos normalizados para verificación."""
    from decimal import Decimal
    text = re.sub(r'\b(?:DOC-[A-Fa-f0-9]{16}|PC-\d{4}-\d{3})\b', '', text)
    if answer:
        text = re.sub(r'(?m)^\s*(?:#{1,6}\s+)?(?:\*\*)?\d{1,3}[.)]\s+', '', text)
    numbers = set()
    for value in re.findall(r'(?<![a-zA-Z])\d+(?:[.,]\d+)*', text):
        if ',' in value and '.' in value:
            decimal = ',' if value.rfind(',') > value.rfind('.') else '.'
            value = value.replace('.' if decimal == ',' else ',', '').replace(decimal, '.')
        elif ',' in value or '.' in value:
            parts = re.split(r'[.,]', value)
            if all(len(part) == 3 for part in parts[1:]):
                value = ''.join(parts)
            else:
                value = ''.join(parts[:-1]) + '.' + parts[-1]
        try:
            numbers.add(str(Decimal(value).normalize()))
        except Exception:
            pass
    return numbers


def answer_documents(agent, question, document_ids=None, history=None):
    """
    Motor universal de respuesta sobre documentos PDF.
    Aprovecha la capacidad natural de los LLMs modernos (OpenAI / Gemini) basándose en prompts y RAG.
    """
    from codigo.backend.agent import AgentResponse, ToolExecutionLog
    store = DocumentStore(agent.db_manager.db_path, agent.search_engine.reports_dir)
    available = {d['document_id']: d for d in store.list()}
    ids = list(dict.fromkeys(document_ids or re.findall(r'\bDOC-[A-Fa-f0-9]{16}\b', question)))
    ids = [i.upper() for i in ids]
    if not ids:
        ids = list(available)

    # Resolver fuentes por identidad exacta si están en el índice
    for code in ids:
        if code not in available:
            preview = agent.search_engine.get_document_preview(code)
            if preview:
                available[code] = {
                    'document_id': code,
                    'title': preview.get('cliente', code),
                    'document_type': 'informe',
                    'fields': [],
                    'pages': preview.get('pages', []),
                    'summary': '',
                    'filename': preview.get('filename', f'{code}.pdf'),
                }

    missing = [i for i in ids if i not in available]
    if missing or not ids:
        return AgentResponse(
            answer='No se dispone de información: uno de los documentos seleccionados no está disponible.',
            found_info=False
        )

    if len(ids) > 20:
        return AgentResponse(
            answer='Selecciona hasta 20 documentos para comparar en una consulta.',
            found_info=False
        )

    clean_question = re.sub(r'^\[Foco en informe .*?\]:\s*', '', question, flags=re.I).strip()
    broad = any(term in normalized(clean_question) for term in ['que es esto', 'que es este', 'resume', 'resumen', 'que contiene', 'de que trata', 'compar', 'diferencias'])
    tokens = set(re.findall(r'[a-z0-9]{3,}', normalized(clean_question))) - STOPWORDS

    # Búsqueda de fragmentos RAG
    chunks = []
    start = time.perf_counter()
    for doc_id in ids:
        hits = agent.search_engine.search(clean_question, project_id=doc_id, top_k=6)
        if broad or not hits:
            candidates = [c.to_dict() for c in agent.search_engine.chunks if c.codigo_proyecto == doc_id]
            limit = max(3, min(60, 150 // len(ids)))
            if len(candidates) > limit:
                hits = [candidates[round(i * (len(candidates) - 1) / (limit - 1))] for i in range(limit)]
            else:
                hits = candidates
        chunks.extend(hits)

    log = ToolExecutionLog(
        tool_name='search_project_documents',
        arguments={'query': clean_question, 'document_ids': ids},
        result_summary=f'{len(chunks)} fragmentos; {len(ids)} documentos seleccionados.',
        execution_time_ms=round((time.perf_counter() - start) * 1000, 2)
    )

    default_message = 'No se dispone de información verificable para esa pregunta en los documentos seleccionados.'
    if len(ids) == 1 and 'factura' in normalized(available[ids[0]].get('document_type', '')):
        default_message += ' El archivo seleccionado es una factura. Puedes pedir un resumen o consultar el total, el emisor o los conceptos facturados.'

    abstain = lambda message=default_message: AgentResponse(answer=message, tools_used=[log], found_info=False)

    if not chunks:
        return abstain()

    # Contexto estructurado para el LLM
    context = [{'document_id': c['codigo_proyecto'], 'page_number': c['pagina'], 'text': c['contenido']} for c in chunks]

    from codigo.backend import config
    provider = os.getenv('LLM_PROVIDER', config.LLM_PROVIDER)
    key = os.getenv('GEMINI_API_KEY', config.GEMINI_API_KEY) if provider == 'gemini' else os.getenv('OPENAI_API_KEY', config.OPENAI_API_KEY)
    warnings = []

    # ── MODO CON INTELIGENCIA ARTIFICIAL (OPENAI / GEMINI) ───────────────────────
    if key:
        import json
        system_instruction = load_prompt('document_reader_system')
        prompt = (
            f"{system_instruction}\n\n"
            + json.dumps({
                'question': clean_question,
                'history': (history or [])[-6:],
                'documents': [{'document_id': i, 'title': available[i]['title'], 'document_type': available[i]['document_type']} for i in ids],
                'context': context
            }, ensure_ascii=False)
        )
        try:
            if provider == 'gemini':
                result = gemini_json(prompt, GroundedAnswer)
            else:
                result = openai_json(prompt, GroundedAnswer)

            if not result or not result.found_info or not result.answer.strip() or not result.citations:
                return abstain()

            verified = []
            for citation in result.citations:
                text = normalized(citation.quote)
                # Validar existencia de página en el documento
                target_pages = [p for p in available.get(citation.document_id, {}).get('pages', []) if p['page_number'] == citation.page_number]
                if not target_pages:
                    if broad:
                        raise UnverifiedSummary()
                    return abstain()

                matches = [c for c in context if c['document_id'] == citation.document_id and c['page_number'] == citation.page_number and text and text in normalized(c['text'])]
                if not matches:
                    matches = [p for p in target_pages if text and text in normalized(p['text'])]

                if not matches and text:
                    quote_words = set(re.findall(r'[a-z0-9]{3,}', text))
                    quote_nums = number_tokens(citation.quote)
                    for p in target_pages:
                        page_norm = normalized(p['text'])
                        page_words = set(re.findall(r'[a-z0-9]{3,}', page_norm))
                        page_nums = number_tokens(p['text'])
                        if quote_words and (len(quote_words & page_words) / len(quote_words)) >= 0.5 and quote_nums.issubset(page_nums):
                            matches = [p]
                            break

                if not matches:
                    if broad:
                        raise UnverifiedSummary()
                    return abstain('La respuesta de IA no pudo verificarse contra el contenido recuperado. Reformula la consulta.')
                verified.append(citation)

            # Rechazar números inventados
            unsupported = number_tokens(result.answer, answer=True) - number_tokens(' '.join(c.quote for c in verified))
            if unsupported and broad:
                cited_ids = {c.document_id for c in verified}
                for fragment in context:
                    if fragment['document_id'] in cited_ids and unsupported & number_tokens(fragment['text']):
                        verified.append(DocumentCitation(document_id=fragment['document_id'], page_number=fragment['page_number'], quote=fragment['text']))
                        unsupported -= number_tokens(fragment['text'])
                    if not unsupported:
                        break

            if unsupported:
                if broad:
                    raise UnverifiedSummary()
                return abstain('La respuesta de IA contiene cifras sin respaldo verificable en las citas.')

            codes = list(dict.fromkeys(c.document_id for c in verified))
            citations_str = '\n'.join(f'[Fuente: {c.document_id}, Pág. {c.page_number}] {c.quote}' for c in verified)

            return AgentResponse(
                answer=f"{result.answer}\n\n{citations_str}".strip(),
                tools_used=[log],
                sources=codes,
                found_info=True,
                evidence_chunks=[c for c in chunks if any(v.document_id == c['codigo_proyecto'] and v.page_number == c['pagina'] for v in verified)]
            )
        except UnverifiedSummary:
            warnings.append('La síntesis de IA no pasó la verificación de evidencia. Se muestran extractos literales de los archivos seleccionados.')
        except Exception as exc:
            warnings.append(provider_error_reason(exc) + ' La IA no está disponible; se muestran extractos literales del documento.')

    # ── MODO EXTRACTIVO SIN API KEY (FALLBACK OFFLINE) ───────────────────────────
    evidence = []
    for doc_id in ids:
        d = available[doc_id]
        selected = [f for f in d.get('fields', []) if tokens & set(re.findall(r'[a-z0-9]{3,}', normalized(f['name'])))]
        if broad:
            selected = []
            for c in chunks:
                if c['codigo_proyecto'] == doc_id:
                    selected.append({'quote': c['contenido'], 'page_number': c['pagina']})
        if not selected and not broad:
            for c in chunks:
                if c['codigo_proyecto'] != doc_id:
                    continue
                for line in c['contenido'].splitlines():
                    if tokens & set(re.findall(r'[a-z0-9]{3,}', normalized(line))):
                        selected.append({'quote': line, 'page_number': c['pagina']})
        if selected:
            evidence.append((doc_id, d, selected[:8]))

    if not evidence:
        return abstain()

    lines = warnings + (['Lectura del texto disponible (sin síntesis de IA).'] if not key else [])
    for code, d, quotes in evidence:
        lines.append(f"**{d['title']}** ({d.get('document_type', 'documento')})")
        lines.extend(f"{q['quote']}\n[Fuente: {code}, Pág. {q['page_number']}]" for q in quotes)

    return AgentResponse(
        answer='\n\n'.join(lines),
        tools_used=[log],
        sources=[e[0] for e in evidence],
        found_info=True,
        evidence_chunks=chunks
    )
