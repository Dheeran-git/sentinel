# SENTINEL — Autonomous Civic Environmental Agent

Design spec. Date: 2026-06-19. Course: Environment & Sustainability (CV242TA), RV College of Engineering.

## One-line concept

A multimodal autonomous agent: you snap a photo of a real civic environmental
violation, it identifies the issue and grounds it in real Indian/Karnataka law,
autonomously drafts the correct civic action (complaint + evidence dossier +
responsible authority), and after your one-tap approval, sends it and returns a
tracking ID. You watch the whole mission run live.

Tagline: "See it. Prove it. Act on it."

## Why this project

- Novel: it perceives the physical world (camera) and takes real action in it
  (produces and sends real artifacts), rather than being another document
  summarizer.
- Visually striking: a polished, professional web app plus a live "mission feed"
  of the agent reasoning and acting, plus an impact map.
- Practical and feasible: software only, public data only, no sensors, no paid
  APIs, buildable by 1-2 people in a few weeks.
- Strong syllabus fit: Environmental Pollution; Solid/Hazardous/E-Waste
  management; Environmental Protection Acts; EIA; CSR; SDGs 11/12/13.
- Full agentic showcase: goal decomposition, action-planning loops,
  self-reflection/feedback loops, multi-agent tool use, RAG, memory, guardrails,
  human-in-the-loop.

## Goals

- Turn a single photo into a grounded, correctly-addressed civic action.
- Make every accusation cite a real rule (no hallucinated law).
- Keep a human as the final trigger for any irreversible send.
- Stream the agent's reasoning so the demo is visually alive.
- Zero spend: free models and free data sources only.

## Non-goals (explicitly out of scope)

- Multi-day "watch and escalate" tracking loops. Removed: cannot be demonstrated
  in a live evaluation. A tracking ID is still produced as an artifact; the agent
  does not wait for replies.
- Real submission to live government offices during the demo. Sends route to a
  controlled, demo-safe inbox.
- Native mobile app store build. The web app is responsive and installable as a
  PWA, which covers mobile and desktop.

## Scope

### MVP — the wow-critical spine (build first, demo this)

1. Snap/upload a photo. Vision identifies the violation type, severity, and
   location (device geolocation at capture, EXIF if present, or manual map pin).
2. RAG over real law determines which rule is broken and which authority is
   responsible.
3. Agent autonomously produces artifacts: a formal complaint letter, a one-page
   evidence dossier (PDF), the correct authority contact, and the nearest action
   point (certified recycler for e-waste; jurisdiction authority otherwise).
4. "Approve & Send" gate: user reviews/edits, approves, the agent sends to a
   demo-safe inbox and returns a tracking ID.
5. Live mission feed: every step streams to the UI in real time.

### Stretch goals (only if time; never block the MVP)

- Impact map of all past reports.
- Auto-generated awareness post.
- Browser automation to fill a real grievance-portal form.

## Architecture — two services

- Backend: Python, FastAPI, LangGraph (the agent brain). Streams steps via SSE.
- Frontend: Next.js (React, App Router), responsive, talks to the backend API.

### LangGraph mission flow

One photo enters; a finished, signed-off civic action exits. A "case file" state
object flows through the graph nodes.

```
   [PERCEIVE]   vision: violation type? severity? location?
        |
        v
   <confident & located?> --no--> [ASK USER] --+   LIVE LOOP #1 (clarify)
        | yes                                  |
        +<-------------------------------------+
        v
   [INVESTIGATE]   RAG over real law + web: which rule? which authority?
        |
   <grounding strong?> --no--> [REFINE QUERY] --+   LIVE LOOP #2 (self-correct)
        | yes                                   |
        +<--------------------------------------+
        v
   [PLAN]   goal decomposition: which artifacts does THIS case need?
        |
        v
   [ACT in parallel]   draft complaint | build PDF dossier | find authority + recycler
        |
        v
   [APPROVE GATE]   show artifacts to the user (LangGraph interrupt)
        |
   <approve / edit / reject> --edit--> [REFINE] --+   LIVE LOOP #3 (human-in-loop)
        | approve                                 |
        +<--------------------------------------- +
        v
   [EXECUTE]   send (demo-safe) -> confirmation + tracking ID -> log to case memory
```

### The three demonstrable loops (the agentic showcase)

- Loop #1 Clarify: ambiguous photo or missing location -> agent asks one sharp
  question, then re-perceives. Shows it reasons about its own uncertainty.
- Loop #2 Self-correct: weak law-grounding -> agent rewrites its own search query
  and retries. Shows it refuses to guess.
