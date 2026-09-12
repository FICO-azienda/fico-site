import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} data-surface="light">
      <div className={styles.inner}>
        <p className="eyebrow">FICO — Websites for a brighter tomorrow</p>
        <nav className={`eyebrow ${styles.links}`} aria-label="Footer">
          <a className="link" href="mailto:ciao@fico.studio">Email</a>
          <a className="link" href="#studio">Studio</a>
          <a className="link" href="#worlds">Work</a>
        </nav>
        <p className="eyebrow">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
