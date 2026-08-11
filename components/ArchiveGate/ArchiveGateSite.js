import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import {
  clampExperienceProgress,
  getExperienceMotionMetrics,
} from "../../lib/experienceMotion.mjs";
import styles from "./ArchiveGateSite.module.scss";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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

// 打字機節奏：讓每個字有足夠時間被讀到，完整句子也多停留一會兒。
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

// 只有頁面載入較慢時才顯示，快速載入不會被固定開場動畫打斷。
const LOADER_SHOW_DELAY = 220;
const LOADER_MIN_VISIBLE = 900;
const LOADER_EXIT_DURATION = 180;

function PageLoader() {
  const [phase, setPhase] = useState("hidden");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    let showTimer = 0;
    let hideTimer = 0;
    let exitTimer = 0;
    let shownAt = 0;
    let hasShown = false;
    let pageReady = document.readyState === "complete";

    const finish = () => {
      pageReady = true;
      window.clearTimeout(showTimer);

      if (!hasShown) return;

      const remaining = Math.max(0, LOADER_MIN_VISIBLE - (performance.now() - shownAt));
      hideTimer = window.setTimeout(() => {
        setPhase("exiting");
        exitTimer = window.setTimeout(() => setPhase("hidden"), LOADER_EXIT_DURATION);
      }, remaining);
    };

    if (!pageReady) {
      showTimer = window.setTimeout(() => {
        if (pageReady) return;
        hasShown = true;
        shownAt = performance.now();
        setPhase("visible");
      }, LOADER_SHOW_DELAY);
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(exitTimer);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className={styles.pageLoader} data-phase={phase} aria-hidden="true">
      <div className={styles.pageLoaderContent}>
        <EBrandMark className={styles.pageLoaderMark} inverted />
        <span className={styles.pageLoaderBar}>
          <span className={styles.pageLoaderBarFill} />
        </span>
      </div>
    </div>
  );
}

