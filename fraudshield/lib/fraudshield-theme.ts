export const fraudShieldTheme = {
  colors: {
    accentCyan: "#7ddcff",
    accentRose: "#ff88c8",
    accentViolet: "#8d86ff",
    bgBase: "#02050d",
    bgPanel: "#0a1320",
    bgPanelStrong: "#0d1827",
    borderSoft: "rgba(255, 255, 255, 0.08)",
    glowRose: "rgba(255, 136, 200, 0.18)",
    glowViolet: "rgba(117, 124, 255, 0.2)",
    glowVioletSoft: "rgba(141, 134, 255, 0.12)",
    panelHighlight: "rgba(255, 255, 255, 0.04)",
    success: "#7bf0c1",
    textMuted: "rgba(255, 255, 255, 0.62)"
  },
  copy: {
    button: "Enter Dashboard",
    status: "AI Fraud Detection",
    subtitle:
      "Enterprise-grade fraud monitoring for modern identity, payments, and session risk.",
    title: "FraudShield"
  },
  motion: {
    backgroundPulse: 10,
    button: 0.5,
    routeDelayMs: 860,
    scanline: 11,
    stagger: 0.08,
    streak: 15,
    subtitle: 0.58,
    title: 0.76,
    transition: 0.9
  }
} as const;

export const transitionEase = [0.18, 0.9, 0.24, 1] as const;
export const ambientEase = [0.42, 0, 0.18, 1] as const;
