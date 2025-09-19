import lightThemeCss from "highlight.js/styles/github.css?inline";
import darkThemeCss from "highlight.js/styles/github-dark.css?inline";

const LIGHT_ID = "hljs-theme-light";
const DARK_ID = "hljs-theme-dark";
const LINK_SELECTOR = 'link[data-hljs="true"]';

const themeCssMap = {
  default: lightThemeCss,
  light: lightThemeCss,
  dark: darkThemeCss,
};

const cssHrefCache = {};

function toDataUrl(cssText) {
  return `data:text/css,${encodeURIComponent(cssText)}`;
}

function resolveThemeKey(themeKey) {
  if (typeof themeKey === "string") {
    const normalized = themeKey.trim().toLowerCase();
    if (normalized && normalized in themeCssMap) return normalized;
  }
  return "default";
}

export function computeHljsHref(themeKey) {
  const normalized = resolveThemeKey(themeKey);
  if (!cssHrefCache[normalized]) {
    cssHrefCache[normalized] = toDataUrl(themeCssMap[normalized]);
  }
  return cssHrefCache[normalized];
}

function ensureStyle(id, cssText, disabled = false) {
  let styleEl = document.getElementById(id);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);
  }
  styleEl.disabled = disabled;
  return styleEl;
}

function ensureThemeLink(themeKey) {
  const normalized = resolveThemeKey(themeKey);
  const href = computeHljsHref(normalized);
  const head = document.head;
  if (!head) return null;

  let link = document.querySelector(LINK_SELECTOR);
  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.setAttribute("data-hljs", "true");
    head.appendChild(link);
  }
  link.setAttribute("data-theme", normalized);
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href);
  }
  return link;
}

export function applyHighlightTheme(themeKey = "default") {
  ensureThemeLink(themeKey);
}

export function ensureHighlightThemes(initialDark = false) {
  const light = ensureStyle(LIGHT_ID, lightThemeCss, initialDark);
  const dark = ensureStyle(DARK_ID, darkThemeCss, !initialDark);
  dark.disabled = !initialDark;
  light.disabled = initialDark;
  applyHighlightTheme(initialDark ? "dark" : "light");
}

export function toggleHighlightTheme(isDark) {
  const light = document.getElementById(LIGHT_ID);
  const dark = document.getElementById(DARK_ID);
  if (!light || !dark) return;
  light.disabled = isDark;
  dark.disabled = !isDark;
  applyHighlightTheme(isDark ? "dark" : "light");
}

export { ensureThemeLink };
