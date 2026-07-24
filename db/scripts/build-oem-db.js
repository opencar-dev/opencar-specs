#!/usr/bin/env node
/**
 * Build data/oem.db from canonical data/oem/csv/{year}.csv files.
 *
 * Usage: node scripts/build-oem-db.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.join(__dirname, "../..");
const CSV_DIR = path.join(ROOT, "data/oem/csv");
const DB_PATH = path.join(ROOT, "data/oem.db");

function main() {
  if (!fs.existsSync(CSV_DIR)) {
    console.error(`Missing ${CSV_DIR}. Run: npm run export:csv`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CSV_DIR)
    .filter((f) => /^\d{4}\.csv$/.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No year CSV files in ${CSV_DIR}`);
    process.exit(1);
  }

  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE oem (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      trim TEXT NOT NULL
    );
    CREATE UNIQUE INDEX oem_year_make_model_trim_key
      ON oem (year, make, model, trim);
    CREATE INDEX oem_make_idx ON oem (make);
    CREATE INDEX oem_make_model_idx ON oem (make, model);
  `);

  const insert = db.prepare(
    "INSERT OR IGNORE INTO oem (year, make, model, trim) VALUES (?, ?, ?, ?)"
  );

  let total = 0;
  db.exec("BEGIN");
  for (const file of files) {
    const rows = parse(fs.readFileSync(path.join(CSV_DIR, file), "utf8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    for (const row of rows) {
      const year = Number.parseInt(row.year, 10);
      const make = String(row.make ?? "").trim();
      const model = String(row.model ?? "").trim();
      const trim = String(row.trim ?? "").trim();
      if (!Number.isFinite(year) || !make || !model || !trim) continue;
      insert.run(year, make, model, trim);
      total += 1;
    }
  }
  db.exec("COMMIT");
  db.close();

  const sizeMb = (fs.statSync(DB_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`Built ${DB_PATH} (${total} rows, ${sizeMb} MB) from ${files.length} year files`);
}

main();
