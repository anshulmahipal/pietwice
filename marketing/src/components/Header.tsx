import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const nav = [
  { to: "/#stories", label: "Stories" },
  { to: "/#split-demo", label: "Split" },
  { to: "/#playground", label: "Snapshot" },
  { to: "/#features", label: "Features" },
  { to: "/#faq", label: "FAQ" },
  { to: "/privacy", label: "Privacy" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="site-header__inner">
        <Link className="site-logo" to="/">
          BondWallet
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <ul>
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link className="btn btn--small btn--primary" to="/#get-app">
          Get the app
        </Link>
      </div>
    </header>
  );
}
