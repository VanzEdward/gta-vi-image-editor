import React, { useState, useEffect, useRef } from "react";
import "./TerminalBootScreen.css";
import { playTerminalKeySound, playTerminalAccessSound } from "../utils/audio";

const BOOT_LOG_SEQUENCE = [
  { time: "00:01:02", text: "INITIALIZING VCPD CENTRAL MAINFRAME KERNEL v6.24.9...", tag: "[OK]", type: "ok", delay: 550 },
  { time: "00:01:03", text: "CONNECTING ENCRYPTED TUNNEL: LEONIDA STATE CJIS NETWORK...", tag: "[SECURE]", type: "sec", delay: 650 },
  { time: "00:01:04", text: "CLEARANCE VERIFICATION: DETECTIVE BADGE AUTHORIZED...", tag: "[LEVEL 5]", type: "ok", delay: 550 },
  { time: "00:01:05", text: "MOUNTING CRIMINAL DOSSIERS & LOCAL EVIDENCE CACHE...", tag: "[5 MOUNTED]", type: "sec", delay: 600 },
  { time: "00:01:06", text: "ALLOCATING 1000x1400 HD FORENSIC CANVAS COMPOSITOR...", tag: "[ARMED]", type: "ok", delay: 600 },
  { time: "00:01:07", text: "ACTIVE THREAT MONITOR: 10-99 HIGH PRIORITY WANTED ALERT...", tag: "[ARMED]", type: "warn", delay: 550 },
  { time: "00:01:08", text: "ALL SYSTEMS OPERATIONAL. 100% COMPLETE. TERMINAL READY.", tag: "[READY]", type: "ok", delay: 500 },
];

