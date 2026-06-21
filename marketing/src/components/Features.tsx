import { useId, useState } from "react";

type Feature = {
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    title: "House expense & calendar",
    body: "See spend against category budgets and tap any day for line items—built around how you actually track household outflows.",
  },
  {
    title: "Bills & credit cards",
    body: "Month views, due-day detail, and optional local reminders so recurring obligations do not sneak up on you.",
  },
  {
    title: "Accounts & cashflow",
    body: "Manual accounts with a running ledger and month summaries when you want a second lens beyond categories.",
  },
  {
    title: "Budget periods & insights",
    body: "Weekly, bi-weekly, or monthly caps with live totals; insights surface India-formatted month and FY signals.",
  },
  {
    title: "Investments & insurance",
    body: "Lightweight hubs for SIP-style activity days and policy renewal reminders—same calendar language as the rest of the app.",
  },
  {
    title: "PIN lock & backup",
    body: "Unlock with a PIN and export or restore a local backup file when you change devices.",
  },
];

export function Features() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <div className="section-heading">
        <h2 id="features-title">Everything in one wallet-shaped shell</h2>
        <p>
          Tap a card to expand. BondWallet is an Expo app—these are the areas users live in day to
          day.
        </p>
      </div>
      <div className="features__grid" role="list">
        {FEATURES.map((f, i) => {
          const panelId = `${baseId}-panel-${i}`;
          const buttonId = `${baseId}-btn-${i}`;
          const expanded = openIndex === i;
          return (
            <article key={f.title} className="feature-card" role="listitem">
              <button
                type="button"
                id={buttonId}
                className={`feature-card__toggle ${expanded ? "is-open" : ""}`}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpenIndex(expanded ? -1 : i)}
              >
                <span className="feature-card__title">{f.title}</span>
                <span className="feature-card__chevron" aria-hidden="true">
                  {expanded ? "−" : "+"}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="feature-card__panel"
                data-expanded={expanded}
                hidden={!expanded}
              >
                <p>{f.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
