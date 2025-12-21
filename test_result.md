# BLANKENSHIP CASE - HANDOFF REPORT / ÜBERGABE BERICHT
## Fork Date: December 21, 2024

---

## ORIGINAL PROBLEM STATEMENT
Build a private, password-protected website named "Blankenship" to document evidence of a wrongful conviction. The site serves as a judicial archive for presenting evidence of Zackary Blankenship's wrongful imprisonment.

---

## PRODUCT REQUIREMENTS
1. **Entry Page:** Password-protected entry (`05052017`) with mandatory scroll-to-accept Terms of Use
2. **Synopsis Page:** Intermediate page with case context letter
3. **Monthly Detailed Logs:** Year envelopes (2013, 2014, 2015) containing monthly logs with evidence entries
4. **Admin Functionality:** Secure admin section (password: `02071951`) for content management
5. **Exhibit Uploads:** Upload/view evidence files (PDFs, images) - stored in MongoDB
6. **Content Protection:** View-only popup for exhibits, right-click disabled
7. **Aesthetic:** Serious "courthouse/legal chamber" design

---

## WHAT CURRENTLY EXISTS & WORKS ✅

### Core Functionality
- ✅ Entry page with acknowledgement notice + password
- ✅ Synopsis page with case letter
- ✅ Index page with year envelopes (2013, 2014, 2015)
- ✅ Monthly Detailed Logs with full CRUD (Add, Edit, Delete entries)
- ✅ Exhibit uploads stored in MongoDB (persistent)
- ✅ Exhibit popup viewer (view-only for readers, no download)
- ✅ Admin login via Shield icon
- ✅ Line numbers in Detailed Log table
- ✅ Wide Notes column for better readability
- ✅ Content protection (right-click disabled, screenshot warning)

### New Features Added This Session
- ✅ **Embedded Route Map** - Geographic route analysis displayed at top of main page
- ✅ **Route Analysis Button** - Opens detailed Nov 30, 2013 route analysis modal
- ✅ **"Who Spoke With Whom" Button** - Communication network diagram (replaced Genogram)
- ✅ **Downloadable Documents Created:**
  - Route_Analysis_Nov30_2013.docx (Word document)
  - Blankenship_Route_Map_v2.png (Visual map - white background)
  - Communication_Chain_Nov30_2013.png (Chain diagram)

---

## LIVE URLs

| Type | URL |
|------|-----|
| **DEPLOYED (LIVE)** | `https://legal-timeline-1.emergent.host` |
| Preview | `https://legal-timeline-1.preview.emergentagent.com` |
| Custom Domain (owned) | `www.blankenship.eu` (NOT YET LINKED) |

---

## CREDENTIALS

| Access | Password |
|--------|----------|
| Site Entry Code | `05052017` |
| Admin Login | `02071951` |

---

## PENDING / IN-PROGRESS TASKS 🔶

### HIGH PRIORITY - Communication Network Diagram
**User Request:** Replace generic labels (DSS, POLICE, HOSPITAL) with actual individual names from scanned evidence documents.

**Status:** The Communication Diagram component exists and works, but needs real names extracted from:
- Uploaded exhibits in November 2013 entries
- Scanned documents contain: CPS worker names, detective names, officer names, hospital staff names

**Blocker:** The scanned documents with names are on the LIVE site database, not accessible from preview environment. 

**Next Steps for New Agent:**
1. Access the uploaded exhibits from the live database
2. Use `analyze_file_tool` or `extract_file_tool` to read scanned PDFs/images
3. Extract all individual names (CPS workers, police, detectives, hospital staff, etc.)
4. Update `CommunicationDiagram.jsx` with real names instead of generic placeholders
5. Create connections showing who actually communicated with whom

