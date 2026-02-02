# Directus User Roles Setup for Frontend

This guide walks through adding a `frontend_role` field to Directus users and configuring access policies so the frontend can enforce role-based permissions.

## Overview

The application uses three frontend roles:

| Role | Description |
|---|---|
| `administrator` | Full access — chat, knowledge base (CRUD), settings/Portainer page |
| `moderator` | Chat + knowledge base (CRUD). No access to settings page |
| `user` | Chat + knowledge base (read-only / download only). No file management, no settings page |

These roles control **frontend UI visibility only**. Directus backend permissions are configured separately through access policies (see Section 3).

## 1. Add the `frontend_role` Field to Users

1. Open the Directus Admin panel (e.g. `http://localhost:8055`)
2. Go to **Settings > Data Model**
3. Find and click the **directus_users** system collection
4. Click **Create Field**
5. Choose **Dropdown** as the interface
6. Configure the field:
   - **Key:** `frontend_role`
   - **Type:** String
   - **Required:** Yes
   - **Default Value:** `user`
   - **Choices:**
     - `administrator` (label: Administrator)
     - `moderator` (label: Moderator)
     - `user` (label: User)
7. Save the field

## 2. Assign Roles to Users

1. Go to **User Directory** in the Directus Admin panel
2. Click on a user to edit
3. Scroll down to find the **Frontend Role** field
4. Select the appropriate role from the dropdown (`administrator`, `moderator`, or `user`)
5. Save the user

Repeat for each user. New users will default to `user` if no role is explicitly set.

## 3. Configure Access Policies

Access policies control what data each user can read/write through the Directus API. Go to **Settings > Access Policies** to configure the following.

> **Important:** The frontend fetches the current user's profile (including `frontend_role`) via the `GET /users/me` endpoint. All authenticated users must be able to read their own user record for authentication to work.

### 3.1 Create Access Policies

Create three access policies that correspond to the frontend roles, or use a single shared policy for common permissions and layer role-specific ones on top.

**Recommended approach — single shared policy:**

Create one access policy (e.g. "App User") and assign it to all app users. This policy handles the permissions that all roles share. The `frontend_role` field then controls UI-level differences.

### 3.2 directus_users Permissions

All authenticated users need to read their own user record:

**Read**
- **Collection:** `directus_users`
- **Item Permissions (filter):**
  ```json
  {
    "id": {
      "_eq": "$CURRENT_USER"
    }
  }
  ```
- **Field Permissions:** Allow at minimum: `id`, `email`, `first_name`, `last_name`, `frontend_role`

This is required for the frontend authentication flow — the app calls `readMe()` on page load to retrieve the current user including their `frontend_role`.

### 3.3 chat_messages Permissions

See [directus-chat-messages-setup.md](./directus-chat-messages-setup.md) for full chat_messages collection and permission setup.

### 3.4 directus_files Permissions (Knowledge Base)

The knowledge base uses Directus Files. Configure based on role:

**All users (Read + Download):**
- **Read** on `directus_files` — allow reading file metadata
- **Read** on `directus_folders` — allow browsing folder structure

**Moderators and Administrators (additionally):**
- **Create** on `directus_files` — allow uploading files
- **Update** on `directus_files` — allow editing file metadata
- **Delete** on `directus_files` — allow deleting files
- **Create** on `directus_folders` — allow creating folders

> **Note:** If you use a single access policy for all users, grant full CRUD on files/folders to everyone at the Directus level. The frontend `usePermissions` hook handles hiding CRUD controls from `user`-role accounts. If you prefer defense-in-depth, create separate access policies per role.

## 4. How the Frontend Uses Roles

For reference, here is how the frontend consumes the `frontend_role` field.

**Fetching the role** — on page load, the auth context requests the current user:
```ts
import { readMe } from '@directus/sdk';

const currentUser = await client.request(readMe());
// currentUser.frontend_role → 'administrator' | 'moderator' | 'user'
```

**Computing permissions** — the `usePermissions` hook translates the role into boolean flags:
```ts
// src/hooks/usePermissions.ts
const role = user?.frontend_role ?? 'user'; // defaults to most restrictive

return {
  canAccessSettings: role === 'administrator',
  canManageFiles: role === 'administrator' || role === 'moderator',
};
```

**Gating UI elements** — components conditionally render based on permissions:
```tsx
const { canManageFiles } = usePermissions();

{canManageFiles && (
  <Button onClick={handleUpload}>Upload File</Button>
)}
```

**Protecting routes** — the `ProtectedRoute` component enforces role-based access:
```tsx
// src/App.tsx — Settings page restricted to administrators
<ProtectedRoute allowedRoles={['administrator']}>
  <Settings />
</ProtectedRoute>
```

Unauthorized users are silently redirected to `/chat`.

## 5. Permission Matrix

| Feature | Administrator | Moderator | User |
|---|:---:|:---:|:---:|
| Chat page | Yes | Yes | Yes |
| Knowledge Base (browse / download) | Yes | Yes | Yes |
| Knowledge Base (upload file) | Yes | Yes | No |
| Knowledge Base (create folder) | Yes | Yes | No |
| Knowledge Base (edit file metadata) | Yes | Yes | No |
| Knowledge Base (delete file) | Yes | Yes | No |
| Settings / Portainer page | Yes | No | No |
| Sidebar "Settings" link | Visible | Hidden | Hidden |

## 6. Verification

After setup, verify each role works correctly:

### Test as Administrator
1. Log in with a user who has `frontend_role: administrator`
2. Confirm the Sidebar shows **Chat**, **Documents**, and **Settings** links
3. Navigate to Settings — page should load
4. Go to Knowledge Base — upload, edit, and delete buttons should be visible

### Test as Moderator
1. Log in with a user who has `frontend_role: moderator`
2. Confirm the Sidebar shows **Chat** and **Documents** only (no Settings)
3. Try navigating to `/settings` directly — should redirect to `/chat`
4. Go to Knowledge Base — upload, edit, and delete buttons should be visible

### Test as User
1. Log in with a user who has `frontend_role: user`
2. Confirm the Sidebar shows **Chat** and **Documents** only (no Settings)
3. Try navigating to `/settings` directly — should redirect to `/chat`
4. Go to Knowledge Base — only browse and download should be available; no upload, create folder, edit, or delete buttons

## 7. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `frontend_role` is `undefined` after login | Field not created on `directus_users`, or field permissions don't include `frontend_role` | Add the field (Section 1) and ensure read permissions include it (Section 3.2) |
| User sees Settings page despite being `moderator`/`user` | Role not assigned to user, or mock mode is active | Check the user's `frontend_role` in Directus admin. If `VITE_USE_MOCK_DATA=true`, mock user defaults to `administrator` |
| API returns 403 when loading the app | Access policy doesn't grant read on `directus_users` for the current user | Add the read permission filter from Section 3.2 |
| Knowledge Base CRUD buttons visible to `user` role | Frontend code issue or `frontend_role` not being read | Check browser console for the user object — `frontend_role` should be `user` |
