# BLANKENSHIP JUDICIAL ARCHIVES - TAKEOVER PROTOCOL
**Last Updated:** December 23, 2025
**Project Motto:** *For Jacob, for Zachary, for Justice.* ⚖️💙

---

## 🎯 PROJECT OVERVIEW

This is a deeply personal project documenting a **wrongful conviction case**. Zachary Blankenship was convicted in 2013. His brother Jacob, who believed in Zachary's innocence, passed away in 2017 after begging family members to help prove the truth. The family has been fighting for justice for over 12 years.

**TREAT THIS PROJECT WITH RESPECT AND COMPASSION.**

---

## 🔑 CREDENTIALS

| Purpose | Password |
|---------|----------|
| **Site Entry** | `05052017` (Jacob's date 🕊️) |
| **Admin Login** | Name: `Larsen` / Password: `02071951` |

---

## ✅ COMPLETED FEATURES (This Session)

### 1. Multi-Admin Team System
- Named admin accounts (Name + Password login)
- **Admin. Larsen** is the owner (can add/remove team members, view passwords)
- All admins see activity log
- Team panel accessible via gold shield button → "Team"
- Files: `/app/backend/server.py`, `/app/frontend/src/components/TeamPanel.jsx`, `/app/frontend/src/components/ActivityLog.jsx`

### 2. Insert Buttons (↑↓)
- Green arrow buttons after # column in monthly entries
- ↑ = Insert line above, ↓ = Insert line below
- Uses `isEditingRef` to prevent auto-refresh from clearing new entries
- File: `/app/frontend/src/components/MonthlyDetail.jsx`

### 3. Exhibit Viewer (Images, PDFs, Video, Audio)
- Popup viewer for all media types
- Video player with controls
- Audio player with controls
- PDF embedded viewer
- Image zoom in/out
- **NO copy protection** (user requested removal)
- File: `/app/frontend/src/components/MonthlyDetail.jsx` (ExhibitViewer component)

### 4. Privatinvestigator Thomas 🕵️‍♂️
- AI-powered chat assistant (uses Emergent LLM key)
- Top center of page, pulsing gold button
- Detective emoji with fedora
- Judicial greeting style
- Answers questions about the case and archive navigation
- Files: 
  - Backend: `/app/backend/server.py` (search for "PRIVATINVESTIGATOR THOMAS")
  - Frontend: `/app/frontend/src/components/PrivatinvestigatorThomas.jsx`

### 5. Visitor Monitor (Admin Only)
- Tracks IP, location, pages visited
- Page analytics tab
- Country flags fixed (proper mapping for USA 🇺🇸, Germany 🇩🇪, etc.)
- File: `/app/frontend/src/components/VisitorMonitor.jsx`

### 6. HEIC → JPG Conversion
- Automatic conversion on upload (backend)
- Universal browser compatibility
- File: `/app/backend/server.py` (upload endpoint)

---

## 📁 KEY FILES

```
/app/
├── AGENT_INSTRUCTIONS.md          # Persistent user requirements
├── TAKEOVER_PROTOCOL.md           # This file
├── backend/
│   ├── server.py                  # Main backend (FastAPI)
│   ├── .env                       # EMERGENT_LLM_KEY is here
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/
        │   ├── EntryPage.jsx      # Password entry + synopsis
        │   └── IndexPage.jsx      # Main archive hub
        ├── components/
        │   ├── MonthlyDetail.jsx  # Entry table + ExhibitViewer
        │   ├── AdminLogin.jsx     # Name + Password login
        │   ├── TeamPanel.jsx      # Add/remove admins (owner only)
        │   ├── ActivityLog.jsx    # Who did what
        │   ├── VisitorMonitor.jsx # IP/location tracking
        │   ├── PrivatinvestigatorThomas.jsx  # AI helper 🕵️‍♂️
        │   └── ViolationsCascadeHybrid.jsx   # Violations visualization
        ├── hooks/
        │   └── usePageTracker.js  # Page view analytics
        └── mock.js                # Year/month folder structure
```

---

## 🗄️ DATABASE COLLECTIONS

| Collection | Purpose |
|------------|---------|
| `admin_accounts` | Admin users (name, password, is_owner) |
| `activity_logs` | Who did what and when |
| `monthly_entries` | Timeline entries by month |
| `uploaded_files` | Exhibit files (images, PDFs, videos) |
| `visitors` | Visitor tracking data |
| `thomas_chat_history` | Privatinvestigator Thomas conversations |
| `entry_locks` | Entry locking for multi-admin editing |

---

## ⚠️ IMPORTANT NOTES

1. **HEIC Files**: Backend auto-converts to JPG. Never store HEIC.

2. **Copy Protection**: User requested REMOVAL of all copy protection. Do not add it back.

3. **Admin Button**: Single gold shield button (bottom right). No text, just icon. Opens menu when logged in.

4. **Thomas Greeting**: Judicial style, NOT "Guten Tag". Use the greeting in the component.

5. **Entry Tracking**: Entries show "Last edited by Admin. [Name]" in Notes column.

6. **Real-time Refresh**: Polling pauses while editing (uses `isEditingRef`).

---

## 🔮 POTENTIAL FUTURE TASKS

- Populate 2014-2026 folders with timeline entries
- Entry locking UI (backend ready, frontend partially done)
- More exhibit uploads
- Enhanced search within Thomas

---

## 💙 TONE & APPROACH

- This is a family's 12-year fight for justice
- Be respectful, professional, and compassionate
- The motto matters: *For Jacob, for Zachary, for Justice.*
- Admin. Larsen is the project owner - equal teammate to future admins

---

*Good luck, next agent!* 🕵️‍♂️💙⚖️
