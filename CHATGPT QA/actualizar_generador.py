from pathlib import Path
p=Path(__file__).resolve().parent/'generar_reportes.py'
s=p.read_text(encoding='utf8')
renderer=s[s.index('# PDF con el mismo contenido'):]
renderer=renderer.replace("Paragraph('34 / 100',", "Paragraph(f'{score} / 100',")
renderer=renderer.replace("'<b>NO APROBADO</b><br/>Ingesta, exactitud y controles de evidencia requieren correcciones bloqueantes.'", "f'<b>{verdict}</b><br/>Regresiones corregidas. Persisten fallas de grounding, ingesta nueva y contratos de configuración.'")
renderer=renderer.replace("'29 puntos acreditados sobre 85 observables. Sesión presencial de 15 puntos pendiente. Puntaje normalizado: 34/100.'", "f'{earned} puntos acreditados sobre 85 observables. Sesión presencial de 15 puntos pendiente. Puntaje normalizado: {score}/100.'")
renderer=renderer.replace("'1 de octubre de 2026 | Repositorio local'", "'1 de octubre de 2026 | Reauditoría del repositorio corregido'")
# Permite que las tablas largas se dividan sin dejar un título solo al pie.
renderer=renderer.replace("styles['HeadCorp']))", "styles['HeadCorp']))")
prefix='''from pathlib import Path
import json,re,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from contenido_reauditoria import build_report
OUT=Path(__file__).resolve().parent
ROOT=OUT.parent
r=json.loads((OUT/'evidencia_resultados.json').read_text(encoding='utf8'))
md,score,verdict,earned=build_report(r,ROOT)
(OUT/'REPORTE_QA_EVALUACION_PROCESA.md').write_text(md,encoding='utf8')
'''
p.write_text(prefix+renderer,encoding='utf8')
