from sentinel.graph.state import CaseState


def test_state_is_typed_dict():
    s: CaseState = {"events": []}
    s["events"].append({"node": "perceive", "text": "started"})
    assert s["events"][0]["node"] == "perceive"
