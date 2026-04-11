import { useMemo, useState } from "react";
import { buildSplitBillSnapshot, clampNonNegative } from "../lib/splitBillLogic";

function formatInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const FIELDS = [
  { key: "milk", label: "Milk" },
  { key: "fruits", label: "Fruits" },
  { key: "vegetables", label: "Vegetable" },
  { key: "laundry", label: "Laundry / toiletry" },
] as const;

type SplitKey = (typeof FIELDS)[number]["key"];

export function InteractiveSplitBillDemo() {
  const [total, setTotal] = useState(3000);
  const [splits, setSplits] = useState<Record<SplitKey, number>>({
    milk: 150,
    fruits: 400,
    vegetables: 300,
    laundry: 300,
  });

  const snapshot = useMemo(
    () => buildSplitBillSnapshot(total, splits as Record<string, number>),
    [total, splits],
  );

  return (
    <section className="split-demo" id="split-demo" aria-labelledby="split-demo-title">
      <div className="split-demo__grid">
        <div className="split-demo__copy">
          <p className="eyebrow">Try the flow</p>
          <h2 id="split-demo-title">Split expenses in seconds</h2>
          <p className="split-demo__lead">
            Add the total once. Anything you do not split can roll to your default grocery bucket—just
            like the in-app supermarket bill flow.
          </p>
          <ul className="split-demo__bullets">
            <li>Adjust quick-split lines and watch the summary update live.</li>
            <li>Numbers stay on this page only; nothing is sent anywhere.</li>
          </ul>
        </div>

        <div className="split-demo__panel card card--elevated" aria-live="polite">
          <header className="split-demo__panel-head">
            <span className="split-demo__back" aria-hidden="true">
              ←
            </span>
            <span className="split-demo__panel-title">Supermarket bill</span>
          </header>
          <p className="split-demo__hint">
            Add the total once. Any amount you do not split goes straight to grocery.
          </p>

          <label className="field">
            <span>Total bill amount</span>
            <input
              type="number"
              min={0}
              step={50}
              value={total}
              onChange={(e) => setTotal(clampNonNegative(Number(e.target.value)))}
            />
          </label>

          <p className="field field--ghost">
            <span>Date</span>
            <span className="field__fake">10 Apr 2026 · Tap to change</span>
          </p>

          <div className="split-demo__quick">
            <p className="split-demo__quick-title">Quick split</p>
            <div className="split-demo__lines">
              {FIELDS.map((f) => (
                <label key={f.key} className="field field--inline">
                  <span>{f.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={splits[f.key]}
                    onChange={(e) =>
                      setSplits((prev) => ({
                        ...prev,
                        [f.key]: clampNonNegative(Number(e.target.value)),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="split-demo__summary">
            <div>
              <span>Split assigned</span>
              <strong>{formatInr(snapshot.assigned)}</strong>
            </div>
            <div>
              <span>Remaining to grocery</span>
              <strong>{formatInr(snapshot.remainingToDefault)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
