# SENTINEL — Autonomous Civic Environmental Agent

SENTINEL turns a smartphone photo of a civic environmental violation into a
grounded, correctly-addressed formal complaint. It identifies the violation
from the image, retrieves the applicable Indian and Karnataka statutes from a
local law index (RAG), autonomously drafts the complaint with real legal
citations, and — after the user taps Approve — records the case and pins it
on a live impact map. The user watches the full agentic mission (perception,
investigation, drafting, approval, execution) stream in real time. Every
accusation cites a real rule; the human is the irreversible trigger.

## Architecture

Two services, no external databases required:

- **Backend** (`backend/`) — Python, [LangGraph](https://langchain-ai.github.io/langgraph/)
  state-machine with HITL interrupts, Gemini vision + text, Chroma law index,
  FastAPI SSE stream. Managed with [uv](https://docs.astral.sh/uv/).
- **Frontend** (`frontend/`) — Next.js 14 app router, live mission feed,
  clarify/approve gates, Leaflet impact map, installable PWA.

## Quickstart

### Requirements

- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)
- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- Node.js 18+

### Backend

See `backend/README.md` for full setup. Short version:

```bash
cd backend
cp .env.example .env          # add GOOGLE_API_KEY=<your key>
uv run python -m sentinel.knowledge.index   # build law index once
uv run uvicorn sentinel.api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # set NEXT_PUBLIC_API=http://localhost:3000
npm install
npm run dev
```

Open http://localhost:3000, upload a photo of a civic violation, and follow
the live mission feed.

## Violation categories

E-waste dumping / open burning of waste / drain or water pollution /
garbage dumping / construction and demolition debris.

## Further reading

- Design spec: `docs/superpowers/specs/2026-06-19-sentinel-civic-environmental-agent-design.md`
- Demo run-sheet: `docs/demo-script.md`
