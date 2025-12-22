#!/usr/bin/env python3
"""
Re-upload files with correct entry IDs from production
"""

import requests
import os
from pathlib import Path

PRODUCTION_URL = "https://blanksolution.emergent.host/api"
ADMIN_PASSWORD = "02071951"
FILES_DIR = Path("/app/backend/uploads/imported/nov2013")

# First, get the actual entry IDs from production
def get_production_entry_ids():
    """Get entry IDs mapped by time from production"""
    response = requests.get(f"{PRODUCTION_URL}/monthly/11-2013")
    entries = response.json()
    
    # Create mapping by time
    time_to_id = {}
    for entry in entries:
        time = entry.get('time', '')
        entry_id = entry.get('id', '')
        time_to_id[time] = entry_id
        print(f"  {time:12} -> {entry_id}")
    
    return time_to_id

# Mapping of times to their files
TIME_TO_FILES = {
    "11:30 am": ["IMG_0308.heic", "IMG_0310.heic", "IMG_0311.heic", "IMG_0313.heic", "IMG_0314.heic"],
    "11:52": ["IMG_0317.heic", "IMG_0318.heic", "IMG_0319.heic", "IMG_0320.heic"],
    "12:15 pm": ["IMG_0321.heic"],
    "12:30 pm": ["IMG_0322.heic"],
    # For 12:50 pm we have two entries - CPS Intake has 14 files, Intake Narrative has 1
    # We'll need to handle this specially
}

# CPS Intake 12:50 pm (first one - 14 files)
CPS_INTAKE_FILES = [
    "IMG_0323.heic", "IMG_0324.heic", "IMG_0326.heic", "IMG_0327.heic",
    "IMG_0329.heic", "IMG_0331.heic", "IMG_0333.heic", "IMG_0336.heic",
    "IMG_0339.heic", "IMG_0342.heic", "IMG_0343.heic", "IMG_0344.heic",
    "IMG_0345.heic", "IMG_0346.heic"
]

# Intake Narrative 12:50 pm (second one - 1 file)
INTAKE_NARRATIVE_FILES = ["IMG_0347.heic"]

TIME_TO_FILES_CONTINUED = {
    "1:22 pm": ["IMG_0348.heic"],
    "3:30 pm": ["IMG_0349.heic"],
    "4:00 pm": ["IMG_0350.heic"],
    "6:33 pm": ["IMG_0351.heic", "IMG_0352.heic"],
    "8:35 pm": ["IMG_0353.heic"],
    "9:00 pm": ["IMG_0354.heic"],
    "9:02 pm": ["IMG_0355.heic"],
    "10:30 pm": ["IMG_0356.heic", "IMG_0358.heic"],
}

def upload_file(entry_id, filename):
    """Upload a single file to an entry"""
    file_path = FILES_DIR / filename
    
    if not file_path.exists():
        return False, "File not found"
    
    try:
        with open(file_path, "rb") as f:
            files_data = {
                "file": (filename, f, "image/heic")
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
        return False, str(e)[:40]

def get_12_50_entries():
    """Get the two 12:50 pm entries and figure out which is which"""
    response = requests.get(f"{PRODUCTION_URL}/monthly/11-2013")
    entries = response.json()
    
    # Find both 12:50 pm entries
    entries_1250 = [e for e in entries if e.get('time') == '12:50 pm']
    
    cps_intake_id = None
    intake_narrative_id = None
    
    for entry in entries_1250:
        desc = entry.get('description', '').lower()
        if 'intake report' in desc or 'maltreatment' in desc:
            cps_intake_id = entry['id']
        elif 'narrative' in desc or 'synopsis' in desc:
            intake_narrative_id = entry['id']
    
    return cps_intake_id, intake_narrative_id

def main():
    print("=" * 60)
    print("RE-UPLOADING FILES WITH CORRECT ENTRY IDs")
    print("=" * 60)
    
    # Get production entry IDs
    print("\n1. Getting entry IDs from production...")
    time_to_id = get_production_entry_ids()
    
    # Get the two 12:50 pm entries
    print("\n2. Identifying 12:50 pm entries...")
    cps_intake_id, intake_narrative_id = get_12_50_entries()
    print(f"   CPS Intake (14 files): {cps_intake_id}")
    print(f"   Intake Narrative (1 file): {intake_narrative_id}")
    
    success_count = 0
    fail_count = 0
    
    # Upload files for single-time entries
    print("\n3. Uploading files...")
    
    # First batch
    for time, files in TIME_TO_FILES.items():
        entry_id = time_to_id.get(time)
        if not entry_id:
            print(f"   ✗ No entry found for time: {time}")
            continue
        
        print(f"\n   {time} ({len(files)} files)")
        for filename in files:
            ok, msg = upload_file(entry_id, filename)
            if ok:
                print(f"      ✓ {filename}")
                success_count += 1
            else:
                print(f"      ✗ {filename} - {msg}")
                fail_count += 1
    
    # CPS Intake (14 files)
    if cps_intake_id:
        print(f"\n   12:50 pm - CPS Intake ({len(CPS_INTAKE_FILES)} files)")
        for filename in CPS_INTAKE_FILES:
            ok, msg = upload_file(cps_intake_id, filename)
            if ok:
                print(f"      ✓ {filename}")
                success_count += 1
            else:
                print(f"      ✗ {filename} - {msg}")
                fail_count += 1
    
    # Intake Narrative (1 file)
    if intake_narrative_id:
        print(f"\n   12:50 pm - Intake Narrative ({len(INTAKE_NARRATIVE_FILES)} files)")
        for filename in INTAKE_NARRATIVE_FILES:
            ok, msg = upload_file(intake_narrative_id, filename)
            if ok:
                print(f"      ✓ {filename}")
                success_count += 1
            else:
                print(f"      ✗ {filename} - {msg}")
                fail_count += 1
    
    # Second batch
    for time, files in TIME_TO_FILES_CONTINUED.items():
        entry_id = time_to_id.get(time)
        if not entry_id:
            print(f"   ✗ No entry found for time: {time}")
            continue
        
        print(f"\n   {time} ({len(files)} files)")
        for filename in files:
            ok, msg = upload_file(entry_id, filename)
            if ok:
                print(f"      ✓ {filename}")
                success_count += 1
            else:
                print(f"      ✗ {filename} - {msg}")
                fail_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"RESULTS: {success_count} succeeded, {fail_count} failed")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
