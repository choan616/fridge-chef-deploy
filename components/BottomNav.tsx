"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link 
        href="/saved" 
        className={`${styles.navItem} ${pathname === '/saved' ? styles.active : ''}`}
      >
        <span className={styles.icon}>📖</span>
        <span className={styles.label}>마이 레시피</span>
      </Link>
      
      <Link 
        href="/" 
        className={`${styles.navItem} ${styles.homeButton} ${pathname === '/' ? styles.active : ''}`}
      >
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>홈</span>
      </Link>
      
      <Link 
        href="/timers" 
        className={`${styles.navItem} ${pathname === '/timers' ? styles.active : ''}`}
      >
        <span className={styles.icon}>⏱️</span>
        <span className={styles.label}>타이머</span>
      </Link>
    </nav>
  );
}
