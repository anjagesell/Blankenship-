#!/usr/bin/env python3
"""
Backend API Testing for 2014 Documents Reorganization
Tests the reorganization of 91 documents into 15 separate entries by date
"""

import requests
import json
from datetime import datetime
import sys

# Get backend URL from frontend .env
BACKEND_URL = "https://legal-evidence-db.preview.emergentagent.com/api"

def test_api_health():
    """Test basic API connectivity"""
    print("🔍 Testing API Health...")
    try:
        response = requests.get(f"{BACKEND_URL.replace('/api', '')}/health", timeout=10)
        if response.status_code == 200:
            print("✅ API Health Check: PASSED")
            return True
        else:
            print(f"❌ API Health Check: FAILED - Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health Check: FAILED - {e}")
        return False

def test_monthly_endpoint(month_key, expected_count, month_name):
    """Test a specific monthly endpoint"""
    print(f"\n🔍 Testing {month_name} ({month_key})...")
    try:
        response = requests.get(f"{BACKEND_URL}/monthly/{month_key}", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ {month_name}: FAILED - Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False, 0, []
        
        data = response.json()
        actual_count = len(data)
        
        if actual_count == expected_count:
            print(f"✅ {month_name}: PASSED - {actual_count} entries (expected {expected_count})")
        else:
            print(f"❌ {month_name}: FAILED - {actual_count} entries (expected {expected_count})")
            return False, actual_count, data
        
        # Validate entry structure
        for i, entry in enumerate(data):
            required_fields = ['id', 'date', 'time', 'witness', 'description', 'evidence', 'notes']
            missing_fields = [field for field in required_fields if field not in entry]
            if missing_fields:
                print(f"❌ {month_name} Entry {i+1}: Missing fields {missing_fields}")
                return False, actual_count, data
        
        # Show entry details for verification
        print(f"   📋 Entry Details:")
        for i, entry in enumerate(data):
            date = entry.get('date', 'No date')
            time = entry.get('time', 'No time')
            witness = entry.get('witness', 'No witness')
            description = entry.get('description', 'No description')[:50]
            print(f"      {i+1}. {date} at {time} - {witness} - {description}...")
        
        return True, actual_count, data
        
    except Exception as e:
        print(f"❌ {month_name}: FAILED - {e}")
        return False, 0, []

def test_file_endpoints(entries):
    """Test file-related endpoints for given entries"""
    print(f"\n🔍 Testing File Endpoints...")
    total_files = 0
    file_test_results = []
    
    for entry in entries:
        entry_id = entry.get('id')
        if not entry_id:
            continue
            
        try:
            # Test GET /api/files/{entry_id}
            response = requests.get(f"{BACKEND_URL}/files/{entry_id}", timeout=10)
            
            if response.status_code == 200:
                files = response.json()
                file_count = len(files)
                total_files += file_count
                
                print(f"   📁 Entry {entry.get('date', 'Unknown')} - {file_count} files")
                
                # Test a few file downloads
                for file_info in files[:2]:  # Test first 2 files per entry
                    file_id = file_info.get('file_id')
                    filename = file_info.get('filename', 'unknown')
                    
                    if file_id:
                        file_response = requests.get(f"{BACKEND_URL}/file/{file_id}", timeout=10)
                        if file_response.status_code == 200:
                            file_test_results.append(f"✅ File {filename}: Accessible")
                        else:
                            file_test_results.append(f"❌ File {filename}: Status {file_response.status_code}")
                    
            elif response.status_code == 404:
                print(f"   📁 Entry {entry.get('date', 'Unknown')} - No files (404)")
            else:
                print(f"   ❌ Entry {entry.get('date', 'Unknown')} - Files endpoint failed: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Entry {entry.get('date', 'Unknown')} - File test error: {e}")
    
    print(f"\n📊 File Test Summary:")
    print(f"   Total files found: {total_files}")
    for result in file_test_results[:10]:  # Show first 10 file test results
        print(f"   {result}")
    if len(file_test_results) > 10:
        print(f"   ... and {len(file_test_results) - 10} more file tests")
    
    return total_files

def test_specific_january_entries():
    """Test specific January 2014 entries as mentioned in requirements"""
    print(f"\n🔍 Testing Specific January 2014 Requirements...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/monthly/01-2014", timeout=10)
        if response.status_code != 200:
            print(f"❌ January 2014: Cannot fetch data - Status {response.status_code}")
            return False
        
        entries = response.json()
        
        # Look for specific entries mentioned in requirements
        expected_entries = [
            {"date": "01/13/2014", "time": "9:00 AM", "description_contains": "Plea Offer"},
            {"date": "01/23/2014", "time": "10:00 AM", "description_contains": "In Home Family Services"}
        ]
        
        found_entries = []
        for expected in expected_entries:
            found = False
            for entry in entries:
                if (expected["date"] in entry.get('date', '') and 
                    expected["description_contains"].lower() in entry.get('description', '').lower()):
                    found_entries.append(entry)
                    found = True
                    print(f"✅ Found: {expected['date']} - {expected['description_contains']}")
                    break
            
            if not found:
                print(f"❌ Missing: {expected['date']} - {expected['description_contains']}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ January 2014 specific test failed: {e}")
        return False

def test_specific_february_entries():
    """Test specific February 2014 entries as mentioned in requirements"""
    print(f"\n🔍 Testing Specific February 2014 Requirements...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/monthly/02-2014", timeout=10)
        if response.status_code != 200:
            print(f"❌ February 2014: Cannot fetch data - Status {response.status_code}")
            return False
        
        entries = response.json()
        
        # Look for specific entries mentioned in requirements
        expected_entries = [
            {"date": "02/03/2014", "description_contains": "Bill of Indictment"},
            {"date": "02/04/2014", "description_contains": "Communication Log"},
            {"date": "02/06/2014", "description_contains": "Notice of Return"},
            {"date": "02/11/2014", "description_contains": "Conditions of Release"}
        ]
        
        found_count = 0
        for expected in expected_entries:
            found = False
            for entry in entries:
                if (expected["date"] in entry.get('date', '') and 
                    expected["description_contains"].lower() in entry.get('description', '').lower()):
                    found_count += 1
                    found = True
                    print(f"✅ Found: {expected['date']} - {expected['description_contains']}")
                    break
            
            if not found:
                print(f"❌ Missing: {expected['date']} - {expected['description_contains']}")
        
        return found_count == len(expected_entries)
        
    except Exception as e:
        print(f"❌ February 2014 specific test failed: {e}")
        return False

def main():
    """Main test execution"""
    print("=" * 60)
    print("🧪 BACKEND API TESTING - 2014 Documents Reorganization")
    print("=" * 60)
    
    # Test API health first
    if not test_api_health():
        print("\n❌ CRITICAL: API is not accessible. Cannot proceed with tests.")
        sys.exit(1)
    
    # Test monthly endpoints
    monthly_tests = [
        ("01-2014", 2, "January 2014"),
        ("02-2014", 4, "February 2014"),
        ("03-2014", 2, "March 2014"),
        ("04-2014", 3, "April 2014"),
        ("07-2014", 2, "July 2014"),
        ("10-2014", 1, "October 2014"),
        ("12-2014", 1, "December 2014")
    ]
    
    total_entries = 0
    all_entries = []
    passed_tests = 0
    
    for month_key, expected_count, month_name in monthly_tests:
        success, actual_count, entries = test_monthly_endpoint(month_key, expected_count, month_name)
        total_entries += actual_count
        all_entries.extend(entries)
        if success:
            passed_tests += 1
    
    # Test specific entry requirements
    january_specific = test_specific_january_entries()
    february_specific = test_specific_february_entries()
    
    # Test file endpoints
    total_files = test_file_endpoints(all_entries)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Monthly Endpoint Tests: {passed_tests}/{len(monthly_tests)} passed")
    print(f"Total Entries Found: {total_entries} (expected 15)")
    print(f"Total Files Found: {total_files} (expected ~91)")
    print(f"January Specific Tests: {'✅ PASSED' if january_specific else '❌ FAILED'}")
    print(f"February Specific Tests: {'✅ PASSED' if february_specific else '❌ FAILED'}")
    
    # Overall result
    overall_success = (
        passed_tests == len(monthly_tests) and
        total_entries == 15 and
        january_specific and
        february_specific and
        total_files > 80  # Allow some tolerance for file count
    )
    
    if overall_success:
        print(f"\n🎉 OVERALL RESULT: ✅ ALL TESTS PASSED")
        print(f"   2014 documents reorganization is working correctly!")
    else:
        print(f"\n💥 OVERALL RESULT: ❌ SOME TESTS FAILED")
        print(f"   Issues found in 2014 documents reorganization.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)