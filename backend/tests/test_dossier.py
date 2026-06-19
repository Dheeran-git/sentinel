from pathlib import Path
from sentinel.actions.dossier import build_dossier
from sentinel.models import IssueReport, Grounding, RuleCitation, ViolationCategory


def test_dossier_pdf_created(tmp_path):
    img = (Path(__file__).parent / "fixtures" / "ewaste.jpg").read_bytes()
    issue = IssueReport(
        category=ViolationCategory.EWASTE,
        description="dumped monitors",
        severity="high",
        hazards=["lead"],
        est_quantity="40kg",
        is_violation=True,
        confidence=0.9,
    )
    g = Grounding(
        citations=[RuleCitation(act="E-Waste Rules 2022", section="Rule 11", why="x")],
        authority="KSPCB",
        confidence=0.8,
        reasoning="ok",
    )
    out = build_dossier("SNT-1", img, issue, g, "MG Road", "2026-06-19", tmp_path)
    assert out.exists() and out.stat().st_size > 1000
