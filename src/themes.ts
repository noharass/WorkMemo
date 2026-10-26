import type { CSSProperties } from "react";

export const THEME_IDS = ["glass", "cream", "dark", "neon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const MIN_OPACITY = 80;
export const MAX_OPACITY = 100;

export interface Appearance {
  version: 1;
  theme: ThemeId;
  opacity: number;
}

export const DEFAULT_APPEARANCE: Appearance = { version: 1, theme: "cream", opacity: 88 };

interface Theme {
  name: string;
  description: string;
  defaultOpacity: number;
  scheme: "light" | "dark";
  windowRgb: string;
  surfaceRgb: string;
  inputRgb: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  onAccent: string;
  line: string;
  border: string;
  header: string;
  controlHover: string;
  secondaryHover: string;
  shadow: string;
  panelShadow: string;
  buttonShadow: string;
  timerShadow: string;
  timerFont: string;
  radius: number;
  controlRadius: number;
  noticeText: string;
  noticeBg: string;
  noticeBorder: string;
  errorText: string;
  errorBg: string;
  errorBorder: string;
  closeBg: string;
  onClose: string;
  scroll: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  glass: {
    name: "Glass", description: "清透玻璃", defaultOpacity: 82, scheme: "light",
    windowRgb: "225 237 242", surfaceRgb: "247 252 255", inputRgb: "252 254 255",
    text: "#233e45", muted: "#344d54", accent: "#365e70", accentHover: "#244959",
    accentText: "#214955", onAccent: "#ffffff", line: "#c0d0d8", border: "rgb(255 255 255 / 85%)",
    header: "rgb(255 255 255 / 24%)", controlHover: "rgb(48 85 104 / 13%)", secondaryHover: "#e4eff4",
    shadow: "0 2px 6px rgb(18 45 60 / 20%)", panelShadow: "0 4px 18px rgb(31 72 89 / 5%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 20, controlRadius: 9,
    noticeText: "#2b4e60", noticeBg: "#e5eff6", noticeBorder: "#b8d0df",
    errorText: "#852e2d", errorBg: "#f9e8e6", errorBorder: "#e6bdb7",
    closeBg: "#a84a48", onClose: "#ffffff", scroll: "rgb(54 94 112 / 42%)",
  },
  cream: {
    name: "Cream", description: "温暖奶油", defaultOpacity: 88, scheme: "light",
    windowRgb: "245 243 238", surfaceRgb: "255 253 248", inputRgb: "255 254 250",
    text: "#303b35", muted: "#435247", accent: "#3b6551", accentHover: "#2c513e",
    accentText: "#284b38", onAccent: "#ffffff", line: "#d7d8c9", border: "rgb(255 255 247 / 85%)",
    header: "rgb(255 255 255 / 15%)", controlHover: "rgb(70 90 65 / 12%)", secondaryHover: "#eeeee5",
    shadow: "0 2px 6px rgb(51 43 25 / 18%)", panelShadow: "0 6px 24px rgb(74 65 43 / 4%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 22, controlRadius: 10,
    noticeText: "#625022", noticeBg: "#ece5d4", noticeBorder: "#d7c89e",
    errorText: "#8b392e", errorBg: "#f6e7e2", errorBorder: "#e5c1b7",
    closeBg: "#a94f43", onClose: "#ffffff", scroll: "rgb(79 102 71 / 42%)",
  },
  dark: {
    name: "Dark", description: "安静深色", defaultOpacity: 94, scheme: "dark",
    windowRgb: "23 29 38", surfaceRgb: "32 40 51", inputRgb: "28 35 45",
    text: "#edf2f8", muted: "#c2ccd8", accent: "#a8d8be", accentHover: "#c2ead1",
    accentText: "#bce5cd", onAccent: "#16291f", line: "#4b596a", border: "rgb(156 181 203 / 34%)",
    header: "rgb(0 0 0 / 12%)", controlHover: "rgb(188 211 235 / 15%)", secondaryHover: "#344254",
    shadow: "0 2px 6px rgb(0 0 0 / 45%)", panelShadow: "0 6px 20px rgb(0 0 0 / 10%)",
    buttonShadow: "none", timerShadow: "none", timerFont: '"Segoe UI", sans-serif', radius: 18, controlRadius: 8,
    noticeText: "#f1db9f", noticeBg: "#3b3526", noticeBorder: "#766643",
    errorText: "#ffd3ca", errorBg: "#472d30", errorBorder: "#8c5558",
    closeBg: "#a8434c", onClose: "#ffffff", scroll: "rgb(184 205 229 / 42%)",
  },
  neon: {
    name: "Neon", description: "赛博微光", defaultOpacity: 90, scheme: "dark",
    windowRgb: "15 22 35", surfaceRgb: "22 32 49", inputRgb: "18 28 44",
    text: "#edf9ff", muted: "#c0d3e7", accent: "#6ef3da", accentHover: "#a6ffed",
    accentText: "#87f7e2", onAccent: "#092c29", line: "#3e697d", border: "rgb(110 243 218 / 57%)",
    header: "rgb(80 141 202 / 7%)", controlHover: "rgb(110 243 218 / 15%)", secondaryHover: "#234256",
    shadow: "0 1px 6px rgb(44 211 194 / 30%)", panelShadow: "inset 0 0 18px rgb(57 139 199 / 5%)",
    buttonShadow: "0 0 14px rgb(110 243 218 / 14%)", timerShadow: "0 0 18px rgb(110 243 218 / 20%)",
    timerFont: 'Consolas, "Cascadia Mono", monospace', radius: 12, controlRadius: 6,
    noticeText: "#f8e2a0", noticeBg: "#343526", noticeBorder: "#76754a",
    errorText: "#ffd0e1", errorBg: "#402b42", errorBorder: "#936581",
    closeBg: "#a9426c", onClose: "#ffffff", scroll: "rgb(110 243 218 / 45%)",
  },
};

export function isAppearance(value: unknown): value is Appearance {
  if (typeof value !== "object" || value === null) return false;
  const settings = value as Partial<Appearance>;
  return settings.version === 1 && THEME_IDS.some((id) => id === settings.theme)
    && typeof settings.opacity === "number" && Number.isInteger(settings.opacity)
    && settings.opacity >= MIN_OPACITY && settings.opacity <= MAX_OPACITY;
}

export function themeStyle(settings: Appearance): CSSProperties {
  const theme = THEMES[settings.theme];
  const variables: Record<string, string | number> = {
    "--text-primary": theme.text, "--text-muted": theme.muted,
    "--accent": theme.accent, "--accent-hover": theme.accentHover,
    "--accent-text": theme.accentText, "--on-accent": theme.onAccent,
    "--line": theme.line, "--window-rgb": theme.windowRgb,
    "--surface-rgb": theme.surfaceRgb, "--input-rgb": theme.inputRgb,
    "--window-opacity": settings.opacity / 100, "--surface-opacity": 0.94,
    "--window-border": theme.border, "--header-background": theme.header,
    "--control-hover": theme.controlHover, "--secondary-hover": theme.secondaryHover,
    "--window-shadow": theme.shadow, "--panel-shadow": theme.panelShadow,
    "--button-shadow": theme.buttonShadow, "--timer-shadow": theme.timerShadow,
    "--timer-font": theme.timerFont, "--window-radius": `${theme.radius}px`,
    "--panel-radius": `${Math.max(10, theme.radius - 2)}px`, "--control-radius": `${theme.controlRadius}px`,
    "--notice-text": theme.noticeText, "--notice-background": theme.noticeBg, "--notice-border": theme.noticeBorder,
    "--error": theme.errorText, "--error-background": theme.errorBg, "--error-border": theme.errorBorder,
    "--close-background": theme.closeBg, "--on-close": theme.onClose, "--scroll-thumb": theme.scroll,
  };
  return { ...variables, colorScheme: theme.scheme } as CSSProperties;
}
