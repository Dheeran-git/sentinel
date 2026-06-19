"""Build and load a persistent Chroma collection from the law corpus."""
from pathlib import Path

import chromadb
from chromadb.utils import embedding_functions

from sentinel.knowledge.corpus import load_chunks

INDEX_DIR = Path(__file__).resolve().parent.parent / "data" / "index"
COLLECTION = "laws"

_embed = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="BAAI/bge-small-en-v1.5"
)


def _client():
    return chromadb.PersistentClient(path=str(INDEX_DIR))


def build_index() -> int:
    """(Re)build the collection. Returns the number of chunks indexed."""
    client = _client()
    try:
        client.delete_collection(COLLECTION)
    except Exception:
        pass
    col = client.create_collection(COLLECTION, embedding_function=_embed)
    chunks = load_chunks()
    col.add(
        ids=[f"{i}" for i in range(len(chunks))],
        documents=[c.text for c in chunks],
        metadatas=[{"act": c.act, "section": c.section} for c in chunks],
    )
    return len(chunks)


def get_collection():
    """Return the existing collection (build first if missing)."""
    client = _client()
    try:
        return client.get_collection(COLLECTION, embedding_function=_embed)
    except Exception:
        build_index()
        return client.get_collection(COLLECTION, embedding_function=_embed)
