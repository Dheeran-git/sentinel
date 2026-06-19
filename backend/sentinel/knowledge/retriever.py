"""Retrieve relevant law chunks for a query."""
from dataclasses import dataclass

from sentinel.knowledge.index import get_collection


@dataclass
class Hit:
    act: str
    section: str
    text: str
    distance: float


def retrieve(query: str, k: int = 4) -> list[Hit]:
    """Top-k law chunks by semantic similarity."""
    res = get_collection().query(query_texts=[query], n_results=k)
    hits: list[Hit] = []
    for doc, meta, dist in zip(
        res["documents"][0], res["metadatas"][0], res["distances"][0]
    ):
        hits.append(
            Hit(act=meta["act"], section=meta["section"], text=doc, distance=dist)
        )
    return hits
