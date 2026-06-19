from sentinel.knowledge.index import build_index
from sentinel.knowledge.retriever import retrieve


def test_retrieve_finds_ewaste_rule():
    build_index()
    hits = retrieve("someone dumped old computers and circuit boards on the road")
    assert hits
    assert any("e-waste" in h.act.lower() for h in hits)
