"""Ground an issue in retrieved law.

Uses the Flash model: the free Gemini tier does not grant access to
gemini-2.5-pro (free-tier limit is zero), so grounding runs on Flash, which
handles the cited-grounding task well.
"""
from sentinel.knowledge.retriever import retrieve
from sentinel.llm import flash
from sentinel.models import Grounding, IssueReport

_PROMPT = (
    "You are a legal analyst for environmental enforcement in Karnataka, India. "
    "Given a described violation and excerpts of real law, cite ONLY the rules "
    "present in the excerpts that the violation breaches. Name the single most "
    "appropriate enforcement authority. List relevant SDGs (11, 12, 13). If the "
    "excerpts do not clearly support any citation, return an empty citations list "
    "and confidence below 0.4. Never invent a rule that is not in the excerpts."
)


def _query_for(issue: IssueReport, attempt: int = 0) -> str:
    base = f"{issue.category.value}. {issue.description}. hazards: {', '.join(issue.hazards)}"
    if attempt >= 1:
        base += (" environmental violation prohibition disposal penalty "
                 "enforcement authority pollution rule")
    return base


def ground(issue: IssueReport, attempt: int = 0) -> Grounding:
    """Retrieve law and produce a grounded, cited Grounding object.

    On retry (attempt >= 1) the query is broadened and more chunks are pulled.
    """
    k = 4 if attempt == 0 else 6
    hits = retrieve(_query_for(issue, attempt), k=k)
    context = "\n\n".join(f"[{h.act} - {h.section}]\n{h.text}" for h in hits)
    message = (
        f"{_PROMPT}\n\nVIOLATION:\n{issue.description} "
        f"(category: {issue.category.value})\n\nLAW EXCERPTS:\n{context}"
    )
    return flash().with_structured_output(Grounding).invoke(message)


def is_grounded(g: Grounding) -> bool:
    """True when there is at least one citation and confidence is adequate."""
    return bool(g.citations) and g.confidence >= 0.5
