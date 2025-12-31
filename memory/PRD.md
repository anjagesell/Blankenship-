# TAKEOVER PROTOCOL - Blankenship Legal Archives
## For Zachary, for Jacob, for Justice. ⚖️💙

---

## 🎯 MISSION CRITICAL

**This website will be shown to a JURY in SUPREME COURT.** Every word, every entry, every exhibit must be:
- **Professional** - Court-ready language
- **Factual** - Backed by documentary evidence
- **Purposeful** - Proving Zachary Blankenship's INNOCENCE

**You are:** Scooby Doo (detective), Hiyo Silver (partner), Batman (justice fighter)

---

## 🚫 DO NOT CHANGE WITHOUT ASKING

The user LOVES the website as-is. Before making ANY changes to:
- Website layout/design
- Existing entries
- Navigation structure
- Color schemes
- Button placements

**ASK FIRST.** Ideas are welcomed, but confirm before implementing.

---

## 📍 IMPORTANT URLs

| Purpose | URL |
|---------|-----|
| **Live Website** | https://legal-evidence-db.emergent.host/index |
| **Preview Site** | https://evidence-tracker-12.preview.emergentagent.com |
| **Backend API** | https://evidence-tracker-12.preview.emergentagent.com/api/ |

---

## 🔐 CREDENTIALS

- **Visitor Password:** `05052017`
- **Admin Password:** `02071951`

---

## 📊 CURRENT DATABASE STATUS

- **90 Timeline Entries** across years 2013-2020
- **608 File Records** in database
- **~290+ Files** migrated to MongoDB (migration was in progress)
- **809 Files** in uploads folder

### Year Breakdown:
- November 2013: 15 entries
- December 2013: 27 entries (includes the critical CME entry)
- January 2014: 2 entries
- 2014-2020: Various entries
- Medchecks: Pediatric records (58 files)
- 2020: Federal Habeas/Resentencing (78 files)
- Unresolved: Investigation items

---

## 🔥 PRIORITY 1: CME EXHIBITS (INCOMPLETE)

The **December 4, 2013 Child Medical Exam (CME)** entry exists but needs 3 EXHIBIT DOCUMENTS attached:

1. **Jennifer Owens's CPS Log** - Where she ORDERED the CME (conversation with Tammy Blankenship about appointment at Child Advocacy Center)
2. **Lab Report** - LabCorp results showing Rylie tested NEGATIVE for Chlamydia/Gonorrhea/STDs
3. **Beth Oshbar's Notes** - The nurse's documentation from administering the CME at Child Advocacy Center

**CME Entry ID:** `424fde86-9464-4f02-a63d-33ed46d37ac0`

**Current Witness Field:** Beth Oshbar (Osbahr), NP-C - Catawba County Child Advocacy Center

**NEEDS TO BE UPDATED TO INCLUDE:** Jennifer Owens (CPS) and Tammy Blankenship

### Search Strategy:
- Files are organized by DATE PHOTOGRAPHED, not event date
- CME was Dec 4, 2013 - documents may be filed under Dec 5-14
- Look for CPS narrative logs, medical forms, lab results
- Names to search: Jennifer Owens, Sherri Stock, Beth Oshbar, LabCorp, Child Advocacy Center

---

## 📁 FILES UPLOADED TODAY (SEARCH THESE FOR CME EXHIBITS)

### Zip Files Provided:
1. **Dezember.zip** - 138 files (December 2013 documents)
2. **Dezember (1).zip** - 193 files (December 2013 documents)
3. **Dezember2013 2.zip** - 3 files (Court summons)
4. **2014.zip** - 92 files
5. **2015.zip** - Unknown count
6. **2017.zip** - Unknown count
7. **2018.zip** - Unknown count
8. **2019.zip** - Unknown count
9. **2020.zip** - 78 files (Federal Habeas)
10. **Med_Checkups.zip** - 58 files (Pediatric records 2011-2013)
11. **MAR_Final_Dec19_NoPg.docx** - Motion for Appropriate Relief document

### Download URLs:
```
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/kg7u9qzl_Dezember.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/ugtousct_Dezember%20%281%29.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/7s4qsp1z_Dezember2013%202%20.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/xqektw9q_2014.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/117fgmie_2015.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/xmw0v4sb_2017.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/xlizgxr3_2018.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/7rfoqr9r_2019.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/z2d0o85h_2020.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/zzuewmy8_Med_Checkups.zip
https://customer-assets.emergentagent.com/job_truth-finder-23/artifacts/6xx7mvm0_MAR_Final_Dec19_NoPg.docx
```

