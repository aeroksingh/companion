# COMPANION

A lightweight pixel-art desktop companion that lives on your Windows desktop.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Rust + Cargo](https://rustup.rs/)
- [Tauri CLI prerequisites for Windows](https://tauri.app/start/prerequisites/)
  - Microsoft Visual Studio C++ Build Tools
  - WebView2 (ships with Windows 11, available for Win 10)

## Setup

```bash
# 1. Install all dependencies
npm install
cd sidecar && npm install && cd ..

# 2. Build the sidecar (Node.js image pipeline)
cd sidecar && npm run build && cd ..

# 3. Start development
npm run tauri:dev
```

## Project Structure

```
companion/
├── src/                  # React frontend (all windows)
│   ├── overlay/          # Desktop overlay window
│   ├── center/           # Companion Center settings window
│   ├── onboarding/       # First-launch flow
│   ├── stores/           # Zustand state
│   └── hooks/            # Custom hooks
├── src-tauri/            # Rust backend
│   └── src/
│       ├── commands/     # Tauri IPC commands
│       ├── db/           # SQLite queries
│       ├── state/        # FSM + app state
│       ├── tray/         # System tray
│       ├── overlay/      # Window management
│       └── startup/      # Windows registry autostart
├── sidecar/              # Node.js image pipeline
│   └── src/
│       └── pipeline.ts   # Pixel-art generation
└── public/
    └── sprites/          # Built-in sprite sheets
        ├── person_1/sprite.png
        ├── person_2/sprite.png
        ├── dog/sprite.png
        ├── cat/sprite.png
        ├── rabbit/sprite.png
        └── fox/sprite.png
```

## Windows

The app has 3 separate windows, routed in `src/App.tsx`:

| Label | Purpose |
|-------|---------|
| `overlay` | Transparent always-on-top companion sprite |
| `center` | Companion Center (settings, library, stats) |
| `onboarding` | First-launch wizard |

## Sprite Sheet Format

Each companion uses a single PNG sprite sheet:
- **Width**: `frameCount × spriteWidth` (e.g. 4 × 96 = 384px)
- **Height**: `4 × spriteHeight` (4 rows = 384px)
- **Row 0**: idle (blink, look around)
- **Row 1**: happy (bounce, smile)
- **Row 2**: sleeping (dimmed, still)
- **Row 3**: curious (head tilt)

Replace the placeholder sprites in `public/sprites/` with your own pixel art.

## Adding Real Pixel Art

The sprites in `public/sprites/*/sprite.png` are generated placeholders.
Replace them with proper pixel art sprite sheets (384×384 PNG for 96px size).

Recommended tools:
- [Aseprite](https://www.aseprite.org/) — best pixel art + animation tool
- [LibreSprite](https://libresprite.github.io/) — free Aseprite fork
- [Piskel](https://www.piskelapp.com/) — free browser-based

## Build for Production

```bash
npm run tauri:build
# Installer at: src-tauri/target/release/bundle/nsis/
```

## Database

SQLite at `%APPDATA%\Companion\companion.db`

Tables: `companions`, `overlay_state`, `settings`, `statistics`

## Tray Menu

Right-click the system tray icon:
- Show / Hide companion
- Open Companion Center
- Create Companion
- Exit
