import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "docs");
const NEW =
  '<h6>Site réalisé par <a href="https://spaceman-dev86.github.io/Portfolio-R-mi-SARRO/index.html" target="_blank" rel="noopener">Rémi Sarro</a> sur la base du travail de <a href="https://melezart.fr/" target="_blank" rel="noopener">pl</a></h6></div>';
const OLD1 =
  '<h6>© Copyright 2019 - Site réalisé par <a href="https://paulinelaurent.fr/" target="_blank" rel="noopener"><span class="footer-pl">pl</span></a></h6></div>';
const OLD2 =
  '<h6>© Copyright 2019 - Site réalisé par <a href="https://spaceman-dev86.github.io/Portfolio-R-mi-SARRO/index.html" target="_blank" rel="noopener">Rémi Sarro</a> sur la base du travail de <a href="https://melezart.fr/" target="_blank" rel="noopener">pl</a></h6></div>';

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) {
      let s = fs.readFileSync(p, "utf8");
      const orig = s;
      if (s.includes(OLD1)) s = s.split(OLD1).join(NEW);
      if (s.includes(OLD2)) s = s.split(OLD2).join(NEW);
      if (s !== orig) {
        fs.writeFileSync(p, s, "utf8");
        console.log("updated", p);
      }
    }
  }
}

walk(root);