---

## 📖 REQUIRED READING: MAR DOCUMENT

The **Motion for Appropriate Relief (MAR_Final_Dec19_NoPg.docx)** is the MASTER DOCUMENT. It contains:
- Legal arguments for Zachary's innocence
- Timeline of events
- Evidence of prosecutorial misconduct
- Key witnesses and their statements
- Exculpatory evidence that was suppressed

**READ THIS FIRST** to understand the case before making any changes.

---

## 🧠 KEY CASE FACTS (FOR DETECTIVE THOMAS AI)

1. **Accusers:** Gabriele and Keith Blankenship (Zachary's parents) - they originated accusations WITHOUT physical proof
2. **Exculpatory:** During adoption proceedings, Rylie named "Nana and Poppi" (Gabriele & Keith) and "2 bad men" as her abusers - NOT Zachary
3. **Rejected Plea:** Zachary REJECTED a plea offer - innocent people don't take pleas
4. **CME Results:** December 4, 2013 exam showed NEGATIVE for all STDs
5. **Jacob:** Zachary's younger brother, also affected by this case

---

## 🏗️ WEBSITE STRUCTURE

```
/app/
├── backend/
│   ├── server.py           # FastAPI - DO NOT break HEIC conversion or AI assistant
│   ├── seed_data.json      # 90 entries - timeline data
│   ├── seed_files.json     # 608 file records
│   └── uploads/            # 809 exhibit files
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── DetectiveThomas.jsx    # AI Legal Assistant
│       │   ├── OfficialsWitnesses.jsx # 69 key individuals
│       │   ├── RouteAnalysis.jsx      # Geographic analysis
│       │   ├── MonthlyDetail.jsx      # Timeline view
│       │   └── Timeline.jsx           # Entry display
│       └── pages/
│           ├── IndexPage.jsx          # Main page with year folders
│           └── EntryPage.jsx          # Login page
└── memory/
    └── PRD.md              # This file
```

---

## 🔧 TECHNICAL NOTES

### File Persistence Issue (CRITICAL)
- Files uploaded to `/app/backend/uploads/` do NOT persist to GitHub
- Solution implemented: MongoDB storage with base64 encoding
- Migration endpoint: `POST /api/admin/migrate-files-to-db`
- Status endpoint: `GET /api/admin/file-storage-status?admin_password=02071951`
- **~290 files migrated to MongoDB** (migration was in progress when session ended)

### HEIC Conversion
- Backend converts HEIC to JPEG on-the-fly using `pillow-heif`
- Critical for viewing iPhone photos - DO NOT REMOVE

### Seeding
- On startup, `seed_data.json` and `seed_files.json` are loaded
- This has been unreliable - migration to MongoDB is the permanent fix

---

## ⚠️ KNOWN ISSUES

1. **File Persistence:** Not all files are in MongoDB yet - continue migration
2. **CME Exhibits Missing:** The 3 key documents for Dec 4, 2013 entry not yet found/attached
3. **Orphan Files:** 809 files in uploads but only 608 in database records

---

## 🎯 NEXT AGENT PRIORITIES

1. **Read the MAR document** - Understand the full case
2. **Complete MongoDB migration** - Run migration for remaining files
3. **Find CME Exhibits** - Search uploaded zips for:
   - Jennifer Owens's CPS log ordering CME
   - Lab report (LabCorp, negative results)
   - Beth Oshbar's CME notes
4. **Attach exhibits** to Dec 4, 2013 entry
5. **Update witness field** to include Jennifer Owens and Tammy Blankenship

---

## 💬 COMMUNICATION STYLE

- **Partner language:** "Hiyo Silver", "partner", "Scooby Doo"
- **Mission reminder:** "For Zachary, for Jacob, for Justice. ⚖️💙"
- **Professional:** This is for Supreme Court - be precise, factual, court-ready
- **Empathetic:** User has been fighting this battle for years - be supportive
- **Proactive:** Offer ideas but ASK before implementing changes

---

## 🤝 USER PREFERENCES

- DO NOT call other agents that change project names/URLs
- DO NOT replace or overwrite existing website content without permission
- DO ask before making structural changes
- DO be innovative and solution-creative
- DO be projective thinking - anticipate needs
- DO maintain professional, jury-ready language

---

**Remember:** You're not just coding - you're fighting for justice for an innocent man.

For Zachary, for Jacob, for Justice. ⚖️💙
