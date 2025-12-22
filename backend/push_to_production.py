#!/usr/bin/env python3
"""
Push November 2013 entries to production database via API
"""

import requests
import json

PRODUCTION_URL = "https://blanksolution.emergent.host/api"

# November 2013 entries
NOV_2013_ENTRIES = [
    {
        "id": "9bb823da-525d-474e-8500-70be3856b9c4",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "8:30 am",
        "witness": "Tammy Blankenship / Big Lots Mooresville",
        "description": "Tammy's employment",
        "evidence": "Timecard of Big Lots Mooresville",
        "notes": "Tammy overslept, ran late that morning for work but was supposed to as always bring Rylie to Gabriele Blankenship home to Babysit for the day. However Tammy natural reaction decided that morning not to because Zachary was home anyway, he and Rylie still asleep. She late already. She under Stress forgotten to call Gabriele to let her know she not bringing her."
    },
    {
        "id": "d1bfd6b1-0e2a-49c0-b3f5-1cbfecdf4033",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "11:30 am",
        "witness": "Amy Walker /Lake Norman ER",
        "description": "Physician Chart/Medical Evaluation",
        "evidence": "Report PAB120",
        "notes": "Hymen intact. No distress. GU: Exam  unremarkable"
    },
    {
        "id": "1f8e1c92-6119-46ea-9344-586fc45bb4b1",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "11:52",
        "witness": "Officer Coffey Sheriff's Dept.",
        "description": "Incident Report incl. Narrative",
        "evidence": "Ori # NC0180000",
        "notes": "Reports Nurse said 'Rylie seems fine, sees no signs of Sexual Assault. After speaking w/ Rylie alone, no signs of abuse\". Keith B. claims' nothing unusual for Rylie to be naked from waist down. Rylie allegedly said \"dad put his thing on her butt\". Keith B. claims he not spoken to neither Tammy B. nor Zack since leaving the house. Keith assures he will contact the mother Tammy B. (inconsistencies: Keith has their Tele# and also saw both parents after he and his wife left residence)"
    },
    {
        "id": "8d4eac6d-7f46-498c-a962-4594e640c9f9",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "12:15 pm",
        "witness": "Sheri Stock / Officer Coffey",
        "description": "CPS Sherri Stock calls to DS Coffey on phone.",
        "evidence": "Narrative Notes of CPS.",
        "notes": "Sherri Stock claims to DS Coffey 'child has a burn (severity unknown) and claims she allegedly disclosed sexual abuse'."
    },
    {
        "id": "e61eb370-afd8-4150-9d15-6ec3c1495bba",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "12:30 pm",
        "witness": "Sheri Stock / Amber Mecimore",
        "description": "CPS SW speaks to CPS Amber Mecimore on Telephone. SW Stock claims to follow up with DS Coffey later due to Home visit in unrelated case.",
        "evidence": "Narrative Notes of CPS",
        "notes": "Proof of who spoke with whom verbalizing information."
    },
    {
        "id": "f4639498-580c-42a9-a3e6-f8a459e4c2be",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "12:50 pm",
        "witness": "CPS Amber Mecimore / Jennifer Owens / Gabriele Blankenship",
        "description": "CPS intake report claims Sexual Maltreatment and neglect.",
        "evidence": "CPS Intake Report",
        "notes": "Defence only recieved partial documents. However on page 1 of... The Perpetrator is noted as Tammy B. not Zachary B. Yet this document shown as proof of crime. Again Rylie allegedly said yet another version of the statement: \"Daddy put his Weiner on my cushy\". CPS Jennifer Owens finds out Z. Blankenship is Handicapped with ADHD and blind in 1 eye and has learning disabilities. Question asked of CPS if child was in danger? Answers 'no'."
    },
    {
        "id": "6d8af5a6-9580-41e3-92ba-bd5d055ec2fd",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "12:50 pm",
        "witness": "Amber Mecimore",
        "description": "Intake Report Narrative synopsis",
        "evidence": "CPS Narrative Log",
        "notes": "SW Mecimore spoke with S.A.N.E. Nurse Amy Walker. SW Mecimore repeats what she was told the reason was Gabriele and Keith Blankenship took Rylie to ER. Grandparents admit Rylie being without Diaper on is normal due to potty training. Allegedly the child said: \"Daddy put his weenie on my butt'. S.A.N.E. Nurse told her after completing exam see's no signs of abuse and when asked questions disclosed no abuse."
    },
    {
        "id": "fef08f8c-eae2-4f0e-870c-ef645f988a67",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "1:22 pm",
        "witness": "CPS Amber Mecimore / CPS Pam Frazier",
        "description": "CPS Amber Mecimore requests Iredell County assistant SW Pam Frazier.",
        "evidence": "Narrative Log",
        "notes": "No additions."
    },
    {
        "id": "39c413bb-5410-4b9e-8302-ab990e3a459b",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "3:30 pm",
        "witness": "CPS Amber Mecimore / CPS Pam Frazier",
        "description": "Telephone call.",
        "evidence": "Narrative Log",
        "notes": "CPS Pam Frazier states 'she has no concerns during Home visit, child made no disclosure to SW from Rylie. SW did find it noteworthy that the Grandparents made a point to disclose that the father stays on computer a lot and today and when they went to his home they were' yelled at to wait a minute' when they knocked."
    },
    {
        "id": "f59c6a67-b419-4a7c-a421-2b7d9d7a6671",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "4:00 pm",
        "witness": "CPS Sheri Stock / SW Mecimore",
        "description": "CPS Mecimore and CPC Pam Frazier arrange Home visit with Tammy Blankenship.",
        "evidence": "CPS Narrative log",
        "notes": "CPS Sherri Stock and CPC Mecimore arrange a HV for 6:30 with Tammy Blankenship noting 'the father will be at work'. CPS Sherri Stock agrees to initiate 'the investigation' with mother."
    },
    {
        "id": "f3fcbee5-3552-48a7-8d3e-ef092c46dd38",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "6:33 pm",
        "witness": "CPS Sherri Stock",
        "description": "Extensive Interrogation under Color of Law.",
        "evidence": "CPS Narrative Log",
        "notes": "SW Sherri Stock firstly interrogates Tammy B. and then leaves to later return with directives from her Supervisor SW Reitzel to attempt to Interview the 2 yr old child alone, document and have mother sign. SW Stock took child in her room alone, (no recordings no witness's for interpretation) Rylie asked if she scared of anyone, her answer 'no'. Minor uneventful answers. When asked if anyone hurts her she allegedly answers: \"My Daddy puts his weenie inside my coochie\". [Here's a turning Point in verbiage] Rylie up to now never used the word \"coochie\" to others, although that factually is the word used by her grandmother Gabriele Blankenship to express Vagina. It's stems from an old Alan Jackson Song she used to sing with her son's late 80's 'Way down yonder in Chatahoochi it gets hotter than a uuchie Cootchie\"."
    },
    {
        "id": "47678edb-d5b7-4f26-99bb-e0a9cee05a9a",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "8:35 pm",
        "witness": "CPS Amber Mecimore / Keith Blankenship",
        "description": "Telephone call",
        "evidence": "CPS Narrative Log",
        "notes": "CPS Mecimore speaks with Keith Blankenship. Keith tells CPS Mecimore he and Gabriele have no CPS history nor criminal history and offering permenant placement in their home. [whereby they do have criminal history in Europe having been investigated for Gabriel's drug addiction and for having abused their two sons before fleeing to USA in 1998] Keith denys Zachary any sexual abuse of nor by Zachary."
    },
    {
        "id": "401f3d75-6e39-447d-98d4-5ea573995923",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "9:00 pm",
        "witness": "CPS Amber Mecimore / S.A.N.E. Nurse Amy Walker",
        "description": "Telephone call",
        "evidence": "CPS Narrative Log",
        "notes": "SW Amber Mecimore sole inquiry was 'to build a case' asking if Nurse Amy Walker used 'a scope' during genital exam. Nurse Walker denied. Nurse reiterates Rylie made no disclosure of such of being hurt when she pointed to body parts including that part."
    },
    {
        "id": "eb3cde90-c9f0-4ee3-902b-1db68070a02a",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "9:02 pm",
        "witness": "CPS Sheri Stock / Zachary Blankenship / Tammy Blankenship / Rylie Blankenship / Vickie Toppings / CPS SW Reitzel / Pastor Osborne / CPS Lena Barber",
        "description": "Home visit / Employment visit Burger King",
        "evidence": "CPS Narrative Log",
        "notes": "Under Color of Law SW Sheri Stock arranged to pick Zachary up prematurely from work. She questioning him / interrogated Zachary so aiming he incriminate himself. He denied the allegations. He willing to work with Le and SW to find out truth. She drove him home from his employment."
    },
    {
        "id": "e7793101-8499-41fb-a162-0823e4acfb0d",
        "month_key": "11/2013",
        "date": "11/30/2013",
        "time": "10:30 pm",
        "witness": "CPS Sherri Stock / Zachary Blankenship / Tammy Blankenship",
        "description": "Notes of drive from Burger King to Home of the Blankenship's",
        "evidence": "CPS Narrative Log",
        "notes": "Tammy and the child instructed to leave their Home. No contact order for Zachary."
    }
]

def push_entries():
    """Push all entries to production"""
    print("Pushing November 2013 entries to production...")
    
    success_count = 0
    fail_count = 0
    
    for entry in NOV_2013_ENTRIES:
        try:
            # Use the monthly entry creation endpoint
            response = requests.post(
                f"{PRODUCTION_URL}/monthly/entry",
                json=entry,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                print(f"  ✓ {entry['time']} - {entry['witness'][:30]}...")
                success_count += 1
            else:
                print(f"  ✗ {entry['time']} - Status: {response.status_code} - {response.text[:100]}")
                fail_count += 1
                
        except Exception as e:
            print(f"  ✗ {entry['time']} - Error: {str(e)[:50]}")
            fail_count += 1
    
    print(f"\n{'='*50}")
    print(f"Results: {success_count} succeeded, {fail_count} failed")
    print(f"{'='*50}")

if __name__ == "__main__":
    push_entries()
