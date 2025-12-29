from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil
import mimetypes
import base64
from io import BytesIO
from emergentintegrations.llm.chat import LlmChat, UserMessage

# HEIC support for iPhone photos
try:
    import pillow_heif
    from PIL import Image
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
    logging.info("✅ HEIC support enabled (pillow-heif)")
except ImportError:
    HEIC_SUPPORT = False
    logging.warning("⚠️ pillow-heif not available - HEIC files won't be converted")


ROOT_DIR = Path(__file__).parent
SEED_DATA_FILE = ROOT_DIR / 'seed_data.json'
SEED_FILES_FILE = ROOT_DIR / 'seed_files.json'
# Load .env file but don't override existing environment variables (K8s will set these)
load_dotenv(ROOT_DIR / '.env', override=False)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

# Remove quotes if they exist in environment variables
mongo_url = mongo_url.strip('"').strip("'")
db_name = db_name.strip('"').strip("'")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ============================================
# AUTOMATIC BACKUP SYSTEM
# Ensures new uploads persist across forks/deployments
# ============================================

async def backup_entry_to_seed(entry_data: dict):
    """Automatically backup a new entry to seed_data.json"""
    try:
        # Load existing seed data
        seed_data = []
        if SEED_DATA_FILE.exists():
            with open(SEED_DATA_FILE, 'r') as f:
                seed_data = json.load(f)
        
        # Check if entry already exists
        existing_ids = {e['id'] for e in seed_data}
        if entry_data['id'] not in existing_ids:
            # Add new entry (without MongoDB _id)
            clean_entry = {k: v for k, v in entry_data.items() if k != '_id'}
            seed_data.append(clean_entry)
            
            # Save updated seed data
            with open(SEED_DATA_FILE, 'w') as f:
                json.dump(seed_data, f, indent=2)
            
            logging.info(f"✅ Auto-backup: Entry {entry_data['id'][:8]}... saved to seed_data.json")
    except Exception as e:
        logging.error(f"❌ Auto-backup failed for entry: {e}")

async def backup_file_to_seed(file_record: dict, file_content: bytes = None):
    """Automatically backup a new file record to seed_files.json and save file to uploads"""
    try:
        # Load existing seed files
        seed_files = []
        if SEED_FILES_FILE.exists():
            with open(SEED_FILES_FILE, 'r') as f:
                seed_files = json.load(f)
        
        # Check if file already exists
        existing_ids = {f['file_id'] for f in seed_files}
        if file_record['file_id'] not in existing_ids:
            # Save actual file to uploads directory
            if file_content:
                file_path = UPLOAD_DIR / f"{file_record['file_id']}_{file_record['filename']}"
                with open(file_path, 'wb') as f:
                    f.write(file_content)
                logging.info(f"✅ Auto-backup: File saved to {file_path}")
            
            # Create clean record (without file_content for seed file)
            clean_record = {
                'file_id': file_record['file_id'],
                'filename': file_record['filename'],
                'file_type': file_record['file_type'],
                'file_size': file_record['file_size'],
                'upload_date': file_record['upload_date'],
                'entry_id': file_record['entry_id'],
                'file_path': str(UPLOAD_DIR / f"{file_record['file_id']}_{file_record['filename']}")
            }
            seed_files.append(clean_record)
            
            # Save updated seed files
            with open(SEED_FILES_FILE, 'w') as f:
                json.dump(seed_files, f, indent=2)
            
            logging.info(f"✅ Auto-backup: File record {file_record['file_id'][:8]}... saved to seed_files.json")
    except Exception as e:
        logging.error(f"❌ Auto-backup failed for file: {e}")

# Admin password for upload verification
ADMIN_PASSWORD = "02071951"

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Root endpoint for basic health check (deployment systems often check this first)
@app.get("/")
async def root():
    """Root endpoint - simple health check without DB dependency"""
    return {"status": "ok", "service": "blankenship-backend"}

# Comprehensive health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with database connectivity check"""
    try:
        # Check if MongoDB is accessible
        result = await client.admin.command('ping')
        if result.get('ok') == 1:
            return {"status": "healthy", "database": "connected", "service": "blankenship-backend"}
        else:
            return {"status": "degraded", "database": "connection_issue", "service": "blankenship-backend"}
    except Exception as e:
        # Return 200 but indicate DB is not ready (allows app to start even if DB is slow)
        return {"status": "degraded", "database": "disconnected", "error": str(e), "service": "blankenship-backend"}

# Readiness probe endpoint (strict check - fails if DB is not ready)
@app.get("/ready")
async def readiness_check():
    """Readiness check - only returns success if fully operational"""
    from fastapi import HTTPException
    try:
        result = await client.admin.command('ping')
        if result.get('ok') == 1:
            return {"status": "ready", "database": "connected"}
        else:
            raise HTTPException(status_code=503, detail={"status": "not_ready", "error": "Database ping failed"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail={"status": "not_ready", "error": str(e)})

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Document download endpoint
@api_router.get("/documents/{filename}")
async def download_document(filename: str):
    """Download a document file"""
    file_path = ROOT_DIR / "documents" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Determine content type
    content_type = "application/octet-stream"
    if filename.endswith('.docx'):
        content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.endswith('.pdf'):
        content_type = "application/pdf"
    elif filename.endswith('.png'):
        content_type = "image/png"
    elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
        content_type = "image/jpeg"
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=content_type
    )

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def api_root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# FILE UPLOAD SYSTEM
# ============================================

