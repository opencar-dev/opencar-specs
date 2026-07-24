#!/usr/bin/env node
/**
 * Build data/oem.db from year CSVs (if needed) and copy into www/public
 * for the Vite app / GitHub Pages static host.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WWW = path.join(__dirname, "..");
const ROOT = path.join(WWW, "..");
const DB_SRC = path.join(ROOT, "data/oem.db");
const CSV_DIR = path.join(ROOT, "data/oem/csv");
const PUBLIC_DIR = path.join(WWW, "public");
const DB_DEST = path.join(PUBLIC_DIR, "oem.db");
const WASM_SRC = path.join(WWW, "node_modules/sql.js/dist/sql-wasm.wasm");
const WASM_DEST = path.join(PUBLIC_DIR, "sql-wasm.wasm");
const SQLJS_SRC = path.join(WWW, "node_modules/sql.js/dist/sql-wasm.js");
const SQLJS_DEST = path.join(PUBLIC_DIR, "sql-wasm.js");

function needsRebuild() {
  if (!fs.existsSync(DB_SRC)) return true;
  if (!fs.existsSync(CSV_DIR)) return false;
  const dbMtime = fs.statSync(DB_SRC).mtimeMs;
  const csvs = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith(".csv"));
  if (csvs.length === 0) return true;
  return csvs.some(
    (f) => fs.statSync(path.join(CSV_DIR, f)).mtimeMs > dbMtime
  );
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (needsRebuild()) {
  console.log("Building oem.db from data/oem/csv …");
  run("npm", ["run", "build:db"], path.join(ROOT, "db"));
} else {
  console.log("oem.db is up to date");
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.copyFileSync(DB_SRC, DB_DEST);
console.log(`Copied → ${DB_DEST}`);

if (fs.existsSync(WASM_SRC)) {
  fs.copyFileSync(WASM_SRC, WASM_DEST);
  console.log(`Copied → ${WASM_DEST}`);
} else {
  console.warn("sql-wasm.wasm not found — run npm install in www/");
}

if (fs.existsSync(SQLJS_SRC)) {
  // sql.js only assigns module.exports — expose a browser global for script-tag load.
  const source = fs.readFileSync(SQLJS_SRC, "utf8");
  fs.writeFileSync(
    SQLJS_DEST,
    `${source}\n;globalThis.initSqlJs = typeof initSqlJs !== "undefined" ? initSqlJs : (typeof module !== "undefined" && module.exports) ? module.exports : globalThis.initSqlJs;\n`
  );
  console.log(`Copied → ${SQLJS_DEST}`);
} else {
  console.warn("sql-wasm.js not found — run npm install in www/");
}
