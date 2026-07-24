#!/usr/bin/env node
/**
 * Export unique OC-OEM identities from raw/vehicles.csv into
 * data/oem/csv/{year}.csv (canonical, reviewable source).
 *
 * Mapping (EPA → OC-OEM):
 *   year  ← year
 *   make  ← make
 *   model ← baseModel
 *   trim  ← model
 *
 * Usage: node scripts/export-year-csvs.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const ROOT = path.join(__dirname, "../..");
const RAW_CSV = path.join(ROOT, "raw/vehicles.csv");
const OUT_DIR = path.join(ROOT, "data/oem/csv");

function escapeCsv(value) {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  if (!fs.existsSync(RAW_CSV)) {
    console.error(`Missing ${RAW_CSV}`);
    process.exit(1);
  }

  const rows = parse(fs.readFileSync(RAW_CSV, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  /** @type {Map<number, Map<string, {year:number,make:string,model:string,trim:string}>>} */
  const byYear = new Map();

  for (const row of rows) {
    const year = Number.parseInt(row.year, 10);
    const make = String(row.make ?? "").trim();
    const model = String(row.baseModel ?? "").trim();
    const trim = String(row.model ?? "").trim();
    if (!Number.isFinite(year) || !make || !model || !trim) continue;

    const key = `${make}\0${model}\0${trim}`;
    if (!byYear.has(year)) byYear.set(year, new Map());
    const yearMap = byYear.get(year);
    if (!yearMap.has(key)) {
      yearMap.set(key, { year, make, model, trim });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith(".csv")) fs.unlinkSync(path.join(OUT_DIR, file));
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);
  let total = 0;

  for (const year of years) {
    const records = [...byYear.get(year).values()].sort((a, b) =>
      a.make.localeCompare(b.make) ||
      a.model.localeCompare(b.model) ||
      a.trim.localeCompare(b.trim)
    );
    total += records.length;

    const lines = [
      "year,make,model,trim",
      ...records.map(
        (r) =>
          `${r.year},${escapeCsv(r.make)},${escapeCsv(r.model)},${escapeCsv(r.trim)}`
      ),
    ];
    fs.writeFileSync(path.join(OUT_DIR, `${year}.csv`), `${lines.join("\n")}\n`);
  }

  console.log(`Wrote ${years.length} year files (${total} rows) → ${OUT_DIR}`);
}

main();
