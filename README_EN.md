<p align="center">
  <img src="public/icon.svg" width="96" height="96" alt="TileMerge Icon">
</p>

<h1 align="center">TileMerge</h1>

<p align="center">High-performance desktop tool for merging and inspecting map tiles, built with Tauri and Rust</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-orange" alt="License">
  <img src="https://img.shields.io/badge/tech-Tauri%20v2%20%7C%20Rust%20%7C%20Vue%203-blueviolet" alt="Tech Stack">
</p>

<p align="center">
  <a href="./README.md">简体中文</a> · <b>English</b>
</p>

<p align="center">
  <img src="public/应用.png" width="900" alt="TileMerge Main Interface">
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-tile-specifications">Tile Specifications</a> ·
  <a href="#-merge-engine--algorithm">Merge Engine</a> ·
  <a href="#-interface--controls">Interface & Controls</a> ·
  <a href="#-security--transparency">Security & Transparency</a> ·
  <a href="#-technical-architecture">Technical Architecture</a> ·
  <a href="#-building-from-source">Building from Source</a> ·
  <a href="#-faq--troubleshooting">FAQ</a> ·
  <a href="#-license--attribution">License</a>
</p>

---

## ✨ Features

- **Multi-Source Sequential Merging** — Add multiple tile directories and adjust the layer composite stack order via a visual reorderable card list.
- **Pixel-Level Alpha Blending** — Performs per-pixel RGBA transparency blending (`top * α + bottom * (1 - α)`) on overlapping tiles, eliminating hard edge cutoffs.
- **Rayon Multi-Thread Acceleration** — Leverages Rust's `rayon` work-stealing parallel iterator for tile processing, utilizing all available CPU cores for high-throughput batching.
- **Embedded Local Tile Server** — Integrates a lightweight Rust `tiny_http` server (ports 9527~9537 auto-negotiated), bypassing webview local protocol and CORS restrictions.
- **Interactive Map Inspection & Preview** — Couples Leaflet.js with Amap satellite imagery to preview source and output layers with coordinate navigation and click-to-locate features.
- **Cross-Platform Native Desktop** — Powered by Tauri v2 with zero Electron overhead, delivering native binaries for macOS (Apple Silicon) and Windows (single-file portable executable).

---

## 📦 Quick Start

### Pre-Built Binaries

