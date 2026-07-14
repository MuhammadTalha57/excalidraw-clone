# web

Froentend for excalidraw-clone.
Real-time collaboration backend for excalidraw-clone.
**Next** (App Router) + **Socket.IO** (rooms, for live sync) + **Zustand** (global state management).

## Setup

```bash
cd web
npm install
```
Make sure backend is running (for real time collaboration) & NEXT_PUBLIC_SYNC_SERVER_URL is set in `.env` file

Run it:

```bash
npm run dev     # nodemon, auto-restarts on save
npm start        # plain node
```

Whiteboard: `http://localhost:3000`

## Project structure

```
web/
  app/
    page.tsx                # Renders Whiteboard
  components/               # UI components
    canvas.tsx              # Renders canvas
    colorPickerSwatch.tsx   # Custom Color Picker
    remoteCursors.tsx       # Renders Remote Cursors during real time collaboration
    sessionManager.tsx      # Component for Session Management
    shapeOptions.tsx        # Provide Drawing options like stroke color, width, etc
    whiteboard.tsx          # A wrapper component which wraps other components.
  hooks/
    useEmitCursorMove.tsx   # Custom Hook for emitting cursor move for renering remote cursors
  lib/
    canvas/
      interactions/         # Includes all Interactions Handling such as Drawing shapes, Move, Resize, etc
      eraserHitTets.ts      # Hit Test to erase element
      renderElement.ts      # Renders All type of CanvasElement
    id.ts                   # Generates UUID
    selectionHitTest.ts     # Hit Test for selecting elements
    socket.ts               # socket logic and listeners
    types.ts                # Data Types
  stores/                   # Contain all zustand store definitions
  utils/                    # Utility Functions
```

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