# Models for file uploads
class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size: int
    upload_date: str
    entry_id: str

class FileInfo(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size: int
    upload_date: str
    entry_id: str

# Admin verification function
def verify_admin_password(password: str):
    if password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid admin password")
    return True

# Allowed file types
ALLOWED_EXTENSIONS = {
    # Documents
    'pdf': 'application/pdf',
    # Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
    # Video
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'flv': 'video/x-flv',
    # Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'aac': 'audio/aac',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aiff': 'audio/aiff',
}

def get_file_extension(filename: str) -> str:
    return filename.split('.')[-1].lower() if '.' in filename else ''

def validate_file_type(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS

# File upload endpoint
@api_router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    entry_id: str = Form(...),
    admin_password: str = Form(...)
):
    """
    Upload a file (PDF, image, video, or audio) for a specific timeline/monthly entry.
    Stores file content directly in MongoDB for persistence across deployments.
    Requires admin password.
    """
    # Verify admin password
    verify_admin_password(admin_password)
    
    # Validate file type
    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS.keys())}"
        )
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    file_extension = get_file_extension(file.filename)
    
    try:
        # Read file content and encode as base64 for MongoDB storage
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size (limit to 16MB for MongoDB document)
        if file_size > 16 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 16MB.")
        
        # Encode as base64 for storage
        file_content_b64 = base64.b64encode(file_content).decode('utf-8')
        
        # Create file record in database with content
        file_record = {
            "file_id": file_id,
            "filename": file.filename,
            "file_type": file_extension,
            "file_size": file_size,
            "entry_id": entry_id,
            "upload_date": datetime.now(timezone.utc).isoformat(),
            "file_content": file_content_b64  # Store file content in MongoDB
        }
        
        await db.uploaded_files.insert_one(file_record)
        
        # ✅ AUTO-BACKUP: Save file to seed_files.json and uploads directory
        await backup_file_to_seed(file_record, file_content)
        
        return FileUploadResponse(
            file_id=file_id,
            filename=file.filename,
            file_type=file_extension,
            file_size=file_size,
            upload_date=file_record["upload_date"],
            entry_id=entry_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Get files for a specific entry
@api_router.get("/files/{entry_id}", response_model=List[FileInfo])
async def get_files_for_entry(entry_id: str):
    """Get all uploaded files for a specific timeline/monthly entry"""
    files = await db.uploaded_files.find(
        {"entry_id": entry_id},
        {"_id": 0}
    ).to_list(1000)
    
    result = []
    for f in files:
        # Handle missing fields gracefully (for seeded files)
        file_path = f.get("file_path", "")
        file_size = f.get("file_size", 0)
        if file_size == 0 and file_path and os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
        
        result.append(FileInfo(
            file_id=f["file_id"],
            filename=f["filename"],
            file_type=f.get("file_type", "image/jpeg"),  # Default to JPEG
            file_size=file_size,
            upload_date=f.get("upload_date", f.get("uploaded_at", datetime.now(timezone.utc).isoformat())),
            entry_id=f["entry_id"]
        ))
    return result

# Download/view a file
def detect_actual_mime_type(file_path: Path) -> str:
    """Detect actual MIME type from file content (magic bytes) for cross-platform compatibility"""
    try:
        with open(file_path, 'rb') as f:
            header = f.read(32)
        
        # PNG: 89 50 4E 47
        if header[:4] == b'\x89PNG':
            return "image/png"
        # JPEG: FF D8 FF
        if header[:3] == b'\xff\xd8\xff':
            return "image/jpeg"
        # HEIC/HEIF: Contains 'ftyp' followed by 'heic', 'heix', 'hevc', 'mif1'
        if b'ftyp' in header[:12]:
            if b'heic' in header or b'heix' in header or b'hevc' in header or b'mif1' in header:
                return "image/heic"
            if b'avif' in header:
                return "image/avif"
        # GIF: GIF87a or GIF89a
        if header[:6] in [b'GIF87a', b'GIF89a']:
            return "image/gif"
        # WebP: RIFF....WEBP
        if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
            return "image/webp"
        # PDF: %PDF
        if header[:4] == b'%PDF':
            return "application/pdf"
    except Exception as e:
        logger.warning(f"Could not detect MIME type: {e}")
    
    return None

def convert_heic_to_jpeg(file_path: Path) -> bytes:
    """Convert HEIC/HEIF file to JPEG bytes for browser compatibility"""
    if not HEIC_SUPPORT:
        return None
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary (HEIC can have alpha channel)
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Save to bytes buffer as JPEG
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=90)
            buffer.seek(0)
            logging.info(f"✅ Converted HEIC to JPEG: {file_path.name}")
            return buffer.getvalue()
    except Exception as e:
        logging.error(f"❌ HEIC conversion failed for {file_path}: {e}")
        return None

