// Enhances interactive elements inside loaded aula HTML

const DEFAULT_CONTENT_SELECTOR = "#content";
const ENHANCED_FLAG = "aula-enhanced";

export function computeSectionId(node, index = 0) {
  if (!node) return `section-${index}`;

  const rawId = typeof node.id === "string" ? node.id.trim() : "";
  if (rawId) return rawId;

  const dataId = node.dataset?.sectionId?.trim();
  if (dataId) return dataId;

  return `section-${index}`;
}

export function shouldEnhance(node) {
  if (!node || node.nodeType !== 1) return false;

  const dataset = node.dataset || {};
  const enhancedFlag = dataset.enhanced;
  if (typeof enhancedFlag === "string" && enhancedFlag.length) {
    if (enhancedFlag === "1" || enhancedFlag.toLowerCase() === "true") {
      return false;
    }
  }

  if (node.classList?.contains(ENHANCED_FLAG)) {
    return false;
  }

  const flag = dataset.enhance;
  if (flag === undefined) return false;
  if (flag === "" || flag === "true") return true;

  return String(flag).toLowerCase() === "true";
}

export const shouldEnhanceNode = shouldEnhance;

const isEnhanceCapable = (node) => typeof node?.setAttribute === "function";

export function markEnhanced(node, sectionId) {
  if (!node) return false;

  try {
    if (node.dataset) {
      node.dataset.enhanced = "true";
    } else if (isEnhanceCapable(node)) {
      node.setAttribute("data-enhanced", "true");
    }
  } catch (_) {
    if (isEnhanceCapable(node)) {
      node.setAttribute("data-enhanced", "true");
    }
  }

  if (node.classList?.add) {
    node.classList.add(ENHANCED_FLAG);
  }

  if (sectionId && isEnhanceCapable(node)) {
    try {
      node.setAttribute("data-enhanced-id", sectionId);
    } catch (_) {}
  }

  return true;
}

export function enhanceAulaPage(doc = document, options = {}) {
  const selector = options.selector || DEFAULT_CONTENT_SELECTOR;
  const root = doc?.querySelector?.(selector);
  if (!root) return;

  const sections = root.querySelectorAll("section");
  sections.forEach((section, index) => {
    if (!shouldEnhance(section)) return;

    const sectionId = computeSectionId(section, index);
    markEnhanced(section, sectionId);
    enhanceAulaContent(section);
  });
}

