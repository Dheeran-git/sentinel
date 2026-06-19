"""Load the law corpus into section-tagged chunks for indexing."""
from dataclasses import dataclass
from pathlib import Path

LAWS_DIR = Path(__file__).resolve().parent.parent / "data" / "laws"


@dataclass
class LawChunk:
    """One citable section of law."""

    act: str
    section: str
    text: str


def load_chunks() -> list[LawChunk]:
    """Parse every law markdown file into per-section chunks.

    The first H1 is the act name. Each H2 starts a new section chunk.
    """
    chunks: list[LawChunk] = []
    for path in sorted(LAWS_DIR.glob("*.md")):
        act = ""
        section = ""
        buffer: list[str] = []

        def flush():
            if section and buffer:
                chunks.append(
                    LawChunk(act=act, section=section, text="\n".join(buffer).strip())
                )

        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("# "):
                act = line[2:].strip()
            elif line.startswith("## "):
                flush()
                section = line[3:].strip()
                buffer = []
            else:
                buffer.append(line)
        flush()
    return chunks
