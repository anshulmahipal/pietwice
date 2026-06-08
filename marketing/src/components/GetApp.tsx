import { Link } from "react-router-dom";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.logicnib.bondwallet";

export function GetApp() {
  return (
    <section className="get-app" id="get-app" aria-labelledby="get-app-title">
      <div className="get-app__inner card card--elevated">
        <h2 id="get-app-title">Get BondWallet</h2>
        <p>
          Download on Google Play when you are ready. The iOS build is on the way—check back for the
          App Store release.
        </p>

        <div className="get-app__stores">
          <a
            className="get-app__play"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/google-play-badge.svg"
              alt="Get it on Google Play"
              width={512}
              height={152}
              decoding="async"
            />
          </a>

          <div className="get-app__apple-soon" role="status">
            <span className="get-app__apple-soon-title">App Store</span>
            <span className="get-app__apple-soon-note">Coming soon on the App Store</span>
          </div>
        </div>

        <div className="get-app__actions">
          <Link className="btn btn--ghost" to="/#top">
            Back to top
          </Link>
        </div>

        <p className="get-app__fineprint">
          Package: <code>com.logicnib.bondwallet</code> · Cream UI <code>#f6f1e8</code>
        </p>
      </div>
    </section>
  );
}
