import Head from "next/head";
import Link from "next/link";
import styles from "../styles/NotFound.module.scss";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>找不到頁面 | Zhicheng Situ</title>
        <meta name="description" content="這個頁面不存在；返回 Zhicheng Situ 的作品集首頁。" />
      </Head>
      <main className={styles.page} lang="zh-Hant-HK">
        <p className={styles.code}>404 / NOT FOUND</p>
        <div className={styles.content}>
          <h1>這個頁面不存在。</h1>
          <p>返回首頁，查看我的方案交付、項目經驗與聯絡方式。</p>
          <Link className={styles.link} href="/">
            返回首頁 <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </main>
    </>
  );
}
