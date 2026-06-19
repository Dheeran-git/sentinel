import os
import pytest
from sentinel.actions.complaint import draft_complaint
from sentinel.models import IssueReport, Grounding, RuleCitation, ViolationCategory

needs_key = pytest.mark.skipif(not os.getenv("GOOGLE_API_KEY"), reason="no key")


@needs_key
def test_complaint_includes_citation():
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
    text = draft_complaint(issue, g, "MG Road, Bengaluru")
    assert "Rule 11" in text or "E-Waste" in text
