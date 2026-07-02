# sync-server

Real-time collaboration backend for excalidraw-clone.
**Express** (REST, for session bootstrap) + **Socket.IO** (rooms, for live sync) + **MongoDB** (throwaway session storage with TTL expiry).

## Setup

```bash
cd sync-server
npm install
```

Make sure MongoDB is running locally (or point `MONGODB_URI` at Atlas / any Mongo instance). Copy `.env.example` to `.env` — it already has working local defaults:

```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/excalidraw-clone
FRONTEND_URL=http://localhost:5173
SESSION_TTL_SECONDS=86400
```

Run it:

```bash
npm run dev     # nodemon, auto-restarts on save
npm start        # plain node
```

Health check: `GET http://localhost:4000/health`

## Project structure

```
sync-server/
  src/
    server.js          # Express + Socket.IO bootstrap, entry point
    db/
      connect.js        # mongoose.connect() wrapper
      Session.js         # Session model (schema below)
    routes/
      session.js         # POST /api/sessions, GET /api/sessions/:id
    sockets/
      index.js            # all real-time event handlers (the core logic)
    utils/
      id.js                # session id + host token generators
```

## Data model

One collection, `sessions`. No `User` model, no auth — sessions are ephemeral rooms, matching real Excalidraw's share behavior.

```js
{
  _id: String,          // short id, e.g. "d47wc4jd" — reused directly as Mongo _id, also the URL slug
  elements: Array,        // full excalidraw-style elements array, stored as-is
  hostToken: String,       // secret only the creator knows, never exposed via GET
  hostSocketId: String,     // current socket.id of whoever holds host rights right now
  hostName: String,
  createdAt: Date,
  updatedAt: Date          // TTL-indexed — doc auto-deletes SESSION_TTL_SECONDS after last update
}
```

## REST API

| Method | Route | Body | Returns |
|---|---|---|---|
| POST | `/api/sessions` | `{ elements, hostName }` | `201 { sessionId, hostToken }` |
| GET | `/api/sessions/:id` | – | `200 { sessionId, elements, hostName }` or `404` |

`hostToken` is returned **only once**, at creation. Store it client-side (`localStorage`) — it's what lets the creator's browser be recognized as host later, including after a page refresh (their `socket.id` changes on reconnect, but this token doesn't).

## Socket events

| Event | Direction | Payload | Notes |
|---|---|---|---|
| `join-session` | client → server *(ack)* | `{ sessionId, name, hostToken? }` | ack returns `{ elements, isHost }` or `{ error }` |
| `element-update` | client ↔ server | `{ elements }` | full array, broadcast to everyone else in the room, debounce-saved to Mongo |
| `cursor-move` | client ↔ server | `{ x, y, ... }` | optional — skip wiring it up if you're short on time |
| `peer-joined` / `peer-left` | server → clients | `{ name }` | informational only |
| `end-session` | client (host) → server *(ack)* | `{ sessionId }` | rejected with `{ error }` unless caller is host |
| `session-ended` | server → all clients in room | – | every client should restore its local board and redirect home |

## Frontend integration

Socket client wrapper — adapt into your `web` project, e.g. `src/lib/socket.js`:

```js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SYNC_SERVER_URL, { autoConnect: false });
  }
  return socket;
}
```

**Share button → "Start session":**

```js
async function startSession(elements, name) {
  localStorage.setItem("local-board", JSON.stringify(elements));

  const res = await fetch(`${SYNC_SERVER_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elements, hostName: name }),
  });
  const { sessionId, hostToken } = await res.json();

  localStorage.setItem(`hostToken:${sessionId}`, hostToken);

  const socket = getSocket();
  socket.connect();
  socket.emit("join-session", { sessionId, name, hostToken }, ({ error }) => {
    if (error) return console.error(error);
    navigate(`/board/${sessionId}`);
  });
}
```

**Opening `/board/:sessionId` directly (joining someone else's link):**

```js
async function joinSession(sessionId, name) {
  const res = await fetch(`${SYNC_SERVER_URL}/api/sessions/${sessionId}`);
  if (!res.ok) {
    // not found / expired — redirect home or show a message
    return;
  }
  const { elements } = await res.json();
  renderBoard(elements); // paint immediately, don't wait on the socket round-trip

  const hostToken = localStorage.getItem(`hostToken:${sessionId}`) || undefined;

  const socket = getSocket();
  socket.connect();
  socket.emit("join-session", { sessionId, name, hostToken }, ({ elements, isHost, error }) => {
    if (error) return console.error(error);
    renderBoard(elements); // reconcile in case it changed since the GET above
    setIsHost(isHost);       // controls whether "Stop session" is shown
  });

  socket.on("element-update", ({ elements }) => renderBoard(elements));

  socket.on("session-ended", () => {
    const local = JSON.parse(localStorage.getItem("local-board") || "[]");
    renderBoard(local);
    navigate("/");
    socket.disconnect();
  });
}
```

**On every local drawing change** (debounce this — don't fire on every `mousemove`, only on meaningful changes like pointer-up or every ~50–100ms):

```js
function onElementsChange(elements) {
  renderBoard(elements); // your existing local render, unchanged
  socket.emit("element-update", { elements });
}
```

**"Stop session" button (host only):**

```js
function stopSession(sessionId) {
  socket.emit("end-session", { sessionId }, ({ error }) => {
    if (error) console.error(error);
    // session-ended also fires back to this same socket via the room broadcast —
    // that's what actually restores local-board + redirects, so no extra code needed here
  });
}
```

## Known MVP tradeoffs (intentional, not bugs)

- **Last-write-wins**, not CRDT-merged. Fine when everyone's online and connected to the same server; you'd need Yjs (or similar) if you later want offline editing that merges on reconnect.
- **No auth** — anyone with the link can draw, and can end the session for everyone. This matches real Excalidraw's own share behavior.
- **Full elements array sent on every update**, not a diff/patch. Much simpler to implement; costs more bandwidth on very large boards. Fine for MVP.
- If the host's tab just closes (no explicit "Stop session" click), the session is **not** auto-ended — it just sits until `SESSION_TTL_SECONDS` reaps it from Mongo. The in-memory cache also clears on server restart, but Mongo retains the last debounce-saved state.
- Board data (`elements`) has no server-side shape validation beyond "is an array" — the server trusts whatever the frontend sends. Fine with no auth/accounts anyway; would matter more if you add persistent user-owned boards later.
