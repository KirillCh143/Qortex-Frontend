# n8n Workflow Streaming Fix

## Problem
The Code node (line 115-126) breaks streaming because it waits for the complete AI Agent output before formatting it.

## Solution Options

### Option 1: Remove Code Node (Simplest)
Connect AI Agent directly to "Respond to Frontend Webhook":
1. Delete the "Code in JavaScript" node
2. Connect AI Agent → Respond to Frontend Webhook directly
3. The AI Agent's output will stream naturally

**Tradeoff:** You lose the custom formatting (answer + sources). The frontend will need to parse the raw AI Agent output.

### Option 2: Modify AI Agent System Prompt
Instead of formatting in Code node, format in the AI Agent's system prompt:
1. Keep the Code node deleted
2. Update AI Agent's system message to output JSON directly:
   ```
   After your answer, output a JSON block with sources:
   ```json
   {
     "answer": "your complete answer here",
     "sources": [{"title": "...", "url": "...", "relevance": 0.9}]
   }
   ```
   ```
3. Frontend parses the JSON from the streamed response

### Option 3: Stream First, Format After (Recommended)
1. Remove Code node
2. Let AI Agent stream the answer directly
3. After streaming completes, make a separate non-streaming request for sources (if needed)
4. Or: Include sources in the AI Agent's text output (as markdown), parse on frontend

## Current Workflow Flow
```
Frontend webhook → AI Agent (with streaming) → Code node (breaks streaming) → Respond to Frontend Webhook
```

## Fixed Flow (Option 1)
```
Frontend webhook → AI Agent (with streaming) → Respond to Frontend Webhook
```

## Implementation
In n8n:
1. Click the connection between "AI Agent" and "Code in JavaScript"
2. Delete it
3. Delete the "Code in JavaScript" node
4. Create connection from "AI Agent" output to "Respond to Frontend Webhook" input
5. Save and activate workflow

The "Respond to Frontend Webhook" node already has `enableStreaming: true` (line 148), so it will stream the AI Agent's output chunks directly.
