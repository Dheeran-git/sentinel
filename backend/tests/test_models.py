from sentinel.models import IssueReport, ViolationCategory


def test_issue_report_validates():
    r = IssueReport(
        category=ViolationCategory.EWASTE,
        description="Pile of CRT monitors dumped on a footpath",
        severity="high",
        hazards=["lead", "mercury"],
        est_quantity="about 40 kg",
        is_violation=True,
        confidence=0.91,
    )
    assert r.category == ViolationCategory.EWASTE
    assert r.is_violation