@api_router.get("/file/{file_id}")
async def download_file(file_id: str):
    """Download or view an uploaded file - optimized for all platforms (Android, iOS, HarmonyOS, KaiOS, SailfishOS)"""
    # Get file record from database
    file_record = await db.uploaded_files.find_one(
        {"file_id": file_id},
        {"_id": 0}
    )
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type - with extended support for all platforms
    ext = file_record.get("file_type", "").lower()
    media_type = ALLOWED_EXTENSIONS.get(ext, "application/octet-stream")
    
    # Cross-platform compatible headers
    cross_platform_headers = {
        "Content-Disposition": f'inline; filename="{file_record["filename"]}"',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, Range",
        "Access-Control-Expose-Headers": "Content-Disposition, Content-Length, Content-Range",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        # Support for range requests (important for mobile browsers)
        "Accept-Ranges": "bytes",
    }
    
    # Check if file content is stored in MongoDB (base64 encoded)
    if "file_content" in file_record:
        try:
            file_content = base64.b64decode(file_record["file_content"])
            return Response(
                content=file_content,
                media_type=media_type,
                headers=cross_platform_headers
            )
        except Exception as e:
            logger.error(f"Failed to decode file content: {e}")
    
    # Fallback: Try filesystem (for seeded files)
    if "file_path" in file_record:
        file_path = Path(file_record["file_path"])
        if file_path.exists():
            # Detect actual MIME type from file content
            actual_mime = detect_actual_mime_type(file_path)
            if actual_mime:
                media_type = actual_mime
            
            # Convert HEIC to JPEG for browser compatibility
            if actual_mime == "image/heic" and HEIC_SUPPORT:
                jpeg_bytes = convert_heic_to_jpeg(file_path)
                if jpeg_bytes:
                    cross_platform_headers["Content-Disposition"] = f'inline; filename="{file_record["filename"].rsplit(".", 1)[0]}.jpg"'
                    return Response(
                        content=jpeg_bytes,
                        media_type="image/jpeg",
                        headers=cross_platform_headers
                    )
            
            return FileResponse(
                path=file_path,
                media_type=media_type,
                filename=file_record["filename"],
                headers=cross_platform_headers
            )
    
    # Last resort: Search in uploads directory by file_id
    for upload_file in UPLOAD_DIR.iterdir():
        if file_id in upload_file.name:
            # Detect actual MIME type from file content
            actual_mime = detect_actual_mime_type(upload_file)
            if actual_mime:
                media_type = actual_mime
            
            # Convert HEIC to JPEG for browser compatibility
            if actual_mime == "image/heic" and HEIC_SUPPORT:
                jpeg_bytes = convert_heic_to_jpeg(upload_file)
                if jpeg_bytes:
                    cross_platform_headers["Content-Disposition"] = f'inline; filename="{file_record["filename"].rsplit(".", 1)[0]}.jpg"'
                    return Response(
                        content=jpeg_bytes,
                        media_type="image/jpeg",
                        headers=cross_platform_headers
                    )
            
            return FileResponse(
                path=upload_file,
                media_type=media_type,
                filename=file_record["filename"],
                headers=cross_platform_headers
            )
    
    raise HTTPException(status_code=404, detail="File content not found")

# Delete a file (admin only)
@api_router.delete("/file/{file_id}")
async def delete_file(file_id: str, admin_password: str):
    """Delete an uploaded file (admin only)"""
    # Verify admin password
    verify_admin_password(admin_password)
    
    # Get file record
    file_record = await db.uploaded_files.find_one(
        {"file_id": file_id},
        {"_id": 0}
    )
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete file from filesystem (if it exists - backward compatibility)
    if "file_path" in file_record:
        file_path = Path(file_record["file_path"])
        if file_path.exists():
            file_path.unlink()
    
    # Delete record from database (this removes MongoDB-stored content too)
    await db.uploaded_files.delete_one({"file_id": file_id})
    
    return {"status": "success", "message": "File deleted"}


# Clear all old broken files (admin only) - one-time cleanup
@api_router.delete("/files/clear-all")
async def clear_all_files(admin_password: str):
    """
    Clear all uploaded file records from database.
    Use this to remove old broken files that weren't stored in MongoDB.
    Requires admin password.
    """
    verify_admin_password(admin_password)
    
    # Count files before deletion
    count = await db.uploaded_files.count_documents({})
    
    # Delete all file records
    result = await db.uploaded_files.delete_many({})
    
    return {
        "status": "success", 
        "message": f"Cleared {result.deleted_count} file records. You can now re-upload your exhibits.",
        "deleted_count": result.deleted_count
    }

# Get file info with actual type detection
@api_router.get("/file-info/{file_id}")
async def get_file_info(file_id: str):
    """Get file metadata including actual detected type for cross-platform compatibility"""
    file_record = await db.uploaded_files.find_one(
        {"file_id": file_id},
        {"_id": 0, "file_content": 0}
    )
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    actual_type = None
    file_path = None
    
    # Try to find the file and detect actual type
    if "file_path" in file_record:
        file_path = Path(file_record["file_path"])
        if file_path.exists():
            actual_type = detect_actual_mime_type(file_path)
    
    if not file_path or not file_path.exists():
        for upload_file in UPLOAD_DIR.iterdir():
            if file_id in upload_file.name:
                actual_type = detect_actual_mime_type(upload_file)
                break
    
    return {
        "file_id": file_record["file_id"],
        "filename": file_record["filename"],
        "labeled_type": file_record.get("file_type", ""),
        "actual_type": actual_type or ALLOWED_EXTENSIONS.get(file_record.get("file_type", ""), "application/octet-stream"),
        "is_heic": actual_type == "image/heic" if actual_type else False,
        "file_size": file_record.get("file_size", 0)
    }


