import { useMemo, useState, type CSSProperties } from "react";
import { buildBudgetDemoSnapshot, clamp } from "../lib/budgetDemoLogic";

const INCOME_MAX = 500_000;
const PLANNED_MAX = 500_000;

function formatInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function InteractiveBudgetDemo() {
  const [income, setIncome] = useState(120_000);
  const [planned, setPlanned] = useState(85_000);

  const snapshot = useMemo(() => buildBudgetDemoSnapshot(income, planned), [income, planned]);

  const incomePct = INCOME_MAX === 0 ? 0 : (income / INCOME_MAX) * 100;
  const plannedPct = PLANNED_MAX === 0 ? 0 : (planned / PLANNED_MAX) * 100;

  return (
    <section className="playground" id="playground" aria-labelledby="playground-title">
      <div className="section-heading">
        <p className="eyebrow section-heading__eyebrow">Monthly snapshot</p>
        <h2 id="playground-title">Try the household snapshot</h2>
        <p>
          Drag the sliders—see how planned spending sits against income. The real app ties this to
          categories, calendars, and budgets across the month.
        </p>
      </div>

      <div className="playground__grid">
        <div className="playground__controls card">
          <label className="slider-field">
            <span className="slider-field__label">Monthly household income</span>
            <span className="slider-field__value">{formatInr(snapshot.income)}</span>
            <input
              type="range"
              min={0}
              max={INCOME_MAX}
              step={1000}
              value={income}
              onChange={(e) => setIncome(clamp(Number(e.target.value), 0, INCOME_MAX))}
              aria-valuemin={0}
              aria-valuemax={INCOME_MAX}
              aria-valuenow={income}
            />
            <span className="slider-field__hint">0 — {formatInr(INCOME_MAX)}</span>
          </label>

          <label className="slider-field">
            <span className="slider-field__label">Planned budget (categories)</span>
            <span className="slider-field__value">{formatInr(planned)}</span>
            <input
              type="range"
              min={0}
              max={PLANNED_MAX}
              step={1000}
              value={planned}
              onChange={(e) => setPlanned(clamp(Number(e.target.value), 0, PLANNED_MAX))}
              aria-valuemin={0}
              aria-valuemax={PLANNED_MAX}
              aria-valuenow={planned}
            />
            <span className="slider-field__hint">Capped at income in the summary</span>
          </label>
        </div>

        <div className="playground__viz card" aria-live="polite">
          <h3 className="playground__viz-title">Allocation</h3>
          <div
            className="donut"
            style={
              {
                "--p": String(snapshot.utilizationPercent),
              } as CSSProperties
            }
            role="img"
            aria-label={`Planned ${snapshot.utilizationPercent} percent of income`}
          />
          <dl className="playground__metrics">
            <div>
              <dt>Planned (capped)</dt>
              <dd>{formatInr(snapshot.planned)}</dd>
            </div>
            <div>
              <dt>Unallocated</dt>
              <dd>{formatInr(snapshot.unallocated)}</dd>
            </div>
            <div>
              <dt>Utilization</dt>
              <dd>{snapshot.utilizationPercent}%</dd>
            </div>
          </dl>

          <div className="bar-compare" aria-hidden="true">
            <div className="bar-compare__track">
              <div className="bar-compare__fill bar-compare__fill--income" style={{ width: `${incomePct}%` }} />
            </div>
            <div className="bar-compare__track">
              <div className="bar-compare__fill bar-compare__fill--planned" style={{ width: `${plannedPct}%` }} />
            </div>
            <div className="bar-compare__legend">
              <span>Income scale</span>
              <span>Budget scale</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
