"""End-to-end pipeline test: photo -> grounding -> HITL -> submitted.

Skipped when GOOGLE_API_KEY is absent so CI stays green without credentials.
"""
import base64
import os
from pathlib import Path

import pytest
from langgraph.types import Command

from sentinel.graph.build import build_graph
from sentinel.knowledge.index import build_index

needs_key = pytest.mark.skipif(
    not os.getenv("GOOGLE_API_KEY"), reason="no key"
)


@needs_key
def test_full_mission_reaches_submitted(tmp_path):
    build_index()
    graph = build_graph(str(tmp_path / "ckpt.sqlite"))
    cfg = {"configurable": {"thread_id": "e2e-1"}}

    img = Path("tests/fixtures/ewaste.jpg").read_bytes()
    state = {
        "image_b64": base64.b64encode(img).decode(),
        "mime": "image/jpeg",
        "device_location": (12.9716, 77.5946),
        "events": [],
    }

    res = graph.invoke(state, cfg)

    # Drain all HITL interrupts: clarify or approve.
    while "__interrupt__" in res:
        payload = res["__interrupt__"][0].value
        if payload.get("type") == "approve":
            resume = {"action": "approved"}
        else:
            # clarify interrupt
            resume = "near MG Road, Bengaluru"
        res = graph.invoke(Command(resume=resume), cfg)

    assert res["status"] == "submitted"
    assert res["tracking_id"].startswith("SNT-")
