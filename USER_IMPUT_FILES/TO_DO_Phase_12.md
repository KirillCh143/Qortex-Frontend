1. UI/UX Improvements
   Typing Indicator: Implement a "typing" animation/indicator for the bot's response to improve user experience while waiting for a message.
   Download Loading Bug: Fix a bug in the Knowledge Base list view. Currently, clicking the download button on a single file triggers the loading spinner for all files in the list. Scope the loading state to the specific file being downloaded.

2. Refactoring & Component Architecture
   Extract Detail Panel: Refactor the /_ Detail Panel _/ section from the Knowledge Base page into a standalone .tsx component (e.g., FileDetailPanel.tsx).

3. Feature Enhancements (File Detail Panel)
   Edit Functionality: Add the ability to edit the File Name and Description directly within the newly created Detail Panel.
   File Organization: Implement a "Move to Folder" feature to allow users to relocate files within the Knowledge Base.

4. Webhook & Integration Updates
   Webhook Payload: Update the chat webhook body to include a new key: "sessionidkey".
   Value Format: The value must be formatted as FirstName_LastName.
   Data Source: Fetch this user data from Directus.

5. Streaming Responses (ChatGPT Style)
   Implementation: Enable response streaming in the chat interface to display the bot's answer word-by-word (Server-Sent Events/Chunked transfer).
   Backend (n8n): The backend logic is handled by an n8n workflow.
   Note: The current workflow JSON is attached @USER_IMPUT_FILES/RAG_Workflow_AIAgent.json
   Requirement: Modify the n8n workflow nodes and the frontend fetch logic to support streaming. Update the provided JSON file if necessary to accommodate these changes.
