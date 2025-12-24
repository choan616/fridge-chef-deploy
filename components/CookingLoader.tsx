"use client";

import styles from "./CookingLoader.module.css";

export default function CookingLoader() {
  return (
    <div className={styles.container}>
      <div className={styles.pan}>
        <div className={styles.food}></div>
        <div className={styles.handle}></div>
      </div>
      <p className={styles.text}>맛있는 레시피를 찾고 있어요...</p>
    </div>
  );
}
