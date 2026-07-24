import type { Database, SqlJsStatic } from "sql.js";

export type OemRow = {
  year: number;
  make: string;
  model: string;
  trim: string;
};

declare global {
  interface Window {
    initSqlJs?: (config?: {
      locateFile?: (file: string) => string;
    }) => Promise<SqlJsStatic>;
  }
}

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let scriptPromise: Promise<void> | null = null;

function assetUrl(name: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${name}`;
}

function loadSqlJsScript(): Promise<void> {
  if (typeof window.initSqlJs === "function") return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = assetUrl("sql-wasm.js");
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load sql-wasm.js from public/"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function loadOemDb(): Promise<Database> {
  if (db) return db;

  await loadSqlJsScript();
  if (typeof window.initSqlJs !== "function") {
    throw new Error("sql.js failed to initialize (window.initSqlJs missing)");
  }

  SQL ??= await window.initSqlJs({
    locateFile: () => assetUrl("sql-wasm.wasm"),
  });

  const response = await fetch(assetUrl("oem.db"));
  if (!response.ok) {
    throw new Error(
      `Failed to load oem.db (${response.status}). Run npm run predev in www/.`
    );
  }

  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));
  return db;
}

export function listMakes(database: Database): string[] {
  const result = database.exec(
    "SELECT DISTINCT make FROM oem ORDER BY make COLLATE NOCASE"
  );
  if (!result[0]) return [];
  return result[0].values.map((row) => String(row[0]));
}

export function listModels(database: Database, make: string): string[] {
  const stmt = database.prepare(
    "SELECT DISTINCT model FROM oem WHERE make = ? ORDER BY model COLLATE NOCASE"
  );
  stmt.bind([make]);
  const models: string[] = [];
  while (stmt.step()) {
    models.push(String(stmt.getAsObject().model));
  }
  stmt.free();
  return models;
}

export function listTrims(
  database: Database,
  make: string,
  model: string
): string[] {
  const stmt = database.prepare(
    "SELECT DISTINCT trim FROM oem WHERE make = ? AND model = ? ORDER BY trim COLLATE NOCASE"
  );
  stmt.bind([make, model]);
  const trims: string[] = [];
  while (stmt.step()) {
    trims.push(String(stmt.getAsObject().trim));
  }
  stmt.free();
  return trims;
}

export function queryVehicles(
  database: Database,
  make: string | null,
  model: string | null,
  trim: string | null,
  limit = 250
): OemRow[] {
  if (!make) return [];

  const clauses = ["make = ?"];
  const params: (string | number)[] = [make];

  if (model) {
    clauses.push("model = ?");
    params.push(model);
  }
  if (trim) {
    clauses.push("trim = ?");
    params.push(trim);
  }

  const sql = `
    SELECT year, make, model, trim
    FROM oem
    WHERE ${clauses.join(" AND ")}
    ORDER BY year DESC, make, model, trim
    LIMIT ${limit}
  `;

  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows: OemRow[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push({
      year: Number(row.year),
      make: String(row.make),
      model: String(row.model),
      trim: String(row.trim),
    });
  }
  stmt.free();
  return rows;
}

export function countVehicles(
  database: Database,
  make: string | null,
  model: string | null,
  trim: string | null
): number {
  if (!make) return 0;

  const clauses = ["make = ?"];
  const params: string[] = [make];
  if (model) {
    clauses.push("model = ?");
    params.push(model);
  }
  if (trim) {
    clauses.push("trim = ?");
    params.push(trim);
  }

  const stmt = database.prepare(
    `SELECT COUNT(*) AS c FROM oem WHERE ${clauses.join(" AND ")}`
  );
  stmt.bind(params);
  stmt.step();
  const count = Number(stmt.getAsObject().c);
  stmt.free();
  return count;
}
