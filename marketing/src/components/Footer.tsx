export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <p>
        © {year} BondWallet · Learning / household finance project.{" "}
        <a href="#top">Top</a>
      </p>
    </footer>
  );
}
