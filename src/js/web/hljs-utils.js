import hljs from "highlight.js/lib/core";
import cLang from "highlight.js/lib/languages/c";
import plaintext from "highlight.js/lib/languages/plaintext";

hljs.registerLanguage("c", cLang);
hljs.registerLanguage("plaintext", plaintext);

export function rehighlightSafe() {
  try {
    document.querySelectorAll("pre code").forEach((el) => {
      try {
        el.classList.remove("hljs");
      } catch (_) {}
      try {
        if (el.dataset && "highlighted" in el.dataset)
          delete el.dataset.highlighted;
      } catch (_) {}
      try {
        hljs.highlightElement(el);
      } catch (_) {}
    });
  } catch (_) {}
}
