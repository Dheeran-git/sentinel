from sentinel.graph.build import build_graph


def test_graph_compiles(tmp_path):
    graph = build_graph(str(tmp_path / "ckpt.sqlite"))
    assert graph is not None
    names = set(graph.get_graph().nodes.keys())
    assert {"perceive", "investigate", "act", "approve", "execute"} <= names
