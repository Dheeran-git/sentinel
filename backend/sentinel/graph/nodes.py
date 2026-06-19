"""Node functions for the SENTINEL mission graph."""
import base64
from datetime import datetime, timezone
from pathlib import Path

from langgraph.types import interrupt

from sentinel.actions.complaint import draft_complaint
from sentinel.actions.dossier import build_dossier
from sentinel.actions.routing import nearest_recyclers, ward_authority
from sentinel.config import settings
from sentinel.delivery.casestore import CaseStore
from sentinel.delivery.email import send_demo_safe
from sentinel.geo.geocode import geocode, reverse
from sentinel.investigation.grounding import ground
from sentinel.models import Grounding, IssueReport, ViolationCategory
from sentinel.perception.location import resolve_location
from sentinel.perception.vision import perceive

ART_DIR = Path(__file__).resolve().parent.parent / "data" / "artifacts"
CASES_DB = Path(__file__).resolve().parent.parent / "data" / "cases.sqlite"

BENGALURU_CENTRE = (12.9716, 77.5946)


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


def resolve_clarification_location(answer, existing):
    """Resolve a location from a clarification answer.

    Keeps an existing location if present. Accepts a dict with a 'location'
    key, or a free-text address (geocoded). Falls back to the city centre so a
    mission never proceeds with a missing location.
    """
    if existing is not None:
        return existing
    if isinstance(answer, dict) and "location" in answer:
        return tuple(answer["location"])
    if isinstance(answer, str) and answer.strip():
        loc = geocode(answer.strip())
        if loc:
            return loc
    return BENGALURU_CENTRE


def ask_user_node(state) -> dict:
    answer = interrupt({"type": "clarify", "question": state["clarification_question"]})
    events = [_event("clarify", "Got your clarification")]
    update = {"needs_clarification": False, "user_answer": str(answer)}
    if state.get("location") is None:
        loc = resolve_clarification_location(answer, None)
        update["location"] = loc
        if loc == BENGALURU_CENTRE:
            events.append(_event("clarify",
                "Could not resolve an exact location; using Bengaluru city centre. Please verify."))
    update["events"] = events
    return update


def investigate_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    attempts = state.get("grounding_attempts", 0)
    g: Grounding = ground(issue, attempt=attempts)
    return {
        "grounding": g.model_dump(),
        "grounding_attempts": attempts + 1,
        "events": [_event("investigate",
                          f"Grounded to {len(g.citations)} rule(s); "
                          f"authority {g.authority or 'unknown'}")],
    }


def act_node(state) -> dict:
    issue = IssueReport(**state["issue"])
    g = Grounding(**state["grounding"])
    lat, lng = state.get("location") or BENGALURU_CENTRE
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
    lat, lng = state.get("location") or BENGALURU_CENTRE
    store = CaseStore(CASES_DB)
    tid = store.new_case(category=issue.category.value, lat=lat, lng=lng,
                         authority=g.authority, address=state["address"])
    sent = False
    try:
        if settings.demo_inbox and settings.smtp_user and settings.smtp_password:
            dossier = state.get("artifacts", {}).get("dossier_path")
            send_demo_safe(
                subject=f"Civic environmental complaint {tid}: {issue.category.value}",
                body=state["artifacts"]["complaint"],
                attachment=Path(dossier) if dossier else None,
                demo_inbox=settings.demo_inbox,
                smtp_user=settings.smtp_user,
                smtp_password=settings.smtp_password,
                host=settings.smtp_host,
                port=settings.smtp_port,
            )
            sent = True
    except Exception:
        sent = False
    tail = " Email sent to demo inbox." if sent else " Logged (email not configured)."
    return {"tracking_id": tid, "status": "submitted",
            "events": [_event("execute", f"Submitted (demo-safe). Tracking {tid}.{tail}")]}
