import { useId, useState } from "react";

type FaqItem = { q: string; a: string };

const ITEMS: FaqItem[] = [
  {
    q: "Is BondWallet a bank or payment app?",
    a: "No. It is a local organizer: budgets, bills, cards, and ledgers you manage yourself. It does not move money.",
  },
  {
    q: "Where does my data live?",
    a: "Most of it stays on your device in a local SQLite database. Some setup and reminder preferences stay in device storage, and exported backups cover the main database rather than every device-only setting.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. Core tracking works offline and does not require a BondWallet cloud account. Network use is limited to surrounding services such as app delivery updates.",
  },
  {
    q: "Is this the same codebase as this website?",
    a: "The app and the website live in the same repo, but this page is a separate Vite marketing surface from the Expo mobile app itself.",
  },
];

export function Faq() {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="section-heading">
        <h2 id="faq-title">Questions, answered</h2>
        <p>Quick facts for visitors evaluating BondWallet for their household.</p>
      </div>
      <div className="faq__list">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          const headingId = `${baseId}-h-${i}`;
          const panelId = `${baseId}-p-${i}`;
          return (
            <div key={item.q} className="faq__item">
              <h3 className="faq__question">
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq__icon" aria-hidden="true">
                    {isOpen ? "↑" : "↓"}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className="faq__answer"
                data-open={isOpen}
              >
                <p>{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
