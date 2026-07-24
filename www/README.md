# OC-OEM Explorer (`www`)

Static React + HeroUI app that loads `oem.db` in the browser (sql.js) and filters Make → Model → Trim.

## Local development

```bash
cd www
npm install
npm run dev
```

`predev` / `prebuild` run `scripts/ensure-oem-db.mjs`, which:

1. Builds `../data/oem.db` from `../data/oem/csv` when stale
2. Copies it to `public/oem.db`
3. Copies `sql-wasm.wasm` into `public/`

Open http://localhost:5173/

## Production build (GitHub Pages)

```bash
VITE_BASE=/opencar-specs/ npm run build
```

CI runs this on push to `main` (see `.github/workflows/pages.yml`).
