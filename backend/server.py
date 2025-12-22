from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
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
from io import BytesIO
import httpx

# Try to import pillow-heif for HEIC conversion (universal compatibility)
try:
    import pillow_heif
    from PIL import Image
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False


ROOT_DIR = Path(__file__).parent
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

# Visitor tracking models
class VisitorLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ip_address: str
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None
    user_agent: Optional[str] = None
    page_accessed: str = "entry"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    access_granted: bool = False

class VisitorLogCreate(BaseModel):
    page_accessed: str = "entry"
    access_granted: bool = False

# ============================================
# VISITOR TRACKING ENDPOINTS (Admin Only)
# ============================================

async def get_geo_from_ip(ip_address: str) -> dict:
    """Get geographic information from IP address using free ip-api.com"""
    try:
        # Skip localhost/private IPs
        if ip_address in ['127.0.0.1', 'localhost', '::1'] or ip_address.startswith('192.168.') or ip_address.startswith('10.'):
            return {
                'city': 'Local',
                'region': 'Local Network',
                'country': 'Local',
                'country_code': 'LO',
                'timezone': 'N/A',
                'isp': 'Local Network'
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(f'http://ip-api.com/json/{ip_address}?fields=status,city,regionName,country,countryCode,timezone,isp', timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    return {
                        'city': data.get('city', 'Unknown'),
                        'region': data.get('regionName', 'Unknown'),
                        'country': data.get('country', 'Unknown'),
                        'country_code': data.get('countryCode', 'XX'),
                        'timezone': data.get('timezone', 'Unknown'),
                        'isp': data.get('isp', 'Unknown')
                    }
    except Exception as e:
        logging.error(f"Geo lookup failed for {ip_address}: {e}")
    
    return {
        'city': 'Unknown',
        'region': 'Unknown',
        'country': 'Unknown',
        'country_code': 'XX',
        'timezone': 'Unknown',
        'isp': 'Unknown'
    }

@api_router.post("/visitor/log")
async def log_visitor(request: Request, visitor_data: VisitorLogCreate):
    """Log a visitor access (called from frontend)"""
    try:
        # Get real IP address (handling proxies)
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            ip_address = forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.client.host if request.client else 'Unknown'
        
        # Get user agent
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
        # Get geographic info
        geo_info = await get_geo_from_ip(ip_address)
        
        # Create visitor log entry
        visitor_log = {
            'id': str(uuid.uuid4()),
            'ip_address': ip_address,
            'city': geo_info['city'],
            'region': geo_info['region'],
            'country': geo_info['country'],
            'country_code': geo_info['country_code'],
            'timezone': geo_info['timezone'],
            'isp': geo_info['isp'],
            'user_agent': user_agent[:500],  # Limit length
            'page_accessed': visitor_data.page_accessed,
            'access_granted': visitor_data.access_granted,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        await db.visitor_logs.insert_one(visitor_log)
        
        return {"status": "logged", "id": visitor_log['id']}
    except Exception as e:
        logging.error(f"Failed to log visitor: {e}")
        return {"status": "error", "message": str(e)}

@api_router.get("/admin/visitors")
async def get_visitor_logs(admin_password: str, limit: int = 100, skip: int = 0):
    """Get visitor logs (Admin only)"""
    verify_admin_password(admin_password)
    
    try:
        # Get total count
        total = await db.visitor_logs.count_documents({})
        
        # Get logs sorted by timestamp descending (newest first)
        logs = await db.visitor_logs.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "total": total,
            "logs": logs,
            "limit": limit,
            "skip": skip
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch visitor logs: {str(e)}")

@api_router.get("/admin/visitors/stats")
async def get_visitor_stats(admin_password: str):
    """Get visitor statistics (Admin only)"""
    verify_admin_password(admin_password)
    
    try:
        # Total visitors
        total_visitors = await db.visitor_logs.count_documents({})
        
        # Visitors with access granted
        access_granted = await db.visitor_logs.count_documents({"access_granted": True})
        
        # Unique IPs
        unique_ips = await db.visitor_logs.distinct("ip_address")
        
        # Visitors by country (aggregation)
        country_pipeline = [
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        countries = await db.visitor_logs.aggregate(country_pipeline).to_list(10)
        
        # Recent visitors (last 24 hours)
        from datetime import timedelta
        yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_count = await db.visitor_logs.count_documents({
            "timestamp": {"$gte": yesterday.isoformat()}
        })
        
        # Page analytics - visits by page
        page_pipeline = [
            {"$group": {"_id": "$page_accessed", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        pages = await db.visitor_logs.aggregate(page_pipeline).to_list(20)
        
        # Monthly folder analytics (for entries like "11/2013", "12/2013", etc.)
        monthly_pipeline = [
            {"$match": {"page_accessed": {"$regex": "^\\d{2}/\\d{4}$"}}},
            {"$group": {"_id": "$page_accessed", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        monthly_pages = await db.visitor_logs.aggregate(monthly_pipeline).to_list(20)
        
        # Visitors by hour of day (to see peak times)
        # This helps understand when people are most active
        hour_pipeline = [
            {"$addFields": {
                "hour": {"$hour": {"$dateFromString": {"dateString": "$timestamp"}}}
            }},
            {"$group": {"_id": "$hour", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        try:
            hourly = await db.visitor_logs.aggregate(hour_pipeline).to_list(24)
        except:
            hourly = []
        
        return {
            "total_visitors": total_visitors,
            "access_granted": access_granted,
            "unique_ips": len(unique_ips),
            "visitors_last_24h": recent_count,
            "top_countries": [{"country": c["_id"], "count": c["count"]} for c in countries],
            "page_visits": [{"page": p["_id"], "count": p["count"]} for p in pages],
            "monthly_folder_visits": [{"month": m["_id"], "count": m["count"]} for m in monthly_pages],
            "hourly_activity": [{"hour": h["_id"], "count": h["count"]} for h in hourly]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch visitor stats: {str(e)}")

@api_router.delete("/admin/visitors/clear")
async def clear_visitor_logs(admin_password: str):
    """Clear all visitor logs (Admin only)"""
    verify_admin_password(admin_password)
    
    try:
        result = await db.visitor_logs.delete_many({})
        return {"status": "cleared", "deleted_count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear visitor logs: {str(e)}")

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

# Activity logging helper (defined early for use throughout)
async def log_activity(admin_name: str, action: str, target_type: str, target_id: str, description: str):
    """Log an admin activity"""
    activity = {
        "id": str(uuid.uuid4()),
        "admin_name": admin_name,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "target_description": description,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(activity)

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
    
    HEIC/HEIF files are automatically converted to JPG for universal compatibility
    across all devices (PC, Android, Apple, Tablets).
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
    original_extension = get_file_extension(file.filename)
    original_filename = file.filename
    
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Check file size (limit to 16MB for MongoDB document)
        if file_size > 16 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 16MB.")
        
        # Auto-convert HEIC/HEIF to JPG for universal device compatibility
        final_filename = original_filename
        final_extension = original_extension
        final_content = file_content
        
        if original_extension.lower() in ['heic', 'heif'] and HEIC_SUPPORT:
            try:
                # Convert HEIC to JPG
                img = Image.open(BytesIO(file_content))
                
                # Convert to RGB if necessary (for RGBA/P mode images)
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Save as JPG
                jpg_buffer = BytesIO()
                img.save(jpg_buffer, 'JPEG', quality=85)
                jpg_buffer.seek(0)
                
                final_content = jpg_buffer.read()
                final_extension = 'jpg'
                final_filename = original_filename.rsplit('.', 1)[0] + '.jpg'
                file_size = len(final_content)
                
                logging.info(f"Converted {original_filename} to {final_filename} for universal compatibility")
            except Exception as conv_error:
                logging.warning(f"HEIC conversion failed, storing original: {conv_error}")
                # Fall back to original if conversion fails
        
        # Encode as base64 for storage
        file_content_b64 = base64.b64encode(final_content).decode('utf-8')
        
        # Create file record in database with content
        file_record = {
            "file_id": file_id,
            "filename": final_filename,
            "file_type": final_extension,
            "file_size": file_size,
            "entry_id": entry_id,
            "upload_date": datetime.now(timezone.utc).isoformat(),
            "file_content": file_content_b64  # Store file content in MongoDB
        }
        
        await db.uploaded_files.insert_one(file_record)
        
        return FileUploadResponse(
            file_id=file_id,
            filename=final_filename,
            file_type=final_extension,
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
    """Download or view an uploaded file from MongoDB storage"""
    # Get file record from database
    file_record = await db.uploaded_files.find_one(
        {"file_id": file_id},
        {"_id": 0}
    )
    
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if file content is stored in MongoDB (new method)
    if "file_content" in file_record:
        # Decode base64 content
        try:
            file_content = base64.b64decode(file_record["file_content"])
        except Exception as e:
            raise HTTPException(status_code=500, detail="Failed to decode file content")
        
        # Determine media type
        ext = file_record["file_type"]
        media_type = ALLOWED_EXTENSIONS.get(ext, "application/octet-stream")
        
        # Return file from MongoDB
        return Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Content-Disposition": f'inline; filename="{file_record["filename"]}"',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Cache-Control": "public, max-age=3600"
            }
        )
    
    # Fallback: Try filesystem (for backward compatibility with old uploads)
    if "file_path" in file_record:
        file_path = Path(file_record["file_path"])
        
        if file_path.exists():
            ext = file_record["file_type"]
            media_type = ALLOWED_EXTENSIONS.get(ext, "application/octet-stream")
            
            return FileResponse(
                path=file_path,
                media_type=media_type,
                filename=file_record["filename"],
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Expose-Headers": "Content-Disposition",
                    "Cache-Control": "public, max-age=3600"
                }
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
    created_by: str = ""  # Admin name who created
    last_edited_by: str = ""  # Admin name who last edited

class MonthlyEntryCreate(BaseModel):
    month_key: str
    date: str = ""
    time: str = ""
    witness: str = ""
    description: str = ""
    evidence: str = ""
    notes: str = ""
    admin_name: str = ""  # Who is creating this

class MonthlyEntryUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    witness: Optional[str] = None
    description: Optional[str] = None
    evidence: Optional[str] = None
    notes: Optional[str] = None
    admin_name: Optional[str] = None  # Who is updating this


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
async def create_monthly_entry(entry: MonthlyEntryCreate, admin_password: str):
    """Create a new monthly detail entry (admin only)"""
    verify_admin_password(admin_password)
    
    admin_name = entry.admin_name or "Admin"
    
    new_entry = MonthlyEntry(
        id=str(uuid.uuid4()),
        month_key=entry.month_key,
        date=entry.date,
        time=entry.time,
        witness=entry.witness,
        description=entry.description,
        evidence=entry.evidence,
        notes=entry.notes,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat(),
        created_by=admin_name,
        last_edited_by=admin_name
    )
    
    await db.monthly_entries.insert_one(new_entry.model_dump())
    
    # Log activity
    await log_activity(admin_name, "created", "entry", new_entry.id, f"Created entry in {entry.month_key}")
    
    return new_entry.model_dump()

# Update a monthly entry (admin only)
@api_router.put("/monthly/{entry_id}")
async def update_monthly_entry(entry_id: str, entry: MonthlyEntryUpdate, admin_password: str):
    """Update a monthly detail entry (admin only)"""
    verify_admin_password(admin_password)
    
    existing = await db.monthly_entries.find_one({"id": entry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Monthly entry not found")
    
    admin_name = entry.admin_name or "Admin"
    
    update_data = {k: v for k, v in entry.model_dump().items() if v is not None and k != "admin_name"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["last_edited_by"] = admin_name
    
    await db.monthly_entries.update_one(
        {"id": entry_id},
        {"$set": update_data}
    )
    
    # Log activity
    await log_activity(admin_name, "edited", "entry", entry_id, f"Edited entry in {existing.get('month_key', 'unknown')}")
    
    updated = await db.monthly_entries.find_one({"id": entry_id}, {"_id": 0})
    return updated

# Delete a monthly entry (admin only)
@api_router.delete("/monthly/{entry_id}")
async def delete_monthly_entry(entry_id: str, admin_password: str, admin_name: str = "Admin"):
    """Delete a monthly detail entry (admin only)"""
    verify_admin_password(admin_password)
    
    existing = await db.monthly_entries.find_one({"id": entry_id}, {"_id": 0})
    
    result = await db.monthly_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Monthly entry not found")
    
    # Log activity
    month_key = existing.get('month_key', 'unknown') if existing else 'unknown'
    await log_activity(admin_name, "deleted", "entry", entry_id, f"Deleted entry from {month_key}")
    
    return {"status": "success", "message": "Entry deleted"}
    
    return {"status": "success", "message": "Monthly entry deleted"}


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
# MULTI-ADMIN SYSTEM
# ============================================

# Admin account model
class AdminAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # e.g., "Larsen"
    password: str
    is_owner: bool = False  # Only owner can add/remove admins and see passwords
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminLogin(BaseModel):
    name: str
    password: str

class AdminCreate(BaseModel):
    name: str
    password: str

# Activity log model
class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_name: str
    action: str  # "created", "edited", "deleted", "uploaded", "deleted_file"
    target_type: str  # "entry", "file"
    target_id: str
    target_description: str  # Brief description of what was affected
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Entry lock model
class EntryLock(BaseModel):
    entry_id: str
    admin_name: str
    locked_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Initialize owner account on startup
@app.on_event("startup")
async def init_admin_accounts():
    """Create the owner admin account if it doesn't exist"""
    owner = await db.admin_accounts.find_one({"is_owner": True})
    if not owner:
        owner_account = {
            "id": str(uuid.uuid4()),
            "name": "Larsen",
            "password": "02071951",
            "is_owner": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admin_accounts.insert_one(owner_account)
        logging.info("Owner admin account 'Larsen' created")

# Admin login endpoint
@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    """Verify admin credentials and return admin info"""
    admin = await db.admin_accounts.find_one(
        {"name": {"$regex": f"^{credentials.name}$", "$options": "i"}, "password": credentials.password},
        {"_id": 0}
    )
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid name or password")
    
    return {
        "success": True,
        "admin": {
            "id": admin["id"],
            "name": admin["name"],
            "is_owner": admin.get("is_owner", False)
        }
    }

# Get all admins (owner only - includes passwords)
@api_router.get("/admin/team")
async def get_admin_team(admin_id: str):
    """Get all admin accounts - owner sees passwords, others don't"""
    requesting_admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not requesting_admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    admins = await db.admin_accounts.find({}, {"_id": 0}).to_list(100)
    
    # If owner, include passwords; otherwise hide them
    if requesting_admin.get("is_owner", False):
        return {"admins": admins, "is_owner_view": True}
    else:
        # Hide passwords for non-owners
        for admin in admins:
            admin.pop("password", None)
        return {"admins": admins, "is_owner_view": False}

# Create new admin (owner only)
@api_router.post("/admin/team/create")
async def create_admin(admin_id: str, new_admin: AdminCreate):
    """Create a new admin account (owner only)"""
    requesting_admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not requesting_admin or not requesting_admin.get("is_owner", False):
        raise HTTPException(status_code=403, detail="Only the owner can add team members")
    
    # Check if name already exists
    existing = await db.admin_accounts.find_one(
        {"name": {"$regex": f"^{new_admin.name}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="An admin with this name already exists")
    
    new_account = {
        "id": str(uuid.uuid4()),
        "name": new_admin.name,
        "password": new_admin.password,
        "is_owner": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admin_accounts.insert_one(new_account)
    
    # Log activity
    await log_activity(requesting_admin["name"], "added", "admin", new_account["id"], f"Added Admin. {new_admin.name}")
    
    return {"success": True, "admin": new_account}

# Delete admin (owner only)
@api_router.delete("/admin/team/{target_admin_id}")
async def delete_admin(target_admin_id: str, admin_id: str):
    """Delete an admin account (owner only)"""
    requesting_admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not requesting_admin or not requesting_admin.get("is_owner", False):
        raise HTTPException(status_code=403, detail="Only the owner can remove team members")
    
    target_admin = await db.admin_accounts.find_one({"id": target_admin_id}, {"_id": 0})
    if not target_admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if target_admin.get("is_owner", False):
        raise HTTPException(status_code=400, detail="Cannot remove the owner account")
    
    await db.admin_accounts.delete_one({"id": target_admin_id})
    
    # Log activity
    await log_activity(requesting_admin["name"], "removed", "admin", target_admin_id, f"Removed Admin. {target_admin['name']}")
    
    return {"success": True, "message": f"Admin. {target_admin['name']} removed"}

# Activity logging helper
async def log_activity(admin_name: str, action: str, target_type: str, target_id: str, description: str):
    """Log an admin activity"""
    activity = {
        "id": str(uuid.uuid4()),
        "admin_name": admin_name,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "target_description": description,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(activity)

# Get activity logs (all admins can view)
@api_router.get("/admin/activity")
async def get_activity_logs(admin_id: str, limit: int = 100, skip: int = 0):
    """Get activity logs - visible to all admins"""
    admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    total = await db.activity_logs.count_documents({})
    logs = await db.activity_logs.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": total}

# Entry locking endpoints
@api_router.post("/admin/lock/{entry_id}")
async def lock_entry(entry_id: str, admin_id: str):
    """Lock an entry for editing"""
    admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    # Check if already locked by someone else
    existing_lock = await db.entry_locks.find_one({"entry_id": entry_id}, {"_id": 0})
    if existing_lock and existing_lock["admin_name"] != admin["name"]:
        # Check if lock is stale (older than 5 minutes)
        lock_time = datetime.fromisoformat(existing_lock["locked_at"])
        if (datetime.now(timezone.utc) - lock_time).seconds < 300:
            return {"locked": True, "by": existing_lock["admin_name"], "self": False}
    
    # Create or update lock
    await db.entry_locks.update_one(
        {"entry_id": entry_id},
        {"$set": {
            "entry_id": entry_id,
            "admin_name": admin["name"],
            "locked_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"locked": True, "by": admin["name"], "self": True}

@api_router.delete("/admin/lock/{entry_id}")
async def unlock_entry(entry_id: str, admin_id: str):
    """Unlock an entry"""
    admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    await db.entry_locks.delete_one({"entry_id": entry_id, "admin_name": admin["name"]})
    return {"unlocked": True}

@api_router.get("/admin/locks")
async def get_all_locks(admin_id: str):
    """Get all current entry locks"""
    admin = await db.admin_accounts.find_one({"id": admin_id}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    locks = await db.entry_locks.find({}, {"_id": 0}).to_list(100)
    
    # Filter out stale locks (older than 5 minutes)
    active_locks = []
    for lock in locks:
        lock_time = datetime.fromisoformat(lock["locked_at"])
        if (datetime.now(timezone.utc) - lock_time).seconds < 300:
            active_locks.append(lock)
        else:
            # Clean up stale lock
            await db.entry_locks.delete_one({"entry_id": lock["entry_id"]})
    
    return {"locks": active_locks}


# Include the router in the main app (after all routes are defined)
app.include_router(api_router)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()