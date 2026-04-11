import { useEffect, useState } from "react";

const nav = [
  { href: "#stories", label: "Stories" },
  { href: "#split-demo", label: "Split" },
  { href: "#playground", label: "Snapshot" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
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
        <a className="site-logo" href="#top">
          BondWallet
        </a>
        <nav className="site-nav" aria-label="Primary">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn--small btn--primary" href="#get-app">
          Get the app
        </a>
      </div>
    </header>
  );
}
