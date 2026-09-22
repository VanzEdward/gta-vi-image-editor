import React, { useState, useRef, useEffect } from "react";
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
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
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
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
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
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80",
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
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
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
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
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

  // Active suspect data
  const [suspect, setSuspect] = useState(PRESET_SUSPECTS[0]);
  const [currentImage, setCurrentImage] = useState(PRESET_SUSPECTS[0].url);
  const [savedImage, setSavedImage] = useState(null);
  const [finalPosterUrl, setFinalPosterUrl] = useState(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  // Audio & Visual Effects
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [scanlinesActive, setScanlinesActive] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

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

  // Handle preset selection
  const selectPreset = (preset) => {
    playClickSound();
    setSuspect(preset);
    setCurrentImage(preset.url);
    setSavedImage(null);
    setFinalPosterUrl(null);
  };

  // Handle custom photo upload
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
        setSavedImage(null);
        setFinalPosterUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Wanted Star click
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

  // Audio Toggle
  const handleToggleMusic = () => {
    playClickSound();
    toggleSynthwaveMusic((playing) => {
      setMusicPlaying(playing);
    });
  };

  // Image Editor Save Callback
  const handleSave = ({ dataUrl }) => {
    playShutterSound();
    setSavedImage(dataUrl);
    generateOfficialWantedPoster(dataUrl);
  };

  // Generate Official VCPD Wanted Poster on Canvas
  const generateOfficialWantedPoster = (editedImgDataUrl) => {
    setIsGeneratingPoster(true);
    const canvas = posterCanvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Poster Dimensions (HD Ratio: 1000 x 1400)
    canvas.width = 1000;
    canvas.height = 1400;

    const suspectImg = new Image();
    suspectImg.crossOrigin = "anonymous";
    suspectImg.onload = () => {
      // 1. Background Paper / HUD Base
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1400);
      bgGrad.addColorStop(0, "#0a0e1a");
      bgGrad.addColorStop(0.5, "#070a12");
      bgGrad.addColorStop(1, "#030509");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1000, 1400);

      // Border & Neon Trim
      ctx.strokeStyle = "#ff007a";
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, 968, 1368);

      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, 948, 1348);

      // 2. Header Top Banner: State of Leonida
      ctx.fillStyle = "rgba(225, 29, 72, 0.2)";
      ctx.fillRect(28, 28, 944, 90);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.textAlign = "center";
      ctx.fillText("STATE OF LEONIDA • DEPARTMENT OF LAW ENFORCEMENT", 500, 62);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "600 14px 'Chakra Petch', monospace";
      ctx.fillText(`VCPD CENTRAL DISPATCH • DOCKET: ${suspect.bookingNo} • STATUS: ACTIVE WARRANT`, 500, 92);

      // 3. Main Title: WANTED BY VCPD
      ctx.fillStyle = "#ff007a";
      ctx.font = "900 68px 'Outfit', sans-serif";
      ctx.fillText("WANTED BY VCPD", 500, 190);

      // 4. Stars Rating Banner
      ctx.fillStyle = "#fbbf24";
      ctx.font = "36px sans-serif";
      const starsDisplay = "★".repeat(suspect.stars) + "☆".repeat(5 - suspect.stars);
      ctx.fillText(starsDisplay, 500, 240);

      // 5. Suspect Image Area with Height Ruler Grid
      const photoX = 140;
      const photoY = 265;
      const photoW = 720;
      const photoH = 500;

      // Draw photo container border
      ctx.fillStyle = "#000000";
      ctx.fillRect(photoX, photoY, photoW, photoH);

      // Draw user's edited image
      ctx.drawImage(suspectImg, photoX, photoY, photoW, photoH);

      // Height Marker Lines on Left & Right
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "12px 'Chakra Petch', monospace";
      ctx.textAlign = "left";

      const heights = ["6'4\"", "6'2\"", "6'0\"", "5'10\"", "5'8\"", "5'6\""];
      heights.forEach((h, idx) => {
        const lineY = photoY + 60 + idx * 65;
        ctx.beginPath();
        ctx.moveTo(photoX, lineY);
        ctx.lineTo(photoX + 50, lineY);
        ctx.stroke();
        ctx.fillText(h, photoX + 10, lineY - 6);

        ctx.beginPath();
        ctx.moveTo(photoX + photoW - 50, lineY);
        ctx.lineTo(photoX + photoW, lineY);
        ctx.stroke();
      });

      // Photo Frame Accent
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(photoX, photoY, photoW, photoH);

      // 6. Angled Warning Stamp: CAUTION / ARMED & DANGEROUS
      ctx.save();
      ctx.translate(photoX + 160, photoY + 110);
      ctx.rotate((-18 * Math.PI) / 180);
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 4;
      ctx.strokeRect(-120, -28, 240, 56);
      ctx.fillStyle = "rgba(225, 29, 72, 0.25)";
      ctx.fillRect(-120, -28, 240, 56);
      ctx.fillStyle = "#ff4d6d";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.textAlign = "center";
      ctx.fillText("ARMED & DANGEROUS", 0, 8);
      ctx.restore();

      // 7. Suspect Info Card
      ctx.textAlign = "center";

      // Suspect Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px 'Outfit', sans-serif";
      ctx.fillText(suspect.name.toUpperCase(), 500, 825);

      // Alias
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px 'Chakra Petch', monospace";
      ctx.fillText(`AKA: "${suspect.alias.toUpperCase()}"`, 500, 865);

      // Divider Line
      ctx.strokeStyle = "rgba(255, 0, 122, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(140, 890);
      ctx.lineTo(860, 890);
      ctx.stroke();

      // Bounty Box (Glowing Gold)
      ctx.fillStyle = "rgba(251, 191, 36, 0.12)";
      ctx.fillRect(140, 915, 720, 100);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.strokeRect(140, 915, 720, 100);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "700 18px 'Chakra Petch', monospace";
      ctx.fillText("OFFICIAL VCPD CASH REWARD / BOUNTY", 500, 948);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px 'Outfit', sans-serif";
      ctx.fillText(`$${suspect.bounty.toLocaleString()}`, 500, 998);

      // Rap Sheet Docket Grid
      const gridY = 1050;
      ctx.textAlign = "left";

      // Column 1: CHARGES
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("OUTSTANDING CHARGES / WARRANTS:", 140, gridY);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(suspect.charge, 140, gridY + 30);

      // Column 1: LAST SEEN LOCATION
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("LAST KNOWN SIGHTING / JURISDICTION:", 140, gridY + 80);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(suspect.location, 140, gridY + 110);

      // Column 1: THREAT ASSESSMENT
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("THREAT LEVEL ASSESSMENT:", 140, gridY + 160);

      ctx.fillStyle = "#ff007a";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.fillText(suspect.dangerLevel, 140, gridY + 190);

      // 8. Footer: Barcode & Dispatch Warning
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(28, 1285, 944, 85);

      // Mock Barcode
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 60; i++) {
        const barW = (i % 3 === 0 ? 5 : (i % 2 === 0 ? 3 : 1));
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

      // Finish rendering poster
      const renderedUrl = canvas.toDataURL("image/png");
      setFinalPosterUrl(renderedUrl);
      setIsGeneratingPoster(false);
    };

    suspectImg.src = editedImgDataUrl;
  };

  // Copy Rap Sheet text
  const handleCopyRapSheet = () => {
    playClickSound();
    const text = `🚨 [VCPD WANTED BULLETIN] 🚨
SUSPECT: ${suspect.name} (AKA: ${suspect.alias})
WANTED RATING: ${"★".repeat(suspect.stars)}
BOUNTY: $${suspect.bounty.toLocaleString()}
CHARGES: ${suspect.charge}
LAST SEEN: ${suspect.location}
STATUS: ${suspect.dangerLevel}
DOCKET: ${suspect.bookingNo}
------------------------------------
Built with React Image Editor Challenge`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px 24px", position: "relative" }}>
      {/* Optional CRT Scanlines Layer */}
      {scanlinesActive && <div className="scanlines-overlay" />}

      {/* Hidden canvas for official poster compositing */}
      <canvas ref={posterCanvasRef} style={{ display: "none" }} />

      {/* ================= HUD HEADER ================= */}
      <header
        className="vice-panel"
        style={{
          padding: "16px 24px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Left: Department & Title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              className="hud-font"
              style={{
                backgroundColor: "var(--vcpd-red)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "800",
                padding: "3px 8px",
                borderRadius: "3px",
                letterSpacing: "1px",
              }}
            >
              VCPD TERMINAL 06
            </span>

            {/* Blinking Live REC Indicator */}
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
              <span className="hud-font" style={{ color: "#ef4444", fontSize: "12px", fontWeight: "700" }}>
                LIVE CCTV REC
              </span>
            </div>

            <span className="hud-font" style={{ color: "#64748b", fontSize: "12px" }}>
              | VICE CITY TIME: <strong style={{ color: "#38bdf8" }}>{currentTime || "00:00:00"} EDT</strong>
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: "900",
              letterSpacing: "2px",
              textTransform: "uppercase",
              background: "linear-gradient(90deg, #ff007a 0%, #ff529a 50%, #00f0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 10px rgba(255, 0, 122, 0.3))",
            }}
          >
            Vice City Mugshot Lab
          </h1>
          <p className="hud-font" style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
            Leonida Department of Corrections • Wanted Bulletin & Surveillance Editor
          </p>
        </div>

        {/* Right: Audio / CRT / Dispatch Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {/* Synthwave Radio Toggle */}
          <button
            onClick={handleToggleMusic}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: musicPlaying ? "rgba(255, 0, 122, 0.25)" : "#1e293b",
              border: `1px solid ${musicPlaying ? "var(--neon-pink)" : "#334155"}`,
              color: musicPlaying ? "var(--neon-pink)" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>{musicPlaying ? "🔊 VICE FM (PLAYING)" : "🔈 VICE FM (RADIO OFF)"}</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => {
              playClickSound();
              setScanlinesActive(!scanlinesActive);
            }}
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: scanlinesActive ? "rgba(0, 240, 255, 0.15)" : "#1e293b",
              border: `1px solid ${scanlinesActive ? "var(--neon-cyan)" : "#334155"}`,
              color: scanlinesActive ? "var(--neon-cyan)" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            CRT FX: {scanlinesActive ? "ON" : "OFF"}
          </button>

          {/* Radio Dispatch Cue */}
          <button
            onClick={() => {
              playDispatchSound();
            }}
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              color: "#fbbf24",
              cursor: "pointer",
            }}
          >
            📻 10-99 BEEP
          </button>
        </div>
      </header>

      {/* ================= SUSPECT SELECTION & UPLOAD BAR ================= */}
      <div
        className="vice-panel"
        style={{
          padding: "14px 20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <span className="hud-font" style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>
            SELECT DOSSIER:
          </span>

          {PRESET_SUSPECTS.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => selectPreset(tpl)}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "700",
                borderRadius: "6px",
                cursor: "pointer",
                border: "1px solid",
                borderColor: suspect.id === tpl.id ? "var(--neon-pink)" : "#334155",
                backgroundColor: suspect.id === tpl.id ? "rgba(255, 0, 122, 0.2)" : "#0f172a",
                color: suspect.id === tpl.id ? "#ffffff" : "#94a3b8",
                boxShadow: suspect.id === tpl.id ? "0 0 12px var(--neon-pink-glow)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Custom Upload Button */}
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 18px",
            backgroundColor: "rgba(0, 240, 255, 0.15)",
            border: "1px solid var(--neon-cyan)",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "700",
            color: "var(--neon-cyan)",
            boxShadow: "0 0 10px var(--neon-cyan-glow)",
          }}
        >
          <span>📁 + UPLOAD SUSPECT PHOTO</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      {/* ================= MAIN INTERFACE (RAP SHEET & EDITOR) ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left Side: Suspect Rap Sheet & Live Controls */}
        <div
          className="vice-panel"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 0, 122, 0.3)",
              paddingBottom: "12px",
            }}
          >
            <h2
              className="hud-font"
              style={{
                margin: 0,
                fontSize: "17px",
                color: "#ff007a",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              📑 Suspect Docket Data
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

          {/* Interactive Wanted Stars */}
          <div>
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              WANTED LEVEL (CLICK TO ADJUST THREAT):
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                      fontSize: "30px",
                      cursor: "pointer",
                      color: isActive ? "#fbbf24" : "#334155",
                      padding: 0,
                      lineHeight: 1,
                      transition: "transform 0.15s ease",
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
                  marginLeft: "10px",
                  fontSize: "13px",
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
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              SUSPECT FULL NAME:
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
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
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
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              BOUNTY / REWARD ($ USD):
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
                fontSize: "18px",
                fontWeight: "900",
                outline: "none",
              }}
            />
          </div>

          {/* Primary Charge */}
          <div>
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              PRIMARY OFFENSE / FELONY:
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
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Last Seen Location */}
          <div>
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
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
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Danger Level Status */}
          <div>
            <label className="hud-font" style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              TACTICAL DANGER WARNING:
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
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
              }}
            />
          </div>

          {/* Copy Docket Quick Action */}
          <button
            onClick={handleCopyRapSheet}
            style={{
              marginTop: "6px",
              padding: "10px",
              backgroundColor: copiedNotification ? "#059669" : "#1e293b",
              border: "1px solid #334155",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            {copiedNotification ? "✓ COPIED TO CLIPBOARD" : "📋 COPY RAP SHEET TEXT"}
          </button>
        </div>

        {/* Right Side: React Image Editor Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 12px",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              borderRadius: "6px",
              border: "1px solid #1e293b",
            }}
          >
            <span className="hud-font" style={{ fontSize: "13px", color: "#38bdf8", fontWeight: "700" }}>
              🛠️ REACT IMAGE EDITOR ENGINE
            </span>
            <span className="hud-font" style={{ fontSize: "12px", color: "#94a3b8" }}>
              Use Crop, Filters, Text & Shapes, then click <strong>Apply / Save</strong>
            </span>
          </div>

          <div
            style={{
              height: "700px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid rgba(255, 0, 122, 0.4)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
              backgroundColor: "#000000",
            }}
          >
            <ImageEditor
              key={currentImage}
              ref={editorRef}
              image={currentImage}
              options={{
                theme: "dark",
              }}
              onSave={handleSave}
              onCancel={() => {
                playClickSound();
                console.info("Edit canceled");
              }}
              onLoadError={() => console.error("Image load failed. Verify URL or CORS.")}
            />
          </div>
        </div>
      </div>

      {/* ================= FINAL GENERATED WANTED POSTER DISPLAY ================= */}
      {finalPosterUrl && (
        <section
          className="vice-panel"
          style={{
            marginTop: "32px",
            padding: "28px",
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
              marginBottom: "20px",
              borderBottom: "1px solid rgba(255, 0, 122, 0.3)",
              paddingBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🚨</span>
              <h3
                className="hud-font"
                style={{
                  margin: 0,
                  fontSize: "20px",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  letterSpacing: "1px",
                }}
              >
                Official VCPD Wanted Poster Generated
              </h3>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href={finalPosterUrl}
                download={`VCPD-WANTED-${suspect.name.replace(/\s+/g, "_")}.png`}
                onClick={() => playClickSound()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "var(--neon-pink)",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "14px",
                  boxShadow: "0 0 15px var(--neon-pink-glow)",
                  cursor: "pointer",
                }}
              >
                💾 DOWNLOAD HIGH-RES POSTER (PNG)
              </a>

              <button
                onClick={handleCopyRapSheet}
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
                📋 SHARE RAP SHEET
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "32px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* The Rendered Poster Preview */}
            <img
              src={finalPosterUrl}
              alt="Generated Official VCPD Wanted Poster"
              style={{
                maxWidth: "480px",
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 15px 45px rgba(0, 0, 0, 0.9)",
                border: "2px solid #334155",
              }}
            />

            {/* Poster Details & Summary */}
            <div style={{ maxWidth: "460px" }}>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "8px",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  marginBottom: "16px",
                }}
              >
                <div style={{ color: "#fbbf24", fontWeight: "800", fontSize: "14px", marginBottom: "6px" }}>
                  ⭐ WANTED LEVEL {suspect.stars} • REWARD: ${suspect.bounty.toLocaleString()}
                </div>
                <div style={{ color: "#ffffff", fontWeight: "700", fontSize: "16px" }}>
                  {suspect.name} ({suspect.alias})
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                  {suspect.charge} • Seen at: {suspect.location}
                </div>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
                This high-resolution bulletin includes your customized suspect edits from the React Image Editor,
                complete with the VCPD seal, measurement height chart, booking docket barcode, and active bounty.
              </p>
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
