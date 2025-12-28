#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Reorganize 91 documents from 2014.zip - each date should have its own line with time and adjoining exhibits that correlate"

backend:
  - task: "2014 Documents Reorganization - 1 entry per date"
    implemented: true
    working: true
    file: "backend/seed_data.json, backend/seed_files.json"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Reorganized 91 documents into 15 unique date entries. Each entry has date, time, witness, description, evidence, notes. Files correctly linked to entries via entry_id."
      - working: true
        agent: "testing"
        comment: "✅ COMPREHENSIVE TESTING PASSED: All 15 entries correctly organized across 7 months (Jan:2, Feb:4, Mar:2, Apr:3, Jul:2, Oct:1, Dec:1). Total 91 files properly linked. Specific requirements verified: January entries (01/13 Plea Offer, 01/23 In Home Services), February entries (02/03 Bill of Indictment, 02/04 Communication Log, 02/06 Notice of Return, 02/11 Conditions of Release). All entries have proper structure with date, time, witness, description, evidence, notes fields."
  
  - task: "API endpoints for 2014 months"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "API endpoints /api/monthly/01-2014, /api/monthly/02-2014, etc. return correct entries. Verified via curl."
      - working: true
        agent: "testing"
        comment: "✅ ALL MONTHLY ENDPOINTS TESTED: GET /api/monthly/01-2014 (2 entries), /api/monthly/02-2014 (4 entries), /api/monthly/03-2014 (2 entries), /api/monthly/04-2014 (3 entries), /api/monthly/07-2014 (2 entries), /api/monthly/10-2014 (1 entry), /api/monthly/12-2014 (1 entry). All return correct entry counts and proper JSON structure. Entries sorted chronologically by date/time."

frontend:
  - task: "Display 2014 entries in MonthlyDetail view"
    implemented: true
    working: true
    file: "frontend/src/components/MonthlyDetail.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Screenshot verified - January 2014 shows 2 entries (01/13 and 01/23) with times, witnesses, descriptions and exhibit buttons"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: true

test_plan:
  current_focus:
    - "Display 2014 entries in MonthlyDetail view"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Completed reorganization of 91 documents from 2014.zip into 15 unique date entries. Each entry now has: date, time, witness, description, evidence, notes. Files are correctly linked. Screenshots verified January 2014 shows multiple entries with times. Please test: 1) API returns correct number of entries for each 2014 month, 2) Frontend displays all entries with correct data, 3) Exhibit files are accessible. Visitor password: 05052017"
  - agent: "testing"
    message: "✅ BACKEND TESTING COMPLETE: All 2014 documents reorganization tests PASSED. Verified 15 entries across 7 months (total 91 files). All monthly API endpoints working correctly. File download endpoints functional. Specific January/February requirements met. Backend reorganization is working perfectly. Only frontend testing remains (not in my scope)."