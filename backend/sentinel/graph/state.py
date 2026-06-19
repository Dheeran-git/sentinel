"""LangGraph state: the case file that flows through the mission."""
from typing import Annotated, Any, TypedDict


def append(left: list, right: list) -> list:
    """Reducer that appends event lists across node updates."""
    return (left or []) + (right or [])


class CaseState(TypedDict, total=False):
    image_b64: str
    mime: str
    device_location: tuple[float, float] | None
    address: str
    location: tuple[float, float] | None
    issue: dict
    needs_clarification: bool
    clarification_question: str
    user_answer: str
    grounding: dict
    grounding_attempts: int
    artifacts: dict[str, Any]
    approval: str
    edit_instruction: str
    tracking_id: str
    status: str
    events: Annotated[list[dict], append]
