# SENTINEL Demo Run-Sheet

Audience: CV242TA evaluation panel, RV College of Engineering.
Duration: ~8 minutes.

---

## Before You Present

- [ ] `backend/.env` contains `GOOGLE_API_KEY=<your-key>` (free Gemini key)
- [ ] Law index built: `cd backend && uv run python -m sentinel.knowledge.index`
- [ ] Backend running: `uv run uvicorn sentinel.api:app --reload --port 8000`
- [ ] Frontend running: `cd frontend && npm run dev` (opens on localhost:3000)
- [ ] `frontend/.env.local` has `NEXT_PUBLIC_API=http://localhost:3000`
- [ ] Browser open to http://localhost:3000 in full-screen
- [ ] Test upload works: upload `backend/tests/fixtures/ewaste.jpg` in a dry run

---

## Photo Order (strongest to weakest classifier)

1. **E-waste dumping** — `backend/tests/fixtures/ewaste.jpg`
   Lead with this. Most reliable classification; triggers the e-waste recycler
   routing path which is visually distinct.

2. **Open burning of waste** — `backend/tests/fixtures/open_burning.jpg`
   Second. Clear violation signal; cites Environment (Protection) Act and
   Solid Waste Management Rules; triggers BBMP/ward authority path.

3. **Garbage dumping** — `backend/tests/fixtures/garbage.jpg`
   Third. Strong visual; cites Solid Waste Management Rules 2016.
   Use if time permits.

Fallback if the classifier is uncertain on a photo: describe the violation in
the clarify prompt box — the clarify loop will handle it.

---

## Talking Points — Three Live Agentic Loops

### Loop 1: Clarify (ask_user node)
"The agent didn't get full confidence from the image alone, so it stops and
asks me a question — this is the clarify interrupt. I answer in plain English.
No re-upload, no form. The agent resumes with my context baked in."

### Loop 2: Investigate / self-correct (investigate node)
"While grounding, the agent runs a RAG search over 40-plus real Karnataka and
Central Government statutes. If the first retrieval is weak — below the
confidence threshold — it retries with a reworded query. You can see those
two or three attempts scroll through the mission feed. This is self-correction
without human prompting."

### Loop 3: Human-approve (approve node)
"Before anything is sent, the agent freezes and surfaces the full draft
complaint for my review. I read it, choose Approve and Send, and only then
does the action execute. The human is the irreversible trigger — the agent
cannot bypass this gate."

---

## The Grounded Law Citation

Point to the citation panel after investigation:

"Every sentence in the complaint is footnoted to a real section number and
rule. If the RAG retrieval found no matching rule with sufficient confidence,
the agent would have flagged the violation as ungroundable rather than
hallucinate a citation. Zero hallucinated law — that is the grounding gate."

---

## Approve and Send Moment

"I click Approve and Send. The agent writes the case to the database, issues
a tracking ID starting with SNT-, and pins the location on the impact map.
If I were connected to real email routing, this complaint would go directly to
the BBMP ward office or the recycler. In the demo it is demo-safe — no real
email is sent — but the full code path runs."

---

## Impact Map Pin

"The map shows every submitted report in this session. Each pin carries the
violation category, address, and tracking ID. In a real deployment this would
aggregate crowdsourced reports across the city — a heat map of civic violations
grounded in law."

---

## Fallback Order (Slow Wi-Fi)

1. Kill the live stream pane — polling /stream adds latency.
2. Use the pre-loaded index (already built before the session).
3. If the frontend cannot reach the backend, switch to running curl directly:
   `curl -X POST http://localhost:8000/api/missions -F image=@backend/tests/fixtures/ewaste.jpg -F lat=12.9716 -F lng=77.5946`
   and narrate the JSON response.
4. Keep the recorded screen capture of a full successful run on a USB drive as
   last resort.

---

## Syllabus Hooks (if asked)

- SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), SDG 13
  (Climate Action)
- E-Waste (Management) Rules 2022; Solid Waste Management Rules 2016;
  Environment (Protection) Act 1986; Water (Prevention and Control of
  Pollution) Act 1974
- Agentic AI concepts demonstrated: goal decomposition, RAG, HITL, self-
  correction, multi-step tool use, grounding gates
