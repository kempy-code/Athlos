import { readFile, access } from "node:fs/promises";

const checks = [];
const check = (name, pass, detail = "") => checks.push({ name, pass, detail });
const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const auth = await readFile(new URL("../public/js/authClient.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/css/auth.css", import.meta.url), "utf8");

check("Document language", /<html lang="en">/.test(html));
check("Responsive viewport", /name="viewport"/.test(html));
check("Search description", /name="description"/.test(html));
check("Accessible authentication labels", /<label>Email<input/.test(auth) && /<label>Password<input/.test(auth));
check("Keyboard-visible focus styles", /:focus/.test(css));
check("Reduced-motion support", /prefers-reduced-motion/.test(css));
check("Demo athlete entry", /id="try-demo"/.test(auth));
check("Installable web app", /manifest\.webmanifest/.test(html));
check("Privacy and terms links", /privacy\.html/.test(await readFile(new URL("../public/js/results/account.js", import.meta.url), "utf8")));
check("No secrets in public HTML", !/OPENAI_API_KEY|sk-[a-zA-Z0-9]/.test(html + auth));
try { await access(new URL("../.env.example", import.meta.url)); check("Environment template", true); } catch { check("Environment template", false); }

for (const item of checks) console.log(`${item.pass ? "✓" : "✗"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
const failed = checks.filter(item => !item.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} release-quality checks passed.`);
if (failed.length) process.exitCode = 1;
