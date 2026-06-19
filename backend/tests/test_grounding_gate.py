"""Unit tests for the grounding confidence gate."""
from sentinel.investigation.grounding import is_grounded
from sentinel.models import Grounding, RuleCitation


def test_strong_grounding_passes():
    g = Grounding(citations=[RuleCitation(act="A", section="3", why="x")],
                  authority="KSPCB", confidence=0.8, reasoning="ok")
    assert is_grounded(g)


def test_weak_grounding_fails():
    g = Grounding(citations=[], authority="", confidence=0.2, reasoning="unsure")
    assert not is_grounded(g)
