"""Node functions for the SENTINEL mission graph."""
import base64
from datetime import datetime, timezone
from pathlib import Path

from langgraph.types import interrupt

from sentinel.actions.complaint import draft_complaint
from sentinel.actions.dossier import build_dossier
from sentinel.actions.routing import nearest_recyclers, ward_authority
from sentinel.delivery.casestore import CaseStore
from sentinel.geo.geocode import reverse
from sentinel.investigation.grounding import ground
from sentinel.models import Grounding, IssueReport, ViolationCategory
from sentinel.perception.location import resolve_location
from sentinel.perception.vision import perceive

ART_DIR = Path(__file__).resolve().parent.parent / "data" / "artifacts"
CASES_DB = Path(__file__).resolve().parent.parent / "data" / "cases.sqlite"


def _event(node: str, text: str) -> dict:
    return {"node": node, "text": text, "ts": datetime.now(timezone.utc).isoformat()}


def perceive_node(state) -> dict:
    img = base64.b64decode(state["image_b64"])
    report: IssueReport = perceive(img, state.get("mime", "image/jpeg"))
    loc = resolve_location(state.get("device_location"), img)
    needs = (not report.is_violation) or report.confidence < 0.5 or loc is None
    return {
        "issue": report.model_dump(),
        "location": loc,
        "needs_clarification": needs,
        "clarification_question": (
            "I could not confirm the location. Please drop a pin or describe where this is."
            if loc is None else
            "I am not fully sure what this shows. Can you describe it briefly?"
        ),
        "events": [_event("perceive", f"Identified: {report.category.value} "
                                       f"(confidence {report.confidence:.0%})")],
    }


def ask_user_node(state) -> dict:
    answer = interrupt({"type": "clarify", "question": state["clarification_question"]})
    update = {"needs_clarification": False, "user_answer": str(answer),
              "events": [_event("clarify", "Got your clarification")]}
    if isinstance(answer, dict) and "location" in answer:
        update["location"] = tuple(answer["location"])
    return update


def investigate_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    g: Grounding = ground(issue)
    attempts = state.get("grounding_attempts", 0) + 1
    return {
        "grounding": g.model_dump(),
        "grounding_attempts": attempts,
        "events": [_event("investigate",
                          f"Grounded to {len(g.citations)} rule(s); "
                          f"authority {g.authority or 'unknown'}")],
    }


def act_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    g = Grounding(**state["grounding"])
    lat, lng = state["location"]
    address = reverse(lat, lng)
    img = base64.b64decode(state["image_b64"])
    tracking_id = "SNT-PREVIEW"
    dossier = build_dossier(tracking_id, img, issue, g, address,
                            datetime.now(timezone.utc).strftime("%Y-%m-%d"), ART_DIR)
    complaint = draft_complaint(issue, g, address)
    if issue.category == ViolationCategory.EWASTE:
        routing = {"recyclers": nearest_recyclers(lat, lng, k=3)}
    else:
        routing = {"authority": ward_authority(lat, lng)}
    return {
        "address": address,
        "artifacts": {
            "complaint": complaint,
            "dossier_path": str(dossier),
            "routing": routing,
            "authority": g.authority,
        },
        "events": [_event("act", "Drafted complaint, dossier, and routing")],
    }


def approve_node(state) -> dict:
    decision = interrupt({"type": "approve", "artifacts": state["artifacts"]})
    if isinstance(decision, dict):
        return {"approval": decision.get("action", "rejected"),
                "edit_instruction": decision.get("edit", ""),
                "events": [_event("approve", f"User chose: {decision.get('action')}")]}
    return {"approval": str(decision),
            "events": [_event("approve", f"User chose: {decision}")]}


def refine_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    g = Grounding(**state["grounding"])
    revised = draft_complaint(issue, g, state["address"]) + \
        f"\n\n[Revised per request: {state.get('edit_instruction','')}]"
    arts = dict(state["artifacts"])
    arts["complaint"] = revised
    return {"artifacts": arts, "approval": "pending",
            "events": [_event("refine", "Revised the complaint")]}


def execute_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    g = Grounding(**state["grounding"])
    lat, lng = state["location"]
    store = CaseStore(CASES_DB)
    tid = store.new_case(category=issue.category.value, lat=lat, lng=lng,
                         authority=g.authority, address=state["address"])
    return {"tracking_id": tid, "status": "submitted",
            "events": [_event("execute", f"Submitted (demo-safe). Tracking {tid}")]}