function ExperienceTrack({ copy, locale }) {
  const storyRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);
  const motionTriggerRef = useRef(null);
  const [activeExperience, setActiveExperience] = useState(0);
  const [experienceScrollProgress, setExperienceScrollProgress] = useState(0);
  const labels = locale === "en"
    ? {
        previous: "Previous",
        next: "Next",
        drag: "DRAG",
        progress: "Experience progress",
        instruction: "Scroll to follow the timeline, or use the arrows.",
      }
    : locale === "zh-CN"
      ? {
          previous: "上一段",
          next: "下一段",
          drag: "滑动",
          progress: "经历浏览进度",
          instruction: "向下滚动查看经历，或使用箭头。",
        }
      : {
          previous: "上一段",
          next: "下一段",
          drag: "滑動",
          progress: "經歷瀏覽進度",
          instruction: "向下滾動查看經歷，或使用箭頭。",
        };

  const updateActiveExperience = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.children];
    const target = track.scrollLeft + track.clientWidth / 2;
    const closest = cards.reduce((best, card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - target);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveExperience(closest.index);
  };

  useEffect(() => {
    const story = storyRef.current;
    const viewport = stickyRef.current?.querySelector(`.${styles.experienceViewport}`);
    const track = trackRef.current;
    if (!story || !viewport || !track) return undefined;

    const desktop = window.matchMedia("(min-width: 901px)");
    const shortHeight = window.matchMedia("(max-height: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || shortHeight.matches || reduced.matches) {
      story.style.removeProperty("height");
      gsap.set(track, { clearProps: "transform" });
      return undefined;
    }

    const measure = () => getExperienceMotionMetrics({
      contentWidth: track.scrollWidth,
      viewportWidth: viewport.clientWidth,
      viewportHeight: window.innerHeight,
      pace: 1.25,
      minimumScreens: 2,
    });

    const setStoryHeight = () => {
      const metrics = measure();
      story.style.height = `${metrics.storyHeight}px`;
      return metrics;
    };

    setStoryHeight();

    const context = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -measure().horizontalDistance,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: story,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.15,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextProgress = clampExperienceProgress(self.progress);
            setExperienceScrollProgress(nextProgress);
            setActiveExperience(Math.round(nextProgress * (copy.experience.length - 1)));
          },
        },
      });

      motionTriggerRef.current = tween.scrollTrigger;
    }, story);

    const handleResize = () => {
      setStoryHeight();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", handleResize);
      motionTriggerRef.current = null;
      context.revert();
      story.style.removeProperty("height");
      gsap.set(track, { clearProps: "transform" });
    };
  }, [copy.experience.length, locale]);

  const scrollTrack = (direction) => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia("(min-width: 901px)").matches;
    const nextIndex = Math.min(copy.experience.length - 1, Math.max(0, activeExperience + direction));
    const nextCard = track.children[nextIndex];

    const motionTrigger = motionTriggerRef.current;
    if (story && motionTrigger && desktop && !reduced) {
      const nextProgress = nextIndex / Math.max(1, copy.experience.length - 1);
      window.scrollTo({
        top: motionTrigger.start + (motionTrigger.end - motionTrigger.start) * nextProgress,
        behavior: "smooth",
      });
      return;
    }

    track.scrollTo({
      left: nextCard?.offsetLeft || 0,
      behavior: reduced ? "auto" : "smooth",
    });
    setActiveExperience(nextIndex);
  };

  const progress = Math.max(
    (activeExperience + 1) / copy.experience.length,
    experienceScrollProgress,
  ) * 100;

  return (
    <div className={styles.experienceStory} ref={storyRef}>
      <div className={styles.experienceSticky} ref={stickyRef}>
        <SectionHeading kicker={copy.experienceHeader.kicker} title={copy.experienceHeader.title} />
        <div className={styles.experienceViewport}>
          <div
            className={styles.experienceRail}
            ref={trackRef}
            data-cursor-label={labels.drag}
            role="list"
            aria-label={copy.experienceHeader.title}
            onScroll={updateActiveExperience}
          >
            {copy.experience.map((item, index) => (
              <article
                className={styles.experienceCard}
                key={`${item.company}-${item.period}`}
                role="listitem"
                data-active={activeExperience === index ? "true" : "false"}
                data-tone={["cream", "blue", "clay"][index % 3]}
              >
                <div className={styles.cardTopline}>
                  <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.cardKicker}>{item.period} · {item.location}</span>
                </div>
                <h3>{item.headline}</h3>
                <p className={styles.cardRole}>{item.company} / {item.role}</p>
                <p className={styles.cardDescription}>{item.description}</p>
                <div className={styles.tags}>
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <span className={styles.cardArrow} aria-hidden="true">→</span>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.experienceControls} data-reveal>
          <div className={styles.experienceStatus}>
            <span>{String(activeExperience + 1).padStart(2, "0")} / {String(copy.experience.length).padStart(2, "0")}</span>
            <span
              className={styles.experienceProgress}
              role="progressbar"
              aria-label={labels.progress}
              aria-valuemin="1"
              aria-valuemax={copy.experience.length}
              aria-valuenow={activeExperience + 1}
            >
              <i style={{ width: `${progress}%` }} />
            </span>
            <p>{labels.instruction}</p>
          </div>
          <div className={styles.experienceButtons}>
            <button type="button" onClick={() => scrollTrack(-1)} aria-label={labels.previous} data-cursor-label="←">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" onClick={() => scrollTrack(1)} aria-label={labels.next} data-cursor-label="→">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectEvidenceCard({ project, locale }) {
  const inputModules = project.modules.slice(0, 3);
  const outcomeModule = project.modules[3];
  const labels = locale === "en"
    ? {
        boundary: "BOUNDARY",
        flow: "Project evidence flow",
        signals: "SIGNALS",
        support: "EXAMINER SUPPORT",
        stack: "Technology stack",
      }
    : locale === "zh-CN"
      ? {
          boundary: "边界",
          flow: "项目证据流程",
          signals: "输入讯号",
          support: "辅助考官复核",
          stack: "技术组合",
        }
      : {
          boundary: "邊界",
          flow: "項目證據流程",
          signals: "輸入訊號",
          support: "輔助考官覆核",
          stack: "技術組合",
        };

  return (
    <article className={`${styles.projectLayout} ${styles.projectCard}`} data-reveal>
          <div className={styles.projectCopy}>
            <p className={styles.kicker}>{project.kicker}</p>
            <h2>{project.title}</h2>
            <p>{project.background}</p>
            <p>{project.role}</p>
            {project.technologies && <p>{project.technologies}</p>}
            {project.delivery && <p>{project.delivery}</p>}
            <p className={styles.projectBoundary}>
              <span>{labels.boundary}</span>
              {project.boundary}
            </p>
          </div>
          <div className={styles.projectSignalFlow} aria-label={labels.flow}>
            <div className={styles.projectSignalHeader}>
              <span>{labels.signals}</span>
              <span>{labels.support}</span>
            </div>
            <div className={styles.projectSignalInputs}>
              {inputModules.map((module) => (
                <article className={styles.projectModule} key={module.number}>
                  <span>{module.number}</span>
                  <strong>{module.title}</strong>
                  <em>{module.label}</em>
                </article>
              ))}
            </div>
            <span className={styles.projectSignalConnector} aria-hidden="true"><i /><i /><i /></span>
            <article className={`${styles.projectModule} ${styles.projectOutcome}`}>
              <span>{outcomeModule.number}</span>
              <strong>{outcomeModule.title}</strong>
              <em>{outcomeModule.label}</em>
            </article>
            <div className={styles.projectTechRail} aria-label={labels.stack}>
              <span>OpenCV</span><span>ArUco</span><span>YOLO</span><span>MediaPipe</span>
            </div>
          </div>
    </article>
  );
}

function SelectedProjectsSection({ projects, locale }) {
  return (
    <section id="project" className={styles.projectSection}>
      <div className={styles.containerWide}>
        <div className={styles.projectStack}>
          {projects.map((project) => (
            <ProjectEvidenceCard key={project.title} project={project} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsSection({ copy }) {
  return (
    <section id="skills" className={styles.skillsSection}>
      <div className={styles.container}>
        <SectionHeading
          kicker={copy.evidence.kicker}
          title={copy.teamValue.title}
          intro={`${copy.about.primary} ${copy.about.detail}`}
        />

        <div className={styles.metrics} data-reveal>
          {copy.metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>

        <div className={styles.capabilityGrid} data-reveal>
          {copy.teamValue.items.map((item, index) => (
            <article key={item.title} className={styles.capabilityCard}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.skillsBands} data-reveal>
          {copy.skills.map((category) => (
            <article key={category.title} className={styles.skillsBand}>
              <h3>{category.title}</h3>
              <div>
                {category.items.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.practiceHeader} data-reveal>
          <p className={styles.kicker}>{copy.aiHeader.kicker}</p>
          <h3>{copy.aiHeader.title}</h3>
          <p>{copy.aiHeader.intro}</p>
        </div>
        <div className={styles.practiceGrid} data-reveal>
          {copy.aiPractice.map((item) => (
            <article className={styles.practiceCard} key={item.number}>
              <span className={styles.practiceNumber}>{item.number}</span>
              <div className={styles.practiceOrb} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <ScrollText className={styles.skillsClosing}>
          {`${copy.teamValue.closing} ${copy.aiClosing}`}
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
  useReveal(rootRef);
  usePointerCursor(rootRef, cursorRef, cursorFollowerRef);
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
  const menuLabels = locale === "en"
    ? { open: "Open menu", close: "Close menu", navigation: "Site navigation", home: "Home", kicker: "Navigate" }
    : locale === "zh-CN"
      ? { open: "打开菜单", close: "关闭菜单", navigation: "网站导航", home: "首页", kicker: "页面导航" }
      : { open: "開啟選單", close: "關閉選單", navigation: "網站導覽", home: "首頁", kicker: "頁面導覽" };

  return (
    <div ref={rootRef} className={styles.site} lang={locale} data-menu-open={mobileMenuOpen}>
      <PageLoader />
      <span ref={cursorRef} className={styles.cursor} aria-hidden="true" />
      <span ref={cursorFollowerRef} className={styles.cursorFollower} aria-hidden="true" />
      <span className={styles.signatureAura} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerIdentity}>
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
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
      </header>

      <div
        className={styles.menuOverlay}
        data-open={mobileMenuOpen}
        aria-hidden={!mobileMenuOpen}
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
                  <span className={styles.heroName}>{copy.hero.name}</span>
                </h1>
                <p className={styles.heroPositioning}>{copy.positioning.primary}</p>
                <TypewriterLine phrases={copy.hero.typewriter} />
                <div className={styles.heroActions}>
                  <a className={styles.primaryButton} href="#experience" data-cursor-label="WORK">{copy.hero.viewExperience}<span>↘</span></a>
                  <a className={styles.textButton} href={copy.contact.resume} download data-cursor-label="CV">{copy.hero.download}<span>↓</span></a>
                </div>
              </div>
              <div className={styles.heroVisual} data-reveal aria-label={locale === "en" ? "Delivery workflow" : "交付工作流程"}>
                <div className={styles.heroVisualHeader}>
                  <span>{locale === "en" ? "A working model" : "工作方式"}</span>
                  <span>01 — 05</span>
                </div>
                <div className={styles.solutionMap} role="list">
                  <span className={styles.solutionPath} aria-hidden="true" />
                  {copy.hero.workflowLayers.map((layer, index) => (
                    <article
                      className={styles.solutionNode}
                      key={layer.id}
                      role="listitem"
                      style={{ "--node-index": index }}
                    >
                      <span className={styles.solutionNumber}>{layer.number}</span>
                      <i className={styles.solutionDot} aria-hidden="true" />
                      <div>
                        <strong>{layer.title}</strong>
                        <p>{layer.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.heroFooter} data-reveal>
              <span>Hong Kong · AI · Delivery</span>
            </div>
          </div>
        </section>

        <section id="experience" className={styles.experienceSection}>
          <div className={styles.containerWide}>
            <ExperienceTrack copy={copy} locale={locale} />
          </div>
        </section>

        <SelectedProjectsSection projects={copy.selectedProjects} locale={locale} />

        <SkillsSection copy={copy} />

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactGlow} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.contactContent} data-reveal>
              <h2>{copy.contact.kicker}</h2>
              <p className={styles.contactOpportunity}>{copy.contact.title}</p>
              <p className={styles.contactStatement}>{copy.contact.statement}</p>
              <div className={styles.contactActions}>
                <a className={styles.primaryButton} href={copy.contact.email} data-cursor-label="EMAIL">{copy.contact.emailLabel}<span>↗</span></a>
                {copy.contact.linkedin && <a className={styles.secondaryButton} href={copy.contact.linkedin} data-cursor-label="LINKEDIN">LinkedIn<span>↗</span></a>}
                <a className={styles.secondaryButton} href={copy.contact.resume} download data-cursor-label="CV">{copy.contact.resumeLabel}<span>↓</span></a>
              </div>
              <div className={styles.contactMeta}>
                <span>{copy.contact.education}</span>
                <span>{copy.contact.languages}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>ZS · Zhicheng Situ</span>
      </footer>
    </div>
  );
}
