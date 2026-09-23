# 🚨 Vice City Mugshot Lab — GTA VI Wanted Bulletin & Evidence Editor

> **Built for the [Unlayer React Image Editor Challenge](https://unlayer.com) • #BuiltWithImageEditor**  
> An original, in-universe Grand Theft Auto VI law enforcement terminal designed for the **Vice City Police Department (VCPD)** and **Leonida Department of Corrections**.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Unlayer React Image Editor](https://img.shields.io/badge/Powered%20By-React%20Image%20Editor-ff007a?logo=unlayer)](https://www.npmjs.com/package/@unlayer/react-image-editor)
[![Deployed on Render](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?logo=render&logoColor=white)](https://gta-vi-image-editor.onrender.com/)
[![Web Audio API](https://img.shields.io/badge/Audio-Synthesized%20Web%20Audio-00f0ff)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20%2B%20sessionStorage-fbbf24)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Demo & Submission Links

* 🚀 **Live Production Link:** **[https://gta-vi-image-editor.onrender.com](https://gta-vi-image-editor.onrender.com/)**
* 📦 **Public GitHub Repository:** **[https://github.com/VanzEdward/gta-vi-image-editor](https://github.com/VanzEdward/gta-vi-image-editor)**
* 🏷️ **Official Challenge Tag:** `#BuiltWithImageEditor`
* 🏢 **Organized By:** [Unlayer](https://unlayer.com)

---

## 🎮 The Concept: An Authentic GTA VI In-Game Experience

In Grand Theft Auto VI, Leonida is a sprawling playground of high-speed chases, illicit heists, and neon-lit criminal empires. **Vice City Mugshot Lab** reimagines how law enforcement dossiers and wanted bulletins operate in the GTA universe.

Stepping into the shoes of a VCPD Detective or wanted outlaw, users log into a classified police mainframe terminal to:
1. **Analyze and customize criminal dossiers** (Lucia Caminos, Jason Duval, or any custom uploaded suspect).
2. **Forensically manipulate suspect photos** using the core **React Image Editor** (`@unlayer/react-image-editor`).
3. **Stamp iconic GTA decals** (WASTED, BUSTED, Aviator Shades, Cuban Gold Chains, Police Caution Tape).
4. **Calibrate threat levels & bounties** with synchronized pulsing Wanted Stars and live police radio dispatch tones.
5. **Generate and download official 1000x1400 HD Wanted Bulletins** complete with barcodes, dual mugshot profiles, and caution warnings.

---

## 🛠️ How React Image Editor is Core to the Experience

At the center of the application is **`@unlayer/react-image-editor`**, seamlessly embedded inside an authentic Vice City dark cyber-HUD panel:

* **Forensic Color Grading & Filters:** Apply gritty cyberpunk noir, high-contrast black & white surveillance filters, chromatic saturation, or vintage security camera grades to suspect mugshots.
* **Crop & Align:** Frame photos to mugshot standards or zoom into suspect facial features.
* **Draw & Evidence Markup:** Use high-visibility forensic brush strokes (laser cyan, danger red) to circle tattoos, scars, or points of interest.
* **Text & Typography:** Overlay suspect case notes, aliases, and booking serials directly onto the canvas.
* **Shapes & Annotations:** Frame facial recognition target boxes and forensic badges.
* **Custom GTA Sticker Pack Integration:** A custom-built vector drawer that stamps GTA decals directly onto the image canvas and reloads the editor with undo history.
* **Lossless Export Pipeline:** The image generated inside the React Image Editor directly feeds into the canvas compositor to create the final 1000x1400 high-definition poster.

---

## ✨ Key Features

### 1. 🎨 Custom GTA VI Sticker Pack (12 Vector Decals)
Integrated directly above the photo editor with category filtering (`STAMPS`, `PROPS`, `POLICE`, `EFFECTS`):
* 💥 **WASTED** — Distressed red GTA death stamp with dark drop shadow.
* 🚨 **BUSTED** — Electric blue VCPD custody stamp.
* ⚠️ **EVIDENCE TAPE** — Diagonal *POLICE LINE DO NOT CROSS* crime scene caution tape.
* 🕶️ **MIAMI SHADES** — Gold-rimmed aviator sunglasses with Miami sunset mirror reflections.
* ⛓️ **GOLD CHAIN** — Heavy golden Cuban link gangster chain with `$` medallion.
* 🛡️ **VCPD BADGE** — Official 5-star golden police shield.
* 🔴 **CLASSIFIED** — Angled forensic case stamp: *TOP SECRET // DO NOT DISCLOSE*.
* 🩸 **BULLET HOLE** — Radial shattered glass fractures with bullet impact core.
* 🌴 **VICE PALM** — Synthwave neon magenta & cyan palm tree decal.
* ⚡ **SHOOT ON SIGHT** — NOOSE tactical lethal force authorized banner.
* 📋 **PRISON PLACARD** — Suspect chest booking sign with date & statute.
* ⭐ **5-STAR WANTED** — Golden maximum threat level badge.
* *Includes `↺ UNDO` history stack to step backwards through applied stickers.*

### 2. 🖥️ VCPD Classified Terminal Boot Animation
* Authentic retro CRT terminal with phosphor scanlines, live Leonida EDT clock, and animated terminal logs:
  ```text
  > INITIALIZING VCPD CENTRAL MAINFRAME KERNEL v6.24.9... [OK]
  > CONNECTING ENCRYPTED TUNNEL: LEONIDA STATE CJIS NETWORK... [SECURE]
  > CLEARANCE VERIFICATION: DETECTIVE BADGE AUTHORIZED... [LEVEL 5]
  > MOUNTING CRIMINAL DOSSIERS & LOCAL EVIDENCE CACHE... [5 MOUNTED]
  > ALL SYSTEMS OPERATIONAL. 100% COMPLETE. TERMINAL READY.
  ```
* **Auto-Scrolling Terminal Log:** Text naturally flows upward as new logs print.
* **Timed Button Reveal:** The glowing **`[ ⚡ ACCESS SUSPECT DATABASE & LAUNCH LAB ▶ ]`** button only appears once the system hits 100% complete.
* **Session Persistence:** Powered by `sessionStorage`—once entered, refreshing your browser skips straight into the workspace so work is never interrupted. Shows again upon opening a new tab.

### 3. ⭐ 100% Synchronized Wanted Level Stars
* Escalating 1 to 5 star threat rating with dynamic bounty scaling ($10,000 to $1,000,000) and legal jeopardy descriptions.
* **Synchronized Heartbeat Pulse:** All active stars beat and pulse in 100% lockstep unison, mimicking authentic Grand Theft Auto game HUDs.

### 4. 🎵 100% Native Web Audio API Sound Engine (Zero Audio Files Needed)
* **VICE FM Synthwave Radio:** Real-time synthesized 80s synthwave arpeggios (Am - F - C - G) generated in code.
* **Radio Dispatch (10-99 Alert):** High-priority dual police chime with authentic walkie-talkie mic squelch.
* **Camera Shutter Flash:** Mechanical shutter snap sound when composing posters.
* **Terminal Cyber Chimes:** Ascending frequency tones when authorizing terminal access.
* **Autoplay Resilient:** Seamlessly unlocks on the boot screen button click with dynamic `(TAP TO PLAY)` status cues.

### 5. 📜 Official 1000x1400 HD Wanted Poster Canvas Engine
* High-resolution canvas renderer with aspect-ratio preservation (`object-fit: cover` math to ensure user photos never stretch or compress).
* Features diagonal caution tape, dual mugshot profiles (profile + portrait), VCPD watermark shield, official barcode, and emergency tip line warnings.

### 6. 💾 Offline IndexedDB Session Persistence
* Custom uploaded suspect photos, docket edits, and generated posters automatically persist across browser reloads via IndexedDB.

### 7. 📱 Mobile-First Responsive HUD
* Seamless responsive design featuring tabs to switch between the **Forensic Photo Editor** and **Rap Sheet Docket** on smaller screens.
* Vertically centered terminal boot screen tailored for mobile devices.

### 8. 🔗 Shareable Bulletin Links
* Generates shareable URL query parameters (`?preset=...&name=...&bounty=...&stars=...`) allowing users to share custom criminal bulletins with friends.

---

## 🏆 Submission Criteria Checklist

| Challenge Requirement | Implementation in this Project | Status |
| :--- | :--- | :---: |
| **Original GTA VI-inspired experience** | VCPD criminal database terminal & wanted poster laboratory set in Leonida County. | ✅ PASS |
| **Used React Image Editor as core part** | `@unlayer/react-image-editor` powers all suspect mugshot editing, cropping, filters, drawing, and custom GTA stickers. | ✅ PASS |
| **User can customize at least one visual** | Users can upload custom photos, edit rap sheets, apply stickers, adjust stars, customize bounties, and render posters. | ✅ PASS |
| **Published in a public GitHub repo** | Open source repository with clean commit history and comprehensive documentation. | ✅ PASS |
| **Deployed with working live link** | Deployed on Render with automated SPA fallback configuration (`render.yaml`). | ✅ PASS |
| **Shared with #BuiltWithImageEditor** | Ready for submission and social sharing tagging Unlayer. | ✅ PASS |

---

## 🚀 Local Development Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
* npm (bundled with Node.js)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VanzEdward/gta-vi-image-editor.git
   cd gta-vi-image-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   Navigate to `http://localhost:5173` (or the URL displayed in your terminal).

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## ☁️ Deployment Guide (Render)

This repository includes a pre-configured **`render.yaml`** file for 1-click deployment on Render as a **Static Site**:

### Method 1: Using the Render Dashboard (Recommended)

1. Sign up or log into [Render.com](https://render.com/).
2. Click **New +** and select **Static Site**.
3. Connect your GitHub repository: `VanzEdward/gta-vi-image-editor`.
4. Configure the build settings:
   * **Name:** `gta-vi-image-editor` (or your choice)
   * **Branch:** `main`
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
5. Under **Redirects/Rewrites**:
   * Add a rewrite rule for single-page apps (SPA):
     * **Type:** `Rewrite`
     * **Source:** `/*`
     * **Destination:** `/index.html`
6. Click **Create Static Site**.
7. The site is live and deployed on Render: **[https://gta-vi-image-editor.onrender.com](https://gta-vi-image-editor.onrender.com/)**.

---

## 📂 Project Architecture

```text
gta-editor/
├── public/
│   ├── favicon.svg              # Custom GTA VI VCPD neon tab icon & PWA asset
│   ├── images/                  # Preset suspect mugshots (Lucia, Jason)
│   └── test_poster.html         # Canvas standalone test harness
├── src/
│   ├── components/
│   │   ├── GtaStickerTray.jsx   # Custom GTA VI sticker pack drawer
│   │   ├── GtaStickerTray.css   # Neon sticker tray styles & grid
│   │   ├── TerminalBootScreen.jsx # VCPD tactical CRT boot screen
│   │   └── TerminalBootScreen.css # CRT scanlines, animations, mobile layout
│   ├── utils/
│   │   ├── audio.js             # Native Web Audio API synthesizer (Vice FM, 10-99)
│   │   ├── gtaStickers.js       # 12 custom GTA SVG sticker definitions & canvas stamper
│   │   └── storage.js           # IndexedDB offline session storage utilities
│   ├── App.jsx                  # Main application orchestrator & canvas compositor
│   ├── App.css                  # Layout styles
│   ├── index.css                # GTA VI theme tokens, CRT scanlines, neon gradients
│   └── main.jsx                 # React root entry point
├── render.yaml                  # Automated Render static site blueprint
├── vite.config.js               # Vite build configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # Project documentation
```

---

## 🛠️ Tech Stack

* **Frontend Framework:** [React 18](https://react.dev/)
* **Build Tool:** [Vite 6](https://vitejs.dev/)
* **Core Image Editor:** [@unlayer/react-image-editor](https://www.npmjs.com/package/@unlayer/react-image-editor)
* **Audio Synthesis:** Native Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`)
* **Vector Graphics:** Custom inline SVGs & HTML5 2D Canvas Compositor
* **Persistence:** [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) & `sessionStorage`
* **Hosting:** [Render](https://render.com/)

---

## 👥 Credits & Acknowledgments

* **Challenge:** [Build with React Image Editor Challenge](https://unlayer.com) by **Unlayer**.
* **Inspiration:** Rockstar Games' *Grand Theft Auto VI* and the fictional state of Leonida.
* **Developer:** [VanzEdward](https://github.com/VanzEdward)

---

<p align="center">
  <b>Built with ❤️ and #BuiltWithImageEditor for the Unlayer Developer Challenge</b>
</p>
