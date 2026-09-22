import React, { useState, useRef, useEffect, useCallback } from "react";
import ImageEditor from "@unlayer/react-image-editor";
import {
  playClickSound,
  playStarSound,
  playShutterSound,
  playDispatchSound,
  toggleSynthwaveMusic,
} from "./utils/audio";

const PRESET_SUSPECTS = [
  {
    id: "lucia-booking",
    name: "LUCIA CAMINOS",
    alias: "THE VICE RUNNER",
    url: "/images/lucia_mugshot.jpg",
    charge: "Armed Bank Robbery & Evading VCPD",
    bounty: 750000,
    stars: 4,
    location: "Ocean Beach / Washington Ave",
    dangerLevel: "ARMED & EXTREMELY DANGEROUS",
    bookingNo: "VCPD-2026-0984A",
  },
  {
    id: "jason-pursuit",
    name: "JASON DUVAL",
    alias: "LEONIDA OUTLAW",
    url: "/images/jason_mugshot.jpg",
    charge: "Grand Theft Auto & Tactical Weapons Trafficking",
    bounty: 500000,
    stars: 4,
    location: "Starfish Island Causeway",
    dangerLevel: "ARMED & DANGEROUS",
    bookingNo: "VCPD-2026-1102B",
  },
  {
    id: "bank-vault",
    name: "UNIDENTIFIED CREW",
    alias: "THE DOWNTOWN SYNDICATE",
    url: "/images/bank_heist_cctv.jpg",
    charge: "Vice City Trust Federal Vault Breach",
    bounty: 1000000,
    stars: 5,
    location: "Downtown Financial District",
    dangerLevel: "TACTICAL THREAT - SHOOT ON SIGHT",
    bookingNo: "VCPD-2026-9900X",
  },
  {
    id: "vice-port",
    name: "MARCO 'EL TIBURON' RIVERA",
    alias: "THE HARBOR PHANTOM",
    url: "/images/marco_mugshot.jpg",
    charge: "Contraband Smuggling & Speedboat Evading",
    bounty: 250000,
    stars: 3,
    location: "Vice Port Pier 4",
    dangerLevel: "FLIGHT RISK / WEAPON POSSESSION",
    bookingNo: "VCPD-2026-0419C",
  },
  {
    id: "neon-drag",
    name: "ROXY 'NITRO' VALENTINE",
    alias: "SOUTH BEACH DRIFTER",
    url: "/images/roxy_mugshot.jpg",
    charge: "Illicit Street Racing & Reckless Endangerment",
    bounty: 120000,
    stars: 2,
    location: "Ocean Drive Boulevard",
    dangerLevel: "HIGH-SPEED VEHICULAR EVADER",
    bookingNo: "VCPD-2026-0773D",
  },
];

