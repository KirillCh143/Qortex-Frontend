# SPECIFICATION.md — Technical Specification for RAG Agent Frontend (v2)

## 1. Project Overview
Development of a Frontend interface (SPA) for a local AI RAG system.
The system runs in Docker (Localhost). The system enables employees to search internal documentation through a chatbot and view or download the actual documents.
**Development Approach:** MOCK-FIRST. We will first implement the UI using mock data (stubs) to approve the visual design, and then connect the real APIs.

**Key Roles:**
1.  **Directus:** Backend (Auth, User Management, File Storage).
2.  **n8n:** AI Orchestrator (Webhook processing).
3.  **Frontend:** React UI (This project).

---

## 2. Tech Stack

*   **Runtime:** Node.js
*   **Build Tool:** Vite
*   **Framework:** React (TypeScript)
*   **Styling:** Tailwind CSS
*   **UI Library:** Shadcn/UI + Lucide Icons.
*   **State Management:** React Context + LocalStorage.
*   **Data Fetching:**
    *   `axios` (for n8n communication).
    *   `@directus/sdk` (for database, files and Auth).
    *   **Mock Service:** An abstraction layer to switch between "Real API" and "Mock Data".

---

## 3. Color Palette
`tailwind.config.js`:
*   `primary`: `#003057` (Deep Blue)
*   `secondary`: `#0077C8` (Bright Blue)
*   `accent`: `#00A9E0` (Cyan)
*   `background`: `#EFF1F2` (Light Gray)
*   `surface`: `#FFFFFF` (White)

---

## 4. Architecture & Configuration

### 4.1. Config & Environment
*   The app must support `localhost` environments effectively.
*   **LocalStorage Keys:**
    *   `API_MODE`: 'mock' | 'real' (default: 'mock' for the initial run).
    *   `DIRECTUS_URL`: (default: `http://localhost:8055`)
    *   `N8N_WEBHOOK_URL`: (default: `http://localhost:5678/webhook/...`)

### 4.2. Routing & Auth
*   **Custom Login Page:** Do not use the default Directus interface. Implement a custom form (Email/Pass) using Shadcn Card that calls `directus.auth.login()` internally.
*   **ProtectedRoute:** Checks for a valid token (in Real mode) or an `isAuthenticated` flag (in Mock mode).

---

## 5. Functional Modules

### 5.1. Layout
*   **Sidebar:** Navigation links, Company Logo, Logout button.
*   **Header:** Current page title, User Avatar (Mock placeholder or Directus User Image).

### 5.2. Chat Bot (`/chat`)
*   **UI Elements:**
    *   **Mode Toggle (Switch):**
        *   `RAG Search` (Default)
        *   `LLM Chat` (Pure conversation)
    *   **Chat Window:** List of messages (User/AI bubbles).
    *   **Input Area:** Text field + Send button.
*   **Logic:**
    *   **Payload Construction** (sent to n8n):
        ```json
        {
          "question": "User text",
          "mode": "rag" | "llm", // Based on the toggle
          "sessionId": "UUID",
          "history": [...]
        }
        ```
    *   **History Persistence:**
        *   Check `CHAT_PERSISTENCE` setting.
        *   If `true`: Save messages to `localStorage`. Chat history remains after refresh.
        *   If `false`: Clear chat on page refresh (F5), similar to RAM-only session.

### 5.3. Knowledge Base (`/knowledge-base`)
*   Display: Table or List of documents.
*   Columns: Filename, Size, Type, Date.
*   Actions: Download, View/Open.
*   *Mock Mode:* Return an array of 5-10 JSON test documents.
*   *Real Mode:* Query `directus_files` collection.

### 5.4. Settings (`/settings`)
*   **Connection Section (Admin only):**
    *   Input: Directus URL.
    *   Input: n8n Webhook URL.
    *   Toggle: `Use Mock Data` (Debug mode).
*   **Chat Section:**
    *   Toggle: `Session Persistence` (Save history).
        *   ON: History persists in browser `localStorage`.
        *   OFF: History is cleared when the tab is closed or refreshed.