- Loop #3 Human-in-the-loop: user edits an artifact -> agent regenerates. The
  Approve & Send gate is the guardrail.

All three fire within a single live mission, so all are demoable.

## Components (short, focused modules)

Backend:
- `perception/` — multimodal vision classification + location resolution.
- `knowledge/` — RAG: corpus loader, chunker/indexer, retriever over the law base.
- `investigation/` — map issue -> rule -> authority; grounding-confidence check.
- `actions/` — artifact generators: complaint drafter, PDF dossier builder,
  authority/recycler finder, (stretch) awareness card.
- `graph/` — the LangGraph StateGraph: nodes, conditional edges, interrupt for HITL.
- `delivery/` — email sender (demo-safe), tracking ID, case logger.
- `memory/` — SQLite case store + impact-map data.
- `api/` — FastAPI app with SSE streaming endpoints.

Frontend:
- `web/` — Next.js app: capture screen, live mission feed, artifact cards,
  approve-and-send, impact map.

## Brain (LLM) — free, multimodal

- Provider: Google Gemini via `langchain-google-genai` (free tier, no credit card,
  multimodal vision built in).
- Default workhorse: Gemini 2.5 Flash (~1,500 requests/day free; vision; fast).
- Optional max-reasoning: Gemini 2.5 Pro (smartest free; ~50 requests/day free)
  reserved for the single hardest node (law-grounding), if desired.
- Rationale: best free multimodal intelligence in 2026 without hitting limits
  mid-demo. Verified against current free-tier comparisons (June 2026).

## Tech stack

- Python 3.13, managed with `uv` (`uv run`, `uv add`).
- Orchestration: LangGraph `StateGraph` + `interrupt()` + SQLite checkpointer.
- LLM: Gemini 2.5 Flash (and optional Pro) via `langchain-google-genai`.
- RAG: Chroma vector store + local embeddings (sentence-transformers, offline and
  free; no API quota). Gemini free embeddings are an alternative. Chunks tagged
  with metadata `{act, section, authority}`.
- Tools: Tavily (web search), `smtplib` (email), WeasyPrint (PDF), Nominatim/OSM
  (geocoding + reverse geocoding), Pillow (EXIF), haversine (nearest distance).
- Memory/state: SQLite for the case log and the paused-mission checkpoints.
- Backend: FastAPI with Server-Sent Events for the live mission feed.
- Frontend: Next.js (App Router), TypeScript, Tailwind, Framer Motion, Leaflet
  (maps). Responsive (mobile + desktop), installable PWA.

## Location resolution (honest design)

Location comes from the device, not the pixels:
1. Primary: browser Geolocation API at capture time -> device GPS lat/long.
2. Bonus: if an uploaded image carries EXIF GPS, read it with Pillow.
3. Fallback: user drops a pin on a Leaflet map or types an address geocoded via
   Nominatim. Never blocks the mission.

## Authority and recycler routing (honest design)

- Certified e-waste recyclers: a curated JSON dataset built from public CPCB/KSPCB
  authorized-recycler lists (name, address, type, contact), each geocoded once via
  Nominatim to lat/long. At runtime, compute haversine distance from the user's
  location and return the nearest few + map pin + directions link.
- Non-e-waste civic issues (dumping, open burning, drain pollution): reverse
  geocode the user's coordinates -> resolve the BBMP ward/zone -> pull that ward's
  grievance contact from a curated ward dataset. Routing = location ->
  jurisdiction -> authority.
- Caveat: quality depends on the curated dataset; we build a solid Bengaluru
  dataset for the demo. No live national API is assumed.

## Knowledge base (RAG corpus — real law)

- E-Waste (Management) Rules 2022
- Solid Waste Management Rules 2016
- Plastic Waste Management Rules (amended)
- Noise Pollution (Regulation and Control) Rules 2000
- Air (Prevention and Control of Pollution) Act 1981
- Water (Prevention and Control of Pollution) Act 1974
- Environment (Protection) Act 1986
- CPCB / KSPCB guidelines and BBMP grievance procedures
- Curated authorities + certified-recyclers directory (JSON) for Bengaluru/Karnataka
- SDG 11/12/13 targets

Each chunk is tagged with `{act, section, authority}` so the complaint cites a
specific rule and routes to a specific authority, grounded rather than fabricated.

## Demo violation categories (all of them)

The hero demo covers the full set so any judge photo lands somewhere:
- Illegal e-waste dumping
- Open burning of waste / plastic
- Drain or lake sewage / water pollution
- Overflowing bins / garbage dumping in public space
- Construction & demolition debris dumping
- (Air/noise as applicable)