export default function App() {
  const editorRef = useRef(null);
  const posterCanvasRef = useRef(null);
  const posterSectionRef = useRef(null);

  // Initialize from URL search params if present (shareable links support)
  const getInitialSuspect = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const presetId = params.get("preset");
      const matched = PRESET_SUSPECTS.find((p) => p.id === presetId);
      const base = matched || PRESET_SUSPECTS[0];

      return {
        id: base.id,
        name: params.get("name") || base.name,
        alias: params.get("alias") || base.alias,
        url: params.get("img") || base.url,
        charge: params.get("charge") || base.charge,
        bounty: Number(params.get("bounty")) || base.bounty,
        stars: Number(params.get("stars")) || base.stars,
        location: params.get("location") || base.location,
        dangerLevel: params.get("danger") || base.dangerLevel,
        bookingNo: params.get("docket") || base.bookingNo,
      };
    } catch {
      return PRESET_SUSPECTS[0];
    }
  };

  // State
  const [suspect, setSuspect] = useState(getInitialSuspect);
  const [currentImage, setCurrentImage] = useState(suspect.url);
  const [finalPosterUrl, setFinalPosterUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Audio & Visual Effects
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live Vice City Digital Clock (EDT / UTC-4)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preset Selection
  const selectPreset = (preset) => {
    playClickSound();
    setSuspect(preset);
    setCurrentImage(preset.url);
    setFinalPosterUrl(null);
  };

  // Custom Suspect Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result);
        setSuspect((prev) => ({
          ...prev,
          name: "NEW UNIDENTIFIED SUSPECT",
          alias: "UNKNOWN SUBJECT",
          bookingNo: `VCPD-2026-${Math.floor(1000 + Math.random() * 9000)}X`,
        }));
        setFinalPosterUrl(null);
        showToast("Suspect photo loaded into editor!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Wanted Star Rating Click
  const handleStarClick = (rating) => {
    playStarSound(rating);
    const bountyScale = [10000, 50000, 150000, 500000, 1000000];
    const threatLevels = [
      "PETTY MISDEMEANOR / CITATION",
      "ACTIVE WARRANT / VEHICULAR FLIGHT",
      "TACTICAL CALLOUT / ARMED ROBBERY",
      "VCPD SWAT & AIR SUPPORT DEPLOYED",
      "NOOSE & MILITARY AUTHORIZED - EXTREME DANGER",
    ];

    setSuspect((prev) => ({
      ...prev,
      stars: rating,
      bounty: bountyScale[rating - 1],
      dangerLevel: threatLevels[rating - 1],
    }));
  };

  // Synthesizer Radio Toggle
  const handleToggleMusic = () => {
    playClickSound();
    toggleSynthwaveMusic((playing) => {
      setMusicPlaying(playing);
    });
  };

  // Render Wanted Poster on Canvas
  const renderPosterCanvas = useCallback((sourceImageUrl) => {
    setIsGenerating(true);
    const canvas = posterCanvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // HD 1000 x 1400 Ratio
    canvas.width = 1000;
    canvas.height = 1400;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
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
      ctx.fillText(`VCPD CENTRAL DISPATCH • DOCKET: ${suspect.bookingNo} • STATUS: ACTIVE WARRANT`, 500, 96);

      // 3. Main Title
      ctx.fillStyle = "#ff007a";
      ctx.font = "900 66px 'Outfit', sans-serif";
      ctx.fillText("WANTED BY VCPD", 500, 192);

      // 4. Stars Banner
      ctx.fillStyle = "#fbbf24";
      ctx.font = "38px sans-serif";
      const starsDisplay = "★".repeat(suspect.stars) + "☆".repeat(5 - suspect.stars);
      ctx.fillText(starsDisplay, 500, 242);

      // 5. Suspect Photo Container with Height Ruler
      const pX = 140;
      const pY = 265;
      const pW = 720;
      const pH = 510;

      ctx.fillStyle = "#000000";
      ctx.fillRect(pX, pY, pW, pH);

      // Draw edited photo
      ctx.drawImage(img, pX, pY, pW, pH);

      // Height Rulers on Left & Right
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "12px 'Chakra Petch', monospace";
      ctx.textAlign = "left";

      const heights = ["6'4\"", "6'2\"", "6'0\"", "5'10\"", "5'8\"", "5'6\""];
      heights.forEach((h, idx) => {
        const lineY = pY + 65 + idx * 65;
        ctx.beginPath();
        ctx.moveTo(pX, lineY);
        ctx.lineTo(pX + 50, lineY);
        ctx.stroke();
        ctx.fillText(h, pX + 10, lineY - 6);

        ctx.beginPath();
        ctx.moveTo(pX + pW - 50, lineY);
        ctx.lineTo(pX + pW, lineY);
        ctx.stroke();
      });

      // Photo Frame Accent
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(pX, pY, pW, pH);

      // 6. Angled Warning Stamp
      ctx.save();
      ctx.translate(pX + 160, pY + 110);
      ctx.rotate((-18 * Math.PI) / 180);
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 4;
      ctx.strokeRect(-125, -28, 250, 56);
      ctx.fillStyle = "rgba(225, 29, 72, 0.28)";
      ctx.fillRect(-125, -28, 250, 56);
      ctx.fillStyle = "#ff4d6d";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.textAlign = "center";
      ctx.fillText("ARMED & DANGEROUS", 0, 8);
      ctx.restore();

      // 7. Suspect Dossier Details
      ctx.textAlign = "center";

      // Suspect Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px 'Outfit', sans-serif";
      ctx.fillText(suspect.name.toUpperCase(), 500, 835);

      // Alias
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px 'Chakra Petch', monospace";
      ctx.fillText(`AKA: "${suspect.alias.toUpperCase()}"`, 500, 875);

      // Divider Line
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
      ctx.fillText(`$${suspect.bounty.toLocaleString()}`, 500, 1008);

      // Rap Sheet Details Grid
      const gridY = 1060;
      ctx.textAlign = "left";

      // Charges
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("OUTSTANDING CHARGES / WARRANTS:", 140, gridY);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(suspect.charge, 140, gridY + 30);

      // Location
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("LAST KNOWN SIGHTING / JURISDICTION:", 140, gridY + 80);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(suspect.location, 140, gridY + 110);

      // Threat Level
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("THREAT LEVEL ASSESSMENT:", 140, gridY + 160);

      ctx.fillStyle = "#ff007a";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.fillText(suspect.dangerLevel, 140, gridY + 190);

      // 8. Footer Barcode & Tip Line
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.fillRect(28, 1285, 944, 85);

      // Mock Barcode
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 60; i++) {
        const barW = i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 1;
        ctx.fillRect(80 + i * 5, 1305, barW, 45);
      }

      ctx.font = "12px monospace";
      ctx.fillText(suspect.bookingNo, 120, 1362);

      ctx.textAlign = "right";
      ctx.fillStyle = "#e11d48";
      ctx.font = "bold 15px 'Chakra Petch', monospace";
      ctx.fillText("DO NOT ATTEMPT APPREHENSION • SUSPECT IS ARMED", 940, 1320);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px 'Chakra Petch', monospace";
      ctx.fillText("REPORT SIGHTINGS TO VCPD DISPATCH (1-800-VICE-PD)", 940, 1345);

      const renderedUrl = canvas.toDataURL("image/png");
      setFinalPosterUrl(renderedUrl);
      setIsGenerating(false);

      // Auto-scroll to poster on mobile/desktop
      setTimeout(() => {
        posterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    img.src = sourceImageUrl;
  }, [suspect]);

  // Instant Trigger: Generate Poster using current editor state or base image
  const handleInstantGenerate = () => {
    playShutterSound();
    const editorCanvasUrl = editorRef.current?.editor?.getImage();
    const imageToUse = editorCanvasUrl || currentImage;
    renderPosterCanvas(imageToUse);
    showToast("Official VCPD Wanted Poster generated!");
  };

  // On Save from Unlayer Image Editor
  const handleEditorSave = ({ dataUrl }) => {
    playShutterSound();
    renderPosterCanvas(dataUrl);
    showToast("Edits applied! Wanted Poster created below.");
  };

  // Instant Download Action
  const handleInstantDownload = () => {
    playClickSound();
    if (!finalPosterUrl) {
      handleInstantGenerate();
      return;
    }
    const a = document.createElement("a");
    a.href = finalPosterUrl;
    a.download = `VCPD_WANTED_${suspect.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading High-Res Wanted Poster...");
  };

  // Share Link / Share Card (supports Web Share API & URL Search Params)
  const handleShareLink = async () => {
    playClickSound();
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("preset", suspect.id);
    url.searchParams.set("name", suspect.name);
    url.searchParams.set("alias", suspect.alias);
    url.searchParams.set("stars", suspect.stars);
    url.searchParams.set("bounty", suspect.bounty);
    url.searchParams.set("charge", suspect.charge);
    url.searchParams.set("location", suspect.location);
    url.searchParams.set("danger", suspect.dangerLevel);
    url.searchParams.set("docket", suspect.bookingNo);

    const shareUrl = url.toString();
    const shareText = `🚨 VCPD WANTED BULLETIN 🚨\nSUSPECT: ${suspect.name} (${suspect.alias})\nWANTED LEVEL: ${"★".repeat(suspect.stars)}\nBOUNTY: $${suspect.bounty.toLocaleString()}\nCHARGES: ${suspect.charge}\n\nBuilt with React Image Editor Challenge #BuiltWithImageEditor\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `VCPD Wanted: ${suspect.name}`,
          text: shareText,
          url: shareUrl,
        });
        showToast("Shared successfully!");
        return;
      } catch {
        // Fallback
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("✓ Copied shareable link & rap sheet to clipboard!");
    } catch {
      showToast("Link: " + shareUrl);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "16px clamp(12px, 3vw, 28px)", position: "relative" }}>
      {/* Optional CRT Scanlines Layer */}
      {scanlinesActive && <div className="scanlines-overlay" />}

      {/* Hidden canvas for official poster compositing */}
      <canvas ref={posterCanvasRef} style={{ display: "none" }} />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 10000,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "1px solid var(--neon-cyan)",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 0 20px var(--neon-cyan-glow)",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: "var(--neon-cyan)" }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= HUD HEADER ================= */}
      <header
        className="vice-panel"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {/* Left Title & Status */}
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              className="hud-font"
              style={{
                backgroundColor: "var(--vcpd-red)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "800",
                padding: "2px 7px",
                borderRadius: "3px",
                letterSpacing: "1px",
              }}
            >
              VCPD TERMINAL 06
            </span>

            {/* Blinking Live REC */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                className="rec-indicator"
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  display: "inline-block",
                }}
              />
              <span className="hud-font" style={{ color: "#ef4444", fontSize: "11px", fontWeight: "800" }}>
                LIVE CCTV
              </span>
            </div>

            <span className="hud-font" style={{ color: "#64748b", fontSize: "12px" }}>
              | TIME: <strong style={{ color: "#38bdf8" }}>{currentTime || "00:00:00"} EDT</strong>
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 3.8vw, 34px)",
              fontWeight: "900",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              background: "linear-gradient(90deg, #ff007a 0%, #ff529a 50%, #00f0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 10px rgba(255, 0, 122, 0.3))",
            }}
          >
            Vice City Mugshot Lab
          </h1>
          <p className="hud-font" style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "12px" }}>
            Leonida Department of Corrections • Powered by React Image Editor
          </p>
        </div>

        {/* Right Audio & Action Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          {/* Quick Generate Action */}
          <button
            onClick={handleInstantGenerate}
            disabled={isGenerating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: "800",
              borderRadius: "6px",
              backgroundColor: "var(--neon-pink)",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 0 14px var(--neon-pink-glow)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>⚡ {isGenerating ? "GENERATING..." : "GENERATE POSTER"}</span>
          </button>

          {/* Quick Share Link */}
          <button
            onClick={handleShareLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#38bdf8",
              cursor: "pointer",
            }}
          >
            <span>📤 SHARE CARD</span>
          </button>

          {/* Synthwave Radio Toggle */}
          <button
            onClick={handleToggleMusic}
            style={{
              padding: "9px 13px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: musicPlaying ? "rgba(255, 0, 122, 0.25)" : "#0f172a",
              border: `1px solid ${musicPlaying ? "var(--neon-pink)" : "#334155"}`,
              color: musicPlaying ? "var(--neon-pink)" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            <span>{musicPlaying ? "🔊 VICE FM (ON)" : "🔈 VICE FM"}</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => {
              playClickSound();
              setScanlinesActive(!scanlinesActive);
            }}
            style={{
              padding: "9px 13px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: scanlinesActive ? "rgba(0, 240, 255, 0.15)" : "#0f172a",
              border: `1px solid ${scanlinesActive ? "var(--neon-cyan)" : "#334155"}`,
              color: scanlinesActive ? "var(--neon-cyan)" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            CRT: {scanlinesActive ? "ON" : "OFF"}
          </button>

          {/* Radio Dispatch Cue */}
          <button
            onClick={() => playDispatchSound()}
            title="Play Police Radio Beep"
            style={{
              padding: "9px 12px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              color: "#fbbf24",
              cursor: "pointer",
            }}
          >
            📻 10-99
          </button>
        </div>
      </header>

      {/* ================= SUSPECT PRESETS (HORIZONTAL SCROLL ON MOBILE) ================= */}
      <div
        className="vice-panel"
        style={{
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Preset Buttons Scroll Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            maxWidth: "100%",
            paddingBottom: "4px",
          }}
        >
          <span className="hud-font" style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", flexShrink: 0 }}>
            DOSSIER:
          </span>

          {PRESET_SUSPECTS.map((tpl) => {
            const isSelected = suspect.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => selectPreset(tpl)}
                style={{
                  padding: "7px 13px",
                  fontSize: "12px",
                  fontWeight: "700",
                  borderRadius: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "1px solid",
                  borderColor: isSelected ? "var(--neon-pink)" : "#334155",
                  backgroundColor: isSelected ? "rgba(255, 0, 122, 0.2)" : "#0f172a",
                  color: isSelected ? "#ffffff" : "#94a3b8",
                  boxShadow: isSelected ? "0 0 10px var(--neon-pink-glow)" : "none",
                  flexShrink: 0,
                }}
              >
                {tpl.name}
              </button>
            );
          })}
        </div>

        {/* Custom Suspect Photo Upload */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            backgroundColor: "rgba(0, 240, 255, 0.12)",
            border: "1px solid var(--neon-cyan)",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--neon-cyan)",
            flexShrink: 0,
          }}
        >
          <span>📁 UPLOAD CUSTOM SUSPECT</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      {/* ================= MAIN GRID: RAP SHEET + EDITOR ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Rap Sheet Docket Controls */}
        <div
          className="vice-panel"
          style={{
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 0, 122, 0.3)",
              paddingBottom: "10px",
            }}
          >
            <h2
              className="hud-font"
              style={{
                margin: 0,
                fontSize: "16px",
                color: "#ff007a",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              📑 Criminal Rap Sheet
            </h2>
            <span
              className="hud-font"
              style={{
                fontSize: "12px",
                color: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.1)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {suspect.bookingNo}
            </span>
          </div>

          {/* Interactive Wanted Star Rating */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              WANTED LEVEL (CLICK STARS TO ESCALATE THREAT):
            </label>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= suspect.stars;
                return (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={isActive ? "star-active" : ""}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "28px",
                      cursor: "pointer",
                      color: isActive ? "#fbbf24" : "#334155",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    title={`Set Wanted Level ${star}`}
                  >
                    ★
                  </button>
                );
              })}
              <span
                className="hud-font"
                style={{
                  marginLeft: "8px",
                  fontSize: "12px",
                  color: "#fbbf24",
                  fontWeight: "700",
                }}
              >
                LEVEL {suspect.stars} WANTED
              </span>
            </div>
          </div>

          {/* Suspect Name Input */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              SUSPECT NAME:
            </label>
            <input
              type="text"
              value={suspect.name}
              onChange={(e) => setSuspect({ ...suspect, name: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                outline: "none",
              }}
            />
          </div>

          {/* Suspect Alias Input */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              ALIAS / MONIKER:
            </label>
            <input
              type="text"
              value={suspect.alias}
              onChange={(e) => setSuspect({ ...suspect, alias: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#38bdf8",
                fontSize: "14px",
                fontWeight: "600",
                outline: "none",
              }}
            />
          </div>

          {/* Bounty Reward */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              BOUNTY / CASH REWARD ($ USD):
            </label>
            <input
              type="number"
              step="50000"
              value={suspect.bounty}
              onChange={(e) => setSuspect({ ...suspect, bounty: Number(e.target.value) || 0 })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #fbbf24",
                borderRadius: "6px",
                color: "#fbbf24",
                fontSize: "17px",
                fontWeight: "900",
                outline: "none",
              }}
            />
          </div>

          {/* Primary Charge */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              PRIMARY OFFENSE:
            </label>
            <input
              type="text"
              value={suspect.charge}
              onChange={(e) => setSuspect({ ...suspect, charge: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Last Seen Location */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              LAST SIGHTED LOCATION:
            </label>
            <input
              type="text"
              value={suspect.location}
              onChange={(e) => setSuspect({ ...suspect, location: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#00f0ff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Threat Warning */}
          <div>
            <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              THREAT ASSESSMENT:
            </label>
            <input
              type="text"
              value={suspect.dangerLevel}
              onChange={(e) => setSuspect({ ...suspect, dangerLevel: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#090d16",
                border: "1px solid #e11d48",
                borderRadius: "6px",
                color: "#ff4d6d",
                fontSize: "12px",
                fontWeight: "700",
                outline: "none",
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={handleInstantGenerate}
              style={{
                padding: "11px",
                backgroundColor: "var(--neon-pink)",
                border: "none",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 0 10px var(--neon-pink-glow)",
              }}
            >
              ⚡ GENERATE POSTER
            </button>

            <button
              onClick={handleShareLink}
              style={{
                padding: "11px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#38bdf8",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📋 COPY SHARE CARD
            </button>
          </div>
        </div>

        {/* Right Column: React Image Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Tool Guidance Bar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              borderRadius: "6px",
              border: "1px solid #1e293b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="hud-font" style={{ fontSize: "12px", color: "var(--neon-cyan)", fontWeight: "800" }}>
                🛠️ REACT IMAGE EDITOR
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Crop • Filters • Draw • Text • Stickers • Frames
              </span>
            </div>

            <button
              onClick={handleInstantGenerate}
              style={{
                padding: "4px 10px",
                backgroundColor: "rgba(255, 0, 122, 0.2)",
                border: "1px solid var(--neon-pink)",
                borderRadius: "4px",
                color: "#ff007a",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              USE CURRENT EDITS ➔
            </button>
          </div>

          {/* The React Image Editor Container */}
          <div
            style={{
              height: "clamp(540px, 72vh, 760px)",
              width: "100%",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid rgba(255, 0, 122, 0.4)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
              backgroundColor: "#000000",
            }}
          >
            <ImageEditor
              key={currentImage}
              ref={editorRef}
              image={currentImage}
              options={{
                theme: "dark",
                features: {
                  imageEditor: {
                    tools: {
                      crop: true,
                      filter: true,
                      draw: true,
                      text: true,
                      shapes: true,
                      stickers: true,
                      frame: true,
                      resize: true,
                    },
                  },
                },
              }}
              onSave={handleEditorSave}
              onCancel={() => {
                playClickSound();
                showToast("Editing cancelled");
              }}
              onLoadError={() => showToast("Image load error.")}
            />
          </div>
        </div>
      </div>

      {/* ================= OFFICIAL WANTED POSTER SECTION ================= */}
      {finalPosterUrl && (
        <section
          ref={posterSectionRef}
          className="vice-panel"
          style={{
            marginTop: "28px",
            padding: "clamp(16px, 3vw, 28px)",
            border: "2px solid var(--neon-pink)",
            boxShadow: "0 10px 40px var(--neon-pink-glow)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
              borderBottom: "1px solid rgba(255, 0, 122, 0.3)",
              paddingBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🚨</span>
              <h3
                className="hud-font"
                style={{
                  margin: 0,
                  fontSize: "clamp(17px, 2.5vw, 22px)",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  letterSpacing: "1px",
                }}
              >
                Official VCPD Wanted Poster Generated
              </h3>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button
                onClick={handleInstantDownload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "var(--neon-pink)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "14px",
                  boxShadow: "0 0 15px var(--neon-pink-glow)",
                  cursor: "pointer",
                }}
              >
                💾 DOWNLOAD POSTER (.PNG)
              </button>

              <button
                onClick={handleShareLink}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  color: "#38bdf8",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                📤 SHARE CARD / LINK
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "28px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* The Rendered Poster Preview */}
            <div style={{ maxWidth: "460px", width: "100%" }}>
              <img
                src={finalPosterUrl}
                alt="Generated Official VCPD Wanted Poster"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 15px 45px rgba(0, 0, 0, 0.9)",
                  border: "2px solid #334155",
                  display: "block",
                }}
              />
            </div>

            {/* Poster Details & Summary */}
            <div style={{ maxWidth: "480px", flex: "1 1 300px" }}>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid rgba(251, 191, 36, 0.35)",
                  marginBottom: "16px",
                }}
              >
                <div style={{ color: "#fbbf24", fontWeight: "800", fontSize: "14px", marginBottom: "6px" }}>
                  ⭐ WANTED LEVEL {suspect.stars} • REWARD: ${suspect.bounty.toLocaleString()}
                </div>
                <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "18px" }}>
                  {suspect.name} ("{suspect.alias}")
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>
                  {suspect.charge}
                </div>
                <div style={{ color: "#00f0ff", fontSize: "13px", marginTop: "4px" }}>
                  Last Seen: {suspect.location}
                </div>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
                Ready to submit! The poster contains your customized mugshot edits directly rendered from the React Image Editor,
                with the official VCPD booking grid, barcode, threat level, and Leonida Department of Corrections seal.
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  onClick={handleInstantDownload}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: "transparent",
                    border: "1px solid var(--neon-cyan)",
                    color: "var(--neon-cyan)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ⬇️ Save Again
                </button>
                <button
                  onClick={handleShareLink}
                  style={{
                    padding: "9px 18px",
                    backgroundColor: "transparent",
                    border: "1px solid #334155",
                    color: "#94a3b8",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  🔗 Copy Link
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          textAlign: "center",
          padding: "16px 0",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        <span className="hud-font">
          GTA VI Vice City Mugshot Lab • Built with React Image Editor Challenge • #BuiltWithImageEditor
        </span>
      </footer>
    </div>
  );
}
