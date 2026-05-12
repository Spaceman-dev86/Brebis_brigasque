import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs");
const mediaDir = path.join(docsRoot, "media");

function listFilesRecursive(dir, pred) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFilesRecursive(p, pred));
    else if (ent.isFile() && (!pred || pred(p))) out.push(p);
  }
  return out;
}

function buildMediaStemIndex() {
  // media filenames look like: "title-img8-470ee91700.jpg"
  // we map stem -> actual filename
  const idx = new Map();
  if (!fs.existsSync(mediaDir)) return idx;
  for (const f of fs.readdirSync(mediaDir)) {
    const ext = path.extname(f).toLowerCase();
    if (!ext) continue;
    const base = path.basename(f, ext);
    const m = base.match(/^(.*)-[0-9a-f]{8,40}$/i);
    const stem = (m ? m[1] : base).toLowerCase();
    if (!idx.has(stem)) idx.set(stem, f);
  }
  return idx;
}

function fixHtmlFile(filePath, mediaIndex) {
  let html = fs.readFileSync(filePath, "utf8");

  // 1) Remove srcset + sizes attributes (they often reference wp-content/uploads resized variants).
  html = html.replace(/\s+srcset="[^"]*"/gi, "");
  html = html.replace(/\s+sizes="[^"]*"/gi, "");

  // 2) Replace inline background-image URLs that still point to wp-content/uploads.
  // Example: background-image:url(../../wp-content/uploads/2019/07/title-img8.jpg)
  html = html.replace(/background-image:url\(([^)]+wp-content\/uploads\/[^)]+)\)/gi, (full, urlPart) => {
    const cleaned = urlPart.replace(/^['"]|['"]$/g, "");
    const fname = path.basename(cleaned).replace(/\?.*$/, "");
    const stem = path.basename(fname, path.extname(fname)).toLowerCase();
    const mapped = mediaIndex.get(stem);
    if (!mapped) return full;
    // Keep existing relative prefix up to docsRoot by preserving leading "../" segments before "wp-content"
    const prefix = cleaned.split("wp-content")[0];
    const mediaUrl = `${prefix}media/${mapped}`.replaceAll("\\", "/");
    return `background-image:url(${mediaUrl})`;
  });

  // 3) Replace direct img src that still points to wp-content/uploads with a media file when we can.
  html = html.replace(/(<img[^>]+src=")([^"]*wp-content\/uploads\/[^"]+)(")/gi, (full, a, src, b) => {
    const fname = path.basename(src).replace(/\?.*$/, "");
    const stem = path.basename(fname, path.extname(fname)).toLowerCase();
    const mapped = mediaIndex.get(stem);
    if (!mapped) return full;
    const prefix = src.split("wp-content")[0];
    const mediaUrl = `${prefix}media/${mapped}`.replaceAll("\\", "/");
    return `${a}${mediaUrl}${b}`;
  });

  fs.writeFileSync(filePath, html, "utf8");
}

function ensureFontAwesomeSvg() {
  // Ensure fontawesome svg is available in the published docs assets path,
  // so the hamburger icon (fa-bars) can render.
  const dst = path.join(docsRoot, "assets", "wp-content", "themes", "bodega", "css", "font-awesome", "fonts", "fontawesome-webfont.svg");
  if (fs.existsSync(dst)) return;

  const candidates = [
    path.join(repoRoot, "..", "backup210204", "wp-content", "themes", "bodega", "css", "font-awesome", "fonts", "fontawesome-webfont.svg"),
    path.join(repoRoot, "..", "backup210204", "wp-content", "plugins", "js_composer", "assets", "lib", "bower", "font-awesome", "fonts", "fontawesome-webfont.svg"),
  ];
  const src = candidates.find((p) => fs.existsSync(p));
  if (!src) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function main() {
  if (!fs.existsSync(docsRoot)) throw new Error("docs/ not found (run from repo root)");
  const mediaIndex = buildMediaStemIndex();
  const htmlFiles = listFilesRecursive(docsRoot, (p) => p.toLowerCase().endsWith(".html"));
  for (const f of htmlFiles) fixHtmlFile(f, mediaIndex);
  ensureFontAwesomeSvg();
  console.log(`OK: fixed ${htmlFiles.length} html files; ensured fontawesome svg`);
}

main();

