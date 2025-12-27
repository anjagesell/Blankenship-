from fastapi import FastAPI, APIRouter, HTTPException, Query
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'blankenship_archives')]

# Create the main app
app = FastAPI(title="Blankenship Judicial Archives API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ================== MODELS ==================

class EvidenceItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    title: str
    description: str
    category: str = "general"  # document, photo, testimony, medical, legal, correspondence
    date: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    tags: List[str] = []
    is_critical: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EvidenceCreate(BaseModel):
    year: int
    title: str
    description: str
    category: str = "general"
    date: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    tags: List[str] = []
    is_critical: bool = False

class YearFolder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    title: str
    description: str
    is_locked: bool = True
    password_hash: str = ""
    evidence_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class YearFolderCreate(BaseModel):
    year: int
    title: str
    description: str
    is_locked: bool = True

class RouteLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    marker: str  # A, B, C, D, E
    name: str
    address: str
    city: str
    distance: str
    time_range: str
    description: str
    order: int

class RouteAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    day_description: str
    total_distance: str
    total_time: str
    locations: List[RouteLocation] = []
    critical_points: List[str] = []
    conclusion: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str  # user or assistant
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PasswordVerify(BaseModel):
    password: str
    access_type: str = "user"  # user or admin

# ================== INITIALIZATION DATA ==================

DEFAULT_ROUTE_ANALYSIS = {
    "id": str(uuid.uuid4()),
    "date": "November 30, 2013",
    "day_description": "Saturday (Day after Thanksgiving) — Evidence Timeline Mapping",
    "total_distance": "27.0 miles",
    "total_time": "50-72 min",
    "locations": [
        {
            "id": str(uuid.uuid4()),
            "marker": "A",
            "name": "G. & K. Blankenship Residence",
            "address": "174 Woodridge Lane",
            "city": "Mooresville",
            "distance": "4.2 mi",
            "time_range": "8-12 min",
            "description": "Paternal grandparents' residence where Rose was regularly babysat",
            "order": 1
        },
        {
            "id": str(uuid.uuid4()),
            "marker": "B",
            "name": "Big Lots Store",
            "address": "376 W. Plaza Drive",
            "city": "Mooresville",
            "distance": "9.8 mi",
            "time_range": "18-25 min",
            "description": "Shopping location on the route",
            "order": 2
        },
        {
            "id": str(uuid.uuid4()),
            "marker": "C",
            "name": "Zackary Blankenship's Home",
            "address": "6718 Catfish Drive",
            "city": "Sherrills Ford",
            "distance": "11.2 mi",
            "time_range": "20-28 min",
            "description": "Defendant's residence in Catawba County",
            "order": 3
        },
        {
            "id": str(uuid.uuid4()),
            "marker": "D",
            "name": "Dr. Pellegrino's Office",
            "address": "930 W. Wilson Avenue",
            "city": "Mooresville",
            "distance": "1.8 mi",
            "time_range": "4-7 min",
            "description": "Medical office location",
            "order": 4
        },
        {
            "id": str(uuid.uuid4()),
            "marker": "E",
            "name": "Lake Norman Hospital",
            "address": "171 Fairview Road",
            "city": "Mooresville",
            "distance": "27.0 mi",
            "time_range": "50-72 min",
            "description": "Lake Norman Medical Center - Initial S.A.N.E. exam location",
            "order": 5
        }
    ],
    "critical_points": [
        "Route crosses TWO counties (Iredell & Catawba)",
        "NC-150 was congested two-lane highway in 2013",
        "Nov 30, 2013 = Black Friday weekend traffic",
        "50-72 min is DRIVING ONLY — excludes stops, parking, waiting at each location",
        "Medical visits & store stops add significant time"
    ],
    "conclusion": "The total minimum driving time of 50-72 minutes raises significant questions about the timeline of events as presented under oath."
}

# Passwords (in production, use proper hashing)
FIRST_PASSWORD = "05052017"
ADMIN_PASSWORD = "02071951"

# ================== ROUTES ==================

@api_router.get("/")
async def root():
    return {"message": "Blankenship Judicial Archives API", "motto": "Justice for Jacob, Justice for Zack ⚖️💙"}

# Password verification
@api_router.post("/verify-password")
async def verify_password(data: PasswordVerify):
    if data.access_type == "admin":
        if data.password == ADMIN_PASSWORD:
            return {"success": True, "access_level": "admin"}
    else:
        if data.password == FIRST_PASSWORD or data.password == ADMIN_PASSWORD:
            return {"success": True, "access_level": "admin" if data.password == ADMIN_PASSWORD else "user"}
    return {"success": False, "message": "Invalid password"}

# Route Analysis endpoints
@api_router.get("/route-analysis")
async def get_route_analysis():
    route = await db.route_analysis.find_one({}, {"_id": 0})
    if not route:
        # Initialize with default data
        await db.route_analysis.insert_one(DEFAULT_ROUTE_ANALYSIS)
        return DEFAULT_ROUTE_ANALYSIS
    return route

@api_router.put("/route-analysis")
async def update_route_analysis(route: RouteAnalysis):
    route_dict = route.model_dump()
    route_dict['created_at'] = route_dict['created_at'].isoformat()
    await db.route_analysis.replace_one({}, route_dict, upsert=True)
    return route_dict

# Year Folders endpoints
@api_router.get("/folders", response_model=List[dict])
async def get_folders():
    folders = await db.folders.find({}, {"_id": 0}).to_list(100)
    if not folders:
        # Initialize default folders for years 2013-2026
        default_folders = []
        for year in range(2013, 2027):
            folder = {
                "id": str(uuid.uuid4()),
                "year": year,
                "title": f"{year} Archives",
                "description": f"Confidential evidence and documentation from {year}",
                "is_locked": True,
                "evidence_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            default_folders.append(folder)
        if default_folders:
            await db.folders.insert_many(default_folders)
        return default_folders
    return folders

@api_router.get("/folders/{year}")
async def get_folder_by_year(year: int):
    folder = await db.folders.find_one({"year": year}, {"_id": 0})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@api_router.post("/folders")
async def create_folder(folder: YearFolderCreate):
    folder_dict = folder.model_dump()
    folder_dict["id"] = str(uuid.uuid4())
    folder_dict["evidence_count"] = 0
    folder_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.folders.insert_one(folder_dict)
    return folder_dict

# Evidence endpoints
@api_router.get("/evidence", response_model=List[dict])
async def get_all_evidence(year: Optional[int] = None, category: Optional[str] = None):
    query = {}
    if year:
        query["year"] = year
    if category:
        query["category"] = category
    evidence = await db.evidence.find(query, {"_id": 0}).to_list(1000)
    return evidence

@api_router.get("/evidence/{evidence_id}")
async def get_evidence_item(evidence_id: str):
    item = await db.evidence.find_one({"id": evidence_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return item

@api_router.post("/evidence")
async def create_evidence(evidence: EvidenceCreate):
    evidence_dict = evidence.model_dump()
    evidence_dict["id"] = str(uuid.uuid4())
    evidence_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.evidence.insert_one(evidence_dict)
    
    # Update folder evidence count
    await db.folders.update_one(
        {"year": evidence.year},
        {"$inc": {"evidence_count": 1}}
    )
    
    return evidence_dict

@api_router.put("/evidence/{evidence_id}")
async def update_evidence(evidence_id: str, evidence: EvidenceCreate):
    evidence_dict = evidence.model_dump()
    result = await db.evidence.update_one(
        {"id": evidence_id},
        {"$set": evidence_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return {"id": evidence_id, **evidence_dict}

@api_router.delete("/evidence/{evidence_id}")
async def delete_evidence(evidence_id: str):
    # Get evidence to find the year
    item = await db.evidence.find_one({"id": evidence_id})
    if not item:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    await db.evidence.delete_one({"id": evidence_id})
    
    # Update folder evidence count
    await db.folders.update_one(
        {"year": item["year"]},
        {"$inc": {"evidence_count": -1}}
    )
    
    return {"success": True, "message": "Evidence deleted"}

# Chat endpoints for PI Thomas
@api_router.get("/chat/history")
async def get_chat_history():
    messages = await db.chat_messages.find({}, {"_id": 0}).sort("timestamp", 1).to_list(100)
    return messages

@api_router.post("/chat")
async def send_chat_message(message: ChatMessage):
    msg_dict = message.model_dump()
    msg_dict["timestamp"] = msg_dict["timestamp"].isoformat()
    await db.chat_messages.insert_one(msg_dict)
    
    # Generate PI Thomas response (static for now)
    responses = {
        "default": "I'm reviewing the case files. What specific aspect would you like me to investigate?",
        "route": "The geographic route analysis shows significant discrepancies in the timeline presented. The total driving time alone raises questions.",
        "evidence": "The evidence folders contain documentation spanning from 2013 to present. Each piece tells part of the story.",
        "warrant": "The arrest warrant dated December 13, 2013 contains demonstrably false information about the offense dates.",
        "cps": "The CPS investigation shows a cascade of social workers that created a false consensus rather than independent verification.",
        "medical": "Medical records from November 30, 2013 state 'hymen intact' and 'no signs of sexual assault.' The S.A.N.E. nurse deemed a rape kit unnecessary."
    }
    
    # Simple keyword matching for response
    user_msg = message.content.lower()
    response_text = responses["default"]
    for key, value in responses.items():
        if key in user_msg:
            response_text = value
            break
    
    # Create assistant response
    assistant_msg = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_messages.insert_one(assistant_msg)
    
    return assistant_msg

@api_router.delete("/chat/clear")
async def clear_chat():
    await db.chat_messages.delete_many({})
    return {"success": True, "message": "Chat history cleared"}

# Statistics endpoint
@api_router.get("/stats")
async def get_stats():
    total_evidence = await db.evidence.count_documents({})
    total_folders = await db.folders.count_documents({})
    critical_evidence = await db.evidence.count_documents({"is_critical": True})
    
    # Evidence by category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    by_category = await db.evidence.aggregate(pipeline).to_list(100)
    
    # Evidence by year
    pipeline_year = [
        {"$group": {"_id": "$year", "count": {"$sum": 1}}}
    ]
    by_year = await db.evidence.aggregate(pipeline_year).to_list(100)
    
    return {
        "total_evidence": total_evidence,
        "total_folders": total_folders,
        "critical_evidence": critical_evidence,
        "by_category": {item["_id"]: item["count"] for item in by_category if item["_id"]},
        "by_year": {str(item["_id"]): item["count"] for item in by_year if item["_id"]}
    }

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
