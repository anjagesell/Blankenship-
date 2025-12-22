#!/usr/bin/env python3
"""
Clean up old HEIC files from production - keep only JPG versions
for universal device compatibility
"""

import requests

PRODUCTION_URL = "https://blanksolution.emergent.host/api"
ADMIN_PASSWORD = "02071951"

def cleanup_heic_files():
    """Remove all HEIC files from production, keeping only JPG versions"""
    print("=" * 60)
    print("CLEANING UP HEIC FILES - KEEPING ONLY JPG FOR COMPATIBILITY")
    print("=" * 60)
    
    # Get all November 2013 entries
    response = requests.get(f"{PRODUCTION_URL}/monthly/11-2013")
    entries = response.json()
    
    total_deleted = 0
    total_kept = 0
    
    for entry in entries:
        entry_id = entry.get('id', '')
        time = entry.get('time', 'N/A')
        
        # Get files for this entry
        files_response = requests.get(f"{PRODUCTION_URL}/files/{entry_id}")
        files = files_response.json()
        
        heic_files = [f for f in files if f['filename'].lower().endswith('.heic')]
        jpg_files = [f for f in files if f['filename'].lower().endswith('.jpg')]
        
        if heic_files:
            print(f"\n{time}: {len(heic_files)} HEIC, {len(jpg_files)} JPG")
            
            for heic_file in heic_files:
                # Check if we have a JPG version
                jpg_name = heic_file['filename'].rsplit('.', 1)[0] + '.jpg'
                has_jpg = any(f['filename'] == jpg_name for f in jpg_files)
                
                if has_jpg:
                    # Delete the HEIC file
                    delete_response = requests.delete(
                        f"{PRODUCTION_URL}/file/{heic_file['file_id']}",
                        params={"admin_password": ADMIN_PASSWORD}
                    )
                    
                    if delete_response.status_code == 200:
                        print(f"   ✓ Deleted {heic_file['filename']} (JPG exists)")
                        total_deleted += 1
                    else:
                        print(f"   ✗ Failed to delete {heic_file['filename']}")
                else:
                    print(f"   ⚠ Kept {heic_file['filename']} (no JPG replacement)")
                    total_kept += 1
    
    print(f"\n{'=' * 60}")
    print(f"CLEANUP COMPLETE")
    print(f"   Deleted: {total_deleted} HEIC files")
    print(f"   Kept: {total_kept} HEIC files (no JPG replacement)")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    cleanup_heic_files()
