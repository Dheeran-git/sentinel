"""Pydantic models for structured agent outputs."""
from enum import Enum

from pydantic import BaseModel, Field


class ViolationCategory(str, Enum):
    EWASTE = "e-waste dumping"
    OPEN_BURNING = "open burning of waste"
    WATER_POLLUTION = "drain or water pollution"
    GARBAGE_DUMPING = "garbage dumping"
    CONSTRUCTION_DEBRIS = "construction and demolition debris"
    NONE = "no violation"


class IssueReport(BaseModel):
    """Structured result of perceiving a photo."""

    category: ViolationCategory
    description: str
    severity: str = Field(description="one of: low, medium, high")
    hazards: list[str] = Field(default_factory=list)
    est_quantity: str = ""
    is_violation: bool
    confidence: float = Field(ge=0.0, le=1.0)


class RuleCitation(BaseModel):
    act: str
    section: str
    why: str


class Grounding(BaseModel):
    """Result of grounding an issue in real law."""

    citations: list[RuleCitation]
    authority: str
    sdgs: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
