"""FastAPI surface: start a mission (SSE), resume on HITL, list cases, serve artifacts."""
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from langgraph.types import Command
from pydantic import BaseModel

from sentinel.api.sessions import new_thread_id
from sentinel.delivery.casestore import CaseStore
from sentinel.graph.build import build_graph
from sentinel.knowledge.index import get_collection

DATA = Path(__file__).resolve().parent.parent / "data"
CASES_DB = DATA / "cases.sqlite"
ART_DIR = DATA / "artifacts"
ART_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="SENTINEL")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)
app.mount("/artifacts", StaticFiles(directory=str(ART_DIR)), name="artifacts")
graph = build_graph()


class StartRequest(BaseModel):
    image_b64: str
    mime: str = "image/jpeg"
    lat: float | None = None
    lng: float | None = None


class ResumeRequest(BaseModel):
    thread_id: str
    value: dict


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _run_stream(graph_input, cfg):
    """Yield SSE events for each node update, pausing at interrupts.

    A mid-mission exception (commonly a Gemini free-tier rate limit) is caught
    and surfaced as a clean 'error' event instead of breaking the stream.
    """
    try:
        for chunk in graph.stream(graph_input, cfg, stream_mode="updates"):
            if "__interrupt__" in chunk:
                yield _sse("interrupt", chunk["__interrupt__"][0].value)
                return
            for node, update in chunk.items():
                for ev in update.get("events", []):
                    yield _sse("step", ev)
                if update.get("status") == "submitted":
                    yield _sse("done", {"tracking_id": update.get("tracking_id")})
    except Exception as exc:
        msg = str(exc)
        if "RESOURCE_EXHAUSTED" in msg or "429" in msg:
            text = ("The free Gemini tier daily limit was reached. Please try "
                    "again later; the quota resets each day.")
        else:
            text = "The agent hit an error mid-mission. Please try again."
        yield _sse("error", {"message": text})


@app.post("/mission/start")
def start(req: StartRequest):
    get_collection()
    tid = new_thread_id()
    cfg = {"configurable": {"thread_id": tid}}
    state = {
        "image_b64": req.image_b64, "mime": req.mime,
        "device_location": (req.lat, req.lng) if req.lat is not None else None,
        "events": [],
    }

    def gen():
        yield _sse("thread", {"thread_id": tid})
        yield from _run_stream(state, cfg)

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.post("/mission/resume")
def resume(req: ResumeRequest):
    cfg = {"configurable": {"thread_id": req.thread_id}}

    def gen():
        yield from _run_stream(Command(resume=req.value), cfg)

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/cases")
def cases():
    return CaseStore(CASES_DB).all_cases()
