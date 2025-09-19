// MD3 Custom Elements to reuse within static aula HTML

const RIPPLE_CLASS = "md3-ripple";
const RIPPLE_ACTIVE_CLASS = "md3-ripple-active";
const RIPPLE_FLAG = "md3RippleBound";
const SEGMENTED_FLAG = "md3SegmentedBound";

const isCallable = (fn) => typeof fn === "function";

const parseSegments = (raw) => {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const scheduleRippleCleanup = (el) => {
  try {
    const remove = () => el.classList.remove(RIPPLE_ACTIVE_CLASS);
    if (isCallable(window.requestAnimationFrame)) {
      window.requestAnimationFrame(() => {
        window.setTimeout(remove, 225);
      });
    } else {
      window.setTimeout(remove, 225);
    }
  } catch (_) {}
};

export function applyRipple(target) {
  if (!target || !target.classList || !isCallable(target.addEventListener)) {
    return false;
  }

  if (!target.classList.contains(RIPPLE_CLASS)) {
    target.classList.add(RIPPLE_CLASS);
  }

  const dataset = target.dataset || {};
  if (dataset[RIPPLE_FLAG] === "1") {
    return true;
  }

  const handlePointerDown = () => {
    try {
      target.classList.add(RIPPLE_ACTIVE_CLASS);
      scheduleRippleCleanup(target);
    } catch (_) {}
  };

  target.addEventListener("pointerdown", handlePointerDown, { passive: true });
  if (dataset) {
    dataset[RIPPLE_FLAG] = "1";
  }
  return true;
}

const activateSegmentButton = (container, button) => {
  const segments = container.querySelectorAll("button.md3-segment");
  segments.forEach((segment) => {
    segment.classList.toggle("is-active", segment === button);
  });
  try {
    const value = button?.dataset?.value;
    if (value !== undefined) {
      container.dispatchEvent(
        new CustomEvent("md3:segment-change", {
          detail: { value },
        }),
      );
    }
  } catch (_) {}
};

export function setupSegmented(container) {
  if (!container || !isCallable(container.setAttribute)) {
    return [];
  }

  const dataset = container.dataset || {};
  if (dataset[SEGMENTED_FLAG] === "1") {
    const existing = Array.from(
      container.querySelectorAll("button.md3-segment"),
    ).map((btn) => btn.dataset?.value).filter(Boolean);
    return existing;
  }

  const values = parseSegments(container.getAttribute("data-md3-segmented"));
  if (!values.length) return [];

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  values.forEach((value, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md3-segment";
    btn.dataset.value = value;
    btn.textContent = value;
    if (index === 0) {
      btn.classList.add("is-active");
    }
    btn.addEventListener("click", () => activateSegmentButton(container, btn));
    fragment.appendChild(btn);
  });

  container.appendChild(fragment);
  if (dataset) {
    dataset[SEGMENTED_FLAG] = "1";
  }
  return values;
}

export function initMd3Elements(root = document) {
  if (!root) return;
  const scope = root.querySelectorAll ? root : document;
  if (!scope?.querySelectorAll) return;

  try {
    scope.querySelectorAll("[data-md3-ripple]").forEach((el) => {
      applyRipple(el);
    });
  } catch (_) {}

  try {
    scope.querySelectorAll("[data-md3-segmented]").forEach((el) => {
      setupSegmented(el);
    });
  } catch (_) {}
}

class MD3Video extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const src = this.getAttribute("src") || "";
    const allow =
      this.getAttribute("allow") ||
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    const interaction = (
      this.getAttribute("interaction") || "default"
    ).toLowerCase();
    const toPrivacySrc = (url) => {
      try {
        const u = new URL(url, window.location.href);
        if (
          /youtube\.com$/i.test(u.hostname) ||
          /youtu\.be$/i.test(u.hostname)
        ) {
          // force nocookie domain
          if (u.hostname.includes("youtu.be")) {
            // convert short to embed
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
    const safeSrc = toPrivacySrc(src);

    // Decide loading strategy: default = iframe inline; click = placeholder until user interaction
    const preferClick =
      interaction === "click" ||
      (interaction === "auto" &&
        window.matchMedia &&
        window.matchMedia("(hover: none)").matches);
    if (!preferClick) {
      this.innerHTML = `
        <div class="card p-4">
          ${title ? `<h3 class="font-semibold text-lg text-primary-800 dark:text-primary-200 mb-2">${title}</h3>` : ""}
          <div class="aspect-video w-full">
            <iframe class="w-full h-full rounded-xl" src="${safeSrc}" title="${title || "Vídeo"}" frameborder="0" allow="${allow}" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
          </div>
        </div>
      `;
      return;
    }

    // Click-to-load placeholder (mobile-friendly)
    this.innerHTML = `
      <div class="card p-4">
        ${title ? `<h3 class="font-semibold text-lg text-primary-800 dark:text-primary-200 mb-2">${title}</h3>` : ""}
        <button type="button" class="aspect-video w-full video-ph" aria-label="Reproduzir vídeo"></button>
      </div>
    `;
    const box = this.querySelector(".video-ph");
    const mount = () => {
      if (!box || box.dataset.mounted === "1") return;
      const iframe = document.createElement("iframe");
      iframe.className = "w-full h-full rounded-xl";
      iframe.src = safeSrc;
      iframe.title = title || "Vídeo";
      iframe.frameBorder = "0";
      iframe.setAttribute("allow", allow);
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      box.replaceWith(iframe);
      box.dataset.mounted = "1";
    };
    // Derive thumbnail for YouTube
    try {
      const u = new URL(safeSrc, window.location.href);
      const id = u.pathname.includes("/embed/")
        ? u.pathname.split("/embed/")[1].split(/[?&#]/)[0]
        : "";
      if (id && box) {
        box.setAttribute("data-thumb", "1");
        box.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
      }
    } catch (_) {}
    box?.addEventListener("click", () => mount(), { passive: true });
  }
}

class MD3Callout extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute("variant") || "info";
    const title = this.getAttribute("title") || "";
    const body = this.innerHTML;
    const map = {
      info: "callout callout-info",
      success: "callout callout-success",
      danger: "callout callout-danger",
      academic: "callout callout-academic",
      good: "callout callout-good-practice",
    };
    const cls = map[variant] || map.info;
    this.innerHTML = `
      <div class="${cls}">
        ${title ? `<h5 class="font-bold mb-2">${title}</h5>` : ""}
        <div>${body}</div>
      </div>
    `;
  }
}

customElements.define("md3-video", MD3Video);
customElements.define("md3-callout", MD3Callout);

// Simple MD3 Checkbox custom element for static aula HTML
class MD3Checkbox extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") || this.innerHTML || "";
    const checked = this.hasAttribute("checked");
    // Render
    this.innerHTML = `
      <label class="inline-flex items-start gap-3">
        <input type="checkbox" ${checked ? "checked" : ""} style="accent-color: var(--accent);" class="mt-0.5" />
        <span class="text-body-medium" style="color: var(--text);">${label}</span>
      </label>
    `;
  }
}
customElements.define("md3-checkbox", MD3Checkbox);

// MD3 External Link (CTA) – renders a button-like anchor for external resources
class MD3ExternalLink extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "#";
    const label =
      this.getAttribute("label") || this.textContent?.trim() || "Abrir";
    const icon =
      this.getAttribute("icon") || "fa-solid fa-arrow-up-right-from-square";
    const variant = this.getAttribute("variant") || "tonal"; // tonal | filled | outlined
    const rel = this.getAttribute("rel") || "noopener noreferrer";
    const target = this.getAttribute("target") || "_blank";
    const clsVariant =
      variant === "filled"
        ? "btn btn-filled"
        : variant === "outlined"
          ? "btn btn-outlined-primary"
          : "btn btn-tonal";
    this.innerHTML = `
      <a href="${href}" target="${target}" rel="${rel}" class="${clsVariant}">
        <i class="${icon} mr-2"></i>${label}
      </a>
    `;
  }
}
customElements.define("md3-external", MD3ExternalLink);

// code-text → upgrade to native <code> to reuse MD3 inline code style
class CodeText extends HTMLElement {
  connectedCallback() {
    try {
      const code = document.createElement("code");
      code.textContent = this.textContent || "";
      this.replaceWith(code);
    } catch (_) {}
  }
}
customElements.define("code-text", CodeText);

// (copy-code click handler moved to aula-enhance.js for aula content)
