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
    back: "Back to recent work",
    explore: "Project notes",
    boundary: "What this is",
    context: "Why we built it",
    myRole: "What I worked on",
    approach: "How we built it",
    evidence: "Screens and records",
    outcome: "What we reached",
    heroPlaceholder: "Project visual placeholder",
    technicalScope: "Tools and setup",
    prototypeScope: "How the system works",
    delivery: "Testing and delivery",
    validation: "How we tested it",
    processFallback: "More process notes will be added later.",
    statusFallback: "More details will be added later.",
  },
  "zh-CN": {
    back: "返回近期项目",
    explore: "项目记录",
    boundary: "这是什么",
    context: "为什么做",
    myRole: "我做了什么",
    approach: "怎么推进",
    evidence: "界面与记录",
    outcome: "做到了什么",
    heroPlaceholder: "项目视觉素材占位",
    technicalScope: "用到的技术",
    prototypeScope: "系统怎么工作",
    delivery: "测试与交付",
    validation: "怎么测试",
    processFallback: "更多过程说明会在之后补充。",
    statusFallback: "更多状态说明会在之后补充。",
  },
  "zh-HK": {
    back: "返回近期項目",
    explore: "項目記錄",
    boundary: "這是甚麼",
    context: "為甚麼做",
    myRole: "我做了甚麼",
    approach: "怎樣推進",
    evidence: "介面與記錄",
    outcome: "做到了甚麼",
    heroPlaceholder: "項目視覺素材佔位",
    technicalScope: "用到的技術",
    prototypeScope: "系統怎樣運作",
    delivery: "測試與交付",
    validation: "怎樣測試",
    processFallback: "更多過程說明會在之後補充。",
    statusFallback: "更多狀態說明會在之後補充。",
  },
};

function getProjectList(locale) {
  const projects = siteContent[locale]?.selectedProjects
    || siteContent[DEFAULT_LOCALE]?.selectedProjects
    || [];
  return projects.filter((project) => project.caseStudy === true);
}

function findProject(locale, slug) {
  return getProjectList(locale).find((project) => project.id === slug)
    || getProjectList(DEFAULT_LOCALE).find((project) => project.id === slug);
}

function getProcessItems(project, localeLabels) {
  if (project.process?.length) return project.process;

  const items = [];
  if (project.delivery) items.push({ title: localeLabels.delivery, body: project.delivery });
  return items;
}

