import React, { useState, useRef, useEffect, useCallback } from "react";
import ImageEditor from "@unlayer/react-image-editor";
import {
  playClickSound,
  playStarSound,
  playShutterSound,
  playDispatchSound,
  toggleSynthwaveMusic,
  startSynthwaveMusic,
} from "./utils/audio";
import {
  saveCustomDossier,
  loadCustomDossier,
  clearCustomDossier,
} from "./utils/storage";
import TerminalBootScreen from "./components/TerminalBootScreen";

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

const RANDOM_CRIMES = [
  "Armed Robbery at Vice Beach Jewelry Exchange",
  "High-Speed Yacht Piracy off Starfish Island",
  "Illicit Airboat Evading in the Grassrivers Bayou",
  "Extortion & Exotic Animal Trafficking in Little Haiti",
  "Reckless Supercar Street Racing on Ocean Drive",
  "Federal Reserve Vault Breach with Heavy Explosives",
  "Counterfeit Casino Chip Syndicate in Vice Port",
  "High-Tech Cyber Extortion of Leonida Port Authority",
];

const RANDOM_LOCATIONS = [
  "Ocean Beach / Washington Ave",
  "Starfish Island Gateway",
  "Little Haiti / 54th Street",
  "Downtown Financial District",
  "Vice Port Container Dock 7",
  "Grassrivers Airboat Basin",
  "Venetian Islands Causeway",
  "Leonida Keys Overseas Highway",
];

