import React, { useState } from "react";
import "./GtaStickerTray.css";
import { GTA_STICKERS, applyStickerToImage } from "../utils/gtaStickers";
import { playClickSound, playStarSound } from "../utils/audio";

export default function GtaStickerTray({
  currentImage,
  onApplySticker,
  onResetPhoto,
  isOpen,
  setIsOpen,
  showToast,
}) {
  const [category, setCategory] = useState("all");
  const [isApplying, setIsApplying] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);

  const filteredStickers = GTA_STICKERS.filter((s) => {
    if (category === "all") return true;
    return s.category === category;
  });

  const handleStickerClick = async (sticker) => {
    if (isApplying || !currentImage) return;
    setIsApplying(true);
    playClickSound();

    try {
      // Save current image to history before stamping
      setHistoryStack((prev) => [...prev, currentImage]);

      const stampedUrl = await applyStickerToImage(currentImage, sticker);
      playStarSound(3); // satisfying affirmative chime
      onApplySticker(stampedUrl, sticker.name);
      if (showToast) {
        showToast(`💥 Stamped "${sticker.name}" onto suspect photo!`);
      }
    } catch (err) {
      console.error("[GTA Stickers] Failed to apply sticker:", err);
      if (showToast) {
        showToast("⚠️ Failed to apply sticker. Try again.");
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    playClickSound();
    const previousImage = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    onApplySticker(previousImage, "Undo");
    if (showToast) {
      showToast("↺ Undid last sticker!");
    }
  };

  return (
    <div className={`gta-sticker-tray-container ${isOpen ? "is-open" : ""}`}>
      {/* Header Toggle Accordion */}
      <div
        className="gta-sticker-toggle-header"
        onClick={() => {
          playClickSound();
          setIsOpen(!isOpen);
        }}
      >
        <div className="gta-sticker-toggle-left">
          <span className="gta-sticker-badge-tag">NEW</span>
          <span className="gta-sticker-title">🎨 GTA VI STICKER PACK</span>
          <span className="gta-sticker-sub">
            (WASTED, BUSTED, SHADES, BADGES, POLICE TAPE...)
          </span>
        </div>

        <div className="gta-sticker-toggle-right">
          <span style={{ fontSize: "11px", color: "var(--neon-cyan)", fontWeight: "700" }}>
            {isOpen ? "HIDE STICKERS" : "CLICK TO OPEN"}
          </span>
          <span className={`gta-sticker-arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>
      </div>

      {/* Expanded Sticker Drawer */}
      {isOpen && (
        <div className="gta-sticker-body">
          {/* Controls Bar: Category Filter & Undo */}
          <div className="gta-sticker-controls-bar">
            <div className="gta-sticker-categories">
              {[
                { id: "all", label: "ALL (12)" },
                { id: "stamps", label: "💥 STAMPS" },
                { id: "props", label: "🕶️ PROPS" },
                { id: "police", label: "🚨 POLICE" },
                { id: "effects", label: "🩸 EFFECTS" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`gta-sticker-cat-btn ${category === cat.id ? "active" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="gta-sticker-actions-bar">
              <button
                onClick={handleUndo}
                disabled={historyStack.length === 0}
                className="gta-sticker-undo-btn"
                title="Undo last stamped sticker"
              >
                ↺ UNDO ({historyStack.length})
              </button>
            </div>
          </div>

          {/* Sticker Grid */}
          <div className="gta-sticker-grid">
            {filteredStickers.map((sticker) => (
              <div
                key={sticker.id}
                className="gta-sticker-card"
                onClick={() => handleStickerClick(sticker)}
                title={`Click to stamp ${sticker.name} onto suspect (${sticker.tagline})`}
              >
                <div className="gta-sticker-preview-wrap">
                  <img
                    src={sticker.svgDataUrl}
                    alt={sticker.name}
                    className="gta-sticker-img"
                    loading="lazy"
                  />
                </div>
                <div className="gta-sticker-meta">
                  <div className="gta-sticker-name">{sticker.name}</div>
                  <span className="gta-sticker-badge">
                    {sticker.placement.replace("-", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
