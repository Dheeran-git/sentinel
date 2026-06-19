"""Regression: a dossier with multiple long citations must not crash fpdf2."""
from pathlib import Path

from sentinel.actions.dossier import build_dossier
from sentinel.models import Grounding, IssueReport, RuleCitation, ViolationCategory


def test_dossier_handles_multiple_long_citations(tmp_path):
    img = (Path(__file__).parent / "fixtures" / "ewaste.jpg").read_bytes()
    issue = IssueReport(
        category=ViolationCategory.EWASTE,
        description="A large pile of discarded monitors, circuit boards and cables "
                    "dumped on a public footpath next to a storm water drain",
        severity="high", hazards=["lead", "mercury"], est_quantity="about 40 kg",
        is_violation=True, confidence=0.9,
    )
    g = Grounding(
        citations=[
            RuleCitation(act="E-Waste (Management) Rules, 2022", section="Rule 5",
                         why="Improper disposal of e-waste outside authorized channels "
                             "and failure to channelise it to a registered recycler."),
            RuleCitation(act="Environment (Protection) Act, 1986", section="Section 7",
                         why="Discharge of environmental pollutants in excess of "
                             "prescribed standards is prohibited."),
            RuleCitation(act="Solid Waste Management Rules, 2016", section="Rule 15",
                         why="Dumping of waste in public spaces and near drains "
                             "violates the duties of waste generators and local bodies."),
        ],
        authority="Karnataka State Pollution Control Board (KSPCB)",
        sdgs=["11", "12"], confidence=0.85, reasoning="Clear e-waste dumping.",
    )
    out = build_dossier("SNT-MULTI", img, issue, g,
                        "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038, India",
                        "2026-06-20", tmp_path)
    assert out.exists() and out.stat().st_size > 1000