export function enhanceAulaContent(root) {
  if (!root) return;

  // Accordions: .accordion-toggle controls nearest following .accordion-content
  try {
    const toggles = root.querySelectorAll(".accordion-toggle");
    toggles.forEach((btn) => {
      // ensure proper aria
      btn.setAttribute("aria-controls", btn.id ? btn.id + "-panel" : "");
      btn.setAttribute("aria-expanded", "false");
      const container = btn.closest(".card, div, section") || root;
      const panel = container.querySelector(".accordion-content");
      if (!panel) return;
      panel.style.maxHeight = "0px";
      panel.setAttribute("hidden", "");
      panel.setAttribute("role", "region");

      btn.addEventListener("click", () => {
        const isOpen = panel.hasAttribute("hidden") === false;
        if (isOpen) {
          panel.style.maxHeight = "0px";
          panel.setAttribute("hidden", "");
          btn.setAttribute("aria-expanded", "false");
          try {
            btn.querySelector(".transform")?.classList.remove("rotate-180");
          } catch (e) { console.warn('Operação não crítica falhou:', e); }
        } else {
          panel.removeAttribute("hidden");
          const h = panel.scrollHeight;
          panel.style.maxHeight = h + "px";
          btn.setAttribute("aria-expanded", "true");
          try {
            btn.querySelector(".transform")?.classList.add("rotate-180");
          } catch (e) { console.warn('Operação não crítica falhou:', e); }
        }
      });
    });
  } catch (e) { console.warn('Operação não crítica falhou:', e); }

  // Video placeholders: upgrade empty .aspect-video to iframe only for known video hosts
  try {
    const containers = root.querySelectorAll(".aspect-video");
    containers.forEach((box) => {
      const hasMedia = box.querySelector("iframe, video, embed, object");
      if (hasMedia) return;
      let src =
        box.getAttribute("data-src") ||
        box.dataset?.src ||
        box.querySelector('a[href^="http"]')?.getAttribute("href") ||
        box.parentElement
          ?.querySelector('a[href^="http"]')
          ?.getAttribute("href");
      const toPrivacySrc = (url) => {
        try {
          const u = new URL(url, window.location.href);
          if (
            /youtube\.com$/i.test(u.hostname) ||
            /youtu\.be$/i.test(u.hostname)
          ) {
            if (u.hostname.includes("youtu.be")) {
              const id = u.pathname.replace(/^\//, "");
              return `https://www.youtube-nocookie.com/embed/${id}`;
            }
            return url
              .replace("www.youtube.com", "www.youtube-nocookie.com")
              .replace("youtube.com", "youtube-nocookie.com");
          }
          return url;
        } catch (_) {
          return url;
        }
      };
      if (src) src = toPrivacySrc(src);
      if (!src) return;
      // Only embed if source is a supported video host (YouTube/Vimeo)
      try {
        const u = new URL(src, window.location.href);
        const host = u.hostname;
        const isYouTube =
          /youtube\.com$/i.test(host) ||
          /youtu\.be$/i.test(host) ||
          host.includes("youtube-nocookie");
        const isVimeo =
          /vimeo\.com$/i.test(host) || host.includes("player.vimeo.com");
        if (!(isYouTube || isVimeo)) return;
      } catch (_) {
        return;
      }
      const titleEl = box.closest(".card")?.querySelector("h3, h4, h5");
      const title = titleEl?.textContent?.trim() || "Vídeo";
      const iframe = document.createElement("iframe");
      iframe.setAttribute("src", src);
      iframe.setAttribute("title", title);
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      );
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      box.appendChild(iframe);
    });
  } catch (e) { console.warn('Operação não crítica falhou:', e); }

  // Add copy buttons to code blocks
  try {
    const pres = root.querySelectorAll("pre > code");
    const detectLanguage = (code) => {
      const classList = code.className || "";
      const hasLanguage = /\blanguage-[\w-]+/.test(classList);
      const isPlain = /\blanguage-plaintext\b/.test(classList);
      if (hasLanguage && !isPlain) return;

      const source = code.textContent || code.innerText || "";
      const cLikePattern = /#include\s+<|int\s+main\s*\(|printf\s*\(|scanf\s*\(|return\s+\d/;
      if (cLikePattern.test(source)) {
        code.classList.remove("language-plaintext");
        code.classList.add("language-c");
        return;
      }

      const pseudoPattern = /(ALGORITMO|FIM_ALGORITMO|LEIA\(|ESCREVA\(|ENTAO|SENAO)/i;
      if (pseudoPattern.test(source)) {
        code.classList.remove("language-plaintext");
        code.classList.add("language-c");
      }
    };

    pres.forEach((code) => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.enhancedCopy === "1") return;
      pre.dataset.enhancedCopy = "1";
      detectLanguage(code);
      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      try {
        const computed = window.getComputedStyle?.(pre);
        if (computed) {
          wrapper.style.marginTop = computed.marginTop;
          wrapper.style.marginRight = computed.marginRight;
          wrapper.style.marginBottom = computed.marginBottom;
          wrapper.style.marginLeft = computed.marginLeft;
          const display = computed.display === "inline" ? "inline-block" : computed.display;
          wrapper.style.display = display && display !== "none" ? display : "block";
        } else {
          wrapper.style.display = "block";
        }
      } catch (_) {
        wrapper.style.display = "block";
      }
      pre.style.margin = "0";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      try {
        const computed = window.getComputedStyle?.(pre);
        const current = computed ? parseFloat(computed.paddingTop) || 0 : 0;
        const required = 60;
        if (current < required) {
          pre.style.paddingTop = `${required}px`;
        }
      } catch (_) {
        pre.style.paddingTop = "60px";
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-code-btn btn btn-icon btn-tonal shadow-elevation-3";
      btn.setAttribute("aria-label", "Copiar código");
      btn.setAttribute("title", "Copiar código");
      btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      wrapper.appendChild(btn);
      btn.addEventListener(
        "click",
        async () => {
          try {
            const text = code.innerText || "";
            if (text) await navigator.clipboard?.writeText(text);
            if (window.__showSnackbar) window.__showSnackbar("Código copiado");
          } catch (e) { console.warn('Operação não crítica falhou:', e); }
        },
        { passive: true },
      );
    });
  } catch (e) { console.warn('Operação não crítica falhou:', e); }

  // Normalize markdown-like **tokens** to <code-text> outside of code blocks
  try {
    const candidates = root.querySelectorAll("p, li, h4, h5, h6, span, div");
    const rx = /\*\*([-A-Za-zÀ-ÿ0-9_.,;:()/\\\s]{1,40})\*\*/g;
    candidates.forEach((el) => {
      if (el.closest("pre, code")) return;
      if (!el.innerHTML || el.childElementCount > 0) {
        // still attempt if innerHTML contains ** and replacements are safe
        if (el.innerHTML && el.innerHTML.includes("**")) {
          el.innerHTML = el.innerHTML.replace(rx, "<code-text>$1</code-text>");
        }
        return;
      }
      if (el.textContent.includes("**")) {
        el.innerHTML = el.innerHTML.replace(rx, "<code-text>$1</code-text>");
      }
    });
  } catch (e) { console.warn('Operação não crítica falhou:', e); }
}
