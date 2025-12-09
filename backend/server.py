from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse
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

# Include the router in the main app
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()