"""Network test: ground an e-waste issue in real law via RAG + Gemini Pro."""
import os

import pytest

from sentinel.investigation.grounding import ground
from sentinel.knowledge.index import build_index
from sentinel.models import IssueReport, ViolationCategory

needs_key = pytest.mark.skipif(not os.getenv("GOOGLE_API_KEY"), reason="no key")


@needs_key
def test_ground_ewaste_cites_ewaste_rules():
    build_index()
    issue = IssueReport(
        category=ViolationCategory.EWASTE,
        description="CRT monitors and circuit boards dumped on a public footpath",
        severity="high",
        hazards=["lead"],
        est_quantity="40 kg",
        is_violation=True,
        confidence=0.9,
    )
    g = ground(issue)
    assert g.citations
    assert any("e-waste" in c.act.lower() for c in g.citations)
    assert g.authority
