"""Draft a formal civic complaint grounded in cited law."""
from sentinel.llm import flash
from sentinel.models import Grounding, IssueReport

_PROMPT = (
    "Write a concise, formal civic complaint (max 200 words) to the named "
    "authority in India. Reference each cited rule by act and section exactly as "
    "given. State the violation, location, observed severity, and request "
    "specific enforcement action. Professional tone. Do not invent facts or rules "
    "beyond those provided."
)


def draft_complaint(issue: IssueReport, grounding: Grounding, address: str) -> str:
    """Return the complaint letter body as text."""
    cites = "; ".join(f"{c.act} {c.section}" for c in grounding.citations)
    message = (
        f"{_PROMPT}\n\nAUTHORITY: {grounding.authority}\nLOCATION: {address}\n"
        f"VIOLATION: {issue.description} (severity {issue.severity}, "
        f"hazards: {', '.join(issue.hazards)})\nCITED RULES: {cites}"
    )
    return flash().invoke(message).content