const RANDOM_ALIASES = [
  "THE SUNSET PHANTOM",
  "VICE CITY VIPER",
  "THE NEON DRIFTER",
  "LEONIDA KINGPIN",
  "THE HARBOR GHOST",
  "KEY WEST BANDIT",
  "THE HEIST MASTERMIND",
  "OCEAN DRIVE SHADOW",
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
  const [editorKey, setEditorKey] = useState(0);
  const [finalPosterUrl, setFinalPosterUrl] = useState(null);
  const [composedSuspect, setComposedSuspect] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "docket"
  const [savedCustom, setSavedCustom] = useState(null);

  // Audio & Visual Effects - Default to ON with user persistence
  const [musicPlaying, setMusicPlaying] = useState(() => localStorage.getItem("vcpd_music") !== "false");
  const [audioStarted, setAudioStarted] = useState(false);
  const [starSyncKey, setStarSyncKey] = useState(0);
  const [scanlinesActive, setScanlinesActive] = useState(() => localStorage.getItem("vcpd_crt") !== "false");
  const [dispatching, setDispatching] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // VCPD Terminal Boot Animation (Concept 2: Classified Mainframe)
  // Shows on first visit or when closing tab and reopening
  // Persisted in sessionStorage: once entered, refreshing the page stays on workspace without rebooting
  const [showBootScreen, setShowBootScreen] = useState(() => {
    try {
      return sessionStorage.getItem("vcpd_boot_completed") !== "true";
    } catch {
      return false;
    }
  });

  // Auto-start Vice FM synthwave music on first user interaction (browser autoplay policy requirement)
  useEffect(() => {
    if (localStorage.getItem("vcpd_music") !== "false") {
      const startAudioOnFirstGesture = () => {
        startSynthwaveMusic((playing) => {
          setMusicPlaying(playing);
          setAudioStarted(playing);
        });
      };

      window.addEventListener("click", startAudioOnFirstGesture, { once: true });
      window.addEventListener("keydown", startAudioOnFirstGesture, { once: true });
      window.addEventListener("touchstart", startAudioOnFirstGesture, { once: true });

      return () => {
        window.removeEventListener("click", startAudioOnFirstGesture);
        window.removeEventListener("keydown", startAudioOnFirstGesture);
        window.removeEventListener("touchstart", startAudioOnFirstGesture);
      };
    }
  }, []);

  // Auto-restore custom suspect session from IndexedDB on initial load or reload
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasUrlPreset = params.get("preset");

    loadCustomDossier().then((saved) => {
      if (saved && saved.suspect) {
        setSavedCustom(saved);
        const wasCustom = localStorage.getItem("vcpd_active_tab_type") === "custom";
        if (wasCustom && !hasUrlPreset) {
          setSuspect(saved.suspect);
          if (saved.currentImage) setCurrentImage(saved.currentImage);
          if (saved.finalPosterUrl) setFinalPosterUrl(saved.finalPosterUrl);
          if (saved.composedSuspect) setComposedSuspect(saved.composedSuspect);
          setEditorKey((k) => k + 1);
          showToast("⚡ Restored your custom suspect session!");
        }
      }
    });
  }, []);

  // Auto-save custom suspect state to IndexedDB whenever modified
  useEffect(() => {
    if (suspect.id === "custom") {
      const timer = setTimeout(() => {
        saveCustomDossier({
          suspect,
          currentImage,
          finalPosterUrl,
          composedSuspect,
        });
        setSavedCustom({
          suspect,
          currentImage,
          finalPosterUrl,
          composedSuspect,
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [suspect, currentImage, finalPosterUrl, composedSuspect]);

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
    setEditorKey((k) => k + 1);
    setFinalPosterUrl(null);
    setComposedSuspect(null);
    localStorage.setItem("vcpd_active_tab_type", preset.id);
  };

  // Switch to Saved Custom Suspect
  const selectCustomPreset = () => {
    if (!savedCustom) return;
    playClickSound();
    setSuspect(savedCustom.suspect);
    if (savedCustom.currentImage) setCurrentImage(savedCustom.currentImage);
    setEditorKey((k) => k + 1);
    setFinalPosterUrl(savedCustom.finalPosterUrl || null);
    setComposedSuspect(savedCustom.composedSuspect || null);
    localStorage.setItem("vcpd_active_tab_type", "custom");
    showToast("Loaded your saved custom suspect!");
  };

  // Custom Suspect Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      playClickSound();
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedSuspect = {
          id: "custom",
          url: reader.result,
          name: "NEW UNIDENTIFIED SUSPECT",
          alias: "UNKNOWN SUBJECT",
          bookingNo: `VCPD-2026-${Math.floor(1000 + Math.random() * 9000)}X`,
          charge: "Armed Bank Robbery & Evading VCPD",
          bounty: 750000,
          stars: 4,
          location: "Ocean Beach / Washington Ave",
          dangerLevel: "ARMED & EXTREMELY DANGEROUS",
        };
        setCurrentImage(reader.result);
        setEditorKey((k) => k + 1);
        setSuspect(uploadedSuspect);
        setFinalPosterUrl(null);
        setComposedSuspect(null);
        setSavedCustom({ suspect: uploadedSuspect, currentImage: reader.result });
        localStorage.setItem("vcpd_active_tab_type", "custom");
        saveCustomDossier({
          suspect: uploadedSuspect,
          currentImage: reader.result,
        }).then(() => {
          showToast("Custom photo uploaded and saved locally!");
        });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // Wanted Star Rating Click
  const handleStarClick = (rating) => {
    playStarSound(rating);
    setStarSyncKey((k) => k + 1);
    const bountyScale = [10000, 50000, 150000, 500000, 1000000];
    const threatLevels = [
      "PETTY CITATION / VEHICULAR TRAFFIC",
      "ACTIVE WARRANT / VEHICULAR FLIGHT",
      "TACTICAL CALLOUT / ARMED FELONY",
      "VCPD SWAT & AIR SUPPORT DEPLOYED",
      "NOOSE & MILITARY AUTHORIZED - SHOOT ON SIGHT",
    ];

    const updatedSuspect = {
      ...suspect,
      stars: rating,
      bounty: bountyScale[rating - 1],
      dangerLevel: threatLevels[rating - 1],
    };

    setSuspect(updatedSuspect);

    // If poster is already generated, live-update stars and bounty on the poster canvas immediately
    if (finalPosterUrl) {
      const editorCanvasUrl = editorRef.current?.editor?.getImage();
      const imageToUse = editorCanvasUrl || currentImage;
      renderPosterCanvas(imageToUse, updatedSuspect, false);
    }
  };

  // Randomize Rap Sheet generator
  const handleRandomizeDocket = () => {
    playClickSound();
    const randomCrime = RANDOM_CRIMES[Math.floor(Math.random() * RANDOM_CRIMES.length)];
    const randomLoc = RANDOM_LOCATIONS[Math.floor(Math.random() * RANDOM_LOCATIONS.length)];
    const randomAlias = RANDOM_ALIASES[Math.floor(Math.random() * RANDOM_ALIASES.length)];
    const randomBounty = Math.floor(Math.random() * 9 + 1) * 100000 + 50000;

    const updatedSuspect = {
      ...suspect,
      alias: randomAlias,
      charge: randomCrime,
      location: randomLoc,
      bounty: randomBounty,
    };

    setSuspect(updatedSuspect);
    showToast("🎲 Generated new random crime dossier!");

    // If a poster is already composed, live-update the actual wanted poster canvas with the new crime!
    if (finalPosterUrl) {
      const editorCanvasUrl = editorRef.current?.editor?.getImage();
      const imageToUse = editorCanvasUrl || currentImage;
      renderPosterCanvas(imageToUse, updatedSuspect, false);
    }
  };

  // Synthesizer Radio Toggle with Persistence
  const handleToggleMusic = () => {
    playClickSound();
    toggleSynthwaveMusic((playing) => {
      setMusicPlaying(playing);
      setAudioStarted(playing);
      localStorage.setItem("vcpd_music", playing ? "true" : "false");
    });
  };

  // CRT Scanline Toggle with Persistence
  const handleToggleCRT = () => {
    playClickSound();
    setScanlinesActive((prev) => {
      const next = !prev;
      localStorage.setItem("vcpd_crt", next ? "true" : "false");
      return next;
    });
  };

  // Radio Dispatch Tone (10-99 Alert)
  const handleDispatchClick = () => {
    setDispatching(true);
    playDispatchSound();
    showToast("📻 VCPD DISPATCH: Code 10-99 priority alert broadcasted!");
    setTimeout(() => setDispatching(false), 850);
  };

  // Handle Terminal Boot Screen Entry
  const handleBootEnter = () => {
    try {
      sessionStorage.setItem("vcpd_boot_completed", "true");
    } catch {
      // Ignore
    }
    setShowBootScreen(false);

    // Ensure Vice FM radio is playing since direct user interaction has unlocked audio
    if (localStorage.getItem("vcpd_music") !== "false") {
      startSynthwaveMusic((playing) => {
        setMusicPlaying(playing);
        setAudioStarted(playing);
      });
    }
  };

  // Re-run Terminal Boot Screen manually
  const handleRebootTerminal = () => {
    playClickSound();
    try {
      sessionStorage.removeItem("vcpd_boot_completed");
    } catch {
      // Ignore
    }
    setShowBootScreen(true);
  };

  // Render Wanted Poster on Canvas
  const renderPosterCanvas = useCallback((sourceImageUrl, targetSuspect = suspect, shouldScroll = true) => {
    setIsGenerating(true);
    const canvas = posterCanvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const activeSuspect = targetSuspect || suspect;

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

      // Dark background backdrop behind photo container
      ctx.fillStyle = "#050811";
      ctx.fillRect(pX, pY, pW, pH);

      // Flanking Police Lineup Height Grid (Wings outside the mugshot frame)
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

      // Draw suspect photo with 100% aspect-ratio preservation (no squishing/stretching)
      ctx.save();
      ctx.beginPath();
      ctx.rect(pX, pY, pW, pH);
      ctx.clip();

      const imgRatio = img.width / img.height;
      const frameRatio = pW / pH; // 480 / 530 ≈ 0.90566
      let drawW, drawH, drawX, drawY;

      if (imgRatio > frameRatio) {
        // Image is wider than frame (landscape/square) - match height and center horizontally
        drawH = pH;
        drawW = pH * imgRatio;
        drawX = pX + (pW - drawW) / 2;
        drawY = pY;
      } else {
        // Image is taller than frame (e.g., 9:16 or 3:4 portrait) - match width and align with slight top bias
        drawW = pW;
        drawH = pW / imgRatio;
        drawX = pX;
        // Bias slightly upwards (0.28) so heads/faces aren't cut off when tall 9:16 images are used
        drawY = pY + Math.min(0, (pH - drawH) * 0.28);
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle inner height ruler ticks over image edges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "11px 'Chakra Petch', monospace";
      ctx.textAlign = "left";

      heights.forEach((h, idx) => {
        const lineY = pY + 45 + idx * 68;
        // Left inner tick
        ctx.beginPath();
        ctx.moveTo(pX, lineY);
        ctx.lineTo(pX + 35, lineY);
        ctx.stroke();
        ctx.fillText(h, pX + 8, lineY - 5);

        // Right inner tick
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

      // Cyberpunk / Police Corner Accents (Neon Pink)
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

      // Suspect Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px 'Outfit', sans-serif";
      ctx.fillText(activeSuspect.name.toUpperCase(), 500, 835);

      // Alias
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px 'Chakra Petch', monospace";
      ctx.fillText(`AKA: "${activeSuspect.alias.toUpperCase()}"`, 500, 875);

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
      ctx.fillText(`$${activeSuspect.bounty.toLocaleString()}`, 500, 1008);

      // Rap Sheet Details Grid
      const gridY = 1060;
      ctx.textAlign = "left";

      // Charges
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("OUTSTANDING CHARGES / WARRANTS:", 140, gridY);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(activeSuspect.charge, 140, gridY + 30);

      // Location
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("LAST KNOWN SIGHTING / JURISDICTION:", 140, gridY + 80);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "600 20px 'Outfit', sans-serif";
      ctx.fillText(activeSuspect.location, 140, gridY + 110);

      // Threat Level
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 15px 'Chakra Petch', monospace";
      ctx.fillText("THREAT LEVEL ASSESSMENT:", 140, gridY + 160);

      ctx.fillStyle = "#ff007a";
      ctx.font = "bold 20px 'Chakra Petch', monospace";
      ctx.fillText(activeSuspect.dangerLevel, 140, gridY + 190);

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
      ctx.fillText(activeSuspect.bookingNo, 120, 1362);

      ctx.textAlign = "right";
      ctx.fillStyle = "#e11d48";
      ctx.font = "bold 15px 'Chakra Petch', monospace";
      ctx.fillText("DO NOT ATTEMPT APPREHENSION • SUSPECT IS ARMED", 940, 1320);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px 'Chakra Petch', monospace";
      ctx.fillText("REPORT SIGHTINGS TO VCPD DISPATCH (1-800-VICE-PD)", 940, 1345);

      const renderedUrl = canvas.toDataURL("image/png");
      setFinalPosterUrl(renderedUrl);
      setComposedSuspect(activeSuspect);
      setIsGenerating(false);

      // Auto-scroll to poster only on initial generate
      if (shouldScroll) {
        setTimeout(() => {
          posterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    img.src = sourceImageUrl;
  }, [suspect]);

  // Primary Action: Compose Wanted Poster (Uses current canvas or current image)
  const handleComposeWantedPoster = () => {
    playShutterSound();
    const editorCanvasUrl = editorRef.current?.editor?.getImage();
    const imageToUse = editorCanvasUrl || currentImage;
    renderPosterCanvas(imageToUse, suspect, true);
    showToast("Official VCPD Wanted Poster generated below!");
  };

  // On Save from Unlayer Image Editor: Saves edits to current profile photo
  const handleEditorSave = ({ dataUrl }) => {
    playClickSound();
    setCurrentImage(dataUrl);
    showToast("✓ Visual edits saved! Click 'Compose Wanted Poster' to update bulletin.");
    if (finalPosterUrl) {
      renderPosterCanvas(dataUrl, composedSuspect || suspect, false);
    }
  };

  // On Cancel from Unlayer Image Editor: Genuinely reverts back to original unedited photo
  const handleEditorCancel = () => {
    playClickSound();
    setCurrentImage(suspect.url);
    setEditorKey((k) => k + 1);
    if (editorRef.current?.editor?.reset) {
      editorRef.current.editor.reset(suspect.url);
    }
    if (finalPosterUrl) {
      renderPosterCanvas(suspect.url, composedSuspect || suspect, false);
    }
    showToast("↺ Edits discarded. Photo reverted to original.");
  };

  // Fit & Center Photo inside workspace
  const handleFitToScreen = () => {
    playClickSound();
    const fitBtn = document.querySelector('[title*="Fit to screen"], [aria-label*="Fit to screen"]');
    if (fitBtn) {
      fitBtn.click();
    } else {
      window.dispatchEvent(new Event("resize"));
    }
    showToast("⛶ Photo fitted & centered in workspace");
  };

  // Instant Download Action
  const handleInstantDownload = () => {
    playClickSound();
    if (!finalPosterUrl) {
      handleComposeWantedPoster();
      return;
    }
    const currentPosterSuspect = composedSuspect || suspect;
    const a = document.createElement("a");
    a.href = finalPosterUrl;
    a.download = `VCPD_WANTED_${currentPosterSuspect.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading High-Res Wanted Poster...");
  };

  // Share Link / Share Card (supports Web Share API & URL Search Params)
  const handleShareLink = async () => {
    playClickSound();
    const currentPosterSuspect = composedSuspect || suspect;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("preset", currentPosterSuspect.id);
    url.searchParams.set("name", currentPosterSuspect.name);
    url.searchParams.set("alias", currentPosterSuspect.alias);
    url.searchParams.set("stars", currentPosterSuspect.stars);
    url.searchParams.set("bounty", currentPosterSuspect.bounty);
    url.searchParams.set("charge", currentPosterSuspect.charge);
    url.searchParams.set("location", currentPosterSuspect.location);
    url.searchParams.set("danger", currentPosterSuspect.dangerLevel);
    url.searchParams.set("docket", currentPosterSuspect.bookingNo);

    const shareUrl = url.toString();
    const shareText = `🚨 VCPD WANTED BULLETIN 🚨\nSUSPECT: ${currentPosterSuspect.name} (${currentPosterSuspect.alias})\nWANTED LEVEL: ${"★".repeat(currentPosterSuspect.stars)}\nBOUNTY: $${currentPosterSuspect.bounty.toLocaleString()}\nCHARGES: ${currentPosterSuspect.charge}\n\nBuilt with React Image Editor Challenge #BuiltWithImageEditor\n${shareUrl}`;

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
    <div className="app-container">
      {/* VCPD Terminal Boot Screen (shown on first visit or tab reopening) */}
      {showBootScreen && <TerminalBootScreen onEnter={handleBootEnter} />}

      {/* Optional CRT Scanlines Layer */}
      {scanlinesActive && <div className="scanlines-overlay" />}

      {/* Hidden canvas for official poster compositing */}
      <canvas ref={posterCanvasRef} style={{ display: "none" }} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mobile-toast">
          <span style={{ color: "var(--neon-cyan)" }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= HUD HEADER ================= */}
      <header className="vice-panel hud-header">
        {/* Left Title & Department Status */}
        <div className="hud-title-block">
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
              fontSize: "clamp(20px, 4.5vw, 34px)",
              fontWeight: "900",
              letterSpacing: "1.2px",
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

        {/* Right Atmospheric & Audio Controls Only */}
        <div className="hud-control-group">
          {/* Synthwave Radio Toggle */}
          <button
            onClick={handleToggleMusic}
            title={
              musicPlaying
                ? (audioStarted ? "Vice FM Synthwave Radio is playing" : "Click anywhere to enable audio (Browser Autoplay Policy)")
                : "Turn on Vice FM Radio"
            }
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: musicPlaying ? "rgba(255, 0, 122, 0.25)" : "#0f172a",
              border: `1px solid ${musicPlaying ? "var(--neon-pink)" : "#334155"}`,
              color: musicPlaying ? "var(--neon-pink)" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            <span>
              {musicPlaying
                ? (audioStarted ? "🔊 VICE FM (ON)" : "🔊 VICE FM (TAP TO PLAY)")
                : "🔈 VICE FM"}
            </span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={handleToggleCRT}
            style={{
              padding: "8px 14px",
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

          {/* Radio Dispatch Cue (10-99 Police Code for Wanted Suspect Alert) */}
          <button
            onClick={handleDispatchClick}
            title="10-99 Police Ten-Code: High-Priority Wanted Suspect Dispatch Alert"
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: dispatching ? "rgba(251, 191, 36, 0.25)" : "#0f172a",
              border: `1px solid ${dispatching ? "#fbbf24" : "#334155"}`,
              color: "#fbbf24",
              boxShadow: dispatching ? "0 0 16px rgba(251, 191, 36, 0.6)" : "none",
              transform: dispatching ? "scale(1.05)" : "scale(1)",
              transition: "all 0.15s ease",
              cursor: "pointer",
            }}
          >
            📻 {dispatching ? "10-99 ALERT!" : "10-99"}
          </button>

          {/* Re-boot Terminal Screen */}
          <button
            onClick={handleRebootTerminal}
            title="Replay VCPD Classified Terminal Boot Animation"
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              fontWeight: "700",
              borderRadius: "6px",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              color: "#38bdf8",
              cursor: "pointer",
            }}
          >
            💻 BOOT
          </button>
        </div>
      </header>

      {/* ================= WORKFLOW STEP INDICATOR ================= */}
      <div className="workflow-step-indicator">
        <span className="hud-font" style={{ color: "#ff007a", fontWeight: "800", flexShrink: 0 }}>
          ① SELECT DOSSIER
        </span>
        <span style={{ color: "#64748b", flexShrink: 0 }}>➔</span>
        <span className="hud-font" style={{ color: "#00f0ff", fontWeight: "800", flexShrink: 0 }}>
          ② EDIT PHOTO & RAP SHEET
        </span>
        <span style={{ color: "#64748b", flexShrink: 0 }}>➔</span>
        <span className="hud-font" style={{ color: "#fbbf24", fontWeight: "800", flexShrink: 0 }}>
          ③ COMPOSE & DOWNLOAD POSTER
        </span>
      </div>

      {/* ================= SUSPECT PRESETS ================= */}
      <div className="vice-panel presets-container">
        {/* Preset Buttons */}
        <div className="presets-scroll-track">
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

          {/* Saved Custom Suspect Quick Switcher Button */}
          {savedCustom && (
            <div style={{ display: "inline-flex", alignItems: "center", position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                onClick={selectCustomPreset}
                style={{
                  padding: "7px 13px",
                  paddingRight: "28px",
                  fontSize: "12px",
                  fontWeight: "700",
                  borderRadius: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "1px solid",
                  borderColor: suspect.id === "custom" ? "var(--neon-cyan)" : "rgba(0, 240, 255, 0.4)",
                  backgroundColor: suspect.id === "custom" ? "rgba(0, 240, 255, 0.22)" : "#0f172a",
                  color: suspect.id === "custom" ? "#ffffff" : "var(--neon-cyan)",
                  boxShadow: suspect.id === "custom" ? "0 0 10px var(--neon-cyan-glow)" : "none",
                }}
                title="Switch to your saved custom suspect"
              >
                ★ {savedCustom.suspect?.name && savedCustom.suspect.name !== "NEW UNIDENTIFIED SUSPECT" ? savedCustom.suspect.name : "MY CUSTOM SUSPECT"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  clearCustomDossier();
                  setSavedCustom(null);
                  if (suspect.id === "custom") {
                    selectPreset(PRESET_SUSPECTS[0]);
                  }
                  showToast("Saved custom suspect removed from local storage.");
                }}
                title="Delete saved custom suspect"
                style={{
                  position: "absolute",
                  right: "6px",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "13px",
                  cursor: "pointer",
                  padding: "2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Custom Suspect Photo Upload */}
        <label className={`upload-custom-btn ${suspect.id === "custom" ? "active-custom-dossier" : ""}`}>
          <span>📁 {suspect.id === "custom" ? "RE-UPLOAD CUSTOM SUSPECT" : "UPLOAD CUSTOM SUSPECT"}</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      {/* ================= MOBILE VIEW TAB SELECTOR (< 768px) ================= */}
      <div className="mobile-view-tabs" role="tablist" aria-label="Editor View Switcher">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "editor"}
          className={`mobile-tab-btn ${mobileTab === "editor" ? "active-tab-editor" : ""}`}
          onClick={() => {
            playClickSound();
            setMobileTab("editor");
          }}
        >
          <span>📸</span>
          <span>PHOTO EDITOR</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === "docket"}
          className={`mobile-tab-btn ${mobileTab === "docket" ? "active-tab-docket" : ""}`}
          onClick={() => {
            playClickSound();
            setMobileTab("docket");
          }}
        >
          <span>📑</span>
          <span>RAP SHEET DOCKET</span>
          <span className="mobile-stars-badge">{"★".repeat(suspect.stars)}</span>
        </button>
      </div>

      {/* ================= MAIN GRID: RAP SHEET + EDITOR ================= */}
      <div className="main-workspace-grid">
        <div className={`vice-panel docket-column ${mobileTab === "docket" ? "mobile-visible" : "mobile-hidden"}`}>
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
            <div key={`stars-row-${suspect.stars}-${starSyncKey}`} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= suspect.stars;
                return (
                  <button
                    key={`star-${star}-${starSyncKey}`}
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

          {/* Clear Primary Action & Fun GTA Randomizer Button */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={handleComposeWantedPoster}
              disabled={isGenerating}
              style={{
                padding: "12px",
                backgroundColor: "var(--neon-pink)",
                border: "none",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 0 14px var(--neon-pink-glow)",
                transition: "transform 0.15s ease",
              }}
            >
              ⚡ {isGenerating ? "COMPOSING..." : "COMPOSE WANTED POSTER"}
            </button>

            <button
              onClick={handleRandomizeDocket}
              style={{
                padding: "12px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              🎲 RANDOM CRIME
            </button>
          </div>
        </div>

        {/* Right Column: React Image Editor */}
        <div className={`editor-column ${mobileTab === "editor" ? "mobile-visible" : "mobile-hidden"}`}>
          {/* Tool Guidance Bar with Reset Shortcut */}
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
                Filters • Text • Stickers • Draw • Crop • Shapes
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                onClick={handleFitToScreen}
                title="Fit and center image inside workspace"
                style={{
                  padding: "6px 12px",
                  minHeight: "36px",
                  backgroundColor: "rgba(0, 240, 255, 0.12)",
                  border: "1px solid rgba(0, 240, 255, 0.4)",
                  borderRadius: "4px",
                  color: "var(--neon-cyan)",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ⛶ FIT PHOTO
              </button>

              <button
                onClick={handleEditorCancel}
                title="Reset all edits to original photo"
                style={{
                  padding: "6px 12px",
                  minHeight: "36px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "4px",
                  color: "#f87171",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ↺ RESET PHOTO
              </button>
            </div>
          </div>

          {/* The React Image Editor Container */}
          <div
            className="editor-canvas-wrapper"
            onClick={() => {
              // Ensure canvas immediately recalculates fit if a tool subpanel was opened or closed
              requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
              });
            }}
          >
            <ImageEditor
              key={`${currentImage}-${editorKey}`}
              ref={editorRef}
              image={currentImage}
              minHeight="100%"
              style={{
                width: "100%",
                height: "100%",
                flex: 1,
                minHeight: 0,
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
              }}
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
              onCancel={handleEditorCancel}
              onLoadError={() => showToast("Image load error.")}
            />
          </div>

          {/* Mobile Quick Action Strip in Photo Editor view */}
          <div className="mobile-quick-action-strip">
            <div className="mobile-suspect-summary">
              <div>
                <span style={{ color: "#ffffff", fontWeight: "800" }}>{suspect.name}</span>
                <span style={{ color: "#38bdf8", marginLeft: "6px", fontSize: "12px" }}>("{suspect.alias}")</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#fbbf24" }}>{"★".repeat(suspect.stars)}</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setMobileTab("docket");
                  }}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255, 0, 122, 0.4)",
                    borderRadius: "4px",
                    color: "var(--neon-pink)",
                    fontSize: "11px",
                    padding: "3px 8px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  ✏️ Edit Docket
                </button>
              </div>
            </div>

            <div className="mobile-action-btn-group">
              <button
                onClick={handleComposeWantedPoster}
                disabled={isGenerating}
                className="mobile-compose-btn"
              >
                ⚡ {isGenerating ? "COMPOSING..." : "COMPOSE WANTED POSTER"}
              </button>
              <button
                onClick={handleRandomizeDocket}
                className="mobile-random-btn"
              >
                🎲 RANDOM CRIME
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= OFFICIAL WANTED POSTER SECTION ================= */}
      {finalPosterUrl && (
        <section ref={posterSectionRef} className="vice-panel poster-preview-card">
          <div className="poster-header-row">
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

            {/* Clean Export Actions on Poster Card */}
            <div className="poster-actions-row">
              <button
                onClick={handleInstantDownload}
                className="poster-download-btn"
              >
                💾 DOWNLOAD POSTER (.PNG)
              </button>

              <button
                onClick={handleShareLink}
                className="poster-share-btn"
              >
                📤 SHARE BULLETIN LINK
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
              {/* Alert if manual edits were made above after composing */}
              {composedSuspect && (
                suspect.name !== composedSuspect.name ||
                suspect.alias !== composedSuspect.alias ||
                suspect.charge !== composedSuspect.charge ||
                suspect.location !== composedSuspect.location ||
                suspect.bounty !== composedSuspect.bounty ||
                suspect.dangerLevel !== composedSuspect.dangerLevel ||
                suspect.stars !== composedSuspect.stars
              ) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "rgba(255, 0, 122, 0.12)",
                    border: "1px solid var(--neon-pink)",
                    borderRadius: "6px",
                    marginBottom: "14px",
                    fontSize: "13px",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#f8fafc", fontSize: "12px" }}>
                    ⚠️ Docket edits detected above.
                  </span>
                  <button
                    onClick={handleComposeWantedPoster}
                    style={{
                      padding: "5px 12px",
                      backgroundColor: "var(--neon-pink)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#ffffff",
                      fontWeight: "800",
                      fontSize: "12px",
                      cursor: "pointer",
                      boxShadow: "0 0 10px var(--neon-pink-glow)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⚡ UPDATE POSTER
                  </button>
                </div>
              )}

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
                  ⭐ WANTED LEVEL {(composedSuspect || suspect).stars} • REWARD: ${(composedSuspect || suspect).bounty.toLocaleString()}
                </div>
                <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "18px" }}>
                  {(composedSuspect || suspect).name} ("{(composedSuspect || suspect).alias}")
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>
                  {(composedSuspect || suspect).charge}
                </div>
                <div style={{ color: "#00f0ff", fontSize: "13px", marginTop: "4px" }}>
                  Last Seen: {(composedSuspect || suspect).location}
                </div>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                Ready to submit! The poster contains your customized mugshot edits directly rendered from the React Image Editor,
                with the official VCPD booking grid, barcode, threat level, and Leonida Department of Corrections seal.
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
