"""Run a full SENTINEL mission from the terminal (manual HITL)."""
import base64
import sys
from pathlib import Path

from langgraph.types import Command

from sentinel.graph.build import build_graph
from sentinel.knowledge.index import build_index


def main(image_path: str, lat: float, lng: float):
    build_index()
    graph = build_graph()
    cfg = {"configurable": {"thread_id": "cli-1"}}
    img_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
    state = {"image_b64": img_b64, "mime": "image/jpeg",
             "device_location": (lat, lng), "events": []}

    result = graph.invoke(state, cfg)
    while "__interrupt__" in result:
        payload = result["__interrupt__"][0].value
        if payload["type"] == "clarify":
            print("AGENT ASKS:", payload["question"])
            ans = input("> ")
            result = graph.invoke(Command(resume=ans), cfg)
        elif payload["type"] == "approve":
            print("\n--- COMPLAINT ---\n", payload["artifacts"]["complaint"])
            choice = input("approve / edit / reject ? ").strip()
            resume = {"action": choice}
            if choice == "edit":
                resume["edit"] = input("edit instruction: ")
            result = graph.invoke(Command(resume=resume), cfg)
    print("\nDONE:", result.get("status"), result.get("tracking_id"))


if __name__ == "__main__":
    main(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]))
