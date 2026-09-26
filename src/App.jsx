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
import GtaStickerTray from "./components/GtaStickerTray";
import { MEDIA_TEMPLATES, renderGtaMediaFormat } from "./utils/posterRenderer";

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
  const [selectedTemplate, setSelectedTemplate] = useState("vcpd-bulletin");
  const [composedTemplate, setComposedTemplate] = useState("vcpd-bulletin");
  const [lastComposedImage, setLastComposedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileTab, setMobileTab] = useState("editor"); // "editor" | "docket"
  const [savedCustom, setSavedCustom] = useState(null);
  const [isStickerTrayOpen, setIsStickerTrayOpen] = useState(false);

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
    setComposedTemplate("vcpd-bulletin");
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
    setComposedTemplate(savedCustom.composedTemplate || "vcpd-bulletin");
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
        setComposedTemplate("vcpd-bulletin");
        setSavedCustom({ suspect: uploadedSuspect, currentImage: reader.result, composedTemplate: "vcpd-bulletin" });
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
    showToast("🎲 Generated new random crime dossier! Click 'Compose' to update poster.");
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

  // Handle GTA Custom Sticker Stamping onto suspect photo
  const handleApplyGtaSticker = (newImageUrl, stickerName) => {
    setCurrentImage(newImageUrl);
    setEditorKey((k) => k + 1);

    // If custom suspect, auto-save to IndexedDB
    if (suspect.id === "custom") {
      saveCustomDossier({
        suspect,
        currentImage: newImageUrl,
        finalPosterUrl,
        composedSuspect,
      });
    }

    showToast(`✓ Applied "${stickerName}" sticker! Click 'Update Graphic' to re-compose.`);
  };

  // Render Chosen GTA Media Format on Canvas
  const renderPosterCanvas = useCallback(
    (sourceImageUrl, targetSuspect = suspect, shouldScroll = true, templateOverride = null) => {
      setIsGenerating(true);
      const canvas = posterCanvasRef.current || document.createElement("canvas");
      const activeSuspect = targetSuspect || suspect;
      const activeTemplate = templateOverride || selectedTemplate;

      renderGtaMediaFormat(activeTemplate, canvas, sourceImageUrl, activeSuspect, (renderedUrl) => {
        setFinalPosterUrl(renderedUrl);
        setLastComposedImage(sourceImageUrl);
        setComposedSuspect(activeSuspect);
        setComposedTemplate(activeTemplate);
        setIsGenerating(false);

        if (shouldScroll) {
          setTimeout(() => {
            posterSectionRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      });
    },
    [suspect, selectedTemplate]
  );

  // Switch GTA Media Format (does NOT auto-compose; sets selected template so user can click Compose/Re-compose)
  const handleSelectTemplate = (templateId) => {
    playClickSound();
    setSelectedTemplate(templateId);
    const tpl = MEDIA_TEMPLATES.find((t) => t.id === templateId);
    showToast(`Format set to ${tpl ? tpl.name : templateId}. Click Compose/Re-compose to generate!`);
  };

  // Detect if suspect details, photo, or format have been edited since the graphic was composed
  const isDocketModified = Boolean(
    finalPosterUrl && composedSuspect && (
      suspect.name !== composedSuspect.name ||
      suspect.alias !== composedSuspect.alias ||
      suspect.charge !== composedSuspect.charge ||
      suspect.location !== composedSuspect.location ||
      suspect.bounty !== composedSuspect.bounty ||
      suspect.dangerLevel !== composedSuspect.dangerLevel ||
      suspect.stars !== composedSuspect.stars ||
      selectedTemplate !== composedTemplate ||
      (lastComposedImage && currentImage !== lastComposedImage)
    )
  );

  // Primary Action: Compose Wanted Poster / Media Graphic
  const handleComposeWantedPoster = () => {
    playShutterSound();
    const editorCanvasUrl = editorRef.current?.editor?.getImage();
    const imageToUse = editorCanvasUrl || currentImage;
    renderPosterCanvas(imageToUse, suspect, true, selectedTemplate);
    const tpl = MEDIA_TEMPLATES.find((t) => t.id === selectedTemplate);
    showToast(`${tpl ? tpl.name : "Graphic"} generated below!`);
  };

  // On Save from Unlayer Image Editor: Saves edits to current profile photo
  const handleEditorSave = ({ dataUrl }) => {
    playClickSound();
    setCurrentImage(dataUrl);
    showToast("✓ Visual edits saved! Click 'Compose' to update graphic.");
  };

  // On Cancel from Unlayer Image Editor: Genuinely reverts back to original unedited photo
  const handleEditorCancel = () => {
    playClickSound();
    setCurrentImage(suspect.url);
    setEditorKey((k) => k + 1);
    if (editorRef.current?.editor?.reset) {
      editorRef.current.editor.reset(suspect.url);
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
    const activeTpl = composedTemplate || selectedTemplate;
    const prefix =
      activeTpl === "weazel-news"
        ? "WEAZEL_NEWS_"
        : activeTpl === "loading-art"
        ? "GTA_VI_LOADING_ART_"
        : "VCPD_WANTED_";
    const a = document.createElement("a");
    a.href = finalPosterUrl;
    a.download = `${prefix}${currentPosterSuspect.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading High-Res Graphic (.PNG)...");
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                SUSPECT NAME:
              </label>
              <span style={{ fontSize: "10px", color: (suspect.name || "").length >= 26 ? "#ff4d6d" : "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                {(suspect.name || "").length}/26
              </span>
            </div>
            <input
              type="text"
              maxLength={26}
              value={suspect.name}
              onChange={(e) => setSuspect({ ...suspect, name: e.target.value.slice(0, 26) })}
              placeholder="e.g. MARCO 'EL TIBURON' RIVERA"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                ALIAS / MONIKER:
              </label>
              <span style={{ fontSize: "10px", color: (suspect.alias || "").length >= 24 ? "#ff4d6d" : "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                {(suspect.alias || "").length}/24
              </span>
            </div>
            <input
              type="text"
              maxLength={24}
              value={suspect.alias}
              onChange={(e) => setSuspect({ ...suspect, alias: e.target.value.slice(0, 24) })}
              placeholder="e.g. THE HARBOR PHANTOM"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                BOUNTY / CASH REWARD ($ USD):
              </label>
              <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                MAX $99M
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="99999999"
              step="50000"
              value={suspect.bounty}
              onChange={(e) => {
                const val = Math.min(99999999, Math.max(0, Number(e.target.value) || 0));
                setSuspect({ ...suspect, bounty: val });
              }}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                PRIMARY OFFENSE:
              </label>
              <span style={{ fontSize: "10px", color: (suspect.charge || "").length >= 55 ? "#ff4d6d" : "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                {(suspect.charge || "").length}/55
              </span>
            </div>
            <input
              type="text"
              maxLength={55}
              value={suspect.charge}
              onChange={(e) => setSuspect({ ...suspect, charge: e.target.value.slice(0, 55) })}
              placeholder="e.g. Contraband Smuggling & Speedboat Evading"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                LAST SIGHTED LOCATION:
              </label>
              <span style={{ fontSize: "10px", color: (suspect.location || "").length >= 35 ? "#ff4d6d" : "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                {(suspect.location || "").length}/35
              </span>
            </div>
            <input
              type="text"
              maxLength={35}
              value={suspect.location}
              onChange={(e) => setSuspect({ ...suspect, location: e.target.value.slice(0, 35) })}
              placeholder="e.g. Vice Port Pier 4"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="hud-font" style={{ fontSize: "11px", color: "#94a3b8" }}>
                THREAT ASSESSMENT:
              </label>
              <span style={{ fontSize: "10px", color: (suspect.dangerLevel || "").length >= 45 ? "#ff4d6d" : "#64748b", fontFamily: "'Chakra Petch', monospace" }}>
                {(suspect.dangerLevel || "").length}/45
              </span>
            </div>
            <input
              type="text"
              maxLength={45}
              value={suspect.dangerLevel}
              onChange={(e) => setSuspect({ ...suspect, dangerLevel: e.target.value.slice(0, 45) })}
              placeholder="e.g. FLIGHT RISK / WEAPON POSSESSION"
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

          {/* Media Output Format Selector */}
          <div style={{ marginBottom: "14px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="field-label" style={{ margin: 0, fontSize: "11px" }}>
                OUTPUT MEDIA FORMAT:
              </label>
              <span style={{ fontSize: "10px", color: "var(--neon-cyan)", fontFamily: "'Chakra Petch', monospace", fontWeight: "700" }}>
                {MEDIA_TEMPLATES.find((t) => t.id === selectedTemplate)?.badge}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              {MEDIA_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  title={`${tpl.name} (${tpl.dimensions})`}
                  style={{
                    padding: "8px 4px",
                    backgroundColor: selectedTemplate === tpl.id ? "rgba(0, 240, 255, 0.2)" : "rgba(30, 41, 59, 0.6)",
                    border: `1px solid ${selectedTemplate === tpl.id ? "var(--neon-cyan)" : "#334155"}`,
                    borderRadius: "5px",
                    color: selectedTemplate === tpl.id ? "#ffffff" : "#94a3b8",
                    fontSize: "10px",
                    fontWeight: selectedTemplate === tpl.id ? "800" : "600",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    boxShadow: selectedTemplate === tpl.id ? "0 0 10px rgba(0, 240, 255, 0.3)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{tpl.icon}</span>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                    {tpl.id === "vcpd-bulletin" ? "VCPD POSTER" : tpl.id === "weazel-news" ? "WEAZEL TV" : "GTA VI ART"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Primary Action & Fun GTA Randomizer Button */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={handleComposeWantedPoster}
              disabled={isGenerating}
              style={{
                padding: "12px",
                backgroundColor: isDocketModified ? "var(--neon-pink)" : finalPosterUrl ? "#1e293b" : "var(--neon-pink)",
                border: isDocketModified ? "2px solid #00f0ff" : finalPosterUrl ? "1px solid #334155" : "none",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: isDocketModified ? "0 0 16px rgba(0, 240, 255, 0.6)" : "0 0 14px var(--neon-pink-glow)",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ {isGenerating ? "COMPOSING..." : isDocketModified ? "UPDATE COMPOSED GRAPHIC" : finalPosterUrl ? "RE-COMPOSE GRAPHIC" : "COMPOSE MEDIA GRAPHIC"}
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

              {/* GTA Custom Stickers Toggle Button */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsStickerTrayOpen((prev) => !prev);
                }}
                title="Toggle GTA VI Custom Sticker Pack (WASTED, BUSTED, Aviator Shades, Gold Chain, Badges)"
                style={{
                  padding: "6px 12px",
                  minHeight: "36px",
                  backgroundColor: isStickerTrayOpen ? "rgba(255, 0, 122, 0.25)" : "rgba(255, 0, 122, 0.12)",
                  border: `1px solid ${isStickerTrayOpen ? "var(--neon-pink)" : "rgba(255, 0, 122, 0.5)"}`,
                  borderRadius: "4px",
                  color: "var(--neon-pink)",
                  fontSize: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: isStickerTrayOpen ? "0 0 10px rgba(255, 0, 122, 0.4)" : "none",
                }}
              >
                🎨 {isStickerTrayOpen ? "HIDE STICKERS" : "GTA STICKERS"}
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

          {/* GTA VI Custom Sticker Pack Drawer */}
          <GtaStickerTray
            currentImage={editorRef.current?.editor?.getImage() || currentImage}
            onApplySticker={handleApplyGtaSticker}
            onResetPhoto={handleEditorCancel}
            isOpen={isStickerTrayOpen}
            setIsOpen={setIsStickerTrayOpen}
            showToast={showToast}
          />

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
                style={isDocketModified ? { border: "2px solid #00f0ff", boxShadow: "0 0 16px rgba(0, 240, 255, 0.6)" } : {}}
              >
                ⚡ {isGenerating ? "COMPOSING..." : isDocketModified ? "UPDATE COMPOSED GRAPHIC" : finalPosterUrl ? "RE-COMPOSE GRAPHIC" : "COMPOSE MEDIA GRAPHIC"}
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

      {/* ================= OFFICIAL GTA MEDIA GRAPHIC SECTION ================= */}
      {finalPosterUrl && (
        <section ref={posterSectionRef} className="vice-panel poster-preview-card">
          <div className="poster-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>
                {(composedTemplate || selectedTemplate) === "weazel-news" ? "📺" : (composedTemplate || selectedTemplate) === "loading-art" ? "🌴" : "🚨"}
              </span>
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
                {(composedTemplate || selectedTemplate) === "weazel-news"
                  ? "Weazel News Live TV Broadcast Generated"
                  : (composedTemplate || selectedTemplate) === "loading-art"
                  ? "GTA VI Official Character Splash Art Generated"
                  : "Official VCPD Wanted Poster Generated"}
              </h3>
            </div>

            {/* Clean Export Actions on Poster Card */}
            <div className="poster-actions-row">
              <button
                onClick={handleInstantDownload}
                className="poster-download-btn"
              >
                💾 DOWNLOAD GRAPHIC (.PNG)
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
              marginTop: "20px",
            }}
          >
            {/* The Rendered Media Preview */}
            <div style={{ maxWidth: (composedTemplate || selectedTemplate) === "weazel-news" ? "580px" : "460px", width: "100%", transition: "max-width 0.3s ease" }}>
              <img
                src={finalPosterUrl}
                alt="Generated GTA Media Graphic"
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
                  ⭐ WANTED LEVEL {(composedSuspect || suspect).stars} • REWARD: ${(composedSuspect || suspect).bounty.toLocaleString()}
                </div>
                <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "18px", wordBreak: "break-word" }}>
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
