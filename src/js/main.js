import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import App from "../App.vue";
import { createRouter } from "./core/router.js";
import "/style.css";
import { registerSW } from "virtual:pwa-register";
import "./web/md3-elements.js";
import { ensureHighlightThemes } from "./web/hljs-theme-loader.js";

const THEME_STORAGE_KEY = "theme";

const isValidTheme = (theme) => theme === "dark" || theme === "light";

const coerceTheme = (value) => {
  if (typeof value === "string" && value.trim() !== "") {
    const trimmed = value.trim();
    const normalized = trimmed.toLowerCase();
    if (isValidTheme(normalized)) return normalized;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== value) {
        return coerceTheme(parsed);
      }
    } catch (error) {
      // non-JSON string, ignore
    }
    return null;
  }

  if (value && typeof value === "object") {
    if (typeof value.theme === "string") {
      return coerceTheme(value.theme);
    }
  }

  return null;
};

// Determine if the provided path should be resolved by the SPA router instead of a static file.
export function isSpaRoute(pathname) {
  if (typeof pathname !== "string" || pathname.length === 0) return true;
  const [cleanPath] = pathname.split(/[?#]/);
  const trimmed = cleanPath || "/";
  if (trimmed === "/" || trimmed === "") return true;
  const segments = trimmed.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "";
  return !/\.[a-z0-9]+$/i.test(lastSegment);
}

// Apply the persisted theme (if any) to the current document and return the resolved theme.
export function initTheme(doc = document, storage = localStorage) {
  const root = doc?.documentElement;
  const classList = root?.classList;
  let rawTheme = null;

  try {
    rawTheme = storage?.getItem?.(THEME_STORAGE_KEY) ?? null;
  } catch (error) {
    rawTheme = null;
  }

  const storedTheme = coerceTheme(rawTheme);
  const theme = isValidTheme(storedTheme) ? storedTheme : "light";

  if (classList?.add && classList?.remove) {
    if (theme === "dark") {
      classList.add("theme-dark");
    } else {
      classList.remove("theme-dark");
    }
  } else if (classList?.toggle) {
    // Fallback for environments where only toggle is available.
    classList.toggle("theme-dark", theme === "dark");
  }

  return theme;
}

// Create a router instance using the provided factory while enforcing a useful guard.
export function initRouter(routerFactory = createRouter) {
  const router = routerFactory();
  if (!router) {
    throw new Error("initRouter: routerFactory must return a router instance");
  }
  return router;
}

ensureHighlightThemes();
initTheme();
const router = initRouter();
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

// Use Pinia
app.use(pinia);

// Use Vue Router
app.use(router);

// Mount the app
app.mount("#app");

// Register PWA and wire update banner
try {
  const showUpdateBanner = () => {
    const banner = document.getElementById("update-banner");
    const btnReload = document.getElementById("update-reload");
    const btnLater = document.getElementById("update-later");
    if (!banner) return;
    banner.classList.remove("hidden");
    if (btnReload)
      btnReload.onclick = () => {
        if (window.__showSnackbar) window.__showSnackbar("Atualizando...");
        try {
          sessionStorage.setItem("sw-updated", "1");
        } catch (e) { console.warn('Operação não crítica falhou:', e); }
        updateSW(true);
      };
    if (btnLater) btnLater.onclick = () => banner.classList.add("hidden");
  };

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      showUpdateBanner();
    },
    onOfflineReady() {
      if (window.__showSnackbar)
        window.__showSnackbar("Pronto para usar offline");
    },
  });
} catch (error) {
  console.error(error);
}

// Show post-reload notice if applicable
try {
  if (sessionStorage.getItem("sw-updated") === "1") {
    sessionStorage.removeItem("sw-updated");
    if (window.__showSnackbar)
      window.__showSnackbar("Atualizado — recarregado");
  }
} catch (e) { console.warn('Operação não crítica falhou:', e); }
