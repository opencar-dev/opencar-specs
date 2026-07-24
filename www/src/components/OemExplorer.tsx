import { useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Spinner, Table } from "@heroui/react";
import type { Database } from "sql.js";
import {
  countVehicles,
  listMakes,
  listModels,
  listTrims,
  loadOemDb,
  queryVehicles,
  type OemRow,
} from "../lib/oemDb";
import { FilterSelect } from "./FilterSelect";

const RESULT_LIMIT = 250;

export function OemExplorer() {
  const [database, setDatabase] = useState<Database | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [trim, setTrim] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadOemDb();
        if (!cancelled) {
          setDatabase(loaded);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const makes = useMemo(
    () => (database ? listMakes(database) : []),
    [database]
  );

  const models = useMemo(
    () => (database && make ? listModels(database, make) : []),
    [database, make]
  );

  const trims = useMemo(
    () => (database && make && model ? listTrims(database, make, model) : []),
    [database, make, model]
  );

  const total = useMemo(
    () => (database ? countVehicles(database, make, model, trim) : 0),
    [database, make, model, trim]
  );

  const rows: OemRow[] = useMemo(
    () =>
      database ? queryVehicles(database, make, model, trim, RESULT_LIMIT) : [],
    [database, make, model, trim]
  );

  function clearFilters() {
    setMake(null);
    setModel(null);
    setTrim(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-muted">
        <Spinner size="lg" />
        <span>Loading OEM catalog…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-danger/30 bg-danger/5 p-6">
        <Card.Header>
          <Card.Title>Could not load oem.db</Card.Title>
          <Card.Description>{error}</Card.Description>
        </Card.Header>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-border/60 bg-surface/80 shadow-sm backdrop-blur">
        <Card.Header className="gap-2">
          <Card.Title>Browse vehicles</Card.Title>
          <Card.Description>
            Filter the OC-OEM catalog by make, then model, then trim.
          </Card.Description>
        </Card.Header>
        <Card.Content className="grid gap-4 md:grid-cols-3">
          <FilterSelect
            label="Make"
            placeholder="Select a make"
            options={makes}
            value={make}
            onChange={(value) => {
              setMake(value);
              setModel(null);
              setTrim(null);
            }}
          />
          <FilterSelect
            label="Model"
            placeholder={make ? "Select a model" : "Choose a make first"}
            options={models}
            value={model}
            isDisabled={!make}
            onChange={(value) => {
              setModel(value);
              setTrim(null);
            }}
          />
          <FilterSelect
            label="Trim"
            placeholder={model ? "Select a trim" : "Choose a model first"}
            options={trims}
            value={trim}
            isDisabled={!model}
            onChange={setTrim}
          />
        </Card.Content>
        <Card.Footer className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip size="sm" variant="soft">
              {make ? `${total.toLocaleString()} matches` : "Pick a make"}
            </Chip>
            {total > RESULT_LIMIT ? (
              <Chip size="sm" variant="soft">
                Showing first {RESULT_LIMIT}
              </Chip>
            ) : null}
          </div>
          <Button variant="tertiary" onPress={clearFilters} isDisabled={!make}>
            Clear
          </Button>
        </Card.Footer>
      </Card>

      {!make ? (
        <p className="text-center text-muted py-10">
          Select a make to see year / make / model / trim results.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-center text-muted py-10">No vehicles match.</p>
      ) : (
        <Card className="overflow-hidden border border-border/60 bg-surface/80 shadow-sm">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="OEM vehicles" className="min-w-[640px]">
                <Table.Header>
                  <Table.Column isRowHeader>Year</Table.Column>
                  <Table.Column>Make</Table.Column>
                  <Table.Column>Model</Table.Column>
                  <Table.Column>Trim</Table.Column>
                </Table.Header>
                <Table.Body>
                  {rows.map((row) => (
                    <Table.Row
                      key={`${row.year}-${row.make}-${row.model}-${row.trim}`}
                    >
                      <Table.Cell className="tabular-nums font-medium">
                        {row.year}
                      </Table.Cell>
                      <Table.Cell>{row.make}</Table.Cell>
                      <Table.Cell>{row.model}</Table.Cell>
                      <Table.Cell>{row.trim}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card>
      )}
    </div>
  );
}
