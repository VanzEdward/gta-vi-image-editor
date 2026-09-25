/**
 * GTA VI Media Formats Canvas Compositor Engine
 * Generates 3 authentic in-universe GTA media formats:
 * 1. "vcpd-bulletin"  - Official VCPD High-Definition Wanted Bulletin (1000x1400)
 * 2. "weazel-news"    - Weazel News Live TV Breaking News Broadcast (1400x900)
 * 3. "loading-art"    - Official GTA VI Character Splash & Loading Screen Art (1000x1400)
 */

export const MEDIA_TEMPLATES = [
  {
    id: "vcpd-bulletin",
    name: "VCPD Wanted Bulletin",
    icon: "🚨",
    badge: "LAW ENFORCEMENT",
    dimensions: "1000 × 1400 HD",
    desc: "Official Vice City Police Department forensic poster with dual height rulers and barcodes.",
  },
  {
    id: "weazel-news",
    name: "Weazel News Breaking TV",
    icon: "📺",
    badge: "LIVE BROADCAST",
    dimensions: "1400 × 900 16:9",
    desc: "Televised breaking news chopper feed with live lower-third ticker and targeting reticle.",
  },
  {
    id: "loading-art",
    name: "GTA VI Loading Screen Art",
    icon: "🌴",
    badge: "ROCKSTAR ART",
    dimensions: "1000 × 1400 POSTER",
    desc: "Signature GTA VI Miami sunset splash art with iconic VI logo and character quote.",
  },
];

/**
 * 1. Official VCPD Wanted Bulletin Renderer (1000 x 1400)
 */
