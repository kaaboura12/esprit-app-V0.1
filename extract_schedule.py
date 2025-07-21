import pdfplumber
import os
import json
import argparse
import sys
import re

def normalize_time(time_str):
    # Replace H or h (with or without colon) with : and remove spaces
    # Examples: 13H:30, 13H30, 13h:30, 13h30 -> 13:30
    if not time_str:
        return time_str
    # Remove spaces around H/h and replace with :
    time_str = re.sub(r"\s*[Hh]\s*:?", ":", time_str)
    # If still something like 13:30, leave as is
    return time_str.strip()

def extract_schedule_from_pdf(pdf_path):
    schedule = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    # Skip empty or malformed tables
                    if not table or len(table[0]) < 2:
                        continue
                    for row in table:
                        # Expecting: [day+date, morning, afternoon]
                        if len(row) >= 3 and row[0]:
                            day_date = row[0].strip().split("\n")
                            day = day_date[0] if len(day_date) > 0 else ""
                            date = day_date[1] if len(day_date) > 1 else ""
                            events = []
                            for cell in row[1:]:
                                if cell and any(char.isdigit() for char in cell):
                                    # Try to extract time, subject, class, room
                                    lines = [l.strip() for l in cell.split("\n") if l.strip()]
                                    time = subject = class_name = room = ""
                                    if lines:
                                        time = normalize_time(lines[0])
                                        if len(lines) > 1:
                                            subject = lines[1]
                                        if len(lines) > 2:
                                            class_name = lines[2]
                                        if len(lines) > 3:
                                            room = " ".join(lines[3:])
                                    events.append({
                                        "time": time,
                                        "subject": subject,
                                        "class": class_name,
                                        "room": room
                                    })
                            schedule.append({
                                "day": day,
                                "date": date,
                                "events": events
                            })
    except Exception as e:
        print(f"Error processing PDF: {str(e)}", file=sys.stderr)
        return None
    
    return schedule

def main():
    if len(sys.argv) != 2:
        print("Usage: python extract_schedule.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} does not exist", file=sys.stderr)
        sys.exit(1)
    
    schedule = extract_schedule_from_pdf(pdf_path)
    
    if schedule is None:
        print("Error: Failed to extract schedule from PDF", file=sys.stderr)
        sys.exit(1)
    
    # Output as JSON
    json_output = json.dumps(schedule, indent=2, ensure_ascii=False)
    print(json_output)

if __name__ == "__main__":
    main() 