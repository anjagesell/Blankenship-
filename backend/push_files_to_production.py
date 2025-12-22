#!/usr/bin/env python3
"""
Push all 36 exhibit files to production database via API
"""

import requests
import os
from pathlib import Path

PRODUCTION_URL = "https://blanksolution.emergent.host/api"
ADMIN_PASSWORD = "02071951"
FILES_DIR = Path("/app/backend/uploads/imported/nov2013")

# Mapping of entry IDs to their files
ENTRY_FILES = {
    # Entry: d1bfd6b1 (Amy Walker Medical 11:30am) - 5 files
    "d1bfd6b1-0e2a-49c0-b3f5-1cbfecdf4033": [
        "IMG_0308.heic", "IMG_0310.heic", "IMG_0311.heic", "IMG_0313.heic", "IMG_0314.heic"
    ],
    # Entry: 1f8e1c92 (Officer Coffey 11:52am) - 4 files
    "1f8e1c92-6119-46ea-9344-586fc45bb4b1": [
        "IMG_0317.heic", "IMG_0318.heic", "IMG_0319.heic", "IMG_0320.heic"
    ],
    # Entry: 8d4eac6d (Sheri Stock 12:15pm) - 1 file
    "8d4eac6d-7f46-498c-a962-4594e640c9f9": [
        "IMG_0321.heic"
    ],
    # Entry: e61eb370 (Stock/Mecimore 12:30pm) - 1 file
    "e61eb370-afd8-4150-9d15-6ec3c1495bba": [
        "IMG_0322.heic"
    ],
    # Entry: f4639498 (CPS Intake 12:50pm) - 14 files
    "f4639498-580c-42a9-a3e6-f8a459e4c2be": [
        "IMG_0323.heic", "IMG_0324.heic", "IMG_0326.heic", "IMG_0327.heic",
        "IMG_0329.heic", "IMG_0331.heic", "IMG_0333.heic", "IMG_0336.heic",
        "IMG_0339.heic", "IMG_0342.heic", "IMG_0343.heic", "IMG_0344.heic",
        "IMG_0345.heic", "IMG_0346.heic"
    ],
    # Entry: 6d8af5a6 (Intake Narrative 12:50pm) - 1 file
    "6d8af5a6-9580-41e3-92ba-bd5d055ec2fd": [
        "IMG_0347.heic"
    ],
    # Entry: fef08f8c (Mecimore/Frazier 1:22pm) - 1 file
    "fef08f8c-eae2-4f0e-870c-ef645f988a67": [
        "IMG_0348.heic"
    ],
    # Entry: 39c413bb (No concerns 3:30pm) - 1 file
    "39c413bb-5410-4b9e-8302-ab990e3a459b": [
        "IMG_0349.heic"
    ],
    # Entry: f59c6a67 (HV arranged 4:00pm) - 1 file
    "f59c6a67-b419-4a7c-a421-2b7d9d7a6671": [
        "IMG_0350.heic"
    ],
    # Entry: f3fcbee5 (Color of Law 6:33pm) - 2 files
    "f3fcbee5-3552-48a7-8d3e-ef092c46dd38": [
        "IMG_0351.heic", "IMG_0352.heic"
    ],
    # Entry: 47678edb (Keith call 8:35pm) - 1 file
    "47678edb-d5b7-4f26-99bb-e0a9cee05a9a": [
        "IMG_0353.heic"
    ],
    # Entry: 401f3d75 (Amy Walker call 9:00pm) - 1 file
    "401f3d75-6e39-447d-98d4-5ea573995923": [
        "IMG_0354.heic"
    ],
    # Entry: eb3cde90 (Home visit 9:02pm) - 1 file
    "eb3cde90-c9f0-4ee3-902b-1db68070a02a": [
        "IMG_0355.heic"
    ],
    # Entry: e7793101 (Drive home 10:30pm) - 2 files
    "e7793101-8499-41fb-a162-0823e4acfb0d": [
        "IMG_0356.heic", "IMG_0358.heic"
    ],
}

def push_files():
    """Push all exhibit files to production"""
    print("Pushing 36 exhibit files to production...")
    print("=" * 50)
    
    success_count = 0
    fail_count = 0
    
    for entry_id, files in ENTRY_FILES.items():
        print(f"\nEntry: {entry_id[:8]}... ({len(files)} files)")
        
        for filename in files:
            file_path = FILES_DIR / filename
            
            if not file_path.exists():
                print(f"  ✗ {filename} - File not found")
                fail_count += 1
                continue
            
            try:
                # Open file and upload
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
                    print(f"  ✓ {filename}")
                    success_count += 1
                else:
                    print(f"  ✗ {filename} - Status: {response.status_code}")
                    fail_count += 1
                    
            except Exception as e:
                print(f"  ✗ {filename} - Error: {str(e)[:40]}")
                fail_count += 1
    
    print(f"\n{'=' * 50}")
    print(f"RESULTS: {success_count} succeeded, {fail_count} failed")
    print(f"{'=' * 50}")

if __name__ == "__main__":
    push_files()
