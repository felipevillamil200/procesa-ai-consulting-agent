"""Diagnóstico del modelo; no imprime ni guarda credenciales."""
import json
from pathlib import Path
from codigo.backend import document_chat
from codigo.backend.agent import ConsultorAgent

original = document_chat.openai_json
captures = []

def observe(prompt, schema):
    result = original(prompt, schema)
    context = json.loads(prompt.split('\n')[-1])['context']
    valid = [any(c['document_id'] == q.document_id and c['page_number'] == q.page_number
                 and document_chat.normalized(q.quote) in document_chat.normalized(c['text'])
                 for c in context) for q in result.citations]
    numeric_match = document_chat.number_tokens(result.answer, answer=True).issubset(
        document_chat.number_tokens(' '.join(q.quote for q in result.citations)))
    captures.append({'model_result': result.model_dump(), 'citation_matches': valid, 'numeric_match': numeric_match})
    print({'citation_matches': valid, 'numeric_match': numeric_match}, flush=True)
    return result

document_chat.openai_json = observe
agent = ConsultorAgent()
result = agent.ask('Que contiene este documento?', document_ids=['DOC-D8CD838E68D33EF4'])
print({'found_info': result.found_info, 'extractive_fallback': 'extractos literales' in result.answer})
Path('CHATGPT QA/diagnostico_validacion_modelo.json').write_text(json.dumps(captures, ensure_ascii=False, indent=2), encoding='utf-8')
