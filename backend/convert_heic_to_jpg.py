import asyncio
import io
from motor.motor_asyncio import AsyncIOMotorClient
from PIL import Image
import pillow_heif
import os

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'blankenship_db')

async def convert_all_heic_files():
    """Convert all HEIC files in the database to JPG"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Find all HEIC files
    heic_files = await db.uploaded_files.find({
        "$or": [
            {"filename": {"$regex": r"\.heic$", "$options": "i"}},
            {"filename": {"$regex": r"\.heif$", "$options": "i"}},
            {"file_type": "heic"},
            {"file_type": "heif"},
        ]
    }).to_list(1000)
    
    print(f"Found {len(heic_files)} HEIC/HEIF files to convert")
    
    converted = 0
    failed = 0
    
    for file_record in heic_files:
        try:
            file_id = file_record.get('file_id')
            filename = file_record.get('filename', 'unknown')
            print(f"\nConverting: {filename} (ID: {file_id})")
            
            # Get the binary data
            file_data = file_record.get('data')
            if not file_data:
                print(f"  ⚠️ No data found, skipping")
                failed += 1
                continue
            
            # Convert HEIC to JPG
            heif_file = pillow_heif.read_heif(file_data)
            image = Image.frombytes(
                heif_file.mode,
                heif_file.size,
                heif_file.data,
                "raw",
            )
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'P'):
                image = image.convert('RGB')
            
            # Save as JPG
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=90)
            jpg_data = output.getvalue()
            
            # Update filename
            new_filename = filename.rsplit('.', 1)[0] + '.jpg'
            
            # Update database record
            await db.uploaded_files.update_one(
                {"file_id": file_id},
                {"$set": {
                    "data": jpg_data,
                    "filename": new_filename,
                    "file_type": "jpg",
                    "content_type": "image/jpeg"
                }}
            )
            
            print(f"  ✅ Converted to: {new_filename}")
            converted += 1
            
        except Exception as e:
            print(f"  ❌ Failed: {str(e)}")
            failed += 1
    
    print(f"\n{'='*50}")
    print(f"CONVERSION COMPLETE")
    print(f"  ✅ Converted: {converted}")
    print(f"  ❌ Failed: {failed}")
    print(f"{'='*50}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(convert_all_heic_files())
