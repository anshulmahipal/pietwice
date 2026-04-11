import { useEffect } from "react";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = "Privacy — BondWallet";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <main className="legal-page" id="privacy-top">
      <div className="legal-page__inner">
        <p className="legal-page__back">
          <Link to="/">← Back to home</Link>
        </p>
        <h1 className="legal-page__title">Privacy</h1>
        <p className="legal-page__updated">Last updated: 11 April 2026</p>

        <section className="legal-page__section" aria-labelledby="privacy-overview">
          <h2 id="privacy-overview">Overview</h2>
          <p>
            BondWallet is built as a <strong>local-first</strong> household finance app. This page
            describes how information is handled on your device and what this marketing website
            collects when you browse it.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-app">
          <h2 id="privacy-app">The BondWallet app</h2>
          <ul>
            <li>
              <strong>Data on device.</strong> Budgets, expenses, bills, cards, accounts, and related
              data are stored primarily in a local database on your phone. It is not uploaded to our
              servers for syncing or backup by default.
            </li>
            <li>
              <strong>PIN.</strong> Your app unlock PIN is handled using the platform secure storage
              APIs; we do not receive your PIN.
            </li>
            <li>
              <strong>Household &amp; flags.</strong> Some onboarding and preference flags may be
              stored outside the main database (for example in app-managed storage). Those values stay
              on device and are not used for advertising.
            </li>
            <li>
              <strong>Export &amp; restore.</strong> If you use backup export, you create a file you
              control. Restoring is a local operation you initiate. Treat backup files like sensitive
              documents.
            </li>
            <li>
              <strong>Reminders.</strong> Optional local notifications are scheduled on your device
              for due dates you configure. They are not sent through our servers.
            </li>
            <li>
              <strong>Updates.</strong> The app may receive JavaScript updates through the Expo /
              EAS update channel you installed from. That updates app code; it does not change our
              approach to keeping your ledger data on device.
            </li>
          </ul>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-site">
          <h2 id="privacy-site">This website</h2>
          <p>
            The BondWallet marketing site is a static React app. If you deploy it on Vercel with{" "}
            <strong>Vercel Analytics</strong> enabled, Vercel may process basic usage and performance
            metrics according to{" "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
              Vercel’s privacy policy
            </a>
            . We do not add separate cookies for ads on this site.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-contact">
          <h2 id="privacy-contact">Contact</h2>
          <p>
            For privacy questions about BondWallet, use the contact channel you maintain for the
            project (for example the repository owner or support email once published).
          </p>
        </section>
      </div>
    </main>
  );
}
