# Directus `chat_messages` Collection Setup

This guide walks through creating and configuring the `chat_messages` collection in Directus so the chat feature works correctly.

## 1. Create the Collection

1. Open the Directus Admin panel (e.g. `http://localhost:8055`)
2. Go to **Settings > Data Model**
3. Click **Create Collection**
4. Set the collection name to `chat_messages`
5. For the Primary Key, select **Generated UUID** (the app expects string UUIDs)

## 2. Add Fields

Create the following fields on the `chat_messages` collection:

| Field | Interface | Type | Required | Notes |
|---|---|---|---|---|
| `id` | — | UUID | Yes | Created automatically as Primary Key |
| `user` | — | UUID (M2O relation) | Yes | Many-to-One relationship to `directus_users` |
| `role` | Dropdown | String | Yes | Allowed values: `user`, `assistant` |
| `content` | Textarea | Text | Yes | The message body |
| `mode` | Dropdown | String | No | Allowed values: `rag`, `llm` (nullable) |
| `timestamp` | DateTime | Timestamp | Yes | ISO 8601 format, set by the app on creation |
| `date_created` | DateTime | Timestamp | No | Enable "Created On" special field (auto-populated by Directus) |

### Field-by-field instructions

#### `user` (Many-to-One relationship)

1. Click **Create Field** > choose **Many to One Relationship**
2. Set the field key to `user`
3. Set the **Related Collection** to `directus_users`
4. Leave the related field / foreign key as default
5. This links each message to the user who owns it

#### `role`

1. Click **Create Field** > choose **Dropdown**
2. Set the field key to `role`
3. Add two choices:
   - `user` (label: User)
   - `assistant` (label: Assistant)
4. Mark as **Required**

#### `content`

1. Click **Create Field** > choose **Textarea**
2. Set the field key to `content`
3. Mark as **Required**

#### `mode`

1. Click **Create Field** > choose **Dropdown**
2. Set the field key to `mode`
3. Add two choices:
   - `rag` (label: RAG Search)
   - `llm` (label: LLM Chat)
4. Leave as **not required** (nullable) — older messages may not have this field

#### `timestamp`

1. Click **Create Field** > choose **DateTime**
2. Set the field key to `timestamp`
3. Mark as **Required**
4. Do NOT use the "Created On" special — this field is explicitly set by the frontend app

#### `date_created`

1. Click **Create Field** > choose **DateTime**
2. Set the field key to `date_created`
3. Under **Special**, select **Date Created** so Directus auto-populates it

## 3. Configure Permissions

The app filters messages by the current user's ID. You need to set item-level permissions so users can only access their own messages.

Go to **Settings > Access Policies** and configure the role your app users belong to (e.g. a custom "User" role or the "Authenticated" role):

### Read

- **Collection:** `chat_messages`
- **Item Permissions (filter):**
  ```json
  {
    "user": {
      "_eq": "$CURRENT_USER"
    }
  }
  ```
- **Field Permissions:** Allow all fields (`id`, `user`, `role`, `content`, `mode`, `timestamp`, `date_created`)

### Create

- **Collection:** `chat_messages`
- **Item Permissions (preset/validation):**
  ```json
  {
    "user": {
      "_eq": "$CURRENT_USER"
    }
  }
  ```
- **Field Permissions:** Allow `user`, `role`, `content`, `mode`, `timestamp`

### Delete

- **Collection:** `chat_messages`
- **Item Permissions (filter):**
  ```json
  {
    "user": {
      "_eq": "$CURRENT_USER"
    }
  }
  ```

### Update

Not needed. The app treats messages as immutable — no update operations are performed.

## 4. How the App Uses This Collection

For reference, here is how the frontend interacts with `chat_messages`:

**Fetch messages** — filtered by user ID and optionally by mode, sorted by `timestamp` ascending:
```ts
readItems('chat_messages', {
  filter: { user: { _eq: userId }, mode: { _eq: mode } },
  sort: ['timestamp'],
  limit: -1,
})
```

**Save a message** — `id` is auto-generated, `timestamp` is set by the app:
```ts
createItem('chat_messages', {
  user: userId,
  role: 'user',       // or 'assistant'
  content: 'Hello!',
  mode: 'rag',        // or 'llm'
  timestamp: new Date().toISOString(),
})
```

**Clear chat history** — deletes all messages for a user (optionally filtered by mode):
```ts
deleteItems('chat_messages', {
  filter: { user: { _eq: userId }, mode: { _eq: mode } },
})
```

## 5. Verification

After setup, verify things are working:

1. Log in to the app as a regular user
2. Send a message in RAG Search mode
3. Open the Directus Admin panel and check that a new item appeared in `chat_messages` with the correct `user`, `role`, `content`, `mode`, and `timestamp`
4. Switch to LLM Chat mode and send another message — confirm it has `mode: "llm"`
5. Refresh the page — chat history should reload from Directus
6. Clear chat — confirm messages are deleted from the collection
