const LOOKS_HTML_RE =
  /<\/?(?:p|div|ul|ol|li|h[1-6]|blockquote|article|section|figure|table|thead|tbody|tr|td|pre|hr|br|img|a|strong|em|b|u|i|span|font|del|strike|sup|sub|colgroup)\b|<br\s*\/?>/i;

function escapeHtmlPlain(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/** Treat as HTML if it obviously contains tags — otherwise escaped plain text gets <br>s. */
export function prepareProductDescription(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  if (LOOKS_HTML_RE.test(trimmed)) {
    return normalizeInterTagWhitespace(fixListBrGarbage(trimmed.trim()));
  }
  return escapeHtmlPlain(trimmed).replace(/\r\n|\n|\r/g, "<br>");
}

function normalizeInterTagWhitespace(html: string): string {
  let prev = "";
  let out = html;
  for (let i = 0; i < 12 && out !== prev; i++) {
    prev = out;
    out = out.replace(/>\s*\r?\n\s*</g, "><").replace(/\n/g, " ");
  }
  return out;
}

function fixListBrGarbage(html: string): string {
  let prev = "";
  let out = html.replace(/<\/li>\s*<br\s*\/?>/gi, "</li>");
  for (let i = 0; i < 10 && out !== prev; i++) {
    prev = out;
    out = out
      .replace(/<(ul|ol)(\b[^>]*)>\s*(?:<br\s*\/?>|(?:&nbsp;)+\s*)+/gi, "<$1$2>")
      .replace(/\s*(?:<br\s*\/?>|(?:&nbsp;)+\s*)+<\/(ul|ol)>/gi, "</$2>")
      .replace(/<\/li>\s*(?:<br\s*\/?>|(?:&nbsp;)+\s*)+<li\b/gi, "</li><li")
      .replace(/<\/(ul|ol)>\s*<br\s*\/?>/gi, "</$1>");
  }
  return collapseEmptyLiByRegex(out);
}

function collapseEmptyLiByRegex(html: string): string {
  let prev = "";
  let out = html;
  for (let i = 0; i < 24 && out !== prev; i++) {
    prev = out;
    out = out.replace(
      /<li\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>|\ufeff)*<\/li>/gi,
      "",
    );
  }
  return out.replace(/<(ul|ol)(\b[^>]*)>\s*<\/\1>/gi, "");
}

function stripDangerousFragments(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[\s\S]*?(?:>|\/[\s\S]*?<\/embed>)/gi, "")
    .replace(/<link\b[\s\S]*?>/gi, "")
    .replace(/<meta\b[\s\S]*?>/gi, "");
}

/** Remove inline handlers and javascript: urls (SSR-friendly). */
function stripUnsafeAttrsRegex(html: string): string {
  return html.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "").replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "");
}

function unwrapParagraphsInsideListItems(scope: HTMLElement) {
  scope.querySelectorAll("li").forEach((li) => {
    li.querySelectorAll(":scope > p").forEach((p) => {
      while (p.firstChild) li.insertBefore(p.firstChild, p);
      p.remove();
    });
    li.querySelectorAll(":scope > div").forEach((div) => {
      while (div.firstChild) li.insertBefore(div.firstChild, div);
      div.remove();
    });
  });
}

function stripEmptyOrWhitespaceLi(scope: HTMLElement) {
  scope.querySelectorAll("li").forEach((li) => {
    if (
      li.querySelector(
        "img, video, iframe, svg, canvas, audio, ul, ol, table, iframe, embed, picture, source",
      )
    )
      return;
    const txt = li.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!txt) li.remove();
  });
}

function removeEmptyLists(scope: HTMLElement) {
  scope.querySelectorAll("ul, ol").forEach((list) => {
    if (!list.querySelector(":scope > li")) list.remove();
  });
}

function sanitizeDom(domRoot: HTMLElement) {
  const blocked = ["script", "iframe", "object", "embed", "style", "link", "meta"];
  blocked.forEach((tag) => {
    domRoot.querySelectorAll(tag).forEach((el) => el.remove());
  });
  domRoot.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });
}

/**
 * Escape / normalize pasted or stored markup, strip unsafe bits, tidy lists (fixes stray <br>s and empty <li>s).
 */
export function sanitizeRichText(raw: string): string {
  const prepared = prepareProductDescription(raw);
  if (!prepared) return "";
  const rough = collapseEmptyLiByRegex(
    normalizeInterTagWhitespace(fixListBrGarbage(stripDangerousFragments(stripUnsafeAttrsRegex(prepared)))),
  );
  if (typeof window === "undefined") return rough;

  const doc = new DOMParser().parseFromString(rough, "text/html");
  sanitizeDom(doc.body);
  unwrapParagraphsInsideListItems(doc.body);
  stripEmptyOrWhitespaceLi(doc.body);
  removeEmptyLists(doc.body);
  return doc.body.innerHTML;
}
