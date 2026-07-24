# OpenCar OEM Data

Canonical source for USA OEM vehicle identities conforming to **[OC-OEM](../specifications/OC-OEM.md)**.

## Layout

| Path | Role |
| :--- | :--- |
| `oem/csv/{year}.csv` | **Canonical source** (committed, PR-reviewable) |
| `oem.db` | **Generated** SQLite build (gitignored) |
| `../raw/vehicles.csv` | Upstream EPA dump (gitignored) |

## CSV schema

Each year file has:

```csv
year,make,model,trim
2020,Toyota,Tacoma,Tacoma TRD Offroad 4WD
```

| Column | OC-OEM field |
| :----- | :----------- |
| `year` | `vehicle.year` |
| `make` | `vehicle.make` |
| `model` | `vehicle.model` |
| `trim` | `vehicle.trim` |

## Build `oem.db`

```bash
cd db
npm install
npm run build:db          # data/oem/csv → data/oem.db
```

Re-export year CSVs from the upstream EPA dump (requires `raw/vehicles.csv`):

```bash
cd db
npm run export:csv
npm run build:db
```

## Explorer site

The React app in `../www` loads `oem.db` in the browser via sql.js.

```bash
cd www
npm install
npm run dev               # builds oem.db + copies to public/, then Vite
```

On push to `main`, GitHub Actions rebuilds `oem.db` and deploys `www/dist` to GitHub Pages.
