import { OemExplorer } from "./components/OemExplorer";

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-3">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-accent">
          OpenCar.dev
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          OC-OEM Explorer
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Browse USA OEM vehicle identities from the OpenCar{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-sm">oem.db</code>{" "}
          catalog — year, make, model, and trim.
        </p>
      </header>

      <main className="flex-1">
        <OemExplorer />
      </main>

      <footer className="mt-12 border-t border-border/50 pt-6 text-sm text-muted">
        Data conforms to{" "}
        <a
          className="text-accent underline-offset-2 hover:underline"
          href="https://github.com/opencar-dev/opencar-specs/blob/main/specifications/OC-OEM.md"
        >
          OC-OEM
        </a>
        . Built for static hosting on GitHub Pages.
      </footer>
    </div>
  );
}
