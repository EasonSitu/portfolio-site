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
    context: "Context",
    myRole: "My Role",
    approach: "Approach / Process",
    evidence: "Visual Evidence",
    outcome: "Outcome / Current Status",
    heroPlaceholder: "Project visual placeholder",
    placeholder: "Visual evidence placeholder",
    placeholderNote: "No approved image, GIF or video has been added yet.",
    technicalScope: "Technical scope",
    prototypeScope: "Prototype scope",
    delivery: "Validation and delivery",
    processFallback: "Detailed process notes will be added as the case study develops.",
    statusFallback: "Current status details have not been added yet.",
    next: "Next project",
    nextHint: "View the next case study",
  },
  "zh-CN": {
    back: "返回代表项目",
    role: "参与角色",
    boundary: "范围说明",
    explore: "项目案例",
    context: "项目背景",
    myRole: "我的角色",
    approach: "推进方式",
    evidence: "视觉证据",
    outcome: "项目结果 / 当前状态",
    heroPlaceholder: "项目视觉素材占位",
    placeholder: "视觉素材占位",
    placeholderNote: "当前尚未加入经确认的图片、GIF 或视频素材。",
    technicalScope: "技术范围",
    prototypeScope: "原型范围",
    delivery: "验证与交付",
    processFallback: "当前版本暂未补充分阶段过程说明。",
    statusFallback: "当前版本暂未补充更多状态说明。",
    next: "下一个项目",
    nextHint: "查看下一个案例",
  },
  "zh-HK": {
    back: "返回代表項目",
    role: "參與角色",
    boundary: "範圍說明",
    explore: "項目案例",
    context: "項目背景",
    myRole: "我的角色",
    approach: "推進方式",
    evidence: "視覺證據",
    outcome: "項目結果／目前狀態",
    heroPlaceholder: "項目視覺素材佔位",
    placeholder: "視覺素材佔位",
    placeholderNote: "目前尚未加入經確認的圖片、GIF 或影片素材。",
    technicalScope: "技術範圍",
    prototypeScope: "原型範圍",
    delivery: "驗證與交付",
    processFallback: "目前版本暫未補充分階段過程說明。",
    statusFallback: "目前版本暫未補充更多狀態說明。",
    next: "下一個項目",
    nextHint: "查看下一個案例",
  },
};

function getProjectList(locale) {
  return siteContent[locale]?.selectedProjects
    || siteContent[DEFAULT_LOCALE]?.selectedProjects
    || [];
}

function findProject(locale, slug) {
  return getProjectList(locale).find((project) => project.id === slug)
    || getProjectList(DEFAULT_LOCALE).find((project) => project.id === slug);
}

function getProcessItems(project, localeLabels) {
  const items = [];

  if (project.technologies) {
    items.push({ title: localeLabels.technicalScope, body: project.technologies });
  }

  if (project.modules?.length) {
    items.push({
      title: localeLabels.prototypeScope,
      body: project.modules.map((module) => `${module.title} (${module.label})`).join(" · "),
    });
  }

  if (project.delivery) {
    items.push({ title: localeLabels.delivery, body: project.delivery });
  }

  return items;
}

export default function CaseStudyPage({ slug }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const project = findProject(locale, slug);
  const localeLabels = labels[locale] || labels[DEFAULT_LOCALE];
  const projectList = getProjectList(locale);
  const projectIndex = Math.max(0, projectList.findIndex((item) => item.id === slug));
  const projectNumber = String(projectIndex + 1).padStart(2, "0");
  const nextProject = projectList.length > 1
    ? projectList[(projectIndex + 1) % projectList.length]
    : null;
  const processItems = project ? getProcessItems(project, localeLabels) : [];

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
        <header className={styles.caseStudyHero} data-case-study-section="hero">
          <div className={styles.heroMeta}>
            <span className={styles.index}>{projectNumber}</span>
            <p className={styles.kicker}>{localeLabels.explore} / {project.kicker}</p>
          </div>

          <div className={styles.headingBlock}>
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

          <div className={styles.caseStudyHeroMedia} role="img" aria-label={localeLabels.heroPlaceholder}>
            <span>{localeLabels.heroPlaceholder}</span>
          </div>
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
          </div>
        </section>

        <section className={styles.caseStudySection} data-case-study-section="approach" aria-labelledby="case-study-approach">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>04</span>
            <h2 id="case-study-approach">{localeLabels.approach}</h2>
          </div>
          <div className={styles.sectionBody}>
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
        </section>

        <section className={`${styles.caseStudySection} ${styles.caseStudyEvidence}`} data-case-study-section="evidence" aria-labelledby="case-study-evidence">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>05</span>
            <h2 id="case-study-evidence">{localeLabels.evidence}</h2>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.caseStudyPlaceholder} role="img" aria-label={localeLabels.placeholder}>
              <span>{localeLabels.placeholder}</span>
            </div>
            <p className={styles.placeholderNote}>{localeLabels.placeholderNote}</p>
          </div>
        </section>

        <section className={styles.caseStudySection} data-case-study-section="outcome" aria-labelledby="case-study-outcome">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>06</span>
            <h2 id="case-study-outcome">{localeLabels.outcome}</h2>
          </div>
          <div className={styles.sectionBody}>
            <p>{project.outcome || project.boundary || localeLabels.statusFallback}</p>
          </div>
        </section>

        <nav className={styles.caseStudyNavigation} aria-label={localeLabels.next}>
          <Link className={styles.returnLink} href={withPublicBasePath("/#project")}>
            <span>{localeLabels.back}</span>
            <span aria-hidden="true">↗</span>
          </Link>
          {nextProject && (
            <Link className={styles.nextProject} href={withPublicBasePath(`/work/${nextProject.id}/`)}>
              <span className={styles.nextProjectLabel}>{localeLabels.next}</span>
              <strong>{nextProject.title}</strong>
              <span className={styles.nextProjectHint}>{localeLabels.nextHint} <span aria-hidden="true">→</span></span>
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