export function renderVcpdBulletin(ctx, canvas, img, activeSuspect) {
  canvas.width = 1000;
  canvas.height = 1400;

  // 1. Dark Background with subtle Vice gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1400);
  bgGrad.addColorStop(0, "#090d16");
  bgGrad.addColorStop(0.5, "#06080e");
  bgGrad.addColorStop(1, "#020408");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 1400);

  // Neon Outlines
  ctx.strokeStyle = "#ff007a";
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 968, 1368);

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, 948, 1348);

  // 2. Top Header Bar: State of Leonida
  ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
  ctx.fillRect(28, 28, 944, 95);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Chakra Petch', monospace";
  ctx.textAlign = "center";
  ctx.fillText("STATE OF LEONIDA • DEPARTMENT OF LAW ENFORCEMENT", 500, 64);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 14px 'Chakra Petch', monospace";
  ctx.fillText(`VCPD CENTRAL DISPATCH • DOCKET: ${activeSuspect.bookingNo} • STATUS: ACTIVE WARRANT`, 500, 96);

  // 3. Main Title
  ctx.fillStyle = "#ff007a";
  ctx.font = "900 66px 'Outfit', sans-serif";
  ctx.fillText("WANTED BY VCPD", 500, 192);

  // 4. Stars Banner
  ctx.fillStyle = "#fbbf24";
  ctx.font = "38px sans-serif";
  const starsDisplay = "★".repeat(activeSuspect.stars) + "☆".repeat(5 - activeSuspect.stars);
  ctx.fillText(starsDisplay, 500, 242);

  // 5. Suspect Photo Container (Natural Portrait Aspect Ratio Frame)
  const pW = 480;
  const pH = 530;
  const pX = (1000 - pW) / 2; // 260 - centered
  const pY = 265;

  ctx.fillStyle = "#050811";
  ctx.fillRect(pX, pY, pW, pH);

  // Flanking Police Lineup Height Grid
  const heights = ["6'4\"", "6'2\"", "6'0\"", "5'10\"", "5'8\"", "5'6\"", "5'4\""];
  ctx.lineWidth = 1;
  heights.forEach((h, idx) => {
    const lineY = pY + 45 + idx * 68;

    // Left wing ruler
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.beginPath();
    ctx.moveTo(150, lineY);
    ctx.lineTo(pX, lineY);
    ctx.stroke();

    ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
    ctx.font = "11px 'Chakra Petch', monospace";
    ctx.textAlign = "left";
    ctx.fillText(h, 155, lineY - 5);

    // Right wing ruler
    ctx.beginPath();
    ctx.moveTo(pX + pW, lineY);
    ctx.lineTo(850, lineY);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillText(h, 845, lineY - 5);
  });

  // Draw suspect photo with 100% aspect-ratio preservation
  ctx.save();
  ctx.beginPath();
  ctx.rect(pX, pY, pW, pH);
  ctx.clip();

  const imgRatio = img.width / img.height;
  const frameRatio = pW / pH;
  let drawW, drawH, drawX, drawY;

  if (imgRatio > frameRatio) {
    drawH = pH;
    drawW = pH * imgRatio;
    drawX = pX + (pW - drawW) / 2;
    drawY = pY;
  } else {
    drawW = pW;
    drawH = pW / imgRatio;
    drawX = pX;
    drawY = pY + Math.min(0, (pH - drawH) * 0.28);
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  // Subtle inner height ruler ticks
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "11px 'Chakra Petch', monospace";
  ctx.textAlign = "left";

  heights.forEach((h, idx) => {
    const lineY = pY + 45 + idx * 68;
    ctx.beginPath();
    ctx.moveTo(pX, lineY);
    ctx.lineTo(pX + 35, lineY);
    ctx.stroke();
    ctx.fillText(h, pX + 8, lineY - 5);

    ctx.beginPath();
    ctx.moveTo(pX + pW - 35, lineY);
    ctx.lineTo(pX + pW, lineY);
    ctx.stroke();
  });

  ctx.restore();

  // Photo Frame Accent (Neon Cyan)
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(pX, pY, pW, pH);

  // Cyberpunk Corner Accents (Neon Pink)
  ctx.strokeStyle = "#ff007a";
  ctx.lineWidth = 4;
  const cSize = 22;
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(pX - 3, pY + cSize);
  ctx.lineTo(pX - 3, pY - 3);
  ctx.lineTo(pX + cSize, pY - 3);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(pX + pW + 3 - cSize, pY - 3);
  ctx.lineTo(pX + pW + 3, pY - 3);
  ctx.lineTo(pX + pW + 3, pY + cSize);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(pX - 3, pY + pH - cSize);
  ctx.lineTo(pX - 3, pY + pH + 3);
  ctx.lineTo(pX + cSize, pY + pH + 3);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(pX + pW + 3 - cSize, pY + pH + 3);
  ctx.lineTo(pX + pW + 3, pY + pH + 3);
  ctx.lineTo(pX + pW + 3, pY + pH + 3 - cSize);
  ctx.stroke();

  // 6. Angled Warning Stamp
  ctx.save();
  ctx.translate(pX + 115, pY + 75);
  ctx.rotate((-18 * Math.PI) / 180);
  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 4;
  ctx.strokeRect(-110, -26, 220, 52);
  ctx.fillStyle = "rgba(225, 29, 72, 0.32)";
  ctx.fillRect(-110, -26, 220, 52);
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "bold 18px 'Chakra Petch', monospace";
  ctx.textAlign = "center";
  ctx.fillText("ARMED & DANGEROUS", 0, 7);
  ctx.restore();

  // 7. Suspect Dossier Details
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 44px 'Outfit', sans-serif";
  ctx.fillText(activeSuspect.name.toUpperCase(), 500, 835);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 22px 'Chakra Petch', monospace";
  ctx.fillText(`AKA: "${activeSuspect.alias.toUpperCase()}"`, 500, 875);

  ctx.strokeStyle = "rgba(255, 0, 122, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 900);
  ctx.lineTo(860, 900);
  ctx.stroke();

  // Bounty Box
  ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
  ctx.fillRect(140, 925, 720, 100);
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.strokeRect(140, 925, 720, 100);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "700 18px 'Chakra Petch', monospace";
  ctx.fillText("OFFICIAL VCPD CASH REWARD / BOUNTY", 500, 958);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 48px 'Outfit', sans-serif";
  ctx.fillText(`$${activeSuspect.bounty.toLocaleString()}`, 500, 1008);

  // Rap Sheet Details Grid
  const gridY = 1060;
  ctx.textAlign = "left";

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 15px 'Chakra Petch', monospace";
  ctx.fillText("OUTSTANDING CHARGES / WARRANTS:", 140, gridY);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "600 20px 'Outfit', sans-serif";
  ctx.fillText(activeSuspect.charge, 140, gridY + 30);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 15px 'Chakra Petch', monospace";
  ctx.fillText("LAST KNOWN SIGHTING / JURISDICTION:", 140, gridY + 80);

  ctx.fillStyle = "#00f0ff";
  ctx.font = "600 20px 'Outfit', sans-serif";
  ctx.fillText(activeSuspect.location, 140, gridY + 110);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 15px 'Chakra Petch', monospace";
  ctx.fillText("THREAT LEVEL ASSESSMENT:", 140, gridY + 160);

  ctx.fillStyle = "#ff007a";
  ctx.font = "bold 20px 'Chakra Petch', monospace";
  ctx.fillText(activeSuspect.dangerLevel, 140, gridY + 190);

  // 8. Footer Barcode & Tip Line
  ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
  ctx.fillRect(28, 1285, 944, 85);

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 60; i++) {
    const barW = i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 1;
    ctx.fillRect(80 + i * 5, 1305, barW, 45);
  }

  ctx.font = "12px monospace";
  ctx.fillText(activeSuspect.bookingNo, 120, 1362);

  ctx.textAlign = "right";
  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 15px 'Chakra Petch', monospace";
  ctx.fillText("DO NOT ATTEMPT APPREHENSION • SUSPECT IS ARMED", 940, 1320);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px 'Chakra Petch', monospace";
  ctx.fillText("REPORT SIGHTINGS TO VCPD DISPATCH (1-800-VICE-PD)", 940, 1345);
}

