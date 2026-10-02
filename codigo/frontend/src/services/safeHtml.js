// Markdown admite únicamente etiquetas de presentación; documentos y modelos no aportan código.
export function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P','BR','STRONG','B','EM','I','UL','OL','LI','PRE','CODE','BLOCKQUOTE','H1','H2','H3','H4','H5','H6','TABLE','THEAD','TBODY','TR','TH','TD','HR','SPAN','BUTTON','MARK','A']);
  for (const node of Array.from(doc.body.querySelectorAll('*'))) {
    if (!allowed.has(node.tagName)) {
      node.remove();
      continue;
    }
    for (const attr of Array.from(node.attributes)) {
      if (!['class','data-project-code','title','type','href'].includes(attr.name)) node.removeAttribute(attr.name);
    }
    if (node.hasAttribute('href') && !/^(https?:\/\/|mailto:|#)/i.test(node.getAttribute('href'))) node.removeAttribute('href');
    if (node.tagName === 'A') node.setAttribute('rel','noopener noreferrer');
    if (node.tagName === 'BUTTON') node.setAttribute('type','button');
  }
  return doc.body.innerHTML;
}
