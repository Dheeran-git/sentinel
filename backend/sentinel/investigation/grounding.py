"""Ground an issue in retrieved law using the max-reasoning model."""
from sentinel.knowledge.retriever import retrieve
from sentinel.llm import pro
from sentinel.models import Grounding, IssueReport

_PROMPT = (
    "You are a legal analyst for environmental enforcement in Karnataka, India. "
    "Given a described violation and excerpts of real law, cite ONLY the rules "
    "present in the excerpts that the violation breaches. Name the single most "
    "appropriate enforcement authority. List relevant SDGs (11, 12, 13). If the "
    "excerpts do not clearly support any citation, return an empty citations list "
    "and confidence below 0.4. Never invent a rule that is not in the excerpts."
)


def _query_for(issue: IssueReport) -> str:
    return f"{issue.category.value}. {issue.description}. hazards: {', '.join(issue.hazards)}"


def ground(issue: IssueReport) -> Grounding:
    """Retrieve law and produce a grounded, cited Grounding object."""
    hits = retrieve(_query_for(issue), k=4)
    context = "\n\n".join(f"[{h.act} - {h.section}]\n{h.text}" for h in hits)
    message = (
        f"{_PROMPT}\n\nVIOLATION:\n{issue.description} "
        f"(category: {issue.category.value})\n\nLAW EXCERPTS:\n{context}"
    )
    return pro().with_structured_output(Grounding).invoke(message)


def is_grounded(g: Grounding) -> bool:
    """True when there is at least one citation and confidence is adequate."""
    return bool(g.citations) and g.confidence >= 0.5