### MEDIUM PRIORITY
- Link custom domain `www.blankenship.eu` to deployed site (user couldn't do from mobile)
- Update Route Analysis documents with note: "Dr. Pellegrino stop was brief - turned away, advised to go to ER"

### LOW PRIORITY / FUTURE
- Relationship Matrix (Option D) - Grid showing interaction frequency between people
- MS Word (.doc, .docx) upload support

---

## KEY FILES

### Frontend
| File | Purpose |
|------|---------|
| `/app/frontend/src/pages/IndexPage.jsx` | Main page with route map, buttons, envelope icons |
| `/app/frontend/src/pages/EntryPage.jsx` | Password entry with acknowledgement |
| `/app/frontend/src/pages/SynopsisPage.jsx` | Case context letter |
| `/app/frontend/src/components/MonthlyDetail.jsx` | Detailed log modal with entries table, uploads, exhibit viewer |
| `/app/frontend/src/components/CommunicationDiagram.jsx` | Network web diagram (needs real names) |
| `/app/frontend/src/components/EmbeddedRouteMap.jsx` | Route map displayed on main page |
| `/app/frontend/src/components/RouteAnalysis.jsx` | Full route analysis modal |
| `/app/frontend/src/components/AdminLogin.jsx` | Admin login modal |
| `/app/frontend/src/components/ContentProtection.jsx` | Right-click/screenshot protection |

### Backend
| File | Purpose |
|------|---------|
| `/app/backend/server.py` | All API endpoints including file upload/download, monthly entries |
| `/app/backend/documents/` | Generated downloadable documents (docx, png) |

---

## DATABASE SCHEMA (MongoDB)

### Collections in `test_database`:
- `timeline_entries` - Legacy (not used after removing Evidence Timeline)
- `uploaded_files` - Exhibit files stored as base64
  ```
  {file_id, filename, file_type, file_size, file_content (base64), entry_id, upload_date}
  ```
- `monthly_{MM-YYYY}` - Monthly detailed log entries
  ```
  {id, date, time, witness, description, evidence, notes, created_at, updated_at}
  ```

---

## API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/monthly/{month-key}` | Get entries for a month (e.g., `11-2013`) |
| POST | `/api/monthly/{month-key}` | Create/update entry |
| DELETE | `/api/monthly/{month-key}/{entry-id}` | Delete entry |
| POST | `/api/upload` | Upload exhibit file (stores in MongoDB) |
| GET | `/api/files/{entry-id}` | Get files for an entry |
| GET | `/api/file/{file-id}` | Download/view file content |
| DELETE | `/api/file/{file-id}` | Delete file (admin) |
| GET | `/api/documents/{filename}` | Download generated documents |

---

## ROUTE ANALYSIS DATA (Nov 30, 2013)

### Points:
- **A:** 174 Woodridge Lane, Mooresville NC (G. & K. Blankenship Residence)
- **B:** Big Lots Store, 376 W. Plaza Drive, Mooresville NC
- **C:** 6718 Catfish Drive, Sherrills Ford NC (Zackary's Home)
- **D:** Dr. Pellegrino, 930 W. Wilson Ave, Mooresville NC (TURNED AWAY)
- **E:** Lake Norman Hospital, 171 Fairview Road, Mooresville NC

### Distances & Times:
- A→B: 4.2 mi, 8-12 min
- B→C: 9.8 mi, 18-25 min (crosses county line)
- C→D: 11.2 mi, 20-28 min
- D→E: 1.8 mi, 4-7 min
- **TOTAL: 27 miles, 50-72 min DRIVING ONLY**

---

## USER PREFERENCES & NOTES

1. **Language:** User is German-speaking (sometimes uses German words)
2. **Device:** Often on mobile - can't do complex desktop tasks
3. **Tone:** Project is deeply personal and emotional - be respectful and supportive
4. **Visual Style:** Clean, professional, white backgrounds for printable documents
5. **Data:** User has been entering real case data into November 2013 detailed logs on LIVE site

---

## RECENT USER MESSAGES (Context)

1. User requested Communication Network diagram showing "who spoke with whom"
2. User showed reference image of network web (colored dots connected by lines)
3. User specified: Need REAL individual names from scanned documents, not generic "CPS" or "POLICE"
4. User confirmed names are in the uploaded exhibits in November 2013 entries
5. User requested fork with detailed handoff report

---

## WHAT NEW AGENT MUST DO FIRST

1. **Connect to LIVE database** to access actual uploaded exhibits
2. **Extract names from scanned documents** (PDFs/images in exhibits)
3. **Update Communication Diagram** with real names:
   - Individual CPS/DSS workers
   - Individual police officers/detectives  
   - Individual hospital staff
   - Anyone else mentioned in documents
4. **Test on live site** at `https://legal-timeline-1.emergent.host`

---

## TECHNICAL NOTES

- Frontend: React with TailwindCSS
- Backend: FastAPI with Motor (async MongoDB)
- File storage: MongoDB (base64 encoded) - NOT filesystem
- Hot reload enabled - no restart needed for code changes
- Supervisor manages services: `sudo supervisorctl restart backend/frontend`

---

## DOWNLOADABLE DOCUMENTS CREATED

All available at `/api/documents/{filename}`:
- `Route_Analysis_Nov30_2013.docx`
- `Blankenship_Route_Map_v2.png`
- `Blankenship_Route_Map_v2_web.png`
- `Communication_Chain_Nov30_2013.png`
- `Communication_Chain_Nov30_2013_web.png`

---

*End of Handoff Report*
