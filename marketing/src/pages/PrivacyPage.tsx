import { useEffect } from "react";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = "Privacy Policy - BondWallet";
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
        <h1 className="legal-page__title">Privacy Policy</h1>
        <p className="legal-page__updated">Last updated: 21 June 2026</p>

        <section className="legal-page__section" aria-labelledby="privacy-overview">
          <h2 id="privacy-overview">Overview</h2>
          <p>
            BondWallet is designed as a <strong>local-first</strong> household finance app. The
            current product is built to keep day-to-day money records on your device rather than in
            a BondWallet cloud account.
          </p>
          <p>
            This page explains what the mobile app stores locally, which optional device features it
            uses, when data can leave your device because you choose to export it, and what limited
            information may be processed by the marketing website and supporting hosting services.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-app">
          <h2 id="privacy-app">What the app stores</h2>
          <ul>
            <li>
              <strong>Core records stay on device.</strong> Expenses, category budgets, bills,
              credit cards, accounts, investments, insurance entries, and related finance records
              are stored in a local SQLite database on your device.
            </li>
            <li>
              <strong>Some setup data is stored separately.</strong> A small amount of app state,
              such as household income setup values, onboarding state, and reminder preferences, is
              kept in app-managed device storage outside the main database.
            </li>
            <li>
              <strong>Your PIN is device-protected.</strong> The 4-digit app PIN is stored using the
              platform secure storage APIs with device-only protection. BondWallet does not receive
              or keep a copy of that PIN on its own servers.
            </li>
            <li>
              <strong>No BondWallet account is required.</strong> The current app does not ask you
              to create an online account or sign in to a BondWallet server to use core tracking
              features.
            </li>
            <li>
              <strong>No ad profiling from ledger data.</strong> The current app code does not
              include advertising SDKs and does not use your financial entries to build advertising
              profiles.
            </li>
          </ul>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-permissions">
          <h2 id="privacy-permissions">Optional permissions and device features</h2>
          <ul>
            <li>
              <strong>Notifications.</strong> If you enable bill reminders or credit card reminders,
              the app asks for notification permission and schedules those reminders locally on your
              device.
            </li>
            <li>
              <strong>Files and sharing.</strong> If you export a backup, BondWallet creates a local
              <code>.db</code> backup file and passes it to the system share sheet. If you restore a
              backup, BondWallet reads the file you choose through the system document picker.
            </li>
            <li>
              <strong>What the app does not currently use.</strong> The current feature set does not
              rely on contacts, location, camera, or microphone access.
            </li>
          </ul>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-backups">
          <h2 id="privacy-backups">Backups and data leaving your device</h2>
          <p>
            BondWallet can export the main SQLite database as a backup file. Treat that file like a
            sensitive financial document. If you save or send it to Files, iCloud Drive, Google
            Drive, email, or another app, that destination provider&apos;s privacy and security
            practices also matter.
          </p>
          <p>
            The exported backup is not the entire device state. Your PIN, reminder toggles,
            onboarding markers, and some setup values stored outside the main database may not be
            included in the exported file.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-network">
          <h2 id="privacy-network">Network use and app delivery</h2>
          <p>
            Core money tracking in BondWallet is designed to work without a BondWallet sync service.
            The app may still use the network for delivery-related services around the build you
            installed, such as Expo / EAS update checks. That affects app code delivery, not whether
            your household ledger is stored on BondWallet servers.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-open-source">
          <h2 id="privacy-open-source">Open-source transparency</h2>
          <p>
            BondWallet is built with open-source technologies, and publishing the project source is
            intended to improve transparency. Where the source repository for a build is available,
            users and contributors can inspect how privacy-relevant features such as local database
            storage, secure PIN handling, notification scheduling, and backup export or restore are
            implemented.
          </p>
          <p>
            Open-source visibility can make it easier to review and question implementation details,
            but it does not replace the privacy terms or security practices of third-party services
            around the app, such as app stores, website hosting, update delivery, or any cloud
            storage provider you choose for backups.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-site">
          <h2 id="privacy-site">This website</h2>
          <p>
            The BondWallet marketing site is a static React app. It does not create a BondWallet
            user account or connect the interactive demos on this site to your real app data. If the
            site is deployed on Vercel with <strong>Vercel Analytics</strong> enabled, Vercel may
            process basic usage and performance data according to{" "}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
              Vercel’s privacy policy
            </a>
            . We do not run separate ad-retargeting cookies or advertising pixels on this site.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-changes">
          <h2 id="privacy-changes">Changes to this policy</h2>
          <p>
            If BondWallet&apos;s data handling changes in a material way, this page should be updated
            and the "Last updated" date should be revised to reflect the change.
          </p>
        </section>

        <section className="legal-page__section" aria-labelledby="privacy-contact">
          <h2 id="privacy-contact">Contact</h2>
          <p>
            Privacy questions about BondWallet can be directed to the project maintainer through the
            repository or distribution channel used to provide your build of the app.
          </p>
        </section>
      </div>
    </main>
  );
}
