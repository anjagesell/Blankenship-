# BLANKENSHIP JUDICIAL ARCHIVES - AGENT INSTRUCTIONS

## ⚠️ CRITICAL REQUIREMENTS - READ BEFORE MAKING ANY CHANGES

### 1. UNIVERSAL FILE COMPATIBILITY (MANDATORY)
**ALL uploaded files MUST be viewable on ALL devices:**
- PC (Windows, Mac, Linux)
- Android phones/tablets
- Apple iPhone/iPad
- All web browsers

**HEIC/HEIF files are NOT universally compatible!**
- The backend (`server.py`) has auto-conversion from HEIC → JPG built in
- If you modify the upload endpoint, PRESERVE this conversion logic
- NEVER store HEIC files - always convert to JPG first

### 2. Site Passwords
- **Entry Code:** 05052017
- **Admin Password:** 02071951

### 3. Data Structure
- Timeline entries are stored in MongoDB `monthly_entries` collection
- Files are stored in MongoDB `uploaded_files` collection with base64 content
- Entry IDs link files to their corresponding timeline entries

### 4. Key Files
- `/app/backend/server.py` - Main API with HEIC→JPG conversion
- `/app/frontend/src/components/ViolationsCascadeHybrid.jsx` - Constitutional violations display
- `/app/frontend/src/pages/IndexPage.jsx` - Main index with timeline
- `/app/frontend/src/pages/EntryPage.jsx` - Password entry page

### 5. Project Purpose
This is a **judicial evidence archive** documenting constitutional violations in the wrongful conviction of Zachary Alan Blankenship. 

**Motto: For Jacob, for Zachary, for Justice. 💙⚖️**

Treat all content with the gravity and respect it deserves.

### 6. DO NOT
- Store HEIC files without converting to JPG
- Remove the pillow-heif dependency
- Change entry/admin passwords without explicit instruction
- Call outside agents that change the task name or create new URLs

### 7. ALWAYS
- Test file uploads work on multiple device types
- Ensure exhibits display properly (not "Unable to load preview")
- Preserve the hybrid violations cascade visualization
- Maintain mobile responsiveness
