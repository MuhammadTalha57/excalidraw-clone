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
MONGODB_URI=
FRONTEND_URL=http://localhost:5173
SESSION_TTL_SECONDS=86400
REDIS_URL=
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
  api/
    socket.ts               # Main Entry Point
  cache/                    # Redis
    connect.ts              # Redis Connection
    session.cache.ts        # CRUD Functions For Redis
  db/                       # MongoDB
    connect.ts              # DB Connection
    session.repository.ts   # CRUD Functions For DB
    Session.ts              # MongoDB Schema
  public/
    index.html              # Health check
  routes/
    session.ts              # API routes for session management
  services/
    session.service.ts      # Service for managing session data
  sockets/
    index.ts                # Web Sockets Logic
  utils/
    id.ts                   # UUID generator
    logger.ts               # Logger setup
```

## Data model

One collection, `sessions`. No `User` model, no auth — sessions are ephemeral rooms, matching real Excalidraw's share behavior.

```js
{
    _id: { type: String, required: true },

    elements: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => new Map(),
    },

    hostToken: { type: String, required: true },

    hostSocketId: { type: String, default: null },

    hostName: { type: String, default: "Host" },

    active: { type: Boolean, default: true },

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
| `element-update` | client ↔ server | `{ elements }` | broadcast to everyone else in the room, debounce-saved to Mongo |
| `element-delete` | client ↔ server | `{ ids }` | broadcast ids of erased elements |
| `cursor-move` | client ↔ server | `{ x, y, ... }` | Rendering Remote Cursors |
| `peer-joined` / `peer-left` | server → clients | `{ name }` | informational only |
| `end-session` | client (host) → server *(ack)* | `{ sessionId }` | rejected with `{ error }` unless caller is host |
| `session-ended` | server → all clients in room | – | every client should restore its local board and redirect home |