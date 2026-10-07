import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = path.join(os.homedir(), ".athlos-runtime");
const appRoot = path.join(runtimeRoot, "app");

fs.mkdirSync(appRoot, { recursive: true });

function link(name) {
    const target = path.join(appRoot, name);
    if (fs.existsSync(target) || fs.lstatSync(target, { throwIfNoEntry: false })) fs.rmSync(target, { recursive: true, force: true });
    fs.symlinkSync(path.join(projectRoot, name), target);
}

for (const name of ["server.js", "db.js", "auth.js", "coachPlan.js", "public"]) link(name);
if (fs.existsSync(path.join(projectRoot, ".env"))) link(".env");

fs.writeFileSync(path.join(appRoot, "package.json"), JSON.stringify({ type: "module", private: true }));

console.log("[Athlos] Starting from a stable local runtime…");
const child = spawn(process.execPath, ["--preserve-symlinks", "--preserve-symlinks-main", "server.js"], {
    cwd: appRoot,
    stdio: "inherit",
    env: { ...process.env, ATHLOS_RUNTIME: "local" }
});

child.on("exit", code => process.exit(code ?? 0));
child.on("error", error => { console.error("[Athlos] Could not start the local runtime:", error.message); process.exit(1); });
