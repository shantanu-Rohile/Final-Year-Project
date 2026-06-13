import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  {
    id: "light",
    label: "Light default",
    primary: "#dfddec",
    secondary: "#edecf2",
    tertiary: "#ffffff",
    text: "#1f2937",
    accent: "#7f23ca",
  },
  {
    id: "theme-ocean-breeze",
    label: "Ocean Breeze",
    primary: "#f0f9ff",
    secondary: "#e0f2fe",
    tertiary: "#ffffff",
    text: "#0c4a6e",
    accent: "#0ea5e9",
  },
  {
    id: "theme-arctic-mint",
    label: "Arctic Mint",
    primary: "#f0fdfa",
    secondary: "#ccfbf1",
    tertiary: "#ffffff",
    text: "#134e4a",
    accent: "#14b8a6",
  },
  {
    id: "theme-mint-dream",
    label: "Mint Dream",
    primary: "#f0fdf4",
    secondary: "#dcfce7",
    tertiary: "#ffffff",
    text: "#14532d",
    accent: "#10b981",
  },
  {
    id: "theme-rose-gold",
    label: "Rose Gold",
    primary: "#fef7f7",
    secondary: "#fce7e7",
    tertiary: "#ffffff",
    text: "#7c2d12",
    accent: "#e11d48",
  },
  {
    id: "theme-coral-reef",
    label: "Coral Reef",
    primary: "#fff5f5",
    secondary: "#fed7d7",
    tertiary: "#ffffff",
    text: "#c53030",
    accent: "#f56565",
  },
  {
    id: "theme-golden-hour",
    label: "Golden Hour",
    primary: "#fff8e1",
    secondary: "#ffecb3",
    tertiary: "#ffffff",
    text: "#bf360c",
    accent: "#ff9800",
  },
  {
    id: "theme-lavender-fields",
    label: "Lavender Fields",
    primary: "#faf5ff",
    secondary: "#f3e8ff",
    tertiary: "#ffffff",
    text: "#581c87",
    accent: "#8b5cf6",
  },
  {
    id: "dark",
    label: "Dark default",
    primary: "#111827",
    secondary: "#1f2937",
    tertiary: "#374151",
    text: "#d1d5db",
    accent: "#6b21a8",
  },
];

export default function Themes() {
  const [theme, setTheme] = useState("dark");

  // Apply theme to CSS variables
  const applyTheme = (id) => {
    const selected = themes.find((t) => t.id === id);
    if (!selected) return;

    const root = document.documentElement;

    root.style.setProperty("--bg-primary", selected.primary);
    root.style.setProperty("--bg-sec", selected.secondary);
    root.style.setProperty("--bg-ter", selected.tertiary);
    root.style.setProperty("--txt", selected.text);
    root.style.setProperty("--accent", selected.accent);
  };

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const onSelectTheme = (id) => {
    setTheme(id);
    localStorage.setItem("theme", id);
    applyTheme(id);
  };

 return (
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      color: "var(--txt)",
    }}
  >
    <h2
      style={{
        fontSize: "24px",
        marginBottom: "20px",
      }}
    >
      Choose Your Theme
    </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            style={{
              border: `2px solid ${
                theme === t.id ? t.accent : "rgba(107, 114, 128, 0.35)"
              }`,
              boxShadow:
                theme === t.id
                  ? `0 0 0 3px ${t.accent}40, 0 20px 25px -5px rgba(0,0,0,0.1)`
                  : "none",
              isolation: "isolate",
              display: "block",
              width: "100%",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Preview */}
            <div
              style={{
                height: "120px",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                backgroundColor: t.primary,
                color: t.text,
              }}
            >
              <div
                style={{
                  height: "10px",
                  borderRadius: "999px",
                  backgroundColor: t.secondary,
                }}
              />

              <div style={{ flex: 1, display: "flex", gap: "6px" }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: t.tertiary,
                      marginBottom: "4px",
                    }}
                  />
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: t.tertiary,
                      opacity: 0.7,
                    }}
                  />
                </div>

                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: t.accent,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "4px" }}>
                <div
                  style={{
                    height: "6px",
                    width: "40px",
                    backgroundColor: t.accent,
                  }}
                />
                <div
                  style={{
                    height: "6px",
                    width: "30px",
                    backgroundColor: t.tertiary,
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>

            {/* Label */}
            <div
              style={{
                padding: "8px",
                backgroundColor: t.secondary,
                color: t.text,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              <span>{t.label}</span>
              {theme === t.id && (
                <Check size={14} style={{ color: t.accent }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}