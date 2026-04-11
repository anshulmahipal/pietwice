import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <p className="site-footer__line">
        © {year} BondWallet · Learning / household finance project.{" "}
        <Link to="/">Home</Link>
        {" · "}
        <Link to="/privacy">Privacy</Link>
        {" · "}
        <Link to="/#top">Top</Link>
      </p>
    </footer>
  );
}