export default function TerminalBootScreen({ onEnter }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const enteredRef = useRef(false);

  // Live VCPD Clock
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
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sequential typing/log effect with realistic boot pacing
  useEffect(() => {
    if (visibleCount < BOOT_LOG_SEQUENCE.length) {
      const stepDelay = BOOT_LOG_SEQUENCE[visibleCount]?.delay || 550;
      const timer = setTimeout(() => {
        setVisibleCount((prev) => {
          const next = prev + 1;
          try {
            playTerminalKeySound();
          } catch {
            // Ignore sound error
          }
          return next;
        });
      }, stepDelay);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  const isBootComplete = visibleCount >= BOOT_LOG_SEQUENCE.length;

  // Handle entry to main app
  const handleEnter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setIsEntering(true);

    try {
      playTerminalAccessSound();
    } catch {
      // Ignore
    }

    setTimeout(() => {
      onEnter();
    }, 450);
  };

  // Keyboard shortcut listener (Enter, Space, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape allows skipping anytime
      if (e.key === "Escape") {
        e.preventDefault();
        handleEnter();
        return;
      }

      // Enter or Space only triggers once boot is 100% complete
      if (e.key === "Enter" || e.key === " ") {
        if (isBootComplete) {
          e.preventDefault();
          handleEnter();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBootComplete]);

  const progressPercent = Math.min(
    100,
    Math.round((visibleCount / BOOT_LOG_SEQUENCE.length) * 100)
  );

  return (
    <div
      className={`vcpd-boot-overlay ${isEntering ? "is-entering" : ""}`}
      role="dialog"
      aria-label="VCPD Terminal Boot Screen"
    >
      {/* CRT Scanline & Glass Curve Overlays */}
      <div className="vcpd-boot-crt-scanlines" />
      <div className="vcpd-boot-vignette" />

      {/* Top Header Status Bar */}
      <header className="vcpd-boot-header">
        <div className="vcpd-boot-header-left">
          <span className="vcpd-boot-badge-icon">★</span>
          <span className="vcpd-boot-header-title">
            VCPD MAINFRAME // SECURE TERMINAL NODE 09
          </span>
        </div>

        <div className="vcpd-boot-indicators">
          <div className="vcpd-boot-indicator">
            <span className="vcpd-boot-dot green" />
            <span>NODE ONLINE</span>
          </div>
          <div className="vcpd-boot-indicator">
            <span className="vcpd-boot-dot pink" />
            <span>CIPHER: AES-4096</span>
          </div>
          <div className="vcpd-boot-indicator" style={{ color: "#38bdf8" }}>
            <span>TIME: {currentTime || "00:00:00"}</span>
          </div>
        </div>

        <button
          onClick={handleEnter}
          className="vcpd-boot-skip-btn"
          title="Skip terminal animation (Escape or Enter)"
        >
          [ ESC / SKIP ]
        </button>
      </header>

      {/* Main Terminal Center Stage */}
      <main className="vcpd-boot-body">
        {/* Animated Police Seal & Radar Sweep */}
        <div className="vcpd-boot-emblem-wrap">
          <div className="vcpd-boot-radar-ring" />
          <div className="vcpd-boot-radar-ring-inner" />
          <div className="vcpd-boot-badge-shield">
            <div className="vcpd-boot-badge-stars">★★★★★</div>
            <div className="vcpd-boot-badge-text">VCPD</div>
          </div>
        </div>

        {/* Titles */}
        <div className="vcpd-boot-titles">
          <h1 className="vcpd-boot-main-title">
            VICE CITY POLICE DEPT.
          </h1>
          <p className="vcpd-boot-sub-title">
            LEONIDA STATE CORRECTIONS // SUSPECT DOSSIER & EVIDENCE LAB
          </p>
        </div>

        {/* Console Box with Typewriter Lines */}
        <div className="vcpd-boot-console-box">
          <div className="vcpd-boot-console-bar">
            <span>CONSOLE: /DEV/TTY1 - ROOT AUTHENTICATED</span>
            <span>SECURE PROTOCOL v6.24</span>
          </div>

          <div className="vcpd-boot-console-log">
            {BOOT_LOG_SEQUENCE.slice(0, visibleCount).map((log, idx) => (
              <div key={idx} className="vcpd-boot-log-line">
                <span className="vcpd-boot-log-time">[{log.time}]</span>
                <span className="vcpd-boot-log-prefix">&gt;</span>
                <span className="vcpd-boot-log-text">{log.text}</span>
                <span
                  className={
                    log.type === "ok"
                      ? "vcpd-boot-log-tag-ok"
                      : log.type === "warn"
                      ? "vcpd-boot-log-tag-warn"
                      : "vcpd-boot-log-tag-sec"
                  }
                >
                  {log.tag}
                </span>
              </div>
            ))}
            {visibleCount < BOOT_LOG_SEQUENCE.length && (
              <span className="vcpd-boot-cursor" />
            )}
          </div>

          {/* Progress Bar */}
          <div className="vcpd-boot-progress-wrap">
            <span>BOOTING SUBSYSTEMS: {progressPercent}%</span>
            <div className="vcpd-boot-progress-track">
              <div
                className="vcpd-boot-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>
              {visibleCount >= BOOT_LOG_SEQUENCE.length ? "READY" : "LOADING..."}
            </span>
          </div>
        </div>

        {/* Action Button: Only appears when booting reaches 100% */}
        <div className="vcpd-boot-actions">
          {isBootComplete ? (
            <div className="vcpd-boot-cta-container">
              <button
                onClick={handleEnter}
                className="vcpd-boot-enter-btn"
                id="vcpd-boot-enter-btn"
              >
                <span>⚡ ACCESS SUSPECT DATABASE & LAUNCH LAB</span>
                <span className="vcpd-boot-btn-arrow">▶</span>
              </button>
              <span className="vcpd-boot-hint">
                [ PRESS ENTER OR CLICK TO INITIALIZE ]
              </span>
            </div>
          ) : (
            <div className="vcpd-boot-loading-status">
              <span className="vcpd-boot-spinner-pulse">●</span>
              <span>INITIALIZING SECURE MAINFRAME... PLEASE STAND BY ({progressPercent}%)</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer System Telemetry */}
      <footer className="vcpd-boot-footer">
        <div>
          <span>SYSTEM: LEONIDA CRIMINAL JUSTICE INFORMATION SYSTEM (LEO-CJIS)</span>
        </div>
        <div className="vcpd-boot-footer-stars">
          <span>THREAT LEVEL: ★★★★★ PRIORITY WANTED MONITORING ACTIVE</span>
        </div>
        <div>
          <span>AUTHORIZED LAW ENFORCEMENT & PUBLIC EVIDENCE PORTAL</span>
        </div>
      </footer>
    </div>
  );
}