export default function CaseStudyPage({ slug }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const project = findProject(locale, slug);
  const localeLabels = labels[locale] || labels[DEFAULT_LOCALE];
  const projectList = getProjectList(locale);
  const projectIndex = Math.max(0, projectList.findIndex((item) => item.id === slug));
  const projectNumber = String(projectIndex + 1).padStart(2, "0");
  const processItems = project ? getProcessItems(project, localeLabels) : [];
  const isCicProject = project?.id === "cic-ai-assessment";
  const hasValidation = Boolean(project?.validation?.metrics?.length);
  const hasEvidence = Boolean(project?.evidenceImages?.length);
  const hasApproach = Boolean(project?.technologies || project?.process?.length || project?.modules?.length);
  const showApproach = !isCicProject && hasApproach;
  const showValidation = !isCicProject && hasValidation;
  const roleHighlights = isCicProject ? [] : (project?.roleHighlights || []);
  const evidenceIndex = 4 + (showApproach ? 1 : 0) + (showValidation ? 1 : 0);
  const evidenceNumber = String(evidenceIndex).padStart(2, "0");
  const outcomeNumber = String(evidenceIndex + (hasEvidence ? 1 : 0)).padStart(2, "0");

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
          <Link className={styles.backLink} href="/#project">
            <span aria-hidden="true">↖</span>
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
        <header className={styles.caseStudyHero} data-case-study-section="hero">
          <div className={styles.heroMeta}>
            <span className={styles.index}>{projectNumber}</span>
            <p className={styles.kicker}>{localeLabels.explore} / {project.kicker}</p>
          </div>

          <div className={styles.headingBlock}>
            <h1>{project.title}</h1>
          </div>
          <p className={styles.summary}>{project.summary}</p>

          {!isCicProject && project.boundary && (
            <div className={styles.metaGrid}>
            <section>
              <p className={styles.metaLabel}>{localeLabels.boundary}</p>
              <p>{project.boundary}</p>
            </section>
            </div>
          )}

          <div className={styles.tags} aria-label="Technologies and focus areas">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          {project.heroImage ? (
            <figure className={styles.caseStudyHeroMedia}>
              <img src={withPublicBasePath(project.heroImage)} alt={project.heroImageAlt || project.title} />
            </figure>
          ) : (
            <div className={styles.caseStudyHeroMedia} role="img" aria-label={localeLabels.heroPlaceholder}>
              <span>{localeLabels.heroPlaceholder}</span>
            </div>
          )}
        </header>

        <section className={styles.caseStudySection} data-case-study-section="context" aria-labelledby="case-study-context">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 id="case-study-context">{localeLabels.context}</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>{project.background || localeLabels.processFallback}</p>
          </div>
        </section>

        <section className={styles.caseStudySection} data-case-study-section="role" aria-labelledby="case-study-role">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 id="case-study-role">{localeLabels.myRole}</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>{project.role || localeLabels.statusFallback}</p>
            {project.roleDetail && <p className={styles.roleDetail}>{project.roleDetail}</p>}
            {roleHighlights.length > 0 && (
              <div className={styles.roleHighlights}>
                {roleHighlights.map((item) => (
                  <article key={item.title} className={styles.roleHighlight}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {showApproach && (
          <section className={styles.caseStudySection} data-case-study-section="approach" aria-labelledby="case-study-approach">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>04</span>
            <h2 id="case-study-approach">{localeLabels.approach}</h2>
          </div>
          <div className={styles.sectionBody}>

            {project.technologies && (
              <article className={styles.technicalNote}>
                <h3>{localeLabels.technicalScope}</h3>
                <p>{project.technologies}</p>
              </article>
            )}

            {processItems.length > 0 ? (
              <div className={styles.processList}>
                {processItems.map((item) => (
                  <article key={item.title} className={styles.processItem}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>{localeLabels.processFallback}</p>
            )}
          </div>
            {project.modules?.length > 0 && (
              <div className={styles.moduleFlowWide}>
                <h3 className={styles.bodyEyebrow}>{localeLabels.prototypeScope}</h3>
                <div className={styles.moduleFlow}>
                  {project.modules.map((module) => (
                    <article key={module.number} className={styles.moduleFlowItem}>
                      <span>{module.number}</span>
                      <strong>{module.title}</strong>
                      <small>{module.label}</small>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {showValidation && (
          <section className={styles.caseStudySection} data-case-study-section="validation" aria-labelledby="case-study-validation">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>05</span>
              <h2 id="case-study-validation">{localeLabels.validation}</h2>
            </div>
            <div className={styles.sectionBody}>
              <p>{project.validation.intro}</p>
              <div className={styles.validationGrid}>
                {project.validation.metrics.map((metric) => (
                  <article key={`${metric.value}-${metric.label}`} className={styles.validationMetric}>
                    <strong>{metric.value}</strong>
                    <h3>{metric.label}</h3>
                    <p>{metric.note}</p>
                  </article>
                ))}
              </div>
              <p className={styles.validationNote}>{project.validation.note}</p>
            </div>
          </section>
        )}

        {hasEvidence && (
          <section className={`${styles.caseStudySection} ${styles.caseStudyEvidence}`} data-case-study-section="evidence" aria-labelledby="case-study-evidence">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNumber}>{evidenceNumber}</span>
              <h2 id="case-study-evidence">{localeLabels.evidence}</h2>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.evidenceGrid}>
                {project.evidenceImages.map((image) => (
                  <figure className={styles.evidenceItem} key={image.src}>
                    <img src={withPublicBasePath(image.src)} alt={image.alt || project.title} />
                    {image.caption && <figcaption>{image.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className={styles.caseStudySection} data-case-study-section="outcome" aria-labelledby="case-study-outcome">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>{outcomeNumber}</span>
            <h2 id="case-study-outcome">{localeLabels.outcome}</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>{project.outcome || project.boundary || localeLabels.statusFallback}</p>
          </div>
        </section>

        <nav className={styles.caseStudyNavigation} aria-label={localeLabels.back}>
          <Link className={styles.returnLink} href="/#project">
            <span>{localeLabels.back}</span>
            <span aria-hidden="true">↖</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
