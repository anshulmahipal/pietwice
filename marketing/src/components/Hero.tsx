import { Link } from "react-router-dom";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__decor" aria-hidden="true">
        <span className="blob blob--peach blob--tl" />
        <span className="blob blob--mist blob--tr" />
        <span className="blob blob--peach blob--bl" />
        <span className="hero__grid" />
      </div>

      <div className="hero__layout">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            Money clarity for couples
          </h1>
          <p className="hero__kicker">Track, plan, and stay on the same page without stress</p>
          <p className="hero__lead">
            BondWallet is a calm, India-ready household wallet for monthly snapshots, categories,
            bills, cards, and local backups, with records designed to stay on your device.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/#get-app">
              Get BondWallet
            </Link>
            <Link className="btn btn--ghost" to="/#split-demo">
              Try split demo
            </Link>
          </div>
          <ul className="hero__pills" aria-label="Highlights">
            <li>₹ INR everywhere</li>
            <li>Local-first data</li>
            <li>Reminders optional</li>
          </ul>
        </div>

        <div className="hero__visual">
          <PhoneMockup
            src="/screenshots/money-clarity-couples.png"
            alt="BondWallet home screen showing monthly snapshot, spent and left amounts, household income breakdown, and quick actions for categories and bills."
            priority
          />
        </div>
      </div>
    </section>
  );
}
