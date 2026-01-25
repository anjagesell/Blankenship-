#!/usr/bin/env python3
"""
Create cleaned Word document from JSON transcription data
"""

import json
import re
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def format_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def correct_names(text):
    """Correct transcription errors"""
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

def is_noise(text):
    """Check if text is noise/hallucination"""
    text = text.strip().lower()
    noise_patterns = [
        'mr. blankenship, please',
        'r-y-l-i-e',
        'transcribe verbatim',
        'police interrogation',
        'sergeant scronce (male interrogator)',
        'marcella mccombs (female lead interrogator)',
        'zachary blankenship (defendant)',
    ]
    
    for pattern in noise_patterns:
        if text == pattern or text == pattern + '.':
            return True
    
    # Check for very repetitive short text
    if len(text) < 5:
        return True
        
    return False

def detect_silence(segments, start_idx, window=5, threshold=3):
    """Detect if a section has repeating noise (likely silence)"""
    if start_idx + window > len(segments):
        return False
    
    texts = [segments[start_idx + i]['text'].strip() for i in range(window)]
    unique = set(texts)
    
    if len(unique) <= threshold:
        return True
    return False

def main():
    with open('/app/backend/transcription/transcript_segments.json') as f:
        segments = json.load(f)
    
    print(f"Original segments: {len(segments)}")
    
    # Clean segments
    clean_segments = []
    skip_until = 0
    
    for i, seg in enumerate(segments):
        if i < skip_until:
            continue
            
        text = seg['text'].strip()
        
        # Skip noise
        if is_noise(text):
            continue
        
        # Skip silence sections (detected by repetition)
        if detect_silence(segments, i):
            # Check if this is a long silence section
            j = i
            while j < len(segments) and detect_silence(segments, j):
                j += 1
            
            if j - i > 10:  # Long silence
                silence_start = format_timestamp(seg['start'])
                silence_end = format_timestamp(segments[min(j-1, len(segments)-1)]['start'])
                clean_segments.append({
                    'start': seg['start'],
                    'end': segments[min(j-1, len(segments)-1)]['start'],
                    'text': f"[Silence/Inaudible section - {silence_start} to {silence_end}]",
                    'is_silence': True
                })
                skip_until = j
                continue
        
        clean_segments.append(seg)
    
    print(f"After cleaning: {len(clean_segments)}")
    
    # Create Word document
    doc = Document()
    
    # Title
    title = doc.add_heading('Catawba County Interrogation Transcript', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Metadata
    doc.add_paragraph()
    meta = doc.add_paragraph()
    meta.add_run("Case: ").bold = True
    meta.add_run("State v. Zachary Blankenship\n")
    meta.add_run("Date: ").bold = True
    meta.add_run("December 13, 2013\n")
    meta.add_run("Location: ").bold = True
    meta.add_run("Catawba County\n")
    meta.add_run("Total Duration: ").bold = True
    meta.add_run("02:45:27\n")
    meta.add_run("\nParticipants:\n").bold = True
    meta.add_run("• Marcella McCombs - Lead Interrogator (Female)\n")
    meta.add_run("• Sergeant Scronce - Interrogator (Male)\n")
    meta.add_run("• Zachary Blankenship - Defendant\n")
    meta.add_run("• Rylie - Victim (referenced)\n")
    
    doc.add_paragraph()
    doc.add_paragraph("─" * 60)
    doc.add_paragraph()
    doc.add_heading("TRANSCRIPT", level=1)
    doc.add_paragraph()
    
    # Add transcript content
    last_time = -1
    for seg in clean_segments:
        timestamp = format_timestamp(seg['start'])
        text = correct_names(seg['text'])
        
        if not text.strip():
            continue
        
        # Avoid duplicate timestamps within 1 second
        if abs(seg['start'] - last_time) < 1:
            continue
        last_time = seg['start']
        
        p = doc.add_paragraph()
        
        # Timestamp
        ts_run = p.add_run(f"[{timestamp}] ")
        ts_run.bold = True
        ts_run.font.size = Pt(10)
        
        # Text
        text_run = p.add_run(text)
        text_run.font.size = Pt(11)
    
    # Save
    output_path = '/app/backend/transcription/Catawba_Interrogation_Transcript_FINAL.docx'
    doc.save(output_path)
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    main()
