#!/usr/bin/env python3
"""
Transcription script for the Catawba interrogation audio.
Splits large audio into chunks, transcribes with OpenAI Whisper, 
and creates a Word document with speaker identification and timestamps.
"""

import os
import asyncio
import tempfile
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import re

load_dotenv("/app/backend/.env")

# Speaker identification mappings
SPEAKERS = {
    "marcella": "Marcella McCombs (Lead Interrogator)",
    "scronce": "Sergeant Scronce (Male Interrogator)", 
    "zachary": "Zachary Blankenship (Defendant)",
    "blankenship": "Zachary Blankenship (Defendant)",
}

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def split_audio_ffmpeg(input_path, output_dir, chunk_duration=600):
    """Split audio into chunks using ffmpeg (10 min chunks = ~20MB each for mp3)"""
    chunks = []
    
    # Get duration
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", 
         "-of", "default=noprint_wrappers=1:nokey=1", input_path],
        capture_output=True, text=True
    )
    total_duration = float(result.stdout.strip())
    print(f"Total audio duration: {format_timestamp(total_duration)} ({total_duration:.1f} seconds)")
    
    chunk_num = 0
    start = 0
    
    while start < total_duration:
        chunk_path = os.path.join(output_dir, f"chunk_{chunk_num:03d}.mp3")
        end = min(start + chunk_duration, total_duration)
        
        subprocess.run([
            "ffmpeg", "-y", "-i", input_path,
            "-ss", str(start), "-t", str(chunk_duration),
            "-acodec", "libmp3lame", "-b:a", "64k",  # Lower bitrate for smaller files
            chunk_path
        ], capture_output=True)
        
        chunks.append({
            "path": chunk_path,
            "start_time": start,
            "chunk_num": chunk_num
        })
        print(f"Created chunk {chunk_num}: {format_timestamp(start)} - {format_timestamp(end)}")
        
        start += chunk_duration
        chunk_num += 1
    
    return chunks, total_duration

async def transcribe_chunk(stt, chunk_info, prompt):
    """Transcribe a single audio chunk with timestamps"""
    from emergentintegrations.llm.openai import OpenAISpeechToText
    
    chunk_path = chunk_info["path"]
    start_offset = chunk_info["start_time"]
    
    try:
        with open(chunk_path, "rb") as audio_file:
            response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
                language="en",
                prompt=prompt,
                temperature=0.0,
                timestamp_granularities=["segment"]
            )
        
        # Adjust timestamps with offset
        segments = []
        if hasattr(response, 'segments') and response.segments:
            for seg in response.segments:
                segments.append({
                    "start": seg.start + start_offset,
                    "end": seg.end + start_offset,
                    "text": seg.text.strip()
                })
        else:
            # Fallback if no segments
            segments.append({
                "start": start_offset,
                "end": start_offset + 600,
                "text": response.text.strip() if response.text else ""
            })
        
        return segments
        
    except Exception as e:
        print(f"Error transcribing chunk {chunk_info['chunk_num']}: {e}")
        return []

def correct_names(text):
    """Correct common transcription errors in names"""
    corrections = {
        r'\bRaleigh\b': 'Rylie',
        r'\bRayleigh\b': 'Rylie', 
        r'\bRylee\b': 'Rylie',
        r'\bRiley\b': 'Rylie',
        r'\bMarcello\b': 'Marcella',
        r'\bMarsella\b': 'Marcella',
        r'\bScronse\b': 'Scronce',
        r'\bSkronce\b': 'Scronce',
        r'\bBlankship\b': 'Blankenship',
    }
    
    result = text
    for pattern, replacement in corrections.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def create_word_document(transcription_segments, output_path, total_duration):
    """Create a formatted Word document from transcription segments"""
    doc = Document()
    
    # Title
    title = doc.add_heading('Interrogation Transcript', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Metadata
    doc.add_paragraph()
    meta = doc.add_paragraph()
    meta.add_run("Case: ").bold = True
    meta.add_run("Zachary Blankenship Interrogation\n")
    meta.add_run("Location: ").bold = True
    meta.add_run("Catawba County\n")
    meta.add_run("Total Duration: ").bold = True
    meta.add_run(f"{format_timestamp(total_duration)}\n")
    meta.add_run("\nParticipants:\n").bold = True
    meta.add_run("• Marcella McCombs - Lead Interrogator\n")
    meta.add_run("• Sergeant Scronce - Male Interrogator\n")
    meta.add_run("• Zachary Blankenship - Defendant\n")
    
    doc.add_paragraph()
    doc.add_paragraph("─" * 50)
    doc.add_paragraph()
    
    # Transcription content
    for segment in transcription_segments:
        timestamp = format_timestamp(segment["start"])
        text = correct_names(segment["text"])
        
        if not text.strip():
            continue
        
        # Check for silence (very short or empty text)
        if len(text.strip()) < 3:
            p = doc.add_paragraph()
            run = p.add_run(f"[{timestamp}] ")
            run.bold = True
            run.font.size = Pt(10)
            p.add_run("[Silence or inaudible]")
            continue
        
        p = doc.add_paragraph()
        run = p.add_run(f"[{timestamp}] ")
        run.bold = True
        run.font.size = Pt(10)
        
        # Add the text
        text_run = p.add_run(text)
        text_run.font.size = Pt(11)
    
    doc.save(output_path)
    print(f"Document saved to: {output_path}")

async def main():
    from emergentintegrations.llm.openai import OpenAISpeechToText
    
    # Configuration
    audio_url = "https://customer-assets.emergentagent.com/job_legal-timeline-3/artifacts/wy0hqlmz_Audio%20Catawba.mp3"
    output_docx = "/app/backend/transcription/Catawba_Interrogation_Transcript.docx"
    
    # Create temp directory for chunks
    temp_dir = tempfile.mkdtemp(prefix="audio_chunks_")
    audio_path = os.path.join(temp_dir, "audio_catawba.mp3")
    
    try:
        # Download audio
        print("Downloading audio file...")
        subprocess.run([
            "curl", "-L", "-o", audio_path, audio_url
        ], check=True, capture_output=True)
        print(f"Downloaded to: {audio_path}")
        
        # Split into chunks
        print("\nSplitting audio into chunks...")
        chunks, total_duration = split_audio_ffmpeg(audio_path, temp_dir, chunk_duration=600)
        print(f"Created {len(chunks)} chunks")
        
        # Initialize transcription client
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        stt = OpenAISpeechToText(api_key=api_key)
        
        # Prompt to guide transcription
        prompt = """This is a police interrogation. The speakers are:
- Marcella McCombs (female, lead interrogator)
- Sergeant Scronce (male interrogator)
- Zachary Blankenship (male defendant)
- Rylie (spelled R-Y-L-I-E, a person mentioned in the case)
Transcribe verbatim with exact wording."""
        
        # Transcribe each chunk
        print("\nTranscribing chunks...")
        all_segments = []
        
        for i, chunk in enumerate(chunks):
            print(f"Transcribing chunk {i+1}/{len(chunks)}...")
            segments = await transcribe_chunk(stt, chunk, prompt)
            all_segments.extend(segments)
            
            # Clean up chunk after processing
            try:
                os.remove(chunk["path"])
            except:
                pass
        
        print(f"\nTotal segments transcribed: {len(all_segments)}")
        
        # Create Word document
        print("\nCreating Word document...")
        create_word_document(all_segments, output_docx, total_duration)
        
        print(f"\n✓ Transcription complete!")
        print(f"  Output: {output_docx}")
        
    finally:
        # Clean up temp files
        import shutil
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())
