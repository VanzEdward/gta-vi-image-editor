// GTA VI Custom Sticker Pack for Vice City Mugshot Lab
// 100% SVG Vector Decals - Authentic Grand Theft Auto & Vice City Aesthetics

function encodeSvg(svgString) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString.trim());
}

export const GTA_STICKERS = [
  {
    id: "wasted",
    name: "WASTED",
    category: "stamps",
    placement: "bottom",
    scaleWidthRatio: 0.85,
    tagline: "Iconic GTA Red Stamp",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150" width="600" height="150">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.95"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="580" height="130" fill="rgba(15, 0, 5, 0.75)" stroke="#e11d48" stroke-width="5" rx="8" filter="url(#shadow)"/>
        <line x1="25" y1="20" x2="575" y2="20" stroke="#ff4d6d" stroke-width="2" stroke-dasharray="12, 6"/>
        <line x1="25" y1="130" x2="575" y2="130" stroke="#ff4d6d" stroke-width="2" stroke-dasharray="12, 6"/>
        <text x="300" y="98" fill="#e11d48" font-family="'Impact', 'Arial Black', sans-serif" font-size="78" font-weight="900" letter-spacing="16" text-anchor="middle" filter="url(#shadow)">
          WASTED
        </text>
        <text x="300" y="98" fill="#ffffff" font-family="'Impact', 'Arial Black', sans-serif" font-size="78" font-weight="900" letter-spacing="16" text-anchor="middle" fill-opacity="0.15">
          WASTED
        </text>
      </svg>
    `),
  },
  {
    id: "busted",
    name: "BUSTED",
    category: "stamps",
    placement: "bottom",
    scaleWidthRatio: 0.85,
    tagline: "VCPD Arrest Stamp",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 150" width="600" height="150">
        <defs>
          <filter id="busted-glow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#0284c7" flood-opacity="0.85"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="580" height="130" fill="rgba(2, 20, 45, 0.82)" stroke="#00f0ff" stroke-width="5" rx="8" filter="url(#busted-glow)"/>
        <rect x="20" y="20" width="560" height="110" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8, 4"/>
        <text x="300" y="98" fill="#38bdf8" font-family="'Impact', 'Arial Black', sans-serif" font-size="78" font-weight="900" letter-spacing="16" text-anchor="middle" filter="url(#busted-glow)">
          BUSTED
        </text>
        <text x="300" y="122" fill="#00f0ff" font-family="'Courier New', monospace" font-size="14" font-weight="700" letter-spacing="4" text-anchor="middle">
          // VCPD CUSTODY RECORD //
        </text>
      </svg>
    `),
  },
  {
    id: "caution-tape",
    name: "EVIDENCE TAPE",
    category: "police",
    placement: "diagonal-banner",
    scaleWidthRatio: 1.15,
    tagline: "Police Line Crime Tape",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 90" width="700" height="90">
        <defs>
          <pattern id="stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="40" fill="#facc15"/>
            <rect x="20" width="20" height="40" fill="#0f172a"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="700" height="90" fill="#facc15" stroke="#0f172a" stroke-width="4"/>
        <rect x="0" y="0" width="700" height="14" fill="url(#stripes)"/>
        <rect x="0" y="76" width="700" height="14" fill="url(#stripes)"/>
        <text x="350" y="54" fill="#0f172a" font-family="'Impact', 'Arial Black', sans-serif" font-size="28" font-weight="900" letter-spacing="5" text-anchor="middle">
          ★ POLICE LINE DO NOT CROSS ★ VCPD FORENSICS ★
        </text>
      </svg>
    `),
  },
  {
    id: "aviator-shades",
    name: "MIAMI SHADES",
    category: "props",
    placement: "eyes",
    scaleWidthRatio: 0.58,
    tagline: "80s Sunset Mirrored Shades",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="500" height="200">
        <defs>
          <linearGradient id="sunsetLens" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b"/>
            <stop offset="45%" stop-color="#ff007a"/>
            <stop offset="75%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#00f0ff"/>
          </linearGradient>
          <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.8"/>
          </filter>
        </defs>
        <!-- Bridge and top brow bar -->
        <path d="M 120 45 L 380 45" stroke="#fbbf24" stroke-width="6" stroke-linecap="round" filter="url(#goldGlow)"/>
        <path d="M 215 70 Q 250 50 285 70" stroke="#fbbf24" stroke-width="6" fill="none" stroke-linecap="round"/>
        <!-- Left Lens (Teardrop Aviator) -->
        <path d="M 90 55 C 200 50, 220 75, 215 130 C 210 185, 120 180, 85 135 C 65 105, 60 60, 90 55 Z" 
              fill="url(#sunsetLens)" stroke="#fbbf24" stroke-width="7" filter="url(#goldGlow)"/>
        <!-- Right Lens (Teardrop Aviator) -->
        <path d="M 285 130 C 280 75, 300 50, 410 55 C 440 60, 435 105, 415 135 C 380 180, 290 185, 285 130 Z" 
              fill="url(#sunsetLens)" stroke="#fbbf24" stroke-width="7" filter="url(#goldGlow)"/>
        <!-- White glare reflections -->
        <path d="M 95 70 Q 150 65 170 90" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M 330 70 Q 380 65 400 90" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: "gold-chain",
    name: "GOLD CHAIN",
    category: "props",
    placement: "chest",
    scaleWidthRatio: 0.65,
    tagline: "Heavy Gangster Cuban Link",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260" width="500" height="260">
        <defs>
          <filter id="chainShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.85"/>
          </filter>
        </defs>
        <!-- Chain links draped in deep curve -->
        <path d="M 80 30 Q 250 250 420 30" fill="none" stroke="#b45309" stroke-width="26" stroke-linecap="round" filter="url(#chainShadow)"/>
        <path d="M 80 30 Q 250 250 420 30" fill="none" stroke="#fbbf24" stroke-width="20" stroke-linecap="round"/>
        <path d="M 80 30 Q 250 250 420 30" fill="none" stroke="#fef08a" stroke-width="8" stroke-dasharray="14, 12" stroke-linecap="round"/>
        <!-- Big $ Medallion Pendant -->
        <circle cx="250" cy="180" r="42" fill="#d97706" stroke="#fef08a" stroke-width="5" filter="url(#chainShadow)"/>
        <circle cx="250" cy="180" r="34" fill="#fbbf24"/>
        <text x="250" y="202" fill="#78350f" font-family="'Impact', sans-serif" font-size="46" font-weight="900" text-anchor="middle">
          $
        </text>
      </svg>
    `),
  },
  {
    id: "vcpd-badge",
    name: "VCPD BADGE",
    category: "police",
    placement: "slanted-top-right",
    scaleWidthRatio: 0.38,
    tagline: "Golden 5-Star Police Shield",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" width="300" height="340">
        <defs>
          <filter id="badgeGlow">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.9"/>
          </filter>
        </defs>
        <!-- Shield body -->
        <path d="M 150 15 L 275 60 C 275 210, 150 310, 150 310 C 150 310, 25 210, 25 60 Z" 
              fill="#1e293b" stroke="#fbbf24" stroke-width="8" filter="url(#badgeGlow)"/>
        <path d="M 150 30 L 255 70 C 255 195, 150 285, 150 285 C 150 285, 45 195, 45 70 Z" 
              fill="none" stroke="#d97706" stroke-width="3"/>
        <!-- Star & Texts -->
        <text x="150" y="105" fill="#fbbf24" font-family="'Impact', sans-serif" font-size="28" font-weight="900" letter-spacing="3" text-anchor="middle">
          VICE CITY
        </text>
        <circle cx="150" cy="165" r="48" fill="#fbbf24" stroke="#fef08a" stroke-width="3"/>
        <text x="150" y="180" fill="#78350f" font-family="'Impact', sans-serif" font-size="42" font-weight="900" text-anchor="middle">
          ★
        </text>
        <text x="150" y="245" fill="#f8fafc" font-family="'Impact', sans-serif" font-size="34" font-weight="900" letter-spacing="4" text-anchor="middle">
          POLICE
        </text>
        <text x="150" y="275" fill="#00f0ff" font-family="'Courier New', monospace" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">
          OFFICER #0984
        </text>
      </svg>
    `),
  },
  {
    id: "classified",
    name: "CLASSIFIED",
    category: "stamps",
    placement: "slanted-top-right",
    scaleWidthRatio: 0.55,
    tagline: "Red Angled Case Stamp",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 140" width="450" height="140">
        <defs>
          <filter id="stampShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.8"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="430" height="120" fill="rgba(225, 29, 72, 0.28)" stroke="#e11d48" stroke-width="6" rx="6" filter="url(#stampShadow)"/>
        <rect x="18" y="18" width="414" height="104" fill="none" stroke="#e11d48" stroke-width="2" stroke-dasharray="10, 5"/>
        <text x="225" y="75" fill="#e11d48" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="8" text-anchor="middle">
          CLASSIFIED
        </text>
        <text x="225" y="105" fill="#f43f5e" font-family="'Courier New', monospace" font-size="16" font-weight="700" letter-spacing="4" text-anchor="middle">
          TOP SECRET // DO NOT DISCLOSE
        </text>
      </svg>
    `),
  },
  {
    id: "bullet-hole",
    name: "BULLET HOLE",
    category: "effects",
    placement: "top",
    scaleWidthRatio: 0.35,
    tagline: "Shattered Glass Puncture",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <defs>
          <radialGradient id="hole">
            <stop offset="0%" stop-color="#000000"/>
            <stop offset="65%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#475569"/>
          </radialGradient>
        </defs>
        <!-- Fractured glass cracks radiating -->
        <path d="M 150 150 L 40 40 M 150 150 L 260 30 M 150 150 L 280 180 M 150 150 L 210 270 M 150 150 L 80 260 M 150 150 L 20 170" 
              stroke="#ffffff" stroke-width="3" opacity="0.85" stroke-linecap="round"/>
        <path d="M 150 150 L 90 90 M 150 150 L 200 80 M 150 150 L 220 160 M 150 150 L 180 220 M 150 150 L 110 210 M 150 150 L 70 160" 
              stroke="#00f0ff" stroke-width="2" opacity="0.7"/>
        <!-- Concentric shattered rings -->
        <circle cx="150" cy="150" r="75" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-dasharray="15, 10"/>
        <circle cx="150" cy="150" r="45" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.8" stroke-dasharray="8, 6"/>
        <!-- Bullet Hole Entry Core -->
        <circle cx="150" cy="150" r="28" fill="url(#hole)" stroke="#0f172a" stroke-width="4"/>
      </svg>
    `),
  },
  {
    id: "neon-palm",
    name: "VICE PALM",
    category: "props",
    placement: "slanted-top-right",
    scaleWidthRatio: 0.38,
    tagline: "Synthwave Miami Palm",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" width="300" height="320">
        <defs>
          <filter id="neonGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ff007a" flood-opacity="0.9"/>
          </filter>
        </defs>
        <!-- Curved trunk -->
        <path d="M 110 310 Q 170 200 150 110" fill="none" stroke="#00f0ff" stroke-width="12" stroke-linecap="round"/>
        <!-- Palm fronds -->
        <path d="M 150 110 Q 80 40 20 80 Q 90 90 150 110" fill="#ff007a" filter="url(#neonGlow)"/>
        <path d="M 150 110 Q 150 20 150 10 Q 170 50 150 110" fill="#ff007a" filter="url(#neonGlow)"/>
        <path d="M 150 110 Q 220 40 280 80 Q 210 90 150 110" fill="#ff007a" filter="url(#neonGlow)"/>
        <path d="M 150 110 Q 230 110 270 140 Q 200 140 150 110" fill="#00f0ff"/>
        <path d="M 150 110 Q 70 110 30 140 Q 100 140 150 110" fill="#00f0ff"/>
      </svg>
    `),
  },
  {
    id: "shoot-on-sight",
    name: "SHOOT ON SIGHT",
    category: "police",
    placement: "bottom",
    scaleWidthRatio: 0.8,
    tagline: "NOOSE Tactical Warning",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 130" width="550" height="130">
        <defs>
          <filter id="sosShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.9"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="530" height="110" fill="#881337" stroke="#fbbf24" stroke-width="5" rx="6" filter="url(#sosShadow)"/>
        <text x="275" y="62" fill="#ffffff" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" letter-spacing="6" text-anchor="middle">
          ⚡ SHOOT ON SIGHT ⚡
        </text>
        <text x="275" y="98" fill="#fbbf24" font-family="'Courier New', monospace" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle">
          NOOSE // TACTICAL LETHAL FORCE AUTHORIZED
        </text>
      </svg>
    `),
  },
  {
    id: "booking-sign",
    name: "PRISON PLACARD",
    category: "props",
    placement: "chest",
    scaleWidthRatio: 0.75,
    tagline: "Suspect Mugshot Signboard",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 160" width="500" height="160">
        <defs>
          <filter id="boardShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.9"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="480" height="140" fill="#090d16" stroke="#e2e8f0" stroke-width="4" rx="4" filter="url(#boardShadow)"/>
        <rect x="18" y="18" width="464" height="34" fill="#1e293b"/>
        <text x="250" y="41" fill="#f8fafc" font-family="'Arial Black', sans-serif" font-size="15" font-weight="900" letter-spacing="2" text-anchor="middle">
          LEONIDA DEPT. OF CORRECTIONS
        </text>
        <text x="250" y="95" fill="#fbbf24" font-family="'Impact', monospace" font-size="42" font-weight="900" letter-spacing="5" text-anchor="middle">
          VCPD-2026-984A
        </text>
        <text x="250" y="132" fill="#94a3b8" font-family="'Courier New', monospace" font-size="12" font-weight="700" letter-spacing="2" text-anchor="middle">
          BOOKING DATE: 2026-09-24 // STAT: FELONY
        </text>
      </svg>
    `),
  },
  {
    id: "five-stars",
    name: "5-STAR WANTED",
    category: "police",
    placement: "top",
    scaleWidthRatio: 0.65,
    tagline: "Maximum Wanted Level",
    svgDataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 120" width="450" height="120">
        <defs>
          <filter id="starGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#fbbf24" flood-opacity="0.95"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="430" height="100" fill="rgba(15, 23, 42, 0.88)" stroke="#fbbf24" stroke-width="3" rx="8"/>
        <text x="225" y="65" fill="#fbbf24" font-size="48" letter-spacing="10" text-anchor="middle" filter="url(#starGlow)">
          ★★★★★
        </text>
        <text x="225" y="94" fill="#fef08a" font-family="'Impact', sans-serif" font-size="16" font-weight="900" letter-spacing="4" text-anchor="middle">
          MAXIMUM THREAT LEVEL
        </text>
      </svg>
    `),
  },
];

// Helper: Apply sticker to image using an offscreen canvas
export function applyStickerToImage(sourceImageUrl, sticker, customPlacement = null) {
  return new Promise((resolve, reject) => {
    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";

    baseImg.onload = () => {
      const stickerImg = new Image();
      stickerImg.onload = () => {
        const canvas = document.createElement("canvas");
        const W = baseImg.naturalWidth || baseImg.width || 800;
        const H = baseImg.naturalHeight || baseImg.height || 1000;
        canvas.width = W;
        canvas.height = H;

        const ctx = canvas.getContext("2d");

        // 1. Draw base photo
        ctx.drawImage(baseImg, 0, 0, W, H);

        // 2. Calculate sticker placement
        const placement = customPlacement || sticker.placement || "center";
        const targetRatio = sticker.scaleWidthRatio || 0.7;

        let sw = W * targetRatio;
        let sh = sw * (stickerImg.naturalHeight / stickerImg.naturalWidth);
        let sx = (W - sw) / 2;
        let sy = (H - sh) / 2;

        if (placement === "bottom") {
          sy = H * 0.74 - sh / 2;
        } else if (placement === "top") {
          sy = H * 0.08;
        } else if (placement === "eyes") {
          sy = H * 0.33 - sh / 2;
          sw = W * 0.58;
          sh = sw * (stickerImg.naturalHeight / stickerImg.naturalWidth);
          sx = (W - sw) / 2;
        } else if (placement === "chest") {
          sy = H * 0.65 - sh / 2;
          sw = W * 0.68;
          sh = sw * (stickerImg.naturalHeight / stickerImg.naturalWidth);
          sx = (W - sw) / 2;
        } else if (placement === "slanted-top-right") {
          ctx.save();
          ctx.translate(W * 0.75, H * 0.22);
          ctx.rotate((-18 * Math.PI) / 180);
          ctx.drawImage(stickerImg, -sw / 2, -sh / 2, sw, sh);
          ctx.restore();
          resolve(canvas.toDataURL("image/png"));
          return;
        } else if (placement === "diagonal-banner") {
          ctx.save();
          ctx.translate(W * 0.5, H * 0.82);
          ctx.rotate((-12 * Math.PI) / 180);
          sw = W * 1.18;
          sh = sw * (stickerImg.naturalHeight / stickerImg.naturalWidth);
          ctx.drawImage(stickerImg, -sw / 2, -sh / 2, sw, sh);
          ctx.restore();
          resolve(canvas.toDataURL("image/png"));
          return;
        }

        ctx.drawImage(stickerImg, sx, sy, sw, sh);
        resolve(canvas.toDataURL("image/png"));
      };

      stickerImg.onerror = (err) => reject(new Error("Failed to load sticker SVG: " + err));
      stickerImg.src = sticker.svgDataUrl;
    };

    baseImg.onerror = (err) => reject(new Error("Failed to load source image: " + err));
    baseImg.src = sourceImageUrl;
  });
}
