from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil
import mimetypes
import base64


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
    
    return [
        FileInfo(
            file_id=f["file_id"],
            filename=f["filename"],
            file_type=f["file_type"],
            file_size=f["file_size"],
            upload_date=f["upload_date"],
            entry_id=f["entry_id"]
        ) for f in files
    ]

# Download/view a file
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
            return FileResponse(
                path=file_path,
                media_type=media_type,
                filename=file_record["filename"],
                headers=cross_platform_headers
            )
    
    # Last resort: Search in uploads directory by file_id
    for upload_file in UPLOAD_DIR.iterdir():
        if file_id in upload_file.name:
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
    """Get all entries for a specific month (e.g., '10/2013')"""
    # URL decode the month_key since it may contain /
    decoded_key = month_key.replace("-", "/")
    entries = await db.monthly_entries.find({"month_key": decoded_key}, {"_id": 0}).sort("line_number", 1).to_list(1000)
    return entries

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
    
    await db.monthly_entries.insert_one(new_entry.model_dump())
    return new_entry.model_dump()

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


# Include the router in the main app (after all routes are defined)
app.include_router(api_router)


@app.on_event("startup")
async def seed_database():
    """Auto-seed database with initial data on startup if empty"""
    import json
    try:
        # Seed monthly entries
        count = await db.monthly_entries.count_documents({})
        if count == 0 and SEED_DATA_FILE.exists():
            logging.info("Database empty, seeding with initial data...")
            with open(SEED_DATA_FILE, 'r') as f:
                seed_data = json.load(f)
            
            if seed_data:
                for entry in seed_data:
                    if 'id' not in entry:
                        entry['id'] = str(uuid.uuid4())
                    if 'created_at' not in entry:
                        entry['created_at'] = datetime.now(timezone.utc).isoformat()
                
                await db.monthly_entries.insert_many(seed_data)
                logging.info(f"Successfully seeded {len(seed_data)} entries!")
        else:
            logging.info(f"Database has {count} entries, skipping seed.")
        
        # Seed file records (exhibits) - use uploaded_files collection to match API
        file_count = await db.uploaded_files.count_documents({})
        if file_count == 0 and SEED_FILES_FILE.exists():
            logging.info("File records empty, seeding exhibits...")
            with open(SEED_FILES_FILE, 'r') as f:
                seed_files = json.load(f)
            
            if seed_files:
                # Add file_path to each record for filesystem serving
                for file_record in seed_files:
                    # Look for file in uploads directory matching file_id prefix
                    file_pattern = f"{file_record['file_id']}_{file_record['filename']}"
                    file_path = UPLOAD_DIR / file_pattern
                    if file_path.exists():
                        file_record['file_path'] = str(file_path)
                    else:
                        # Try alternate pattern (just filename)
                        for f in UPLOAD_DIR.iterdir():
                            if file_record['file_id'] in f.name:
                                file_record['file_path'] = str(f)
                                break
                
                await db.uploaded_files.insert_many(seed_files)
                logging.info(f"Successfully seeded {len(seed_files)} file records!")
        else:
            logging.info(f"Database has {file_count} file records, skipping file seed.")
            
    except Exception as e:
        logging.error(f"Error seeding database: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()