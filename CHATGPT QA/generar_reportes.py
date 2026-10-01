from pathlib import Path
import json,re,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from contenido_final import build_report
OUT=Path(__file__).resolve().parent
ROOT=OUT.parent
r=json.loads((OUT/'evidencia_resultados.json').read_text(encoding='utf8'))
md,score,verdict,earned=build_report(r,ROOT)
(OUT/'REPORTE_QA_EVALUACION_PROCESA.md').write_text(md,encoding='utf8')
# PDF con el mismo contenido, texto seleccionable, tablas y paginación corporativa.
fontdir=Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Corp',str(fontdir/'arial.ttf')))
pdfmetrics.registerFont(TTFont('CorpBold',str(fontdir/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Corp',normal='Corp',bold='CorpBold',italic='Corp',boldItalic='CorpBold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyCorp',fontName='Corp',fontSize=9,leading=13,spaceAfter=7,textColor=colors.HexColor('#233349')))
styles.add(ParagraphStyle(name='CellCorp',fontName='Corp',fontSize=7.5,leading=10,wordWrap='CJK'))
styles.add(ParagraphStyle(name='HeadCorp',fontName='CorpBold',fontSize=14,leading=18,spaceBefore=14,spaceAfter=9,keepWithNext=True,textColor=colors.HexColor('#12304B')))
styles.add(ParagraphStyle(name='SubCorp',fontName='CorpBold',fontSize=10,leading=14,spaceBefore=10,spaceAfter=6,keepWithNext=True,textColor=colors.HexColor('#12304B')))
def fmt(s):
    s=html.escape(s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
    s=re.sub(r'`(.+?)`',r'\1',s)
    return s
story=[]
story.extend([Spacer(1,38),Paragraph('PROCESA CONSULTORES',styles['HeadCorp']),Paragraph('AUDITORÍA QA<br/>Y EVALUACIÓN TÉCNICA',ParagraphStyle(name='Cover',fontName='CorpBold',fontSize=27,leading=34,textColor=colors.HexColor('#12304B'))),Spacer(1,22),Paragraph('1 de octubre de 2026 | Reauditoría del repositorio corregido',styles['BodyCorp']),Spacer(1,20)])
ver=Table([[Paragraph(f'{score} / 100',ParagraphStyle(name='Score',fontName='CorpBold',fontSize=25,leading=30,textColor=colors.white)),Paragraph(f'<b>{verdict}</b><br/>95/95 controles históricos superados. Validación ampliada: '+str(r['metrics']['passed'])+'/'+str(r['metrics']['total'])+'; '+str(r['metrics']['failed'])+' fallos.',ParagraphStyle(name='Verdict',fontName='Corp',fontSize=11,leading=16,textColor=colors.white))]],colWidths=[140,355])
ver.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#12304B')),('TOPPADDING',(0,0),(-1,-1),18),('BOTTOMPADDING',(0,0),(-1,-1),18),('VALIGN',(0,0),(-1,-1),'MIDDLE')]))
story.extend([ver,Spacer(1,30),Paragraph('Evaluación basada en los cuatro informes oficiales, inspección de código, suites automatizadas, pruebas adversariales y revisión del frontend. Incluye distinción entre requisitos mínimos y valor adicional.',styles['BodyCorp']),Paragraph(f'{earned} puntos acreditados sobre 85 observables. Sesión presencial de 15 puntos pendiente. Puntaje normalizado: {score}/100.',styles['BodyCorp']),PageBreak()])
lines=md.splitlines(); i=0
while i<len(lines):
    line=lines[i].strip()
    if not line: i+=1; continue
    if line.startswith('|'):
        data=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            cells=[x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+',x or '-') for x in cells):data.append(cells)
            i+=1
        cols=len(data[0]); widths={2:[380,115],3:[155,155,185],4:[100,130,70,195],5:[90,90,110,130,75]}.get(cols,[495/cols]*cols)
        content=[[Paragraph(fmt(c),styles['CellCorp']) for c in row] for row in data]
        t=Table(content,colWidths=widths,repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#DCE7EE')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F4F7FA')]),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D1DBE4')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
        story.extend([t,Spacer(1,10)]);continue
    if line.startswith('# '):i+=1;continue
    if line.startswith('## '):story.append(Paragraph(fmt(line[3:]),styles['HeadCorp']))
    elif line.startswith('### '):story.append(Paragraph(fmt(line[4:]),styles['SubCorp']))
    else:
        para=[line]
        while i+1<len(lines) and lines[i+1].strip() and not lines[i+1].startswith(('#','|')):i+=1;para.append(lines[i].strip())
        story.append(Paragraph(fmt(' '.join(para)),styles['BodyCorp']))
    i+=1
def page(canvas,doc):
    canvas.setStrokeColor(colors.HexColor('#BCD0DF'));canvas.line(50,800,545,800)
    canvas.setFont('CorpBold',8);canvas.setFillColor(colors.HexColor('#12304B'));canvas.drawString(50,812,'PROCESA | AUDITORÍA TÉCNICA QA')
    canvas.setFont('Corp',8);canvas.drawRightString(545,812,'01 OCT 2026')
    canvas.line(50,43,545,43);canvas.setFont('Corp',7);canvas.drawString(50,30,'Evidencia local | Dictamen: no aprobado | Uso de evaluación técnica');canvas.drawRightString(545,30,f'{doc.page}')
doc=SimpleDocTemplate(str(OUT/'Reporte_Auditoria_QA_PROCESA.pdf'),pagesize=A4,rightMargin=50,leftMargin=50,topMargin=58,bottomMargin=56,title='Auditoría QA PROCESA',author='Auditoría técnica asistida por Codex')
doc.build(story,onFirstPage=page,onLaterPages=page)
print('Reportes generados',len(md),'caracteres')
