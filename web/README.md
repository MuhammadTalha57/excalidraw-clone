<div align="center">

# ✏️ Excalidraw Clone

A hand-drawn-style collaborative whiteboard, built from scratch on **Next.js**, **React**, and the HTML5 Canvas API — no drawing library, no shortcuts.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-orange)
![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS%20v4-38BDF8?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20active%20development-yellow)

</div>

---

## 🧭 About

This is a personal, from-the-ground-up clone of [Excalidraw](https://excalidraw.com) — built to actually understand how a whiteboard app works under the hood: a raw `<canvas>` render loop, custom hit-testing and geometry math, a hand-drawn stroke renderer, and (eventually) real-time multiplayer sync — rather than wrapping an existing canvas library.

The project is being built incrementally and does **not** yet match its original planned architecture 1:1 — features are being added in whatever order made sense at the time, and this README reflects the **real, current state of the code**, not the original plan.

> 📌 This project is a **work in progress**. The sections below are split into what's done, what's half-built, and what's coming next — so you always know where things stand.

---

## ✨ Features

### ✅ Completed

- **Custom canvas rendering engine** — a single `renderElement()` pipeline that draws every shape type directly with the Canvas 2D API (no external rendering library)
- **Shape rendering** for:
    - Rectangle (rounded corners)
    - Diamond (rounded polygon math)
    - Ellipse
    - Line
    - Arrow (with computed arrowhead geometry)
    - Freehand draw (smoothed with quadratic curves between points for a natural, hand-drawn stroke feel)
- **Live preview while drawing** — the shape you're dragging is rendered in real time before it's committed to the canvas
- **Pointer-based interaction system** — unified mouse/pen/touch handling via the Pointer Events API
- **Bounding-rectangle normalization** — lets you drag in any direction (up/down/left/right) and still get a correct `x, y, width, height`
- **Toolbar UI** — a floating, rounded, grouped toolbar with icons for every planned tool, responsive/scrollable on small viewports
- **Global state with Zustand** — separate stores for canvas elements, the in-progress preview element, and the active tool
- **High-DPI canvas scaling** — crisp rendering on retina displays
- **Styled with Tailwind CSS v4**, on **Next.js 16 (App Router)**, **React 19**, and **TypeScript**

### 🚧 In Progress / Partially Wired

These tools already exist in the toolbar UI and type system, but aren't functional yet:

| Tool           | Status                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| **Select**     | Icon + type defined — no hit-testing, click-to-select, or drag-to-move logic yet |
| **Hand (pan)** | Icon + type defined — canvas does not yet pan or have a camera/viewport offset   |
| **Text**       | Icon + type defined — no on-canvas text insertion or rendering yet               |
| **Eraser**     | Icon only — not wired to remove elements                                         |
| **Image**      | Icon only — no image insertion/upload yet                                        |

### 🔭 Planned / Future

Roughly in the order they're intended to land:

- [ ] **Selection & transform** — click/drag-select, resize & rotate handles, multi-select
- [ ] **Move, delete & duplicate** elements, with layering (z-index, bring to front/back)
- [ ] **Undo / redo** — a command-stack wrapping every mutation
- [ ] **Pan & zoom** — proper camera/viewport math so the canvas isn't 1:1 with the screen
- [ ] **Style panel** — stroke color, fill color, stroke width, opacity, line style (solid/dashed)
- [ ] **Text tool** — click-to-type editable text elements
- [ ] **Persistence** — save/load boards, starting with `localStorage`, later a real database
- [ ] **Auth + dashboard** — sign in and manage multiple boards
- [ ] **Real-time collaboration** — a CRDT-based sync layer (Yjs) over WebSockets, served from a separate always-on sync process so the hot path (drawing sync) stays decoupled from the slow path (DB writes)
- [ ] **Export** — PNG / SVG / copy-to-clipboard
- [ ] **Keyboard shortcuts** — tool switching, delete, undo/redo, etc.

---

## 🛠️ Tech Stack

| Layer     | Choice                                                                       |
| --------- | ---------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router)                                |
| UI        | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Rendering | Raw HTML5 `<canvas>` — no Fabric/Konva/etc.                                  |
| State     | [Zustand](https://github.com/pmndrs/zustand)                                 |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com)                                   |
| Linting   | ESLint 9                                                                     |

---

## 📁 Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Entry point — renders <Whiteboard />
├── components/
│   ├── whiteboard.tsx       # Top-level layout: canvas + floating toolbar
│   ├── toolbar.tsx          # Tool icons, grouping, responsive scroll behavior
│   └── canvas/
│       ├── canvas.tsx              # <canvas> element, render loop, DPR scaling
│       ├── renderElement.ts        # Draws every shape type onto the 2D context
│       └── interactions/
│           └── captureInteraction.ts  # Pointer down/move/up → preview element
├── stores/
│   ├── useCanvasElements.ts   # Committed shapes on the board
│   ├── usePreviewElement.ts   # The shape currently being drawn
│   └── useSelectedTool.ts     # Active toolbar tool
├── lib/
│   └── types.ts              # Element, Tool, and store type definitions
└── utils/
    └── boundingRectangle.ts  # Normalizes drag coords into x/y/width/height
```

> The original plan called for a monorepo (`apps/web` + `apps/sync-server`) to support real-time collaboration. That hasn't been started yet — everything currently lives in `web/`, and the sync server will be split out once collaboration work begins (see **Planned / Future** above).

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/MuhammadTalha57/excalidraw-clone.git
cd excalidraw-clone/web

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start drawing.

---

## 🤝 Contributing

This is currently a solo learning project, but issues, suggestions, and pull requests are welcome — especially around the items in the **Planned / Future** list above.

---

## 📄 License

No license has been added yet. Until one is added, please treat this repository as **all rights reserved**.
