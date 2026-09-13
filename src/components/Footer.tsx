import Link from "next/link";
import styles from "./Footer.module.css";
import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  return (
    <footer className={styles.footer} data-surface="light">
      <div className={styles.inner}>
        <p className="eyebrow">FICO — {dict.footer.tagline}</p>
        <nav className={`eyebrow ${styles.links}`} aria-label="Footer">
          <a className="link" href="mailto:ficolc78@gmail.com">ficolc78@gmail.com</a>
          <Link className="link" href={`/${locale}/work`}>{dict.nav.work}</Link>
          <Link className="link" href={`/${locale}/services`}>{dict.nav.services}</Link>
          <Link className="link" href={`/${locale}/privacy`}>{dict.footer.privacy}</Link>
        </nav>
        <p className="eyebrow">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