## Data flow (single mission)

1. Photo + device location -> `perception/`: image to Gemini vision -> structured
   issue `{type, severity, hazards, est_quantity}`; location resolved as above.
2. If low confidence or no location -> Loop #1 clarify (one question to user).
3. Issue + location -> `investigation/`: retrieve top law chunks from Chroma,
   web-search/look up the responsible authority and nearest recycler. If grounding
   weak -> Loop #2 refine query and retry.
4. `graph/` PLAN node decomposes the needed artifacts.
5. `actions/` runs generators in parallel: complaint letter (cites retrieved
   rule), PDF dossier (WeasyPrint), authority card + map pin.
6. APPROVE GATE: LangGraph `interrupt()` pauses; UI shows artifacts; user
   approves/edits/rejects (Loop #3 on edit).
7. `delivery/`: send to demo-safe inbox -> confirmation + tracking ID; `memory/`
   logs the case and adds a pin to the impact map.

## Frontend design language (decided)

A deliberately non-generic, professional, light-theme aesthetic. Not AI slop.

- Theme: light. Warm paper background (off-white / cream), never stark white.
- Palette: deep forest/emerald green (primary, environmental and confident) +
  warm terracotta/clay accent (energy, CTAs) + warm stone neutrals + cream cards.
  Distinctive and earthy. Explicitly NO blue, violet, purple, or indigo, and NO
  purple-blue ("blurple") gradients anywhere.
- Typography: an editorial pairing — a characterful serif for headings
  (e.g., Fraunces) + a clean modern grotesk for body (e.g., Geist / General Sans).
  Avoid the overused default-Inter look.
- Motion: smooth, satisfying micro-interactions via Framer Motion. The mission
  feed streams in with gentle enter animations; the Approve & Send button has a
  tactile press.
- Layout: mobile-first and fully responsive. Desktop uses a split view (photo +
  live mission feed side by side); mobile stacks them.
- Inspiration (polish and warmth, not their palettes): Stripe (spacing, type
  precision), Airbnb (warm, friendly light UI), Notion (calm, content-first),
  Patagonia/Allbirds (earthy sustainability feel), Linear (motion quality only).
- Feel: premium, smooth, trustworthy, editorial. Looks like a real company's
  product, not a template.

## Guardrails and safety

- Human-in-the-loop approval before any send. No autonomous irreversible action.
- Demo-safe inbox; no real authority is contacted during evaluation.
- "Not an environmental violation" detection -> graceful refusal.
- Grounding requirement: the agent must cite a retrieved rule, or it returns
  "uncertain, needs human review" instead of inventing a law.
- Ignores any instructions embedded in uploaded images (prompt-injection
  hygiene); acts only within environmental scope.

## Error handling (kept simple)

- Low-confidence vision -> clarify loop (one question).
- Empty/weak RAG retrieval -> refine query once, else flag uncertain.
- Tool/web failure -> retry once, then continue with partial results; do not
  crash the mission.
- Missing location -> ask the user to drop a map pin.

## Testing

- Golden set: sample photos per violation category with expected issue-type and
  expected authority; integration test asserts the pipeline reaches the right
  outcome.
- Unit tests: location resolution (EXIF + geocode), retrieval returns the relevant
  rule, complaint includes a citation, email routes to the safe inbox, "not a
  violation" path, haversine nearest-recycler.
- Demo-proofing: corpus pre-indexed; rock-solid sample photos that always run
  clean; local embeddings so it works on flaky wifi.

## Syllabus and roadmap mapping

- Syllabus: Environmental Pollution; Solid/Hazardous/E-Waste management;
  Environmental Protection Acts; EIA; CSR; SDGs 11/12/13.
- Agentic roadmap: multimodal LLM (vision), tool use and integration, multi-agent
  collaboration, goal decomposition, action-planning loops,
  self-reflection/feedback loops, LangGraph orchestration with guardrails and
  HITL, RAG (LangChain RAG, vector store, query refinement), memory (episodic +
  long-term case store), deployment (FastAPI + Next.js), monitoring (LangSmith),
  security/governance (HITL approval, prompt-injection hygiene).

## Open questions / setup dependencies

- Google AI Studio free API key required (free, needs a Google account).
- Tavily free API key for web search (free tier) — or substitute a free search.
- Email transport: `smtplib` to a demo inbox (default) vs Gmail API.
- Embedding model: local sentence-transformers (default, e.g. bge-small-en) vs
  Gemini free embeddings.
