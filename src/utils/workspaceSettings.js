
const STORAGE_KEY = "nexora_settings_v1";

const accentThemes = {
  purple: {
    primary: "#A78BFA",
    secondary: "#55E6FF",
    gradient: "linear-gradient(135deg, #A78BFA, #7C5CFA)",
    gradientSecondary: "linear-gradient(135deg, #55E6FF, #A78BFA)",
    glow: "rgba(167, 139, 250, 0.22)",
    cyanGlow: "rgba(85, 230, 255, 0.12)"
  },
  blue: {
    primary: "#60A5FA",
    secondary: "#38BDF8",
    gradient: "linear-gradient(135deg, #60A5FA, #2563EB)",
    gradientSecondary: "linear-gradient(135deg, #38BDF8, #60A5FA)",
    glow: "rgba(96, 165, 250, 0.22)",
    cyanGlow: "rgba(56, 189, 248, 0.12)"
  },
  cyan: {
    primary: "#22D3EE",
    secondary: "#67E8F9",
    gradient: "linear-gradient(135deg, #22D3EE, #0891B2)",
    gradientSecondary: "linear-gradient(135deg, #67E8F9, #22D3EE)",
    glow: "rgba(34, 211, 238, 0.22)",
    cyanGlow: "rgba(103, 232, 249, 0.12)"
  },
  green: {
    primary: "#34D399",
    secondary: "#6EE7B7",
    gradient: "linear-gradient(135deg, #34D399, #059669)",
    gradientSecondary: "linear-gradient(135deg, #6EE7B7, #34D399)",
    glow: "rgba(52, 211, 153, 0.22)",
    cyanGlow: "rgba(110, 231, 183, 0.12)"
  },
  pink: {
    primary: "#F472B6",
    secondary: "#FDA4AF",
    gradient: "linear-gradient(135deg, #F472B6, #DB2777)",
    gradientSecondary: "linear-gradient(135deg, #FDA4AF, #F472B6)",
    glow: "rgba(244, 114, 182, 0.22)",
    cyanGlow: "rgba(253, 164, 175, 0.12)"
  }
};

export function getSavedSettings() {
  const defaults = {
    appearance: {
      theme: "dark",
      accent: "purple",
      density: "comfortable"
    }
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    return {
      ...defaults,
      ...saved,
      appearance: {
        ...defaults.appearance,
        ...(saved.appearance || {})
      }
    };
  } catch {
    return defaults;
  }
}

export function applyWorkspaceAppearance(settings) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const appearance = settings?.appearance || {};
  const selectedTheme = appearance.theme || "dark";
  const accent = accentThemes[appearance.accent] || accentThemes.purple;

  let actualTheme = selectedTheme;

  if (selectedTheme === "system") {
    actualTheme = window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  root.dataset.theme = actualTheme;
  root.dataset.density = appearance.density || "comfortable";

  root.style.setProperty("--accent-primary", accent.primary);
  root.style.setProperty("--accent-secondary", accent.secondary);
  root.style.setProperty("--gradient-primary", accent.gradient);
  root.style.setProperty("--gradient-secondary", accent.gradientSecondary);
  root.style.setProperty("--purple-glow", accent.glow);
  root.style.setProperty("--cyan-glow", accent.cyanGlow);
  root.style.setProperty("--settings-accent", accent.primary);
}

export { STORAGE_KEY };
