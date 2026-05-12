import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve("docs");
const localhostBase = "http://localhost:8080";

function listHtmlFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listHtmlFiles(p));
    else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) out.push(p);
  }
  return out;
}

function depthFromDocs(filePath) {
  const relDir = path.relative(docsRoot, path.dirname(filePath));
  if (!relDir || relDir === ".") return 0;
  return relDir.split(path.sep).filter(Boolean).length;
}

function prefix(depth) {
  return depth === 0 ? "" : "../".repeat(depth);
}

function fixFile(filePath) {
  const depth = depthFromDocs(filePath);
  const pre = prefix(depth);
  let html = fs.readFileSync(filePath, "utf8");

  // Replace the exporter's fixed "../media/" and "../assets/" with correct depth-based prefix.
  html = html.replaceAll("../media/", `${pre}media/`);
  html = html.replaceAll("../assets/", `${pre}assets/`);

  // Replace absolute localhost links to repo-relative links.
  // Examples:
  // - http://localhost:8080/la-brigasque/ -> (pre)la-brigasque/
  // - http://localhost:8080/ -> (pre)
  html = html.replaceAll(`${localhostBase}/`, pre);
  html = html.replaceAll(localhostBase, pre.replace(/\/+$/, "")); // just in case

  // Replace JSON-escaped localhost (http:\/\/localhost:8080\/...)
  html = html.replaceAll("http:\\/\\/localhost:8080\\/", pre);
  html = html.replaceAll("http:\\/\\/localhost:8080", pre.replace(/\/+$/, ""));

  // Normalize existing relative links that start with "../" so they never escape the docs root.
  // We rewrite "../foo" or "../../foo" to "<pre>foo" where <pre> is computed from current file depth.
  html = html.replace(/\b(href|src)=["']((?:\.\.\/)+)([^"']*)["']/gi, (_m, attr, _ups, rest) => {
    return `${attr}="${pre}${rest}"`;
  });

  // Replace root-relative links (href="/foo") so GitHub Pages doesn't jump to domain root.
  // Keep protocol-relative URLs (//fonts.googleapis.com) intact.
  html = html.replace(/\b(href|src)=["']\/(?!\/)([^"']+)["']/gi, (_m, attr, p) => {
    return `${attr}="${pre}${p}"`;
  });

  fs.writeFileSync(filePath, html, "utf8");
  return { filePath, depth };
}

function main() {
  if (!fs.existsSync(docsRoot)) {
    throw new Error("docs/ folder not found. Run this from repo root.");
  }

  // Make docs/ root serve the real homepage.
  // The WP export's base URL resolved to /la-brigasque/; we want /accueil/ as landing page.
  const accueil = path.join(docsRoot, "accueil", "index.html");
  const rootIndex = path.join(docsRoot, "index.html");
  if (fs.existsSync(accueil)) {
    fs.copyFileSync(accueil, rootIndex);
  }

  const files = listHtmlFiles(docsRoot);
  const stats = { files: files.length };
  for (const f of files) fixFile(f);

  // Update footer attribution everywhere in docs/
  const footerNeedle = 'Site réalisé par <a href="https://paulinelaurent.fr/" target="_blank" rel="noopener"><span class="footer-pl">pl</span></a>';
  const footerReplacement =
    'Site réalisé par <a href="https://spaceman-dev86.github.io/Portfolio-R-mi-SARRO/index.html" target="_blank" rel="noopener">Rémi Sarro</a> sur la base du travail de <a href="https://melezart.fr/" target="_blank" rel="noopener">pl</a>';

  const copyrightNeedle = "© Copyright 2019 - ";

  for (const f of files) {
    let html = fs.readFileSync(f, "utf8");
    let changed = false;
    if (html.includes(footerNeedle)) {
      html = html.replaceAll(footerNeedle, footerReplacement);
      changed = true;
    }
    if (html.includes(copyrightNeedle)) {
      html = html.replaceAll(copyrightNeedle, "");
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(f, html, "utf8");
    }
  }
  console.log(`OK: fixed ${stats.files} html files under docs/`);
}

main();