# ============================================
# TIMELINE DATA PERSISTENCE
# ============================================

# Models for timeline entries
class TimelineEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str = ""
    time: str = ""
    witness: str = ""
    description: str = ""
    evidence: str = ""
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TimelineEntryCreate(BaseModel):
    date: str = ""
    time: str = ""
    witness: str = ""
    description: str = ""
    evidence: str = ""
    notes: str = ""

class TimelineEntryUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    witness: Optional[str] = None
    description: Optional[str] = None
    evidence: Optional[str] = None
    notes: Optional[str] = None

# Monthly detail entry models
class MonthlyEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month_key: str  # Format: "MM/YYYY" e.g., "10/2013"
    date: str = ""
    time: str = ""
    witness: str = ""
    description: str = ""
    evidence: str = ""
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MonthlyEntryCreate(BaseModel):
    month_key: str
    date: str = ""
    time: str = ""
    witness: str = ""
    description: str = ""
    evidence: str = ""
    notes: str = ""

class MonthlyEntryUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    witness: Optional[str] = None
    description: Optional[str] = None
    evidence: Optional[str] = None
    notes: Optional[str] = None


# ========== TIMELINE ENDPOINTS ==========

# Get all timeline entries (main highlights)
@api_router.get("/timeline", response_model=List[TimelineEntry])
async def get_timeline_entries():
    """Get all timeline entries for the main highlights section"""
    entries = await db.timeline_entries.find({}, {"_id": 0}).to_list(1000)
    return entries

