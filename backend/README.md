# SENTINEL Backend

AI-powered environmental complaint triage: vision analysis, geo-grounding, law retrieval, and automated agency routing.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python package manager)
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

Copy `.env.example` to `.env` and set your key:

```
cp .env.example .env
# edit .env and set GEMINI_API_KEY=<your key>
```

## Install

`uv sync` runs automatically on first `uv run`. No manual install step needed.

## Run tests

```
uv run pytest
```

Tests that require vision or geo-grounding are skipped automatically without a Gemini API key.

## Build the law index

```
uv run python -c "from sentinel.knowledge.index import build_index; build_index()"
```

Run once before using the CLI or API. Indexes environmental law chunks into a local Chroma collection.

## CLI

```
uv run python -m sentinel.cli tests/fixtures/ewaste.jpg 12.9716 77.5946
```

## API server

```
uv run uvicorn sentinel.api.main:app --reload
```

Endpoints:

- `POST /mission/start` - start a mission (SSE stream)
- `POST /mission/resume` - resume after a HITL interrupt (SSE stream)
- `GET /cases` - list submitted cases
- `GET /artifacts/<file>` - serve generated dossier PDFs
