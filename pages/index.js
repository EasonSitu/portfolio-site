import { useEffect, useState } from "react";
import Head from "next/head";
import ArchiveGateSite from "../components/ArchiveGate/ArchiveGateSite";
import { siteContent } from "../data/content.mjs";

export default function Home() {
  const [locale, setLocale] = useState("en");
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
        <meta name="theme-color" content="#070B16" />
      </Head>
      <ArchiveGateSite copy={copy} locale={locale} onLocaleChange={changeLocale} />
    </>
  );
}
