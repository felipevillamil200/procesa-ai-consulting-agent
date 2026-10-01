import fs from 'node:fs';
import { marked } from '../codigo/frontend/node_modules/marked/lib/marked.esm.js';
const source = fs.readFileSync(new URL('../codigo/frontend/src/components/ChatView.jsx',import.meta.url),'utf8');
const definition=source.slice(source.indexOf('function formatMarkdownWithPerplexityCitations'),source.indexOf('export default'));
const format=new Function('marked',definition+'; return formatMarkdownWithPerplexityCitations;')(marked);
const result=format('<img src=x onerror="window.qaMarker=1">');
const proof={case:'chat_raw_html_event_attribute',escaped:!result.includes('onerror='),result,browser_execution_tested:false};
fs.writeFileSync(new URL('evidencia_html_render.json',import.meta.url),JSON.stringify(proof,null,2));
console.log(JSON.stringify(proof));
