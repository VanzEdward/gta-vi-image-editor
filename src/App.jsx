import React, { useRef, useState } from "react";
import ImageEditor from "@unlayer/react-image-editor";

const PRESET_TEMPLATES = [
  {
    id: "wanted-card",
    name: "Booking Height Chart",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80",
    crime: "Grand Theft Auto / Armed Robbery",
  },
  {
    id: "vice-sunset",
    name: "Vice Beach Getaway",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    crime: "Reckless Endangerment / Evading Arrest",
  },
  {
    id: "neon-strip",
    name: "Ocean Drive Night",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=80",
    crime: "Illicit Street Racing / Narcotics",
  },
];

export default function App() {
  const editorRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_TEMPLATES[0]);
  const [currentImage, setCurrentImage] = useState(PRESET_TEMPLATES[0].url);
  const [savedImage, setSavedImage] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result);
        setSelectedTemplate({
          name: "Custom Suspect Upload",
          crime: "Unidentified Suspect / Vice City Warrant",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = ({ dataUrl }) => {
    setSavedImage(dataUrl);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#090d16",
        color: "#f8fafc",
        padding: "24px 32px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top Banner */}
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          borderBottom: "2px solid rgba(255, 0, 128, 0.4)",
          paddingBottom: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                backgroundColor: "#e11d48",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "800",
                padding: "3px 8px",
                borderRadius: "4px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              VCPD Database
            </span>
            <span
              style={{
                color: "#fbbf24",
                fontSize: "14px",
                letterSpacing: "2px",
              }}
            >
              ★★★★★ WANTED
            </span>
          </div>
          <h1
            style={{
              margin: "6px 0 0",
              fontSize: "32px",
              fontWeight: "900",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              background: "linear-gradient(90deg, #ff007a 0%, #00f0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Vice City Mugshot Lab
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
            Current Record:{" "}
            <span style={{ color: "#f1f5f9", fontWeight: "600" }}>
              {selectedTemplate.crime}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <label
            style={{
              padding: "10px 18px",
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "#38bdf8",
            }}
          >
            + Upload Suspect Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </header>

      {/* Preset Selector Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "#64748b",
            textTransform: "uppercase",
            fontWeight: "700",
          }}
        >
          Quick Select:
        </span>
        {PRESET_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => {
              setSelectedTemplate(tpl);
              setCurrentImage(tpl.url);
            }}
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: "600",
              borderRadius: "6px",
              border: "1px solid",
              borderColor: currentImage === tpl.url ? "#ff007a" : "#1e293b",
              backgroundColor: currentImage === tpl.url ? "#1e1b4b" : "#0f172a",
              color: currentImage === tpl.url ? "#38bdf8" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Unlayer Editor */}
      <div
        style={{
          height: "670px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #1e293b",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        }}
      >
        <ImageEditor
          key={currentImage} // Forces editor to reload cleanly when switching presets
          ref={editorRef}
          image={currentImage}
          options={{
            theme: "dark",
          }}
          onSave={handleSave}
          onCancel={() => console.info("Edit canceled")}
          onLoadError={() => console.error("Image load failed. Verify CORS.")}
        />
      </div>

      {/* Export Section */}
      {savedImage && (
        <div
          style={{
            marginTop: "28px",
            padding: "24px",
            backgroundColor: "#0f172a",
            borderRadius: "8px",
            border: "1px solid rgba(255, 0, 128, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <span style={{ color: "#22c55e", fontSize: "18px" }}>●</span>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Suspect Record Processed
            </h3>
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <img
              src={savedImage}
              alt="Mugshot Export"
              style={{
                maxWidth: "360px",
                borderRadius: "6px",
                border: "2px solid #ff007a",
              }}
            />
            <div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "14px",
                  maxWidth: "400px",
                  lineHeight: "1.5",
                }}
              >
                Your edited poster has been rendered. Save it directly to your
                device or share it on social channels.
              </p>
              <a
                href={savedImage}
                download="vice-city-suspect.png"
                style={{
                  display: "inline-block",
                  padding: "10px 22px",
                  backgroundColor: "#ff007a",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Download Poster
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
