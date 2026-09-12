import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ArchiveGateSite.module.scss";
import { withPublicBasePath } from "../../lib/publicPath.mjs";
import HeroClarityVisual from "./HeroClarityVisual";
import { editorialLayout } from "../../lib/editorialLayout.mjs";
import editorialStyles from "./EditorialPreview.module.scss";
import {EditorialEmphasis,MagneticContactLink} from './EditorialDetails';
import {projectEmphasis} from '../../lib/editorialPresentation.mjs';
import PointerCursor from '../PointerCursor';

const localeLabels = [
  ["en", "EN"],
  ["zh-CN", "简"],
  ["zh-HK", "繁"],
];

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const blocks = [...root.querySelectorAll("[data-reveal]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      blocks.forEach((block) => block.setAttribute("data-visible", "true"));
      return undefined;
    }

    root.dataset.revealReady = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    blocks.forEach((block) => observer.observe(block));
    return () => {
      observer.disconnect();
      delete root.dataset.revealReady;
    };
  }, [rootRef]);
}

function usePointerCursor(rootRef, cursorRef, cursorFollowerRef) {
  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    const cursorFollower = cursorFollowerRef.current;
    if (!root || !cursor || !cursorFollower) return undefined;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");

    if (reducedQuery.matches || coarseQuery.matches) {
      root.dataset.pointer = "disabled";
      return undefined;
    }

    root.dataset.pointer = "ready";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let followerX = targetX;
    let followerY = targetY;
    let followerFrame = 0;
    let hasPosition = false;

    const followPointer = () => {
      followerFrame = 0;
      followerX += (targetX - followerX) * 0.14;
      followerY += (targetY - followerY) * 0.14;
      root.style.setProperty("--cursor-ring-x", `${followerX}px`);
      root.style.setProperty("--cursor-ring-y", `${followerY}px`);

      if (Math.abs(targetX - followerX) > 0.1 || Math.abs(targetY - followerY) > 0.1) {
        followerFrame = window.requestAnimationFrame(followPointer);
      }
    };

    const requestFollower = () => {
      if (!followerFrame) followerFrame = window.requestAnimationFrame(followPointer);
    };

    const setPosition = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);

      if (!hasPosition) {
        hasPosition = true;
        followerX = targetX;
        followerY = targetY;
        root.style.setProperty("--cursor-ring-x", `${followerX}px`);
        root.style.setProperty("--cursor-ring-y", `${followerY}px`);
      } else {
        requestFollower();
      }

      cursor.dataset.visible = "true";
      cursorFollower.dataset.visible = "true";
    };

    const setTarget = (event) => {
      const target = event.target.closest?.("[data-cursor-label]");
      cursorFollower.dataset.label = target?.dataset.cursorLabel || "";
    };

    const clearTarget = (event) => {
      if (!event.relatedTarget || !event.relatedTarget.closest?.("[data-cursor-label]")) {
        cursorFollower.dataset.label = "";
      }
    };

    const press = () => {
      cursor.dataset.pressed = "true";
      cursorFollower.dataset.pressed = "true";
    };
    const release = () => {
      cursor.dataset.pressed = "false";
      cursorFollower.dataset.pressed = "false";
    };
    const enter = () => {
      cursor.dataset.visible = "true";
      cursorFollower.dataset.visible = "true";
    };
    const leave = () => {
      cursor.dataset.visible = "false";
      cursorFollower.dataset.visible = "false";
      cursorFollower.dataset.label = "";
    };

    root.addEventListener("pointermove", setPosition);
    root.addEventListener("pointerover", setTarget);
    root.addEventListener("pointerout", clearTarget);
    root.addEventListener("pointerdown", press);
    root.addEventListener("pointerup", release);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);

    return () => {
      root.removeEventListener("pointermove", setPosition);
      root.removeEventListener("pointerover", setTarget);
      root.removeEventListener("pointerout", clearTarget);
      root.removeEventListener("pointerdown", press);
      root.removeEventListener("pointerup", release);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      if (followerFrame) window.cancelAnimationFrame(followerFrame);
      delete root.dataset.pointer;
    };
  }, [rootRef, cursorRef, cursorFollowerRef]);
}

function useScrollTextReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const blocks = [...root.querySelectorAll("[data-scroll-text]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof window.requestAnimationFrame !== "function") {
      blocks.forEach((block) => block.style.setProperty("--text-progress", "100%"));
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const start = window.innerHeight * 0.86;
      const end = window.innerHeight * 0.24;
      blocks.forEach((block) => {
        const top = block.getBoundingClientRect().top;
        const progress = Math.min(1, Math.max(0, (start - top) / (start - end)));
        block.style.setProperty("--text-progress", `${progress * 100}%`);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}

function ScrollText({ children, className = "" }) {
  return (
    <p className={`${styles.scrollText} ${className}`} data-scroll-text data-reveal>
      <span className={styles.scrollTextBase}>{children}</span>
      <span className={styles.scrollTextFill} aria-hidden="true">{children}</span>
    </p>
  );
}

// 打字機節奏：逐字出現，完整句子停留一會兒，再逐字刪除。
const TYPEWRITER_TYPE_DELAY = 92;
const TYPEWRITER_DELETE_DELAY = 48;
const TYPEWRITER_HOLD_DELAY = 3500;

function TypewriterLine({ phrases }) {
  const [text, setText] = useState(phrases[0] || "");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || phrases.length < 2) {
      setText(phrases[0] || "");
      return undefined;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeout = 0;

    const tick = () => {
      const phrase = phrases[phraseIndex];

      if (!deleting) {
        characterIndex += 1;
        setText(phrase.slice(0, characterIndex));

        if (characterIndex >= phrase.length) {
          deleting = true;
          timeout = window.setTimeout(tick, TYPEWRITER_HOLD_DELAY);
          return;
        }

        timeout = window.setTimeout(tick, TYPEWRITER_TYPE_DELAY);
        return;
      }

      characterIndex -= 1;
      setText(phrase.slice(0, Math.max(0, characterIndex)));

      if (characterIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeout = window.setTimeout(tick, 260);
        return;
      }

      timeout = window.setTimeout(tick, TYPEWRITER_DELETE_DELAY);
    };

    setText("");
    timeout = window.setTimeout(tick, 360);
    return () => window.clearTimeout(timeout);
  }, [phrases]);

  return (
    <p className={styles.typewriterLine} aria-live="off">
      <span>{text}</span>
      <i aria-hidden="true" />
    </p>
  );
}

function SectionIndexHeader({ index, children }) {
  return (
    <div className={styles.sectionIndexHeader}>
      <div className={styles.sectionIndexBar}>
        <span>{index}</span>
        <span className={styles.sectionIndexRule} aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

function MetricsBand({ metrics }) {
  return (
    <section className={styles.metricsBand} data-reveal aria-label="Key metrics">
      <div className={styles.containerWide}>
        <div className={styles.metricsGrid}>
          {metrics.map(({ value, label }) => (
            <div className={styles.metricsItem} key={`${value}-${label}`}>
              <strong className={styles.metricsValue}>{value}</strong>
              <span className={styles.metricsLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, intro }) {
  return (
    <div className={styles.sectionHeading} data-reveal>
      <h2>{kicker}</h2>
      <p className={styles.sectionLead}>{title}</p>
      {intro && <p className={styles.sectionIntro}>{intro}</p>}
    </div>
  );
}

function LanguageSwitcher({ locale, onChange }) {
  return (
    <div className={styles.languageSwitcher} aria-label="Language">
      {localeLabels.map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={locale === value ? styles.languageActive : ""}
          onClick={() => onChange(value)}
          aria-pressed={locale === value}
          data-cursor-label={label}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function EBrandMark({ className, inverted = false }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path
        fill={inverted ? "#F4F0E7" : "#17212B"}
        d="M22 15h56v12H36v14h42v12H36v15h42v12H22V15Z"
      />
      <path fill="#174EA6" d="M36 41h42v12H36l-9 9V50l9-9Z" />
    </svg>
  );
}

// The E mark is the single initial loading state. It stays over the page
// until the complete Hero scene reports ready, with a failsafe for WebGL
// failures or resources that never resolve.
const LOADER_MIN_VISIBLE = 900;
const LOADER_EXIT_DURATION = 180;
const LOADER_FAILSAFE_DURATION = 3200;

function PageLoader({ ready }) {
  const [phase, setPhase] = useState("visible");
  const shownAtRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("hidden");
      return undefined;
    }

    let hideTimer = 0;
    let exitTimer = 0;
    let failsafeTimer = 0;
    const shownAt = shownAtRef.current || performance.now();
    shownAtRef.current = shownAt;

    const exit = (respectMinimum = true) => {
      window.clearTimeout(failsafeTimer);
      const remaining = respectMinimum
        ? Math.max(0, LOADER_MIN_VISIBLE - (performance.now() - shownAt))
        : 0;
      hideTimer = window.setTimeout(() => {
        setPhase("exiting");
        exitTimer = window.setTimeout(() => setPhase("hidden"), LOADER_EXIT_DURATION);
      }, remaining);
    };

    if (ready) {
      exit(true);
    } else {
      setPhase("visible");
      // A failed WebGL context should reveal the static fallback instead of
      // leaving the E overlay permanently stuck.
      failsafeTimer = window.setTimeout(() => exit(false), LOADER_FAILSAFE_DURATION);
    }

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(failsafeTimer);
    };
  }, [ready]);

  if (phase === "hidden") return null;

  return (
    <div className={styles.pageLoader} data-hero-page-loader data-phase={phase} aria-hidden="true">
      <div className={styles.pageLoaderContent}>
        <EBrandMark className={styles.pageLoaderMark} inverted />
        <span className={styles.pageLoaderBar}>
          <span className={styles.pageLoaderBarFill} />
        </span>
      </div>
    </div>
  );
}

function ExperienceDetailContent({ item, copy }) {
  return (
    <>
      <p className={styles.experienceDetailFocus}>{item.focus}</p>
      <div className={styles.experienceDetailTags}>
        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <section className={styles.experienceDetailBlock}>
        <h4>{copy.experienceHeader.detailSectionsLabel}</h4>
        <div className={styles.experienceDetailList}>
          {item.detail.sections.slice(0, 4).map((section) => (
            <article key={section.title} className={styles.experienceDetailItem}>
              <h5>{section.title}</h5>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {item.detail.cases.length > 0 && (
        <details className={styles.experienceDetailCases} open>
          <summary>{copy.experienceHeader.detailCasesLabel}</summary>
          <div className={styles.experienceDetailList}>
            {item.detail.cases.map((selectedCase) => (
              <article key={`${selectedCase.project || "case"}-${selectedCase.title}`} className={styles.experienceDetailItem}>
                {selectedCase.project ? (
                  <>
                    <h5 className={styles.experienceDetailProject}>{selectedCase.project}</h5>
                    <h6 className={styles.experienceDetailCaseTitle}>{selectedCase.title}</h6>
                  </>
                ) : (
                  <h5>{selectedCase.title}</h5>
                )}
                <p>{selectedCase.body}</p>
              </article>
            ))}
          </div>
        </details>
      )}

    </>
  );
}

function ExperienceExplorer({ copy }) {
  const experienceItemRefs = useRef([]);
  const pendingScrollIndexRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const selectExperience = (index) => {
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex === index ? null : index;
      pendingScrollIndexRef.current = nextIndex === null ? null : index;
      return nextIndex;
    });
  };

  useEffect(() => {
    const index = pendingScrollIndexRef.current;
    if (index === null) return undefined;
    pendingScrollIndexRef.current = null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let timeout = 0;
    let settleTimeout = 0;
    const alignExperience = () => {
      const item = experienceItemRefs.current[index];
      if (!item) return;
      const header = document.querySelector("header");
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const top = item.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduced ? "auto" : "smooth",
      });
    };

    frame = window.requestAnimationFrame(() => {
      timeout = window.setTimeout(() => {
        alignExperience();
        if (!reduced) settleTimeout = window.setTimeout(alignExperience, 320);
      }, reduced ? 0 : 280);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.clearTimeout(settleTimeout);
    };
  }, [activeIndex]);

  const handleExperienceKeyDown = (event, index) => {
    const key = event.key?.toLowerCase();
    if (key !== "enter" && key !== " " && key !== "spacebar" && event.code !== "Space") return;
    event.preventDefault();
    selectExperience(index);
  };

  return (
    <div className={styles.experienceExplorer}>
      <div className={styles.experienceExplorerHeading}>
        <SectionIndexHeader index="01">
          <SectionHeading
            kicker={copy.experienceHeader.kicker}
            title={copy.experienceHeader.title}
          />
        </SectionIndexHeader>
      </div>

      <div className={styles.experienceCardList} role="list" aria-label={copy.experienceHeader.title}>
        {copy.experience.map((item, index) => {
          const isActive = index === activeIndex;
          const experienceDetailId = `experience-detail-${item.id || index}`;
          return (
            <div
              className={styles.experienceSelectableItem}
              key={item.id || `${item.company}-${item.period}`}
              role="listitem"
              ref={(element) => {
                experienceItemRefs.current[index] = element;
              }}
              data-active={isActive}
              data-reveal
            >
              <button
                type="button"
                className={styles.experienceSelectableCard}
                aria-expanded={isActive}
                aria-controls={experienceDetailId}
                aria-label={`${item.company} — ${item.role}`}
                data-active={isActive}
                onClick={() => selectExperience(index)}
                onKeyDown={(event) => handleExperienceKeyDown(event, index)}
              >
                <span className={styles.experienceCardNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.experienceCardBody}>
                  <span className={styles.experienceCardPeriod}>{item.period} · {item.location}</span>
                  <strong>{item.company}</strong>
                  <span className={styles.experienceCardRole}>{item.role}</span>
                  <span className={styles.experienceCardHeadline}>{item.headline}</span>
                </span>
                <span className={styles.experienceCardToggle} aria-hidden="true">
                  {isActive ? "−" : "+"}
                </span>
              </button>
              <div
                id={experienceDetailId}
                className={styles.experienceAccordionDetail}
                data-open={isActive}
                aria-hidden={!isActive}
                aria-label={`${item.company} detail`}
                inert={!isActive ? "" : undefined}
              >
                <div className={styles.experienceAccordionDetailInner}>
                  <ExperienceDetailContent item={item} copy={copy} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectShowcaseCard({ project, index, onClick, actionLabel, layout='standard' }) {
  // Internal site paths need the deploy basePath (e.g. /portfolio-site on Pages);
  // external https URLs pass through unchanged.
  const rawHref = project.cardHref || "";
  const href = rawHref.startsWith("/") ? withPublicBasePath(rawHref) : rawHref;
  const card = (
    <article className={styles.projectShowcaseCard} data-reveal data-tone={index % 2 === 0 ? "blue" : "clay"}>
      <div className={styles.projectShowcaseTopline}>
        <p className={styles.kicker}>{project.kicker}</p>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      {project.thumbnail && (
        <figure className={styles.projectShowcaseMedia}>
          <div className={editorialStyles.imageMotion}>
          <img
            src={withPublicBasePath(project.thumbnail)}
            alt={project.thumbnailAlt || ""}
            width={project.thumbnail.endsWith('portfolio-site-thumb.webp') ? 1200 : 1368}
            height={project.thumbnail.endsWith('portfolio-site-thumb.webp') ? 630 : 707}
            loading="lazy"
            decoding="async"
          />
          </div>
        </figure>
      )}
      <h3><EditorialEmphasis phrases={['CIC AI','FrameShift','Hankou','汉口','漢口']} limit={1}>{project.cardTitle || project.title}</EditorialEmphasis></h3>
      <p className={styles.projectShowcaseSummary}><EditorialEmphasis phrases={projectEmphasis}>{project.summary}</EditorialEmphasis></p>
      <div className={styles.projectShowcaseTags}>
        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      {href ? (
        <span className={styles.projectShowcaseAction} aria-hidden="true">
          {actionLabel}
          <span aria-hidden="true">↗</span>
        </span>
      ) : (
        <span className={styles.projectShowcaseStatus}>{project.cardStatus}</span>
      )}
    </article>
  );

  return (
    <div className={styles.projectShowcaseItem} role="listitem" data-layout={layout}>
      {href ? (
        <a
          href={href}
          className={styles.projectShowcaseLink}
          data-cursor-label="↗"
          draggable={false}
          onDragStart={(event) => event.preventDefault()}
          onClick={onClick}
          target="_blank"
          rel="noreferrer"
        >
          {card}
        </a>
      ) : (
        <div className={`${styles.projectShowcaseLink} ${styles.projectShowcaseStatic}`}>
          {card}
        </div>
      )}
    </div>
  );
}

function SelectedProjectsSection({projects,locale,header}) {
  const labels=locale==='en'
    ? {viewCase:'View case study',viewLive:'View live',viewCode:'GitHub'}
    : locale==='zh-CN'
      ? {viewCase:'查看案例',viewLive:'在线体验',viewCode:'GitHub'}
      : {viewCase:'查看案例',viewLive:'在線體驗',viewCode:'GitHub'};
  const layouts=editorialLayout(projects.length);
  const actionLabel=project=>(project.cardHref||'').startsWith('https://github.com/')
    ? labels.viewCode : (project.cardHref||'').startsWith('http') ? labels.viewLive : labels.viewCase;
  return (
    <section id="project" className={styles.projectSection}>
      <div className={styles.containerWide}>
        <SectionIndexHeader index="02">
          <SectionHeading kicker={header.kicker} title={header.title} intro={header.intro}/>
        </SectionIndexHeader>
        <div className={styles.projectShowcase}>
          <div className={styles.projectShowcaseRail} role="list" aria-label={header.title}>
            {projects.map((project,index)=>(
              <ProjectShowcaseCard key={project.id} project={project} index={index}
                actionLabel={actionLabel(project)} layout={layouts[index]}/>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillsSection({ copy }) {
  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <div className={styles.skillsHeader} data-reveal>
          <SectionIndexHeader index="03">
            <h2>{copy.skillsHeader.title}</h2>
            <p className={styles.sectionIntro}>{copy.skillsHeader.intro}</p>
          </SectionIndexHeader>
        </div>

        <div className={styles.skillsIndex} data-reveal>
          {copy.skills.map((category) => (
            <article key={category.title} className={styles.skillsIndexGroup}>
              <h3>{category.title}</h3>
              <div className={styles.skillsIndexItems}>
                {category.items.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.skillsEvidence} data-reveal>
          {copy.skillsEvidence.map((item) => <span key={item}>{item}</span>)}
        </div>

        <div className={styles.practiceHeader} data-reveal>
          <h3>{copy.aiPracticeHeader.title}</h3>
          <p>{copy.aiPracticeHeader.intro}</p>
        </div>
        <div className={styles.practiceGrid} data-reveal>
          {copy.aiPractice.map((item) => (
            <article className={styles.practiceCard} key={item.number}>
              <span className={styles.practiceNumber}>{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <ScrollText className={styles.skillsClosing}>
          {copy.aiPracticeClosing}
        </ScrollText>
      </div>
    </section>
  );
}

export default function ArchiveGateSite({ copy, locale, onLocaleChange }) {
  const rootRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const handleHeroReady = useCallback(() => setHeroReady(true), []);
  useReveal(rootRef);
  // PointerCursor provides the shared desktop effect; Hero feedback remains independent.
  useScrollTextReveal(rootRef);

  useEffect(() => {
    const language = locale === "zh-CN" ? "zh-CN" : locale === "zh-HK" ? "zh-Hant-HK" : "en";
    document.documentElement.lang = language;
  }, [locale]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const documentElement = document.documentElement;
    const previousOverflow = documentElement.style.overflow;
    if (mobileMenuOpen) documentElement.style.overflow = "hidden";

    return () => {
      documentElement.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const handleMenuOverlayClick = (event) => {
    if (event.target === event.currentTarget || !event.target.closest?.("a, button")) {
      closeMobileMenu();
    }
  };
  const menuLabels = locale === "en"
    ? { open: "Open menu", close: "Close menu", navigation: "Site navigation", home: "Home", kicker: "Navigate" }
    : locale === "zh-CN"
      ? { open: "打开菜单", close: "关闭菜单", navigation: "网站导航", home: "个人介绍", kicker: "页面导航" }
      : { open: "開啟選單", close: "關閉選單", navigation: "網站導覽", home: "個人介紹", kicker: "頁面導覽" };

  return (
    <div ref={rootRef} className={`${styles.site} ${editorialStyles.page}`} lang={locale} data-hero-site data-menu-open={mobileMenuOpen}>
      <PointerCursor />
      <span ref={cursorRef} className={styles.cursor} aria-hidden="true" />
      <span ref={cursorFollowerRef} className={styles.cursorFollower} aria-hidden="true" />
      <span className={styles.signatureAura} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerIdentity}>
            <a href="#home" className={editorialStyles.brand} onClick={closeMobileMenu}>Eason Situ<span aria-hidden="true">.</span></a>
            <button
              className={styles.menuButton}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="site-navigation"
              aria-label={mobileMenuOpen ? menuLabels.close : menuLabels.open}
              onClick={() => setMobileMenuOpen((open) => !open)}
              data-cursor-label="MENU"
            >
              <span className={styles.menuIcon} aria-hidden="true">
                <span className={styles.menuIconLine} />
                <span className={styles.menuIconLine} />
                <span className={styles.menuIconLine} />
              </span>
            </button>
          </div>
          <nav className={editorialStyles.nav} aria-label={menuLabels.navigation}>
            <a href="#experience">{copy.nav.experience}</a>
            <a href="#project">{copy.nav.projects}</a>
            <a href="#skills">{copy.nav.skills}</a>
            <a href="#contact">{copy.nav.contact}</a>
          </nav>
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
      </header>

      <div
        className={styles.menuOverlay}
        data-open={mobileMenuOpen}
        aria-hidden={!mobileMenuOpen}
        onClick={handleMenuOverlayClick}
      >
        <div className={styles.menuOverlayInner}>
          <p className={styles.menuKicker}>{menuLabels.kicker}</p>
          <nav
            id="site-navigation"
            className={styles.menuNav}
            data-open={mobileMenuOpen}
            aria-label={menuLabels.navigation}
          >
            <a className={styles.menuLink} href="#home" onClick={closeMobileMenu} tabIndex={mobileMenuOpen ? 0 : -1} data-cursor-label="HOME">
              <span className={styles.menuLinkNumber}>01</span>
              <span>{menuLabels.home}</span>
            </a>
            <a className={styles.menuLink} href="#experience" onClick={closeMobileMenu} tabIndex={mobileMenuOpen ? 0 : -1} data-cursor-label="WORK">
              <span className={styles.menuLinkNumber}>02</span>
              <span>{copy.nav.experience}</span>
            </a>
            <a className={styles.menuLink} href="#project" onClick={closeMobileMenu} tabIndex={mobileMenuOpen ? 0 : -1} data-cursor-label="PROJECTS">
              <span className={styles.menuLinkNumber}>03</span>
              <span>{copy.nav.projects}</span>
            </a>
            <a className={styles.menuLink} href="#skills" onClick={closeMobileMenu} tabIndex={mobileMenuOpen ? 0 : -1} data-cursor-label="SKILLS">
              <span className={styles.menuLinkNumber}>04</span>
              <span>{copy.nav.skills}</span>
            </a>
            <a className={styles.menuLink} href="#contact" onClick={closeMobileMenu} tabIndex={mobileMenuOpen ? 0 : -1} data-cursor-label="CONTACT">
              <span className={styles.menuLinkNumber}>05</span>
              <span>{copy.nav.contact}</span>
            </a>
          </nav>
        </div>
      </div>

      <main>
        <section id="home" className={styles.heroSection}>
          <div className={styles.containerWide}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy} data-reveal>
                <h1 className={styles.heroIntro}>
                  <span className={styles.heroEyebrow}>{copy.hero.eyebrow}</span>
                  <span className={styles.heroName}>
                    <span className={styles.heroNamePrimary}><EditorialEmphasis phrases={['司徒智成','Zhicheng Situ']} limit={1}>{copy.hero.namePrimary || copy.hero.name}</EditorialEmphasis></span>
                    {copy.hero.namePrimary && copy.hero.nameLatin && <span className={styles.heroNameLatin}>{copy.hero.nameLatin}</span>}
                  </span>
                </h1>
                <p className={styles.heroPositioning}>{copy.positioning.primary}</p>
                <TypewriterLine phrases={copy.hero.typewriter} />
                <div className={styles.heroActions}>
                  <a className={styles.primaryButton} href="#experience" data-cursor-label="WORK">{copy.hero.viewExperience}</a>
                  <a className={styles.textButton} href={withPublicBasePath(copy.contact.resume)} download data-cursor-label="CV">{copy.hero.download}</a>
                </div>
              </div>
              <div className={`${styles.heroVisual} ${styles.heroClarityVisual}`} data-reveal>
                <HeroClarityVisual
                  locale={locale}
                  onReady={handleHeroReady}
                />
              </div>
            </div>
          </div>
        </section>

        <MetricsBand metrics={copy.metrics} />

        <section id="experience" className={styles.experienceSection}>
          <div className={styles.containerWide}>
            <ExperienceExplorer copy={copy} />
          </div>
        </section>

        <SelectedProjectsSection projects={copy.selectedProjects} locale={locale} header={copy.projectHeader} />

        <SkillsSection copy={copy} />

        <section id="contact" className={styles.contactSection} data-contact-reveal>
          <div className={editorialStyles.pageLip} aria-hidden="true" />
          <div className={styles.contactGlow} aria-hidden="true" />
          <div className={`${styles.container} ${editorialStyles.contactContent}`}>
            <header className={styles.contactSectionHeader}>
              <SectionIndexHeader index="04">
                <h2>{copy.contact.kicker}</h2>
              </SectionIndexHeader>
              <span className={editorialStyles.contactArrow} aria-hidden="true">↘</span>
            </header>
            <div className={styles.contactLayout} data-reveal>
              <div className={styles.contactCopy}>
                <p className={styles.contactOpportunity}>
                  {copy.contact.titleLines
                    ? copy.contact.titleLines.map((line) => <span className={styles.contactOpportunityLine} key={line}>{line}</span>)
                    : copy.contact.title}
                </p>
                <p className={styles.contactStatement}>{copy.contact.statement}</p>
                <p className={styles.contactClosing}>{copy.contact.closing}</p>
                <div className={styles.contactMeta}>
                  <span>{copy.contact.location}</span>
                  <span>{copy.contact.languages}</span>
                </div>
              </div>

              <aside className={styles.contactAside} aria-label={copy.contact.kicker}>
                <p className={styles.contactTalk}>{copy.contact.talkTitle}</p>
                <div className={styles.contactActions}>
                  <MagneticContactLink className={styles.primaryButton} href={copy.contact.email} data-cursor-label="EMAIL">
                    {copy.contact.emailLabel}
                  </MagneticContactLink>
                  {copy.contact.linkedin && <a className={styles.secondaryButton} href={copy.contact.linkedin} data-cursor-label="LINKEDIN" target="_blank" rel="noreferrer">LinkedIn</a>}
                  {copy.contact.github && <a className={styles.secondaryButton} href={copy.contact.github} data-cursor-label="GITHUB" target="_blank" rel="noreferrer">GitHub</a>}
                  <a className={styles.secondaryButton} href={withPublicBasePath(copy.contact.resume)} download data-cursor-label="CV">
                    {copy.contact.resumeLabel}
                  </a>
                </div>
                <a className={styles.contactEmail} href={copy.contact.email} data-cursor-label="EMAIL">
                  {copy.contact.emailAddress}
                </a>
              </aside>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