/**
 * 2. Weazel News Live TV Broadcast Renderer (1400 x 900 widescreen 16:9 format)
 */
export function renderWeazelNews(ctx, canvas, img, activeSuspect) {
  canvas.width = 1400;
  canvas.height = 900;

  // 1. Dark Surveillance Studio Background
  ctx.fillStyle = "#020409";
  ctx.fillRect(0, 0, 1400, 900);

  // 2. Suspect Photo with CCTV/Broadcast Grade Framing
  const photoW = 780;
  const photoH = 680;
  const photoX = 310;
  const photoY = 40;

  ctx.save();
  ctx.beginPath();
  ctx.rect(photoX, photoY, photoW, photoH);
  ctx.clip();

  // Aspect-ratio cover
  const imgRatio = img.width / img.height;
  const frameRatio = photoW / photoH;
  let dW, dH, dX, dY;

  if (imgRatio > frameRatio) {
    dH = photoH;
    dW = photoH * imgRatio;
    dX = photoX + (photoW - dW) / 2;
    dY = photoY;
  } else {
    dW = photoW;
    dH = photoW / imgRatio;
    dX = photoX;
    dY = photoY + Math.min(0, (photoH - dH) * 0.25);
  }

  ctx.drawImage(img, dX, dY, dW, dH);

  // Surveillance Scanlines Overlay on Image
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  for (let y = photoY; y < photoY + photoH; y += 4) {
    ctx.fillRect(photoX, y, photoW, 1.5);
  }

  // Vignette darkening at corners
  const vig = ctx.createRadialGradient(
    photoX + photoW / 2, photoY + photoH / 2, 100,
    photoX + photoW / 2, photoY + photoH / 2, 450
  );
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(2, 6, 23, 0.75)");
  ctx.fillStyle = vig;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  ctx.restore();

  // Photo Frame Border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // 3. Helicopter Target Reticle / HUD Crosshairs
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 2;
  const rSize = 40;
  const cx = photoX + photoW / 2;
  const cy = photoY + photoH / 2 - 20;

  // Center Reticle
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - 95, cy);
  ctx.lineTo(cx - 60, cy);
  ctx.moveTo(cx + 60, cy);
  ctx.lineTo(cx + 95, cy);
  ctx.moveTo(cx, cy - 95);
  ctx.lineTo(cx, cy - 60);
  ctx.moveTo(cx, cy + 60);
  ctx.lineTo(cx, cy + 95);
  ctx.stroke();

  // Target Box Brackets around suspect
  const bx = photoX + 110;
  const by = photoY + 70;
  const bw = photoW - 220;
  const bh = photoH - 180;
  ctx.strokeStyle = "#ff007a";
  ctx.lineWidth = 3;

  // Bracket Corners
  ctx.beginPath();
  ctx.moveTo(bx, by + rSize); ctx.lineTo(bx, by); ctx.lineTo(bx + rSize, by);
  ctx.moveTo(bx + bw - rSize, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + rSize);
  ctx.moveTo(bx, by + bh - rSize); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + rSize, by + bh);
  ctx.moveTo(bx + bw - rSize, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - rSize);
  ctx.stroke();

  // Target Label
  ctx.fillStyle = "#00f0ff";
  ctx.font = "bold 13px 'Chakra Petch', monospace";
  ctx.textAlign = "left";
  ctx.fillText(`[ TARGET LOCK: ${activeSuspect.name.toUpperCase()} ]`, bx + 10, by - 8);
  ctx.fillText(`[ THREAT: ${"★".repeat(activeSuspect.stars)} // SIGHTED: ${activeSuspect.location.toUpperCase()} ]`, bx + 10, by + bh + 22);

  // 4. Left Flank: Camera Flight Telemetry
  ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
  ctx.fillRect(30, 40, 260, 680);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 40, 260, 680);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 15px 'Chakra Petch', monospace";
  ctx.fillText("FLIGHT TELEMETRY", 50, 75);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "12px 'Chakra Petch', monospace";
  const teleY = 110;
  ctx.fillText("UNIT: CHOPPER 4 SKY-EYE", 50, teleY);
  ctx.fillText("ALTITUDE: 840 FT MSL", 50, teleY + 30);
  ctx.fillText("SPEED: 114 KTS", 50, teleY + 60);
  ctx.fillText("OPTICAL ZOOM: 18.4X", 50, teleY + 90);
  ctx.fillText("CAM MODE: COLOR HD", 50, teleY + 120);
  ctx.fillText("FREQ: 462.575 MHz", 50, teleY + 150);
  ctx.fillText("GPS LAT: 25.7617° N", 50, teleY + 180);
  ctx.fillText("GPS LON: 80.1918° W", 50, teleY + 210);

  // Mini Radar Circle in Left Panel
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(160, teleY + 330, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(160, teleY + 330, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(90, teleY + 330); ctx.lineTo(230, teleY + 330);
  ctx.moveTo(160, teleY + 260); ctx.lineTo(160, teleY + 400);
  ctx.stroke();
  // Blip
  ctx.fillStyle = "#ff007a";
  ctx.beginPath();
  ctx.arc(175, teleY + 315, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px 'Chakra Petch', monospace";
  ctx.textAlign = "center";
  ctx.fillText("RADAR SWEEP ONLINE", 160, teleY + 430);

  // 5. Right Flank: Weazel News Quick Profile
  ctx.fillStyle = "rgba(10, 15, 30, 0.85)";
  ctx.fillRect(1110, 40, 260, 680);
  ctx.strokeStyle = "#1e293b";
  ctx.strokeRect(1110, 40, 260, 680);

  ctx.textAlign = "left";
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 15px 'Chakra Petch', monospace";
  ctx.fillText("WANTED RAP SHEET", 1130, 75);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'Chakra Petch', monospace";
  ctx.fillText("SUSPECT:", 1130, 110);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px 'Outfit', sans-serif";
  ctx.fillText(activeSuspect.name, 1130, 134);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'Chakra Petch', monospace";
  ctx.fillText("KNOWN ALIAS:", 1130, 170);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 15px 'Chakra Petch', monospace";
  ctx.fillText(`"${activeSuspect.alias}"`, 1130, 194);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'Chakra Petch', monospace";
  ctx.fillText("CHARGES:", 1130, 230);
  ctx.fillStyle = "#f87171";
  ctx.font = "bold 13px 'Outfit', sans-serif";
  ctx.fillText(activeSuspect.charge.substring(0, 24) + "...", 1130, 254);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'Chakra Petch', monospace";
  ctx.fillText("BOUNTY REWARD:", 1130, 290);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 24px 'Outfit', sans-serif";
  ctx.fillText(`$${activeSuspect.bounty.toLocaleString()}`, 1130, 320);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px 'Chakra Petch', monospace";
  ctx.fillText("WANTED THREAT:", 1130, 360);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "20px sans-serif";
  ctx.fillText("★".repeat(activeSuspect.stars) + "☆".repeat(5 - activeSuspect.stars), 1130, 390);

  ctx.fillStyle = "rgba(225, 29, 72, 0.2)";
  ctx.fillRect(1130, 420, 220, 80);
  ctx.strokeStyle = "#e11d48";
  ctx.strokeRect(1130, 420, 220, 80);
  ctx.fillStyle = "#ff4d6d";
  ctx.font = "bold 13px 'Chakra Petch', monospace";
  ctx.fillText("LEONIDA POLICE ADVISORY:", 1140, 445);
  ctx.fillStyle = "#ffffff";
  ctx.font = "11px 'Chakra Petch', monospace";
  ctx.fillText("ARMED // EXTREMELY DANGEROUS", 1140, 470);
  ctx.fillText("DO NOT ATTEMPT APPREHENSION", 1140, 488);

  // 6. Top Left: REC Status Indicator
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(335, 65, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Chakra Petch', monospace";
  ctx.fillText("REC ● 1080i HD", 352, 70);

  // 7. Top Right: WEAZEL NEWS Official Logo
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(890, 52, 180, 46);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px 'Outfit', sans-serif";
  ctx.fillText("WEAZEL", 902, 84);

  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(1005, 52, 65, 46);
  ctx.fillStyle = "#000000";
  ctx.font = "900 22px 'Outfit', sans-serif";
  ctx.fillText("NEWS", 1010, 84);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "italic 600 10px 'Chakra Petch', monospace";
  ctx.fillText("CONFIRMING YOUR PREJUDICES", 894, 114);

  // 8. Bottom Broadcast Lower-Third Banner
  const bannerY = 740;

  // Red breaking news header pill
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(30, bannerY, 320, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 15px 'Outfit', sans-serif";
  ctx.fillText("🔴 LIVE BREAKING NEWS", 50, bannerY + 24);

  // Main dark caption box
  ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
  ctx.fillRect(30, bannerY + 36, 1340, 68);
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, bannerY + 36, 1340, 68);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px 'Outfit', sans-serif";
  ctx.fillText(
    `POLICE MANHUNT: ${activeSuspect.name.toUpperCase()} SOUGHT BY VCPD TACTICAL UNITS`,
    50,
    bannerY + 78
  );

  // Ticker bar (Yellow with black text)
  ctx.fillStyle = "#facc15";
  ctx.fillRect(30, bannerY + 104, 1340, 34);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 13px 'Chakra Petch', monospace";
  ctx.fillText(
    `⚠️ VCPD BULLETIN // CHARGES: ${activeSuspect.charge.toUpperCase()} • SIGHTED: ${activeSuspect.location.toUpperCase()} • REWARD: $${activeSuspect.bounty.toLocaleString()} • REPORT SIGHTINGS TO WEAZEL TIP-LINE 1-800-WEAZEL-TIP ⚠️`,
    40,
    bannerY + 126
  );
}

/**
 * 3. Official GTA VI Loading Screen Art Renderer (1000 x 1400)
 */
export function renderLoadingScreenArt(ctx, canvas, img, activeSuspect) {
  canvas.width = 1000;
  canvas.height = 1400;

  // 1. Miami Vice Sunset Gradient Background
  const bg = ctx.createLinearGradient(0, 0, 1000, 1400);
  bg.addColorStop(0, "#080b14");
  bg.addColorStop(0.3, "#210729");
  bg.addColorStop(0.65, "#a2005a");
  bg.addColorStop(0.88, "#e63946");
  bg.addColorStop(1, "#f4a261");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1000, 1400);

  // Diagonal Retro Grid Lines in Lower Background
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1.5;
  for (let x = -500; x < 1500; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 1400);
    ctx.lineTo(x + 500, 700);
    ctx.stroke();
  }

  // 2. Iconic GTA VI Diagonal Cut-Out Frame
  const fX = 80;
  const fY = 160;
  const fW = 840;
  const fH = 760;

  // Frame Drop Shadow / Outer Glow
  ctx.save();
  ctx.shadowColor = "rgba(255, 0, 122, 0.6)";
  ctx.shadowBlur = 35;
  ctx.fillStyle = "#060810";
  ctx.fillRect(fX, fY, fW, fH);
  ctx.restore();

  // Draw Suspect Photo inside Frame
  ctx.save();
  ctx.beginPath();
  ctx.rect(fX, fY, fW, fH);
  ctx.clip();

  // Aspect-ratio cover
  const imgRatio = img.width / img.height;
  const frameRatio = fW / fH;
  let dW, dH, dX, dY;

  if (imgRatio > frameRatio) {
    dH = fH;
    dW = fH * imgRatio;
    dX = fX + (fW - dW) / 2;
    dY = fY;
  } else {
    dW = fW;
    dH = fW / imgRatio;
    dX = fX;
    dY = fY + Math.min(0, (fH - dH) * 0.22);
  }

  ctx.drawImage(img, dX, dY, dW, dH);

  // Vignette Gradient inside Photo Frame
  const frameVig = ctx.createLinearGradient(0, fY, 0, fY + fH);
  frameVig.addColorStop(0, "rgba(0, 0, 0, 0.15)");
  frameVig.addColorStop(0.65, "transparent");
  frameVig.addColorStop(1, "rgba(7, 10, 20, 0.85)");
  ctx.fillStyle = frameVig;
  ctx.fillRect(fX, fY, fW, fH);

  ctx.restore();

  // Vibrant Frame Borders
  ctx.strokeStyle = "#ff007a";
  ctx.lineWidth = 5;
  ctx.strokeRect(fX, fY, fW, fH);

  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(fX + 6, fY + 6, fW - 12, fH - 12);

  // 3. Iconic Grand Theft Auto VI Logo Typography
  // GTA Title Text
  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 6;
  ctx.font = "900 32px 'Outfit', sans-serif";
  ctx.strokeText("grand theft auto", 85, 95);
  ctx.fillText("grand theft auto", 85, 95);

  // Giant Roman Numeral "VI"
  const viGrad = ctx.createLinearGradient(420, 40, 560, 130);
  viGrad.addColorStop(0, "#ff007a");
  viGrad.addColorStop(0.5, "#ff5500");
  viGrad.addColorStop(1, "#ffd700");
  ctx.fillStyle = viGrad;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.font = "900 86px 'Outfit', sans-serif";
  ctx.strokeText("VI", 390, 108);
  ctx.fillText("VI", 390, 108);

  // Subtitle
  ctx.fillStyle = "#00f0ff";
  ctx.font = "bold 14px 'Chakra Petch', monospace";
  ctx.fillText("LEONIDA EDITION // 2026", 85, 125);
  ctx.restore();

  // 4. Rockstar Games Watermark Star in Top Right
  ctx.save();
  ctx.fillStyle = "#fbbf24";
  ctx.font = "42px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("★", 915, 95);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px 'Chakra Petch', monospace";
  ctx.fillText("ROCKSTAR GAMES", 915, 118);
  ctx.restore();

  // 5. Suspect Name & Lore Card
  const cardY = 960;
  ctx.fillStyle = "rgba(7, 10, 20, 0.95)";
  ctx.fillRect(80, cardY, 840, 320);
  ctx.strokeStyle = "rgba(255, 0, 122, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, cardY, 840, 320);

  // Name Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px 'Outfit', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(activeSuspect.name.toUpperCase(), 110, cardY + 65);

  // Alias Pill
  ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
  ctx.fillRect(110, cardY + 85, 340, 38);
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(110, cardY + 85, 340, 38);

  ctx.fillStyle = "#00f0ff";
  ctx.font = "bold 18px 'Chakra Petch', monospace";
  ctx.fillText(`AKA: "${activeSuspect.alias.toUpperCase()}"`, 125, cardY + 110);

  // Bounty & Wanted Rating (Right Aligned on Card)
  ctx.textAlign = "right";
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 40px 'Outfit', sans-serif";
  ctx.fillText(`$${activeSuspect.bounty.toLocaleString()}`, 890, cardY + 68);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "26px sans-serif";
  ctx.fillText("★".repeat(activeSuspect.stars) + "☆".repeat(5 - activeSuspect.stars), 890, cardY + 105);

  // Divider
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(110, cardY + 145);
  ctx.lineTo(890, cardY + 145);
  ctx.stroke();

  // Character Lore Quote
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffcc00";
  ctx.font = "italic 700 20px 'Outfit', sans-serif";
  ctx.fillText('"IN LEONIDA, THE ONLY REAL CRIME IS GETTING CAUGHT."', 110, cardY + 185);

  // Rap Sheet Synopsis
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "600 16px 'Chakra Petch', monospace";
  ctx.fillText(`CRIME: ${activeSuspect.charge}`, 110, cardY + 225);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 16px 'Chakra Petch', monospace";
  ctx.fillText(`TURF / SIGHTING: ${activeSuspect.location}`, 110, cardY + 258);

  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 15px 'Chakra Petch', monospace";
  ctx.fillText(`THREAT ASSESSMENT: ${activeSuspect.dangerLevel}`, 110, cardY + 290);

  // 6. Bottom Loading Screen Status
  ctx.fillStyle = "rgba(10, 15, 25, 0.9)";
  ctx.fillRect(80, 1300, 840, 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'Chakra Petch', monospace";
  ctx.textAlign = "left";
  ctx.fillText("LOADING LEONIDA HEISTS & OPEN WORLD...", 110, 1332);

  ctx.textAlign = "right";
  ctx.fillStyle = "#00f0ff";
  ctx.fillText("[ INITIALIZING STORY MODE ]", 890, 1332);
}

/**
 * Master dispatcher that executes the chosen media template
 */
export function renderGtaMediaFormat(templateId, canvas, sourceImageUrl, activeSuspect, callback) {
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    switch (templateId) {
      case "weazel-news":
        renderWeazelNews(ctx, canvas, img, activeSuspect);
        break;
      case "loading-art":
        renderLoadingScreenArt(ctx, canvas, img, activeSuspect);
        break;
      case "vcpd-bulletin":
      default:
        renderVcpdBulletin(ctx, canvas, img, activeSuspect);
        break;
    }

    const dataUrl = canvas.toDataURL("image/png");
    if (callback) callback(dataUrl);
  };

  img.src = sourceImageUrl;
}
