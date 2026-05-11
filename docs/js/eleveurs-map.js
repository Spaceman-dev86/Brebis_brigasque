async function initEleveursMap() {
  const el = document.getElementById("eleveurs-map");
  if (!el) return;

  const dataUrl = el.getAttribute("data-eleveurs-json") || "data/eleveurs.json";
  const res = await fetch(dataUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}: ${res.status}`);
  const points = await res.json();

  const map = L.map(el, { scrollWheelZoom: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markers = [];
  for (const p of points) {
    const lat = Number(p.lat);
    const lng = Number(p.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    let html = "";
    if (p.title) html += `<strong>${escapeHtml(p.title)}</strong>`;
    if (p.description) html += `<div class="eleveurs-popup">${rewriteMarkerHtml(p.description)}</div>`;

    const m = L.marker([lat, lng]).addTo(map);
    if (html) m.bindPopup(html, { maxWidth: 320 });
    markers.push(m);
  }

  if (markers.length) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.25));
  } else {
    map.setView([46.6, 2.0], 5);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rewriteMarkerHtml(html) {
  // The old plugin uses GMP_SITE_URL prefix sometimes; in static export we don't have it.
  // If an image URL is relative to wp-content/uploads, map it to our media folder when possible.
  return String(html).replaceAll("GMP_SITE_URL", "");
}

window.addEventListener("DOMContentLoaded", () => {
  initEleveursMap().catch((e) => {
    // Fail silently: don't break the page if map can't load.
    console.error(e);
  });
});

