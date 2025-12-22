# 💙 HANDOFF PROTOCOL — Blankenship Evidence Website
## For Jake and Zach — December 22, 2024

---

## 🚨 CRITICAL INSTRUCTIONS — READ FIRST

1. **NO SUB-AGENTS** — The user has explicitly forbidden testing agents, deployment agents, or any "outside agents." Use your own tools only (curl, screenshot_tool, execute_bash).

2. **ONE URL ONLY** — Production URL is `https://legal-timeline-1.emergent.host/` — NEVER change it, NEVER reference other URLs.

3. **USER IS ON MOBILE** — Android phone, one-finger typing, physically handicapped. Be patient, clear, and concise.

4. **THIS IS PERSONAL** — This website documents evidence of Zachary Blankenship's wrongful conviction. Rylie (aka Rose) is the child. Jake and Zach are family. Treat this with the respect it deserves.

---

## 📋 WHAT EXISTS NOW

A React/FastAPI/MongoDB evidence management system featuring:
- Password-protected entry (`05052017`)
- Admin section (`02071951`)
- Yearly "envelope" navigation with monthly detail logs
- Embedded route map
- **"Who Spoke With Whom"** network diagram (Nov 30, 2013 communications)
- **"Constitutional Violations"** cascade diagram (NEW - from MAR document)

---

## ✅ COMPLETED THIS SESSION

| Feature | Status | Notes |
|---------|--------|-------|
| Deployment sync | ✅ DONE | User can now Re-Deploy to `legal-timeline-1.emergent.host` |
| Big Lots node added | ✅ DONE | Outer ring of "Who Spoke With Whom" |
| Zachary's color changed | ✅ DONE | Now cyan (#00bcd4) — distinct from Tammy's green |
| "Who Spoke With Whom" moved | ✅ DONE | Now inside 2013 section, not main page |
| "Constitutional Violations" diagram | ✅ DONE | New component `ViolationsCascade.jsx` |
| Admin: Delete button per row | ✅ DONE | Red trash icon at end of each timeline row |
| Admin: "Reassign #s" button | ✅ DONE | Reorders entries by time (earliest first) |
| Rylie name updated | ✅ DONE | Shows as "Rylie aka Rose" not "R.E.B." |

---

## 🔴 NEEDS DEPLOYMENT

All features above are in the code but user needs to **Re-Deploy** to see them live.

**After fork, first action should be:**
> Guide user to tap Re-Deploy, then screenshot `https://legal-timeline-1.emergent.host/index` with 2013 section open to verify both buttons appear.

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `/app/frontend/src/components/ViolationsCascade.jsx` | NEW — Constitutional Violations diagram |
| `/app/frontend/src/components/CommunicationDiagram.jsx` | Who Spoke With Whom diagram |
| `/app/frontend/src/components/MonthlyDetail.jsx` | Timeline table with admin controls |
| `/app/frontend/src/pages/IndexPage.jsx` | Main page with 2013 section buttons |
| `/app/backend/server.py` | API endpoints including `/api/monthly/{month_key}/reassign` |

---

## 🎨 CONSTITUTIONAL VIOLATIONS DIAGRAM

Built from the MAR (Motion for Appropriate Relief) document. Contains:

**CENTER (Hexagon):**
- Gabriele & Keith Blankenship — "ROOT CAUSE: Adoption Agenda"

**INNER RING (8 Key Actors):**
- Jennifer Owen (CPS Intake, Former Police)
- SW Reitzel (CPS Supervisor)
- Sr. Inv. McCombs (Catawba Sheriff — false warrant dates)
- Beth Oshbar (Nurse Practitioner — CME exam)
- Adrienne Opdyke (Forensic Interviewer)
- District Attorney (Brady violations)
- Trial Counsel (Strickland failures)
- Herbert Pearce (Resentencing — "just met defendant")

**OUTER RING (17+ Officials):**
- CPS workers, Law enforcement, Medical, Courts, Foster care, Family court
- Amy Walker ✓ (Found NO evidence — suppressed)
- Bobbi Jo Christopher ✓ (Foster mom — child told her truth — suppressed)
- Rylie aka Rose (Child — later accused GRANDPARENTS)

**Color-coded violations:** 4th, 5th, 6th, 14th Amendments, Brady, Strickland, Franks, CPS Protocol

---

## 🐛 KNOWN ISSUE

**Timeline line numbers:** User wanted line 15 (Tammy 8:30am Big Lots) moved to line 1. Database was updated but production DB is separate. The new **"Reassign #s"** button should fix this — user needs to:
1. Open Nov 30 timeline as Admin
2. Tap "🔄 Reassign #s"
3. Entries will reorder by time (8:30am becomes line 1)

---

## 📝 PENDING TASKS (User's Backlog)

| Priority | Task |
|----------|------|
| P1 | Time-sliced diagrams (filter by hour range, e.g., 8am-11am) |
| P2 | Add 2 blank entries at TOP of Nov 30 timeline |
| P3 | MS Word upload support (.doc, .docx) |
| P4 | Relationship Matrix feature |

---

## 🔐 CREDENTIALS

- **Site Entry:** `05052017`
- **Admin Password:** `02071951`

---

## 💬 USER COMMUNICATION STYLE

- Direct, no fluff
- Loves collaboration ("think with me")
- Appreciates wit and warmth
- References "Jake and Zach" — this is family
- Uses 💙 emoji
- Gets frustrated with: URL changes, sub-agents, unnecessary questions

---

## 🛠️ TESTING PROTOCOL

**DO NOT use testing sub-agents.** Instead:
- `curl` for backend endpoints
- `screenshot_tool` for frontend verification
- Always use production URL for screenshots after deployment

---

## 📸 SCREENSHOT WORKAROUND

If modal won't open via click in screenshot tool:
1. Temporarily edit state to `useState(true)` 
2. Take screenshot
3. Immediately revert to `useState(false)`

---

## 💙 FINAL NOTE

This isn't just a website. It's evidence of a family torn apart by false allegations. Every feature we build helps tell the truth. 

Be the hero this family needs.

For Jake and Zach. 💙

---

*Handoff prepared with care — December 22, 2024*
