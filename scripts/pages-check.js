import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");
const checks = [];
const check = (name, pass) => checks.push({ name, pass });

const [rootHtml, html, manifest, script, api, worker, workflow] = await Promise.all([
    read("index.html"),
    read("public/index.html"),
    read("public/manifest.webmanifest"),
    read("public/js/script.js"),
    read("public/js/api.js"),
    read("public/service-worker.js"),
    read(".github/workflows/pages.yml")
]);

check("Branch deployment redirects to app", /\.\/public\//.test(rootHtml));
check("Relative HTML assets", !/(?:src|href)="\/(?!\/)/.test(html));
check("Relative PWA start URL", JSON.parse(manifest).start_url === "./");
check("Repository-scoped service worker", /registration\.scope/.test(worker) && /import\.meta\.url/.test(script));
check("GitHub Pages mode", /github\.io/.test(api) && /staticMode: true/.test(script));
check("Pages artifact uses public directory", /path: public/.test(workflow));
try { await access(new URL("public/.nojekyll", root)); check("Jekyll bypass", true); } catch { check("Jekyll bypass", false); }

for (const item of checks) console.log(`${item.pass ? "✓" : "✗"} ${item.name}`);
const failed = checks.filter(item => !item.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} GitHub Pages checks passed.`);
if (failed.length) process.exitCode = 1;
