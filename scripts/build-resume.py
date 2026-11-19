"""Build the downloadable resume from site/resume/resume.json (JSON Resume format).

Writes site/resume/Sandy-Tayts-UX-Designer-Resume.pdf and .txt.
The PDF is one column of real, selectable text with standard headings, so applicant-tracking
systems and AI screeners read it in order. Needs reportlab: pip install reportlab
"""
import json
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent / "site" / "resume"
DATA = json.loads((ROOT / "resume.json").read_text())
BASE = "Sandy-Tayts-UX-Designer-Resume"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def month(d):
    if not d:
        return "Present"
    y, m = d.split("-")[:2]
    return f"{MONTHS[int(m) - 1]} {y}"


def span(job):
    return f"{month(job.get('startDate'))} – {month(job.get('endDate'))}"


def cert_line(c):
    tail = f", {month(c['date'])}" if c.get("date") else ""
    return f"{c['name']} — {c['issuer']}{tail}"


b = DATA["basics"]
loc = b["location"]
place = f"{loc['city']}, {loc['region']}"
contact = [place, "sandy.tayts.com", "linkedin.com/in/atayts"]

# Plain text: the same order and headings as the PDF.
lines = [b["name"], b["label"], " | ".join(contact), "", "SUMMARY", b["summary"], "", "EXPERIENCE"]
for job in DATA["work"]:
    lines += ["", job["position"], f"{job['name']} | {span(job)}"]
    lines += [f"- {h}" for h in job["highlights"]]
lines += ["", "SKILLS"]
lines += [f"{s['name']}: {', '.join(s['keywords'])}" for s in DATA["skills"]]
lines += ["", "CERTIFICATIONS"]
lines += [f"- {cert_line(c)}" for c in DATA["certificates"]]
(ROOT / f"{BASE}.txt").write_text("\n".join(lines) + "\n")

# PDF
pdfmetrics.registerFont(TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")
INK, MUTED, RULE = HexColor("#223640"), HexColor("#5d6b72"), HexColor("#2c6e7e")

def style(name, size, lead, font="Arial", color=INK, before=0, after=0, **kw):
    return ParagraphStyle(name, fontName=font, fontSize=size, leading=lead, textColor=color,
                          spaceBefore=before, spaceAfter=after, alignment=TA_LEFT, **kw)

NAME = style("name", 20, 24, "Arial-Bold")
LABEL = style("label", 12.5, 16, color=RULE, after=2)
META = style("meta", 9.5, 13, color=MUTED)
HEAD = style("head", 11, 14, "Arial-Bold", color=RULE, before=12, after=3)
ROLE = style("role", 10.5, 13.5, "Arial-Bold", before=8)
WHERE = style("where", 9.5, 13, color=MUTED, after=3)
BODY = style("body", 9.5, 13)

def section(title):
    return [Paragraph(title, HEAD), HRFlowable(width="100%", thickness=0.6, color=RULE, spaceAfter=4)]

def bullets(items):
    return ListFlowable([ListItem(Paragraph(escape(t), BODY), leftIndent=12, value="•") for t in items],
                        bulletType="bullet", start="•", leftIndent=12, bulletFontName="Arial", bulletFontSize=9)

story = [Paragraph(escape(b["name"]), NAME), Paragraph(escape(b["label"]), LABEL),
         Paragraph(" | ".join(escape(c) for c in contact), META)]
story += section("SUMMARY") + [Paragraph(escape(b["summary"]), BODY)]
story += section("EXPERIENCE")
for job in DATA["work"]:
    head = [Paragraph(escape(job["position"]), ROLE), Paragraph(f"{escape(job['name'])} | {span(job)}", WHERE)]
    story += [KeepTogether(head + [bullets(job["highlights"][:1])])]
    if len(job["highlights"]) > 1:
        story += [bullets(job["highlights"][1:])]
story += section("SKILLS")
story += [Paragraph(f"<b>{escape(s['name'])}:</b> {escape(', '.join(s['keywords']))}", style("sk", 9.5, 13, after=3)) for s in DATA["skills"]]
story += section("CERTIFICATIONS") + [bullets([cert_line(c) for c in DATA["certificates"]])]

keywords = sorted({k for s in DATA["skills"] for k in s["keywords"]})
doc = SimpleDocTemplate(str(ROOT / f"{BASE}.pdf"), pagesize=LETTER,
                        leftMargin=0.65 * inch, rightMargin=0.65 * inch, topMargin=0.6 * inch, bottomMargin=0.6 * inch,
                        title=f"{b['name']} — {b['label']} — Resume", author=b["name"], subject=f"{b['label']} resume",
                        keywords=", ".join(keywords), creator="sandy.tayts.com", lang="en-US")
doc.build(story)
print("built", BASE, date.today())
