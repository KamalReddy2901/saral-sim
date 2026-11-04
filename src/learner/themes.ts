// Learner-screen colour themes. Single source of truth, also checked by tests (>= 7:1 for body text).
export interface LearnerTheme {
  bg: string; fg: string; soft: string;
  primaryBg: string; primaryFg: string;
  secondaryBg: string; secondaryFg: string; border: string;
  keyBg: string; keyFg: string;
  goodBg: string; goodFg: string;
  lookBg: string; lookFg: string;
  panel: string;
}

export const THEMES: Record<"normal" | "high", LearnerTheme> = {
  normal: {
    bg: "#ffffff", fg: "#0e1a2b", soft: "#33435a",
    primaryBg: "#1a36a0", primaryFg: "#ffffff",
    secondaryBg: "#ffffff", secondaryFg: "#0e1a2b", border: "#0e1a2b",
    keyBg: "#ffc933", keyFg: "#0e1a2b",
    goodBg: "#095c39", goodFg: "#ffffff",
    lookBg: "#ffe9c7", lookFg: "#0e1a2b",
    panel: "#eef3fb",
  },
  high: {
    bg: "#000000", fg: "#ffffff", soft: "#e6e6e6",
    primaryBg: "#ffd93b", primaryFg: "#000000",
    secondaryBg: "#000000", secondaryFg: "#ffffff", border: "#ffffff",
    keyBg: "#ffd93b", keyFg: "#000000",
    goodBg: "#4be3a0", goodFg: "#000000",
    lookBg: "#ffc2b8", lookFg: "#000000",
    panel: "#141414",
  },
};

export const TEXT_SCALE = [0.85, 1, 1.2] as const;

export function themeVars(theme: LearnerTheme, size: 0 | 1 | 2): Record<string, string> {
  return {
    "--l-bg": theme.bg, "--l-fg": theme.fg, "--l-soft": theme.soft,
    "--l-primary-bg": theme.primaryBg, "--l-primary-fg": theme.primaryFg,
    "--l-secondary-bg": theme.secondaryBg, "--l-secondary-fg": theme.secondaryFg, "--l-border": theme.border,
    "--l-key-bg": theme.keyBg, "--l-key-fg": theme.keyFg,
    "--l-good-bg": theme.goodBg, "--l-good-fg": theme.goodFg,
    "--l-look-bg": theme.lookBg, "--l-look-fg": theme.lookFg,
    "--l-panel": theme.panel,
    "--l-scale": String(TEXT_SCALE[size]),
  };
}
