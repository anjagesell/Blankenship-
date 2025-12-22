#!/usr/bin/env python3
"""
Convert all HEIC files to JPG and upload to production
"""

import os
import requests
import pillow_heif
from PIL import Image
from pathlib import Path
from io import BytesIO

# Register HEIF opener
pillow_heif.register_heif_opener()

PRODUCTION_URL = "https://blanksolution.emergent.host/api"
ADMIN_PASSWORD = "02071951"
HEIC_DIR = Path("/app/backend/uploads/imported/nov2013")
JPG_DIR = Path("/app/backend/uploads/imported/nov2013_jpg")

# Create JPG directory
JPG_DIR.mkdir(exist_ok=True)

# Entry time to ID mapping (from production)
def get_entry_mapping():
    response = requests.get(f"{PRODUCTION_URL}/monthly/11-2013")
    entries = response.json()
    
    mapping = {}
    for entry in entries:
        time = entry.get('time', '')
        entry_id = entry.get('id', '')
        desc = entry.get('description', '').lower()
        
        # Handle the two 12:50 pm entries
        if time == '12:50 pm':
            if 'intake report' in desc and 'narrative' not in desc:
                mapping['12:50 pm - intake'] = entry_id
            elif 'narrative' in desc:
                mapping['12:50 pm - narrative'] = entry_id
        else:
            mapping[time] = entry_id
    
    return mapping

# Files for each entry
ENTRY_FILES = {
    "11:30 am": ["IMG_0308", "IMG_0310", "IMG_0311", "IMG_0313", "IMG_0314"],
    "11:52": ["IMG_0317", "IMG_0318", "IMG_0319", "IMG_0320"],
    "12:15 pm": ["IMG_0321"],
    "12:30 pm": ["IMG_0322"],
    "12:50 pm - intake": ["IMG_0323", "IMG_0324", "IMG_0326", "IMG_0327", "IMG_0329", 
                          "IMG_0331", "IMG_0333", "IMG_0336", "IMG_0339", "IMG_0342",
                          "IMG_0343", "IMG_0344", "IMG_0345", "IMG_0346"],
    "12:50 pm - narrative": ["IMG_0347"],
    "1:22 pm": ["IMG_0348"],
    "3:30 pm": ["IMG_0349"],
    "4:00 pm": ["IMG_0350"],
    "6:33 pm": ["IMG_0351", "IMG_0352"],
    "8:35 pm": ["IMG_0353"],
    "9:00 pm": ["IMG_0354"],
    "9:02 pm": ["IMG_0355"],
    "10:30 pm": ["IMG_0356", "IMG_0358"],
}

def convert_and_upload(heic_path, entry_id):
    """Convert HEIC to JPG and upload"""
    try:
        # Open and convert
        img = Image.open(heic_path)
        
        # Convert to RGB if necessary (for RGBA images)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Save to JPG in memory
        jpg_buffer = BytesIO()
        img.save(jpg_buffer, 'JPEG', quality=85)
        jpg_buffer.seek(0)
        
        # Get new filename
        jpg_filename = heic_path.stem + ".jpg"
        
        # Upload
        files_data = {
            "file": (jpg_filename, jpg_buffer, "image/jpeg")
        }
        
        response = requests.post(
            f"{PRODUCTION_URL}/upload",
            files=files_data,
            data={
                "entry_id": entry_id,
                "admin_password": ADMIN_PASSWORD
            },
            timeout=60
        )
        
        if response.status_code in [200, 201]:
            return True, "OK"
        else:
            return False, f"Status {response.status_code}"
            
    except Exception as e:
        return False, str(e)[:50]

def main():
    print("=" * 60)
    print("CONVERTING HEIC TO JPG AND UPLOADING TO PRODUCTION")
    print("=" * 60)
    
    # Get entry mapping
    print("\n1. Getting entry IDs from production...")
    mapping = get_entry_mapping()
    for key, val in mapping.items():
        print(f"   {key:25} -> {val[:8]}...")
    
    success = 0
    fail = 0
    
    print("\n2. Converting and uploading...")
    
    for entry_key, files in ENTRY_FILES.items():
        entry_id = mapping.get(entry_key)
        if not entry_id:
            print(f"\n   ✗ No entry found for: {entry_key}")
            continue
        
        print(f"\n   {entry_key} ({len(files)} files)")
        
        for file_base in files:
            heic_path = HEIC_DIR / f"{file_base}.heic"
            
            if not heic_path.exists():
                print(f"      ✗ {file_base}.heic - Not found")
                fail += 1
                continue
            
            ok, msg = convert_and_upload(heic_path, entry_id)
            if ok:
                print(f"      ✓ {file_base}.jpg")
                success += 1
            else:
                print(f"      ✗ {file_base}.jpg - {msg}")
                fail += 1
    
    print(f"\n{'=' * 60}")
    print(f"RESULTS: {success} converted & uploaded, {fail} failed")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