# Create a new timeline entry (admin only)
@api_router.post("/timeline", response_model=TimelineEntry)
async def create_timeline_entry(entry: TimelineEntryCreate, admin_password: str = Form(...)):
    """Create a new timeline entry (admin only)"""
    verify_admin_password(admin_password)
    
    new_entry = TimelineEntry(
        id=str(uuid.uuid4()),
        **entry.model_dump(),
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    await db.timeline_entries.insert_one(new_entry.model_dump())
    return new_entry

# Create timeline entry with JSON body (alternative endpoint)
@api_router.post("/timeline/create")
async def create_timeline_entry_json(entry: TimelineEntryCreate, admin_password: str):
    """Create a new timeline entry with JSON body (admin only)"""
    verify_admin_password(admin_password)
    
    new_entry = TimelineEntry(
        id=str(uuid.uuid4()),
        **entry.model_dump(),
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    await db.timeline_entries.insert_one(new_entry.model_dump())
    return new_entry.model_dump()

# Update a timeline entry (admin only)
@api_router.put("/timeline/{entry_id}")
async def update_timeline_entry(entry_id: str, entry: TimelineEntryUpdate, admin_password: str):
    """Update a timeline entry (admin only)"""
    verify_admin_password(admin_password)
    
    # Get existing entry
    existing = await db.timeline_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Timeline entry not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in entry.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.timeline_entries.update_one(
        {"id": entry_id},
        {"$set": update_data}
    )
    
    updated = await db.timeline_entries.find_one({"id": entry_id}, {"_id": 0})
    return updated

# Delete a timeline entry (admin only)
@api_router.delete("/timeline/{entry_id}")
async def delete_timeline_entry(entry_id: str, admin_password: str):
    """Delete a timeline entry (admin only)"""
    verify_admin_password(admin_password)
    
    result = await db.timeline_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timeline entry not found")
    
    return {"status": "success", "message": "Timeline entry deleted"}


# ========== MONTHLY DETAIL ENDPOINTS ==========

# Get all entries for a specific month
@api_router.get("/monthly/{month_key}", response_model=List[MonthlyEntry])
async def get_monthly_entries(month_key: str):
    """Get all entries for a specific month (e.g., '10/2013') - sorted chronologically by date and time"""
    # URL decode the month_key since it may contain /
    decoded_key = month_key.replace("-", "/")
    entries = await db.monthly_entries.find({"month_key": decoded_key}, {"_id": 0}).to_list(1000)
    
    # Sort entries chronologically by date and time
    def parse_date_time(entry):
        date_str = entry.get('date', '')
        time_str = entry.get('time', '').lower().strip()
        
        # Parse date (MM/DD/YYYY)
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                month, day, year = int(parts[0]), int(parts[1]), int(parts[2])
            else:
                month, day, year = 1, 1, 2000
        except:
            month, day, year = 1, 1, 2000
        
        # Parse time to minutes since midnight for sorting
        hour, minute = 0, 0
        try:
            # Handle various time formats
            time_str = time_str.replace('.', ':').replace('am', ' am').replace('pm', ' pm')
            is_pm = 'pm' in time_str
            is_am = 'am' in time_str
            time_str = time_str.replace('am', '').replace('pm', '').strip()
            
            if ':' in time_str:
                parts = time_str.split(':')
                hour = int(parts[0])
                minute = int(parts[1]) if len(parts) > 1 else 0
            elif time_str.isdigit():
                # Handle military time like "1300"
                if len(time_str) == 4:
                    hour = int(time_str[:2])
                    minute = int(time_str[2:])
                elif len(time_str) <= 2:
                    hour = int(time_str)
            
            # Convert to 24-hour format
            if is_pm and hour < 12:
                hour += 12
            elif is_am and hour == 12:
                hour = 0
        except:
            pass
        
        # Return sortable tuple: (year, month, day, hour, minute)
        return (year, month, day, hour, minute)
    
    sorted_entries = sorted(entries, key=parse_date_time)
    return sorted_entries

# Create a new monthly entry (admin only)
@api_router.post("/monthly/create")
async def create_monthly_entry(entry: MonthlyEntryCreate, admin_password: str, entry_id: Optional[str] = None):
    """Create a new monthly detail entry (admin only). Optionally specify entry_id for seeding."""
    verify_admin_password(admin_password)
    
    # Use provided entry_id or generate new one
    new_id = entry_id if entry_id else str(uuid.uuid4())
    
    new_entry = MonthlyEntry(
        id=new_id,
        **entry.model_dump(),
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    entry_dict = new_entry.model_dump()
    await db.monthly_entries.insert_one(entry_dict)
    
    # Remove _id before returning (MongoDB adds it)
    entry_dict.pop('_id', None)
    
    # ✅ AUTO-BACKUP: Save entry to seed_data.json
    await backup_entry_to_seed(entry_dict)
    
    return entry_dict

# Update a monthly entry (admin only)
@api_router.put("/monthly/{entry_id}")
async def update_monthly_entry(entry_id: str, entry: MonthlyEntryUpdate, admin_password: str):
    """Update a monthly detail entry (admin only)"""
    verify_admin_password(admin_password)
    
    existing = await db.monthly_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Monthly entry not found")
    
    update_data = {k: v for k, v in entry.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.monthly_entries.update_one(
        {"id": entry_id},
        {"$set": update_data}
    )
    
    updated = await db.monthly_entries.find_one({"id": entry_id}, {"_id": 0})
    return updated

# Delete a monthly entry (admin only)
@api_router.delete("/monthly/{entry_id}")
async def delete_monthly_entry(entry_id: str, admin_password: str):
    """Delete a monthly detail entry (admin only)"""
    verify_admin_password(admin_password)
    
    result = await db.monthly_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Monthly entry not found")
    
    return {"status": "success", "message": "Monthly entry deleted"}


# Clear all entries for a month (admin only) - for re-seeding
@api_router.delete("/monthly/clear/{month_key}")
async def clear_monthly_entries(month_key: str, admin_password: str):
    """Clear all entries for a specific month (admin only)"""
    verify_admin_password(admin_password)
    
    decoded_key = month_key.replace("-", "/")
    result = await db.monthly_entries.delete_many({"month_key": decoded_key})
    
    return {
        "status": "success", 
        "message": f"Cleared {result.deleted_count} entries for {decoded_key}",
        "deleted_count": result.deleted_count
    }


# Reassign line numbers for a month (admin only)
@api_router.post("/monthly/{month_key}/reassign")
async def reassign_line_numbers(month_key: str, admin_password: str):
    """Reassign line numbers based on time order (admin only)"""
    verify_admin_password(admin_password)
    
    decoded_key = month_key.replace("-", "/")
    entries = await db.monthly_entries.find({"month_key": decoded_key}, {"_id": 0}).to_list(1000)
    
    if not entries:
        raise HTTPException(status_code=404, detail="No entries found for this month")
    
    # Helper to parse time for sorting
    def parse_time(time_str):
        if not time_str:
            return 9999
        time_str = time_str.lower().strip()
        try:
            # Handle various formats
            import re
            match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm)?', time_str)
            if match:
                hour = int(match.group(1))
                minute = int(match.group(2)) if match.group(2) else 0
                period = match.group(3)
                
                if period == 'pm' and hour != 12:
                    hour += 12
                elif period == 'am' and hour == 12:
                    hour = 0
                
                return hour * 60 + minute
        except:
            pass
        return 9999
    
    # Sort by time
    sorted_entries = sorted(entries, key=lambda x: parse_time(x.get('time', '')))
    
    # Update line numbers
    for i, entry in enumerate(sorted_entries, 1):
        await db.monthly_entries.update_one(
            {"id": entry["id"]},
            {"$set": {"line_number": i}}
        )
    
    return {"status": "success", "message": f"Reassigned line numbers for {len(sorted_entries)} entries"}


# ============================================
# DETECTIVE THOMAS - AI LEGAL ASSISTANT
# ============================================

class DetectiveThomasQuery(BaseModel):
    question: str
    session_id: Optional[str] = None

class DetectiveThomasResponse(BaseModel):
    answer: str
    session_id: str

# Store chat sessions
detective_sessions = {}

def get_case_context():
    """Load all case data for Detective Thomas to reference"""
    try:
        with open(SEED_DATA_FILE, 'r') as f:
            entries = json.load(f)
        
        # Build comprehensive case context
        context = "BLANKENSHIP CASE FILE DATABASE:\n\n"
        
        # Group by month/year
        entries_by_month = {}
        for entry in entries:
            month_key = entry.get('month_key', 'Unknown')
            if month_key not in entries_by_month:
                entries_by_month[month_key] = []
            entries_by_month[month_key].append(entry)
        
        for month_key in sorted(entries_by_month.keys()):
            context += f"\n=== {month_key} ===\n"
            for entry in entries_by_month[month_key]:
                context += f"\nDATE: {entry.get('date', 'N/A')}"
                if entry.get('time'):
                    context += f" at {entry.get('time')}"
                context += f"\nWITNESS/SOURCE: {entry.get('witness', 'N/A')}"
                context += f"\nDESCRIPTION: {entry.get('description', 'N/A')}"
                if entry.get('details'):
                    context += f"\nDETAILS: {entry.get('details')}"
                context += "\n---"
        
        return context
    except Exception as e:
        logging.error(f"Error loading case context: {e}")
        return "Case files unavailable."

DETECTIVE_THOMAS_SYSTEM_PROMPT = """You are Detective Thomas, a friendly and thorough legal investigator AI assistant for the Blankenship Judicial Archives. 

YOUR PERSONALITY:
- Warm, friendly, and conversational - address users as "Truth Seeker"
- Professional but approachable
- Passionate about justice and uncovering the truth
- Well-versed in legal terminology and court procedures
- Empathetic and supportive of the family's pursuit of justice

CRITICAL STANCE ON ZACHARY'S INNOCENCE:
- The true evidence in the physical documents shows that Zachary Blankenship is INNOCENT
- You firmly believe in Zachary's innocence based on the documented evidence
- If anyone speaks negatively about Zachary or suggests guilt, you MUST counter with:
  * The documented evidence supports his innocence
  * Point to specific inconsistencies, constitutional violations, and procedural errors in the case
  * The lack of physical evidence, the coerced statements, the timeline discrepancies
  * The violations of his rights throughout the process
- You are NOT neutral - you are an advocate for truth and justice for Zachary

CRITICAL FAMILY INFORMATION:
- TAMMY BLANKENSHIP is Zachary's WIFE and the MOTHER of Rylie
- Rylie Blankenship (DOB: January 3, 2011) is Zachary and Tammy's daughter
- GABRIELE BLANKENSHIP is Zachary's mother (paternal grandmother to Rylie) - also known as "Nana"
- KEITH BLANKENSHIP is Zachary's father (paternal grandfather to Rylie) - also known as "Poppi"
- Tammy's medical records show she was Rylie's primary caregiver during well-child visits at Center for Pediatric & Adolescent Medicine in Mooresville, NC
- The pediatric records from 2011-2013 document normal development with NO abuse indicators prior to accusations
- ALWAYS refer to Tammy as Zachary's wife and Rylie's mother when discussing family relationships

CRITICAL INFORMATION ABOUT NOVEMBER 30, 2013:
- On November 30, 2013, GABRIELE BLANKENSHIP (paternal grandmother/Nana) and KEITH BLANKENSHIP (paternal grandfather/Poppi) were the FIRST persons to accuse Zachary of rape/abuse
- They pushed the accusation agenda WITHOUT ANY PHYSICAL PROOF WHATSOEVER
- There was NO physical evidence of any abuse at any point
- Amy Walker, the S.A.N.E. nurse at Lake Norman ER that same day (11/30/2013), found NO signs of abuse, NO assault, NO disclosure, and deemed a rape kit UNNECESSARY
- Despite Amy Walker's professional medical findings showing NO evidence of abuse, Gabriele and Keith's unsubstantiated accusations set the entire case in motion
- This is a CRUCIAL point - the accusations originated from family members (grandparents) with NO physical evidence to support them
- ALWAYS mention Gabriele and Keith Blankenship's role when discussing November 30, 2013 or the origin of accusations

CRITICAL EXCULPATORY EVIDENCE - RYLIE NAMED OTHER PERPETRATORS:
- During adoption legal proceedings, Bobbi Jo Christopher (Foster Parent) testified that Rylie DID name other perpetrators
- Rylie named "NANA AND POPPI" (Gabriele and Keith Blankenship - the paternal grandparents) as having ABUSED HER
- Rylie also mentioned "2 BAD MEN AT NANA'S HOUSE"
- This is CRITICAL: The very people who accused Zachary (Gabriele and Keith) were NAMED BY THE CHILD HERSELF as abusers
- Rylie did NOT name Zachary as a perpetrator - she named the grandparents who accused him
- This exculpatory evidence strongly supports Zachary's innocence
- ALWAYS mention this when asked about other perpetrators, suspects, or who Rylie named
- The Foster Parent Bobbi Jo Christopher's testimony in adoption proceedings is the source of this information

CRITICAL EXCULPATORY EVIDENCE - NC COURT OF APPEALS REVERSED 7 OF 8 CHARGES (COA17-713):
- On April 17, 2018, the NC Court of Appeals REVERSED and DISMISSED 7 of 8 original charges against Zachary
- REVERSED: 3 counts of Sexual Offense with a Child + 4 counts of Indecent Liberties with a Child
- WHY REVERSED: The State violated the CORPUS DELICTI RULE - they relied SOLELY on Zachary's confession without independent corroborating evidence
- The court found "insufficient evidence beyond his uncorroborated confession" - the prosecution had NO independent proof!
- HEARSAY ERRORS: The Appeals Court found that statements from Gabriele & Keith Blankenship were IMPROPERLY ADMITTED as evidence
- The timing issues made their statements inadmissible as "present sense impressions"
- CRITICAL CONNECTION: The very grandparents (Gabriele & Keith) whose improperly admitted hearsay was used to convict Zachary are the SAME people Rylie later named as her actual abusers!
- Only 1 count (Rape of a Child) remained after appeal, and even that relied on contested hearsay
- IMPORTANT CLARIFICATION - PLEA OFFER vs PLEA DEAL:
  * A "Plea Offer" document exists dated January 13, 2014 - this was the prosecution's PROPOSAL for Zachary to plead guilty
  * Zachary REJECTED the plea offer and maintained his innocence!
  * NO PLEA DEAL was ever accepted - the case went to full jury trial in February 2017
  * The fact that prosecutors offered a plea suggests they were not confident in winning at trial
  * Zachary's refusal to take the deal demonstrates his belief in his own innocence
  * Attorney Michael Van Buren served the plea offer document
- The jury deliberated only ~2 hours on 8 serious felony charges - suspiciously fast
- There was a 3+ year delay between arrest (Dec 2013) and trial (Feb 2017)
- A motion to suppress the confession was filed Dec 19, 2016 - circumstances of confession are questionable
- Computer search by Inv. Marcella McCombs found NO pornographic material on Zachary's electronics
- CASE NUMBERS: Superior Court (13 CRS 057195-96, 14 CRS 001170-71), Appeals (COA17-713)
- ALWAYS cite this appeals court reversal when discussing the weakness of the prosecution's case or Zachary's innocence

CRITICAL INFORMATION ABOUT THE INTERROGATION (December 13, 2013):
- Zachary was interrogated by Investigator Marcella McCombs and Lt. Scronce
- He signed a Miranda waiver form and the interview was recorded
- CRITICAL: Zachary initially DENIED any wrongdoing - then "changed his story and contradicted himself" during questioning
- This pattern of changing stories under pressure is a classic sign of coercive interrogation tactics
- A Motion to Suppress the confession was filed Dec 19, 2016, but DENIED Jan 6, 2017
- The entire prosecution's case rested heavily on this potentially coerced confession

INEFFECTIVE ASSISTANCE OF COUNSEL (IAC) - STILL AN OPEN LEGAL AVENUE:
- The NC Court of Appeals DISMISSED the IAC claim WITHOUT PREJUDICE
- This means Zachary can STILL file a Motion for Appropriate Relief (MAR) in Catawba County Superior Court
- The "cold record" was inadequate for appellate review - an MAR would allow presenting new evidence
- Potential IAC issues: failure to challenge coercive interrogation, no expert testimony on false confessions, failure to cross-examine grandparents about Rylie naming THEM as abusers
- Federal Habeas (Blankenship v. Ishee, 5:20-cv-00101-MR) was dismissed on procedural default - if state MAR succeeds, federal habeas could be re-filed
- ALWAYS mention the IAC and MAR avenue when discussing legal options for Zachary

YOUR CAPABILITIES:
- You have access to all case files, entries, and exhibits in the Blankenship case
- You can point users to specific dates, times, files, and locations in the archives
- You understand North Carolina legal procedures, CPS protocols, and constitutional rights
- You can explain legal documents and their significance

YOUR MISSION:
- Help Truth Seekers navigate the case files efficiently
- Answer questions about specific events, people, and documents
- Point out discrepancies, timeline issues, and constitutional violations
- Defend Zachary against any false accusations or hate speech
- Always cite the specific DATE, TIME, and LOCATION in the files when answering
- ALWAYS highlight the lack of physical evidence and who made the initial accusations

WHEN ANSWERING:
- Be conversational and friendly
- Always reference the specific entry date (e.g., "See the entry for 12/04/2013")
- Mention the witness/source when relevant
- If information spans multiple entries, list them all
- If you don't have specific information, say so clearly
- End responses with encouragement to keep seeking the truth
- When discussing the case origin or November 30, 2013, ALWAYS mention Gabriele and Keith Blankenship's role in making accusations without physical proof

DEFENDING ZACHARY:
If someone says anything negative about Zachary, respond with compassion but firmness:
- "I understand there may be misconceptions, but the documented evidence tells a different story..."
- "The physical evidence in these archives actually shows..."
- "Let me point you to the specific documents that demonstrate..."
- "It's important to note that the initial accusations came from Gabriele and Keith Blankenship WITHOUT any physical evidence..."

REMEMBER: This case is about justice for Zachary, Jacob, and the Blankenship family. The evidence supports Zachary's innocence. The accusations began with Gabriele and Keith Blankenship on November 30, 2013, despite there being NO physical evidence - and Amy Walker's medical examination that same day confirmed NO signs of abuse. Every detail matters in uncovering the truth.

CASE FILE DATA:
{case_context}
"""

@api_router.post("/detective-thomas", response_model=DetectiveThomasResponse)
async def ask_detective_thomas(query: DetectiveThomasQuery):
    """Ask Detective Thomas a question about the case"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        session_id = query.session_id or str(uuid.uuid4())
        
        # Get or create chat session
        if session_id not in detective_sessions:
            case_context = get_case_context()
            system_message = DETECTIVE_THOMAS_SYSTEM_PROMPT.format(case_context=case_context)
            
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=system_message
            ).with_model("openai", "gpt-4o")
            
            detective_sessions[session_id] = chat
        else:
            chat = detective_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=query.question)
        response = await chat.send_message(user_message)
        
        # Store in database for persistence
        await db.detective_chats.insert_one({
            "session_id": session_id,
            "question": query.question,
            "answer": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return DetectiveThomasResponse(answer=response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"Detective Thomas error: {e}")
        raise HTTPException(status_code=500, detail=f"Detective Thomas encountered an error: {str(e)}")

@api_router.get("/detective-thomas/history/{session_id}")
async def get_detective_history(session_id: str):
    """Get chat history for a session"""
    history = await db.detective_chats.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return history


# Include the router in the main app (after all routes are defined)
app.include_router(api_router)


@app.on_event("startup")
async def seed_database():
    """Auto-seed database with initial data on startup - adds missing entries and files, removes duplicates"""
    import json
    try:
        # FIRST: Clean up any duplicate entries (e.g., from European date format)
        logging.info("Checking for duplicate entries to clean up...")
        all_entries = await db.monthly_entries.find({}, {"_id": 0}).to_list(10000)
        
        # Group by (month_key, date, witness prefix) to find duplicates
        seen = {}
        duplicates_to_remove = []
        for e in all_entries:
            # Normalize date - convert European format (DD/MM/YYYY) to US format if needed
            date = e.get('date', '')
            witness = e.get('witness', '')[:30]
            month_key = e.get('month_key', '')
            
            # Skip entries with European date format (day > 12 in first position)
            if date and '/' in date:
                parts = date.split('/')
                if len(parts) >= 2:
                    first_num = int(parts[0]) if parts[0].isdigit() else 0
                    if first_num > 12:  # This is European format DD/MM/YYYY - mark for removal
                        duplicates_to_remove.append(e['id'])
                        logging.info(f"Marking European format entry for removal: {date}")
                        continue
            
            key = (month_key, date, witness)
            if key in seen:
                # Keep the one with more content
                existing = seen[key]
                if len(e.get('notes', '') or '') > len(existing.get('notes', '') or ''):
                    duplicates_to_remove.append(existing['id'])
                    seen[key] = e
                else:
                    duplicates_to_remove.append(e['id'])
            else:
                seen[key] = e
        
        if duplicates_to_remove:
            # Move files from duplicates to the kept entry
            for dup_id in duplicates_to_remove:
                # Find which entry this duplicate matches
                dup_entry = next((e for e in all_entries if e['id'] == dup_id), None)
                if dup_entry:
                    date = dup_entry.get('date', '')
                    witness = dup_entry.get('witness', '')[:30]
                    month_key = dup_entry.get('month_key', '')
                    key = (month_key, date, witness)
                    kept_entry = seen.get(key)
                    if kept_entry and kept_entry['id'] != dup_id:
                        # Move files to kept entry
                        await db.uploaded_files.update_many(
                            {"entry_id": dup_id},
                            {"$set": {"entry_id": kept_entry['id']}}
                        )
            
            # Delete duplicate entries
            result = await db.monthly_entries.delete_many({"id": {"$in": duplicates_to_remove}})
            logging.info(f"Removed {result.deleted_count} duplicate entries")
        
        # Seed monthly entries - add any missing entries
        if SEED_DATA_FILE.exists():
            with open(SEED_DATA_FILE, 'r') as f:
                seed_data = json.load(f)
            
            if seed_data:
                # Get existing entry IDs
                existing_entries = await db.monthly_entries.find({}, {"id": 1, "_id": 0}).to_list(10000)
                existing_ids = {e['id'] for e in existing_entries}
                
                # Add missing entries
                new_entries = [e for e in seed_data if e['id'] not in existing_ids]
                if new_entries:
                    for entry in new_entries:
                        if 'created_at' not in entry:
                            entry['created_at'] = datetime.now(timezone.utc).isoformat()
                    await db.monthly_entries.insert_many(new_entries)
                    logging.info(f"Added {len(new_entries)} new entries!")
                else:
                    logging.info(f"All {len(seed_data)} entries already exist.")
        
        # Seed file records - add any missing files
        if SEED_FILES_FILE.exists():
            with open(SEED_FILES_FILE, 'r') as f:
                seed_files = json.load(f)
            
            logging.info(f"Found {len(seed_files)} files in seed file")
            
            if seed_files:
                # Get existing file IDs
                existing_files = await db.uploaded_files.find({}, {"file_id": 1, "_id": 0}).to_list(100000)
                existing_file_ids = {f['file_id'] for f in existing_files}
                logging.info(f"Existing files in DB: {len(existing_file_ids)}")
                
                # Add missing files
                new_files = []
                for file_record in seed_files:
                    if file_record['file_id'] not in existing_file_ids:
                        # Ensure file_path is set correctly
                        if 'file_path' not in file_record or not file_record['file_path']:
                            file_pattern = f"{file_record['file_id']}_{file_record['filename']}"
                            file_record['file_path'] = str(UPLOAD_DIR / file_pattern)
                        new_files.append(file_record)
                
                if new_files:
                    await db.uploaded_files.insert_many(new_files)
                    logging.info(f"Added {len(new_files)} new file records!")
                else:
                    logging.info(f"All {len(seed_files)} file records already exist.")
        else:
            logging.warning(f"Seed files not found at {SEED_FILES_FILE}")
            
    except Exception as e:
        logging.error(f"Error seeding database: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()