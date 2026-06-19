"""Render an evidence dossier PDF from a case using fpdf2 (pure Python, no native deps)."""
from io import BytesIO
from pathlib import Path

from fpdf import FPDF
from PIL import Image

from sentinel.models import Grounding, IssueReport

FOREST = (20, 83, 45)
CLAY = (224, 122, 95)


def _s(text: str) -> str:
    """Sanitize to latin-1 to avoid fpdf2 crashes on stray unicode."""
    return text.encode("latin-1", "replace").decode("latin-1")


def build_dossier(
    tracking_id: str,
    image_bytes: bytes,
    issue: IssueReport,
    grounding: Grounding,
    address: str,
    timestamp: str,
    out_dir: Path,
) -> Path:
    """Build a one-page evidence dossier PDF and return its path."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_img = out_dir / f"_img_{tracking_id}.jpg"
    Image.open(BytesIO(image_bytes)).convert("RGB").save(tmp_img, "JPEG")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_text_color(*FOREST)
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, _s("SENTINEL Evidence Dossier"), new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*CLAY)
    pdf.set_line_width(1)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    pdf.set_text_color(90, 90, 90)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, _s(f"Case {tracking_id} | {address} | {timestamp}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.image(str(tmp_img), w=120)
    pdf.ln(4)

    def section(title: str, body_lines: list[str]) -> None:
        pdf.set_text_color(*FOREST)
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 8, _s(title), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(40, 40, 40)
        pdf.set_font("Helvetica", "", 11)
        for line in body_lines:
            pdf.multi_cell(0, 6, _s(line))
        pdf.ln(2)

    section("Violation", [f"{issue.description} (severity: {issue.severity})"])
    cite_lines = [f"- {c.act} - {c.section}: {c.why}" for c in grounding.citations] or ["None"]
    section("Cited rules", cite_lines)
    section("Authority", [grounding.authority or "Unknown"])

    out = out_dir / f"dossier_{tracking_id}.pdf"
    pdf.output(str(out))
    tmp_img.unlink(missing_ok=True)
    return out
