import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve("docs");

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

  fs.writeFileSync(filePath, html, "utf8");
  return { filePath, depth };
}

function main() {
  if (!fs.existsSync(docsRoot)) {
    throw new Error("docs/ folder not found. Run this from repo root.");
  }
  const files = listHtmlFiles(docsRoot);
  const stats = { files: files.length };
  for (const f of files) fixFile(f);
  console.log(`OK: fixed ${stats.files} html files under docs/`);
}

main();

