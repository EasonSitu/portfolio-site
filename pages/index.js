import { useEffect, useState } from "react";
import Head from "next/head";
import ArchiveGateSite from "../components/ArchiveGate/ArchiveGateSite";
import { siteContent } from "../data/content.mjs";
import { DEFAULT_LOCALE } from "../lib/pageContract.mjs";
import { withPublicBasePath } from "../lib/publicPath.mjs";

export default function Home() {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const copy = siteContent[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-locale");
    if (saved && siteContent[saved]) setLocale(saved);
  }, []);

  const changeLocale = (nextLocale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("portfolio-locale", nextLocale);
  };

  return (
    <>
      <Head>
        <title>Zhicheng Situ | AI & Digital Solution Delivery</title>
        <meta name="description" content="Zhicheng Situ connects business needs, technical teams and real-world delivery across AI, software and AIoT projects." />
        <meta name="theme-color" content="#17212B" />
        <link rel="icon" href={withPublicBasePath("/brand-mark.svg")} type="image/svg+xml" />
        <meta property="og:title" content="Zhicheng Situ | AI & Digital Solution Delivery" />
        <meta property="og:description" content="Recruiter-facing portfolio for solution delivery, project coordination and applied AI/IoT work." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={withPublicBasePath("/og-card.svg")} />
        <meta property="og:image:alt" content="Zhicheng Situ — Solution Delivery and Project Coordination" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ArchiveGateSite copy={copy} locale={locale} onLocaleChange={changeLocale} />
    </>
  );
}