Download the latest release for your platform from [GitHub Releases](https://github.com/nanvon/tile-merge-app/releases):

- **macOS (Apple Silicon)**: Download `TileMerge.app.zip`, extract, and move `TileMerge.app` to your `Applications` folder (compatible with macOS 10.13+).
- **Windows (x64)**: Download `TileMerge.exe`, a standalone portable executable that runs directly without installation or external runtime dependencies.

### 4-Step Standard Workflow

1. **Add Source Folders**: Click "**Add Folder**" on the left panel to import tile directories. The app scans subdirectories and displays total tile counts.
2. **Adjust Layer Priority**: Use ⬆️ / ⬇️ buttons in the folder list. **Rule: Folders closer to the bottom overlay on top of earlier folders**.
3. **Select Output Directory**: Specify the destination folder where the merged tile tree will be saved.
4. **Merge & Inspect**: Click "**Start Merge**" to track progress, file counters (merged/copied/errors), and elapsed time; click "**Preview Results**" upon completion to inspect layer alignment on the interactive map.

---

## 📁 Tile Specifications

### Directory Topology (Slippy Map XYZ)

Both input source folders and output directories must strictly conform to the Slippy Map XYZ directory convention:

```text
tile-directory/
├── {z}/            # Zoom level (positive integer, e.g. 10)
│   ├── {x}/        # Tile column index / X coordinate (e.g. 827)
│   │   ├── {y}.png # Tile row index / Y coordinate (e.g. 373.png)
```

### Protocol & Format Matrix

| Dimension | Support Status | Specifications & Boundaries |
| :--- | :---: | :--- |
| **Image Format** | **PNG only (`.png`)** | Must contain transparency (Alpha channel) for layer blending. **JPG and WebP are not supported**. |
| **Tiling Standard** | **Standard XYZ** | Origin located at top-left corner (Google / OSM / Amap convention). **TMS (origin at bottom-left) is not used**. |
| **Container Type** | **Discrete directories only** | Reads and writes directly to filesystem folders. **MBTiles, GeoPackage, and GeoTIFF files are not read directly** (must be sliced/extracted first). |
| **Missing Tile Fallback** | **1×1 transparent PNG** | The embedded tile server returns an in-memory 1×1 transparent PNG for non-existent tiles, preventing broken image placeholders on Leaflet. |

> [!NOTE]
> If your existing aerial orthophoto or base data is stored in GeoTIFF or MBTiles formats, use `gdal2tiles.py` or `mb-util` to generate an XYZ directory of PNG tiles prior to merging.

---

## 🔄 Merge Engine & Algorithm

### Layer Processing Order

Folders are processed sequentially from top to bottom in the list:

```text
[Folder 1 (Top)]     ──────► Base Layer
       │
       ▼
[Folder 2 (Middle)]  ──────► Intermediate Overlay
       │
       ▼
[Folder 3 (Bottom)]  ──────► Top Layer (Highest visual priority)
```

### Tiered Execution & Alpha Blending

For each relative path `{z}/{x}/{y}.png`:

1. **Initial Copy**: If the tile does not exist in the output directory, it is transferred directly using OS-level file copy (`fs::copy`) with zero re-encoding overhead.
2. **Subsequent Overlay**: If a tile already exists at the destination, it is treated as `base` and the current tile as `overlay`, followed by pixel-by-pixel RGBA alpha blending.

### Alpha Blending Formulation

The merge engine computes each RGBA pixel at coordinate $(x, y)$:

$$\alpha = \frac{\text{Alpha}_{\text{top}}}{255.0}$$

$$\text{RGB}_{\text{out}} = \text{RGB}_{\text{top}} \times \alpha + \text{RGB}_{\text{bottom}} \times (1.0 - \alpha)$$

$$\text{Alpha}_{\text{out}} = \max(\text{Alpha}_{\text{top}}, \text{Alpha}_{\text{bottom}})$$

- When $\alpha = 1.0$ (fully opaque): top pixel completely overwrites the bottom pixel;
- When $0 < \alpha < 1.0$ (semi-transparent): pixels are smoothly blended according to alpha weight;
- When $\alpha = 0.0$ (fully transparent): bottom pixel remains completely untouched.

---

## 📍 Interface & Controls

### Functional Mapping

| Interface Area | Feature | Action | Behavior |
| :--- | :--- | :--- | :--- |
| **File Management** | Import Directory | Click "Add Folder" | Opens native folder picker, counts tiles recursively, adds item to task queue |
| | Reorder Layers | Click ⬆️ / ⬇️ on card | Adjusts merge sequence (lower items overlay on top of higher items) |
| | Preview Layer | Click 👁️ on card | Mounts selected folder to local HTTP tile server and renders on map |
| | Remove Item | Click ❌ on card | Removes folder from the current merge task queue |
| | Reset Workspace | Click "New Task" on header | Closes preview server, resets lists, and clears the activity log |
| **Map Preview** | Coordinate Jump | Enter Lng/Lat + Enter / "Jump" | Smoothly pans and zooms the map to the specified longitude and latitude |
| | Pick Coordinates | Click anywhere on map | Places a green indicator marker and outputs 6-decimal-place coordinates |
| | Zoom Controls | Mouse wheel / +/- buttons | Supports zoom levels 1~24 (Amap satellite tiles native up to level 18) |
| | Basemap Toggle | Toggle "Satellite Basemap" | Disables satellite imagery to display transparent tile boundaries directly |
| **Global Shortcuts** | Developer Tools | Press `F12` | Opens Webview DevTools console for debugging frontend state and requests |

---

## 🔒 Security & Transparency

TileMerge operates under a strict principle of least privilege:

| Module / Operation | Accessed Resource | Permission | Security Guarantee |
| :--- | :--- | :---: | :--- |
| **Tile Directory Scanning** | User-selected folders | **Read-Only** | Recursively traverses `.png` files via `walkdir`. Never modifies source files |
| **Merged File Output** | User-specified destination | **Read / Write** | Creates subdirectories and writes merged PNGs strictly within target folder |
| **Local Tile Server** | `127.0.0.1:9527~9537` | **Loopback Only** | Binds exclusively to localhost loopback; unreachable from external networks |
| **Satellite Imagery** | Amap public satellite CDN | **Outbound HTTPS** | Fetches public satellite tiles for preview; **never uploads** local tiles or telemetry |
| **Credentials & Privacy** | Zero telemetry / No telemetry | **None** | No user account, no keychain access, no analytics trackers, no telemetry |

---

## 🧱 Technical Architecture

### Architecture Topology

```text
┌─────────────────────────────────────────────────────────────────┐
│                      TileMerge UI (Webview)                     │
│  Vue 3.5 + TypeScript + Vite 6 + Leaflet 1.9 (CSS Modules)      │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Tauri IPC (Commands & Events)
┌────────────────────────────────┴────────────────────────────────┐
│                       Rust Core Engine                          │
├────────────────────────────────┬────────────────────────────────┤
│  TileMerger (Merge Core)       │  TileServer (Microservice)     │
│  - WalkDir recursive scanner   │  - Lightweight Tiny-HTTP       │
│  - Rayon parallel threadpool   │  - Dynamic port check (9527-37)│
│  - Image-rs RGBA8 blending     │  - 1x1 transparent fallback    │
│  - Atomic progress counters    │  - Pure in-memory streaming    │
└────────────────────────────────┴────────────────────────────────┘
```

### Core Dependency Breakdown

| Layer | Component | Version | Role & Responsibility |
| :--- | :--- | :--- | :--- |
| **Application Shell** | [Tauri](https://tauri.app/) | `^2.0` | Native window management, file dialogs, and secure IPC communication |
| **Frontend Framework** | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) | `^3.5` / `~5.6` | Reactive state management, UI component structure, and type safety |
| **Map Rendering** | [Leaflet](https://leafletjs.com/) | `^1.9.4` | Slippy map display, tile rendering, coordinate transformations |
| **Concurrency** | [Rayon](https://github.com/rayon-rs/rayon) | `1.10` | Parallel CPU work-stealing scheduler for batch tile blending |
| **Image Codec** | [image](https://github.com/image-rs/image) | `0.25` | PNG decoding, RGBA8 pixel traversal, alpha compositing, lossless save |
| **Embedded Server** | [tiny_http](https://github.com/tiny-http/tiny-http) | `0.12` | Zero-dependency embedded HTTP service for local tile streaming |

---

## 🔧 Building from Source

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18 (Node 20 LTS recommended)
- [Rust](https://www.rust-lang.org/) >= 1.70 (with `cargo` toolchain)
- npm, pnpm, or yarn

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/nanvon/tile-merge-app.git
cd tile-merge-app

# 2. Install frontend dependencies
npm install

# 3. Start local development mode (launches Vite dev server and Tauri window)
npm run tauri dev
```

### Production Build

```bash
# Build macOS native application bundle (Apple Silicon aarch64)
npm run build:mac
# Output artifact: src-tauri/target/aarch64-apple-darwin/release/bundle/macos/TileMerge.app

# Cross-compile Windows x64 portable executable on macOS (requires cargo-xwin and llvm)
npm run build:win
# Output artifact: src-tauri/target/x86_64-pc-windows-msvc/release/TileMerge.exe
```

> [!TIP]
> For details on setting up Windows cross-compilation on macOS (LLVM toolchain and `cargo-xwin` configuration), refer to the [Build Guide](./README_BUILD_GUIDE.md).

---

## ❓ FAQ & Troubleshooting

<details>
<summary><b>Q: Why are tiles not visible in the preview map?</b></summary>
<br>

1. **Zoom mismatch**: The zoom level (`{z}`) in your folder may not cover the current map view level. Check the zoom level number displayed on the map against the `{z}` subfolder numbers in your source folder.
2. **Coordinate offset**: The spatial coverage of your tiles is outside the default map center. Enter the longitude and latitude of your dataset into the coordinate input and click "Jump".
3. **Basemap blending**: If your tiles have color tones similar to the satellite imagery, uncheck "Satellite Basemap" to preview tiles against a dark transparent background.
</details>

<details>
<summary><b>Q: Why are JPG and WebP tile formats not supported?</b></summary>
<br>

Standard JPG does not include an Alpha transparency channel; merging overlapping JPGs cannot calculate edge feathering and results in opaque rectangular borders. The underlying engine is strictly optimized for RGBA8 PNG tiles. Convert your tiles to PNG with transparency before merging.
</details>

<details>
<summary><b>Q: Will processing hundreds of thousands of tiles exhaust system memory?</b></summary>
<br>

No. TileMerge uses a streaming batch architecture: `WalkDir` only collects relative path strings, and `rayon` dynamically feeds worker threads based on available CPU cores. Each tile pair is loaded, blended, and written directly to disk before freeing its memory. Resident RAM usage scales with CPU core count rather than total dataset size.
</details>

<details>
<summary><b>Q: How can I serve the merged tile directory in Web maps or QGIS?</b></summary>
<br>

The merged output directory is fully compliant with standard Slippy Map conventions:
- **Web (Leaflet / OpenLayers / Mapbox GL)**: Place the output directory under any static HTTP web server (e.g., Nginx) and configure the tile URL pattern as `http://your-server/tiles/{z}/{x}/{y}.png`.
- **Desktop (QGIS)**: In QGIS Browser panel, right-click "XYZ Tiles" -> "New Connection", and enter the local path or static server URL to load layers directly.
</details>

---

## 📜 License & Attribution

### License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/):

- **Share** — Copy and redistribute the material in any medium or format;
- **Adapt** — Remix, transform, and build upon the material;
- **Attribution** — Must give appropriate credit and provide a link to the license;
- **NonCommercial** — The material and derivatives may not be used for commercial purposes;
- **ShareAlike** — Derivative works must be distributed under the exact same license.

Refer to [LICENSE](./LICENSE) for the complete legal terms.

### Acknowledgments

The core merging logic and implementation principles reference work by:

- [merge_tile_sets.pl](https://github.com/jlmcgraw/aviationCharts/blob/master/merge_tile_sets.pl) by jlmcgraw
- [Stack Exchange GIS Discussion](https://gis.stackexchange.com/questions/247717) on ImageMagick tile composition strategies
