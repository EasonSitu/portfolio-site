import { useEffect, useState } from "react";
import Link from "next/link";
import { siteContent } from "../../data/content.mjs";
import { DEFAULT_LOCALE } from "../../lib/pageContract.mjs";
import { withPublicBasePath } from "../../lib/publicPath.mjs";
import styles from "./CaseStudyPage.module.scss";

const localeOptions = [
  ["en", "EN"],
  ["zh-CN", "简"],
  ["zh-HK", "繁"],
];

const labels = {
  en: {
    back: "Back to selected work",
    role: "Role",
    boundary: "Scope",
    explore: "Project case study",
  },
  "zh-CN": {
    back: "返回精选项目",
    role: "参与角色",
    boundary: "范围说明",
    explore: "项目案例",
  },
  "zh-HK": {
    back: "返回精選項目",
    role: "參與角色",
    boundary: "範圍說明",
    explore: "項目案例",
  },
};

function findProject(locale, slug) {
  return siteContent[locale]?.selectedProjects?.find((project) => project.id === slug)
    || siteContent[DEFAULT_LOCALE]?.selectedProjects?.find((project) => project.id === slug);
}

export default function CaseStudyPage({ slug }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const project = findProject(locale, slug);
  const localeLabels = labels[locale] || labels[DEFAULT_LOCALE];

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-locale");
    if (saved && siteContent[saved]) setLocale(saved);
  }, []);

  const changeLocale = (nextLocale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("portfolio-locale", nextLocale);
  };

  if (!project) return null;

  return (
    <main className={styles.page} lang={locale}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.backLink} href={withPublicBasePath("/#project")}>
            <span aria-hidden="true">←</span>
            {localeLabels.back}
          </Link>
          <div className={styles.languageSwitcher} aria-label="Language">
            {localeOptions.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={locale === value ? styles.activeLanguage : ""}
                aria-pressed={locale === value}
                onClick={() => changeLocale(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <p className={styles.kicker}>{localeLabels.explore} / {project.kicker}</p>
        <div className={styles.headingBlock}>
          <p className={styles.index} aria-hidden="true">{project.id}</p>
          <h1>{project.title}</h1>
        </div>
        <p className={styles.summary}>{project.summary}</p>

        <div className={styles.metaGrid}>
          <section>
            <p className={styles.metaLabel}>{localeLabels.role}</p>
            <p>{project.role}</p>
          </section>
          <section>
            <p className={styles.metaLabel}>{localeLabels.boundary}</p>
            <p>{project.boundary}</p>
          </section>
        </div>

        <div className={styles.tags} aria-label="Technologies and focus areas">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>

        <section className={styles.report}>
          <p className={styles.reportLabel}>{project.title}</p>
          <p>{project.background || project.summary}</p>
          {project.delivery && <p>{project.delivery}</p>}
        </section>

        <Link className={styles.returnLink} href={withPublicBasePath("/#project")}>
          <span>{localeLabels.back}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
