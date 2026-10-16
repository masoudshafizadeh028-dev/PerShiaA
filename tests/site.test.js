const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

async function setup(prepare = () => {}) {
  const dom = new JSDOM(html, {
    url: "https://pershiaa.qd.je/",
    runScripts: "outside-only",
  });
  const { window } = dom;
  await new Promise((resolve) => window.document.addEventListener("DOMContentLoaded", resolve));
  prepare(window);
  window.eval(script);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  return window;
}

function click(window, element) {
  element.click();
}

function key(window, name, options = {}) {
  const event = new window.KeyboardEvent("keydown", {
    key: name,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  window.document.dispatchEvent(event);
  return event;
}

test("all internal links resolve (including the no-JavaScript mind map fallback)", async () => {
  const { document } = await setup();
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    assert.ok(document.getElementById(anchor.getAttribute("href").slice(1)), anchor.outerHTML);
  }
});

test("dialog shortcuts, focus return, focus trap, switching and backdrop close", async () => {
  const window = await setup();
  const { document } = window;
  const opener = document.querySelector(".command-bar");
  opener.focus();
  click(window, opener);
  const search = document.getElementById("search-modal");
  const mindmap = document.getElementById("mindmap-modal");
  assert.equal(search.getAttribute("aria-hidden"), "false");
  assert.equal(search.hidden, false);
  assert.equal(document.querySelector("main").inert, true);
  assert.equal(document.activeElement.id, "search-input");
  assert.equal(document.body.classList.contains("modal-open"), true);
  document.getElementById("close-search").focus();
  assert.equal(key(window, "Tab").defaultPrevented, true);
  assert.equal(document.activeElement.id, "search-input");
  assert.equal(key(window, "Tab", { shiftKey: true }).defaultPrevented, true);
  assert.equal(document.activeElement.id, "close-search");
  key(window, "m", { ctrlKey: true });
  assert.equal(search.getAttribute("aria-hidden"), "true");
  assert.equal(mindmap.getAttribute("aria-hidden"), "false");
  assert.equal(document.activeElement.id, "close-mindmap");
  key(window, "Escape");
  assert.equal(document.activeElement, opener);
  assert.equal(mindmap.hidden, true);
  assert.equal(document.querySelector("main").inert, false);
  assert.equal(document.body.classList.contains("modal-open"), false);
  click(window, document.querySelector(".open-mindmap"));
  click(window, mindmap);
  assert.equal(mindmap.getAttribute("aria-hidden"), "true");
});

test("search reflects page content, normalizes Persian input and navigates to a real result", async () => {
  const window = await setup();
  const { document, Event } = window;
  click(window, document.querySelector(".command-bar"));
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  input.value = "فاز ۱";
  input.dispatchEvent(new Event("input"));
  assert.equal(results.querySelector('a[href="#phase-1"]')?.className, "search-item");
  input.value = "حكمراني";
  input.dispatchEvent(new Event("input"));
  assert.ok(results.querySelector('a[href="#governance"]'));
  click(window, results.querySelector('a[href="#governance"]'));
  assert.equal(document.getElementById("search-modal").getAttribute("aria-hidden"), "true");
  assert.equal(document.activeElement.id, "governance");
  // A result hidden by the roadmap filter must become visible before navigation.
  click(window, document.querySelector('[data-filter="upcoming"]'));
  click(window, document.querySelector(".command-bar"));
  input.value = "فاز ۱";
  input.dispatchEvent(new Event("input"));
  click(window, results.querySelector('a[href="#phase-1"]'));
  assert.equal(document.getElementById("phase-1").hidden, false);
  input.value = "چیزی که نیست";
  input.dispatchEvent(new Event("input"));
  assert.match(results.textContent, /نتیجه‌ای یافت نشد/);
});

test("roadmap filter and mind map work with keyboard-focusable nodes", async () => {
  const window = await setup();
  const { document } = window;
  const upcoming = document.querySelector('[data-filter="upcoming"]');
  click(window, upcoming);
  assert.equal(upcoming.getAttribute("aria-pressed"), "true");
  assert.equal(document.getElementById("phase-1").hidden, true);
  assert.equal(document.getElementById("phase-3").hidden, false);
  click(window, document.querySelector('[data-filter="all"]'));
  assert.equal(document.querySelectorAll(".roadmap-card[hidden]").length, 0);
  const node = document.querySelector('.mm-node[data-title="علم و فناوری"]');
  assert.equal(node.tagName, "BUTTON");
  click(window, node);
  assert.equal(node.getAttribute("aria-pressed"), "true");
  assert.match(document.getElementById("mindmap-details").textContent, /نوآوری/);
});

test("local checklist restores both saved true and false and updates accessible progress", async () => {
  const window = await setup((w) => {
    w.localStorage.setItem("pershiaa_upgrade_upg-1", "false");
    w.localStorage.setItem("pershiaa_upgrade_upg-3", "true");
  });
  const { document, Event } = window;
  assert.equal(document.getElementById("upg-1").checked, false);
  assert.equal(document.getElementById("upg-3").checked, true);
  assert.equal(document.getElementById("upgrade-progress").getAttribute("aria-valuenow"), "33");
  const checkbox = document.getElementById("upg-2");
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(window.localStorage.getItem("pershiaa_upgrade_upg-2"), "false");
  assert.equal(document.getElementById("total-progress-fill").style.width, "17%");
  assert.equal(document.getElementById("upgrade-progress").getAttribute("aria-valuenow"), "17");
});

test("blocked storage does not prevent page interactions", async () => {
  const window = await setup((w) => {
    Object.defineProperty(w, "localStorage", {
      get() {
        throw new w.DOMException("blocked", "SecurityError");
      },
    });
  });
  const { document, Event } = window;
  const checkbox = document.getElementById("upg-1");
  checkbox.checked = false;
  checkbox.dispatchEvent(new Event("change"));
  assert.equal(document.getElementById("upgrade-progress").getAttribute("aria-valuenow"), "17");
});

test("search result content is rendered as text, never injected as markup", async () => {
  const window = await setup((w) => {
    w.document.querySelector("#thought h3").textContent = "<img src=x onerror=alert(1)> نظریه";
  });
  const { document, Event } = window;
  click(window, document.querySelector(".command-bar"));
  const input = document.getElementById("search-input");
  input.value = "نظریه";
  input.dispatchEvent(new Event("input"));
  assert.match(document.getElementById("search-results").textContent, /<img/);
  assert.equal(document.querySelector("#search-results img"), null);
});

test("canonical, sitemap and robots use the configured custom domain", async () => {
  const { document } = await setup();
  const domain = fs.readFileSync(path.join(root, "CNAME"), "utf8").trim();
  const canonical = `https://${domain}/`;
  assert.equal(document.querySelector('link[rel="canonical"]').href, canonical);
  assert.match(
    fs.readFileSync(path.join(root, "sitemap.xml"), "utf8"),
    new RegExp(`<loc>${canonical}</loc>`)
  );
  assert.match(
    fs.readFileSync(path.join(root, "robots.txt"), "utf8"),
    new RegExp(`Sitemap: ${canonical}sitemap.xml`)
  );
});
