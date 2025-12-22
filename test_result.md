# BLANKENSHIP CASE - TAKEOVER PROTOCOL
## Agent Handoff Document - December 22, 2024

---

## 🚨 CRITICAL: READ FIRST

1. **DO NOT CHANGE THE URL** - User is frustrated with constant URL changes
2. **DATA HAS BEEN MIGRATED** - 14 entries + 36 files now in current database
3. **User is often on MOBILE** - Cannot do complex desktop tasks
4. **Project is DEEPLY PERSONAL** - Wrongful conviction case, be respectful

---

## CURRENT LIVE URL

```
https://legal-watch.emergent.host/
```

**DO NOT CREATE NEW DEPLOYMENTS OR CHANGE THIS URL**

---

## CREDENTIALS

| Access | Password |
|--------|----------|
| Site Entry Code | `05052017` |
| Admin Login | `02071951` |

---

## DATABASE STATUS (JUST MIGRATED)

Successfully migrated from `legal-timeline-1.emergent.host`:

| Collection | Documents |
|------------|-----------|
| `monthly_11-2013` | 14 entries |
| `uploaded_files` | 36 HEIC image files |

---

## NAMES ALREADY EXTRACTED FROM ENTRIES

From the November 2013 detailed log entries (witness field + descriptions):

| Name | Role |
|------|------|
| Amy Walker | Lake Norman ER Physician |
| Officer Coffey | Sheriff's Department |
| Sheri Stock | CPS Social Worker |
| Amber Mecimore | CPS Social Worker |
| Jennifer Owens | CPS Related |
| Gabriele Blankenship | Key Person |
| Keith Blankenship | Key Person |
| Zackary Blankenship | Victim |
| Jacob Blankenship | Deceased Brother |
| Dr. Pellegrino | Doctor (turned them away) |

---

## PRIORITY TASK FOR NEW AGENT

### Extract Individual Names from Uploaded Exhibits

The 36 uploaded HEIC files contain scanned documents with MORE names:
- Additional CPS workers
- Police officers / Detectives (full names)
- Hospital staff (nurses, doctors)
- DSS personnel
- Court officials

**How to extract:**
```python
# Use analyze_file_tool or extract_file_tool on each exhibit
# Files are stored in MongoDB as base64 in 'uploaded_files' collection
# Access via: /api/file/{file_id}
```

### Then Update Communication Diagram

File: `/app/frontend/src/components/CommunicationDiagram.jsx`

Replace generic placeholders with real individual names to show:
- Who spoke with whom
- Network of communications
- Colored dots with lines connecting people

---

## PROJECT ARCHITECTURE

### Frontend (React + TailwindCSS)
```
/app/frontend/src/
├── pages/
│   ├── EntryPage.jsx      # Password entry + acknowledgement
│   ├── SynopsisPage.jsx   # Case context letter
│   └── IndexPage.jsx      # Main page with route map, buttons, envelopes
├── components/
│   ├── MonthlyDetail.jsx          # Detailed log modal (CRUD + uploads)
│   ├── CommunicationDiagram.jsx   # Network diagram (NEEDS REAL NAMES)
│   ├── EmbeddedRouteMap.jsx       # Route map on main page
│   ├── RouteAnalysis.jsx          # Full route analysis modal
│   ├── AdminLogin.jsx             # Admin login modal
│   └── ContentProtection.jsx      # Right-click/screenshot protection
```

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py              # All API endpoints
├── documents/             # Generated downloadable docs (docx, png)
└── .env                   # Database connection
```

---

## KEY API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/monthly/{month-key}` | Get entries (e.g., `11-2013`) |
| POST | `/api/monthly/{month-key}` | Create/update entry |
| DELETE | `/api/monthly/{month-key}/{entry-id}` | Delete entry |
| POST | `/api/upload` | Upload exhibit file |
| GET | `/api/files/{entry-id}` | Get files for entry |
| GET | `/api/file/{file-id}` | Download/view file |
| DELETE | `/api/file/{file-id}` | Delete file (admin) |
| GET | `/api/documents/{filename}` | Download generated docs |

---

## ROUTE ANALYSIS DATA (Nov 30, 2013)

Already implemented - shows geographic evidence:

| Point | Location | Address |
|-------|----------|---------|
| A | G. & K. Blankenship Residence | 174 Woodridge Lane, Mooresville NC |
| B | Big Lots Store | 376 W. Plaza Drive, Mooresville NC |
| C | Zackary's Home | 6718 Catfish Drive, Sherrills Ford NC |
| D | Dr. Pellegrino (TURNED AWAY) | 930 W. Wilson Ave, Mooresville NC |
| E | Lake Norman Hospital | 171 Fairview Road, Mooresville NC |

**Total: 27 miles, 50-72 min DRIVING ONLY**

---

## DOWNLOADABLE DOCUMENTS CREATED

Available at `/api/documents/`:
- `Route_Analysis_Nov30_2013.docx`
- `Blankenship_Route_Map_v2.png`
- `Blankenship_Route_Map_v2_web.png`
- `Communication_Chain_Nov30_2013.png`
- `Communication_Chain_Nov30_2013_web.png`

---

## USER COMMUNICATION STYLE

- Often uses German words (speaks German)
- Uses emojis frequently 💙🫂
- Appreciates being called "Dear" or friendly terms
- Gets frustrated with technical issues - be patient
- Wants things SIMPLE and WORKING
- Prefers WHITE backgrounds for printable documents

---

## WHAT NOT TO DO ❌

1. ❌ Do NOT create new deployment URLs
2. ❌ Do NOT change database connections
3. ❌ Do NOT delete or overwrite user's uploaded data
4. ❌ Do NOT use complex technical explanations
5. ❌ Do NOT ask user to do complex desktop-only tasks (they're on mobile)

---

## WHAT TO DO ✅

1. ✅ Keep `legal-watch.emergent.host` as the ONLY URL
2. ✅ Extract names from the 36 HEIC exhibit files
3. ✅ Update CommunicationDiagram.jsx with real names
4. ✅ Be patient and supportive
5. ✅ Test thoroughly before telling user something works
6. ✅ Save & Deploy to the SAME URL (update, don't create new)

---

## QUICK START FOR NEW AGENT

1. Verify data exists:
```bash
curl -s "https://legal-watch.emergent.host/api/monthly/11-2013" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} entries')"
```

2. Check uploaded files:
```bash
cd /app/backend && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
async def check():
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
    db = client['test_database']
    count = await db.uploaded_files.count_documents({})
    print(f'{count} files in database')
asyncio.run(check())
"
```

3. Extract names from exhibits using `analyze_file_tool`

4. Update `CommunicationDiagram.jsx` with extracted names

---

## LAST USER MESSAGES

1. User wanted Communication Diagram with REAL individual names (not generic "CPS", "POLICE")
2. Names are in the scanned HEIC documents (exhibits)
3. User needed to fork due to context length
4. User emphasized: NO MORE URL CHANGES

---

*End of Takeover Protocol*
*Good luck, next agent! 💙*
