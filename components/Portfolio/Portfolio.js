import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import styles from "./Portfolio.module.scss";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const localeLabels = [["en", "EN"], ["zh-CN", "简"], ["zh-HK", "繁"]];

function LanguageSwitcher({ locale, onChange }) {
  return (
    <div className={styles.languageSwitcher} aria-label="Language">
      {localeLabels.map(([value, label]) => (
        <button key={value} type="button" className={`${styles.languageButton} ${locale === value ? styles.languageActive : ""}`} onClick={() => onChange(value)} aria-pressed={locale === value}>
          {label}
        </button>
      ))}
    </div>
  );
}

function HeroPhoto() {
  return (
    <div className={styles.heroPhoto}>
      <div className={styles.photoFrame}>
        <img src="/Great-photo.png" alt="Zhicheng Situ" width="320" height="400" />
        <div className={styles.photoBorder} />
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title, intro }) {
  return (
    <div className={styles.sectionTitle}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 className={styles.sectionHeading}>{title}</h2>
      {intro && <p className={styles.sectionIntro}>{intro}</p>}
    </div>
  );
}

function ExperienceTimeline({ experience }) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(`.${styles.timelineItem}`).forEach((item, index) => {
        ScrollTrigger.create({ 
          trigger: item, 
          start: "top 60%", 
          end: "bottom 40%", 
          onEnter: () => setActive(index), 
          onEnterBack: () => setActive(index) 
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [experience]);

  const current = experience[active];

  return (
    <section id="experience" ref={sectionRef} className={styles.experienceSection}>
      <div className={styles.container}>
        <SectionTitle kicker="EXPERIENCE" title="Work Experience" />
        <div className={styles.experienceLayout}>
          <div className={styles.timelineList}>
            {experience.map((item, index) => (
              <article 
                key={`${item.company}-${item.period}`} 
                className={`${styles.timelineItem} ${active === index ? styles.timelineActive : ""}`}
                onMouseEnter={() => setActive(index)}
              >
                <div className={styles.timelineMarker}>
                  <span className={styles.timelineNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <div className={styles.timelineLine} />
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.companyName}>{item.company}</h3>
                  <p className={styles.timelinePeriod}>{item.period}</p>
                  <p className={styles.timelineRole}>{item.role}</p>
                </div>
              </article>
            ))}
          </div>
          <article className={styles.experienceDetail}>
            <div className={styles.detailHeader}>
              <span className={styles.detailIndex}>{String(active + 1).padStart(2, "0")}</span>
              <div className={styles.detailMeta}>
                <span className={styles.detailPeriod}>{current.period}</span>
                <span className={styles.detailLocation}>{current.location}</span>
              </div>
            </div>
            <h3 className={styles.detailHeadline}>{current.headline}</h3>
            <h4 className={styles.detailRole}>{current.role}</h4>
            <p className={styles.detailDescription}>{current.description}</p>
            <div className={styles.detailTags}>
              {current.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function SkillsGrid({ skills }) {
  return (
    <div className={styles.skillsGrid}>
      {skills.map((category, index) => (
        <div key={category.title} className={styles.skillCategory}>
          <div className={styles.skillHeader}>
            <span className={styles.skillNumber}>{String(index + 1).padStart(2, "0")}</span>
            <h3>{category.title}</h3>
          </div>
          <ul className={styles.skillList}>
            {category.items.map((item) => (
              <li key={item} className={styles.skillItem}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Portfolio({ copy, locale, onLocaleChange }) {
  const rootRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const timer = window.setTimeout(() => setLoading(false), 1200); 
    return () => window.clearTimeout(timer); 
  }, []);

  useLayoutEffect(() => {
    if (loading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.heroContent}`, { opacity: 0, y: 40, duration: 1, ease: "power3.out" });
      gsap.from(`.${styles.heroPhoto}`, { opacity: 0, x: 40, duration: 1, delay: 0.3, ease: "power3.out" });
      gsap.utils.toArray(`.${styles.animateIn}`).forEach((block) => {
        gsap.from(block, { 
          scrollTrigger: { trigger: block, start: "top 85%" }, 
          opacity: 0, 
          y: 30, 
          duration: 0.8, 
          ease: "power3.out" 
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [copy, loading]);

  if (loading) {
    return (
      <div className={styles.loader} role="status" aria-label="Loading portfolio">
        <div className={styles.loaderContent}>
          <div className={styles.loaderName}>Zhicheng Situ</div>
          <div className={styles.loaderTitle}>Portfolio</div>
          <div className={styles.loaderBar}>
            <div className={styles.loaderProgress} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={styles.siteShell}>
      {/* Navigation */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.logo} href="#home" aria-label="Zhicheng Situ home">
            <span className={styles.logoText}>ZS</span>
          </a>
          <nav className={styles.mainNav}>
            <a href="#about">About</a>
            <a href="#experience">Experience</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
          </nav>
          <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.heroLayout}>
              <div className={styles.heroContent}>
                <div className={styles.heroEyebrow}>{copy.hero.eyebrow}</div>
                <h1 className={styles.heroName}>{copy.hero.name}</h1>
                <p className={styles.heroChineseName}>{copy.hero.chineseName}</p>
                <div className={styles.heroDivider} />
                <h2 className={styles.heroTitle}>{copy.hero.title}</h2>
                <p className={styles.heroStatement}>{copy.hero.statement}</p>
                <div className={styles.heroActions}>
                  <a className={styles.primaryButton} href="#experience">{copy.hero.viewExperience}</a>
                  <a className={styles.secondaryButton} href={copy.contact.resume} download>{copy.hero.download}</a>
                </div>
              </div>
              <HeroPhoto />
            </div>
          </div>
          <div className={styles.heroDecoration}>
            <div className={styles.decorationLine} />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className={styles.aboutSection}>
          <div className={styles.container}>
            <div className={`${styles.aboutContent} ${styles.animateIn}`}>
              <div className={styles.aboutHeader}>
                <span className={styles.sectionNumber}>01</span>
                <h2>About Me</h2>
              </div>
              <div className={styles.aboutText}>
                <p className={styles.aboutPrimary}>{copy.positioning.primary}</p>
                <p className={styles.aboutSecondary}>{copy.positioning.secondary}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Section */}
        <section className={styles.evidenceSection}>
          <div className={styles.container}>
            <div className={`${styles.evidenceGrid} ${styles.animateIn}`}>
              {copy.metrics.map((metric, index) => (
                <article key={metric.label} className={styles.metricCard}>
                  <span className={styles.metricNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <strong className={styles.metricValue}>{metric.value}</strong>
                  <p className={styles.metricLabel}>{metric.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <ExperienceTimeline experience={copy.experience} />

        {/* Skills Section */}
        <section id="skills" className={styles.skillsSection}>
          <div className={styles.container}>
            <div className={`${styles.skillsContent} ${styles.animateIn}`}>
              <SectionTitle kicker="SKILLS" title="Technical & Professional Skills" />
              <SkillsGrid skills={[
                { title: "Programming & AI Tools", items: ["Python", "SQL", "YOLO", "OpenCV", "MediaPipe", "Generative AI Workflow Automation"] },
                { title: "IoT & System Integration", items: ["Multi-device IoT Architecture", "Hardware/Software Co-debugging", "On-site Commissioning", "System-level Troubleshooting", "Weak-current Implementation"] },
                { title: "Project & Product Management", items: ["Requirement Engineering", "Business Process Reengineering", "UAT Testing", "Agile/Scrum", "SOP Standardization", "PRD Authoring"] }
              ]} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={styles.contactSection}>
          <div className={styles.container}>
            <div className={`${styles.contactContent} ${styles.animateIn}`}>
              <div className={styles.contactHeader}>
                <span className={styles.sectionNumber}>04</span>
                <h2>Get In Touch</h2>
              </div>
              <p className={styles.contactStatement}>{copy.contact.statement}</p>
              <div className={styles.contactActions}>
                <a className={styles.primaryButton} href={copy.contact.email}>{copy.contact.emailLabel}</a>
                <a className={styles.secondaryButton} href={copy.contact.resume} download>{copy.contact.resumeLabel}</a>
              </div>
              <div className={styles.contactDetails}>
                <div className={styles.contactDetail}>
                  <h4>Education</h4>
                  <p>{copy.contact.education}</p>
                </div>
                <div className={styles.contactDetail}>
                  <h4>Languages</h4>
                  <p>{copy.contact.languages}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLeft}>
              <span className={styles.footerLogo}>ZS</span>
              <span className={styles.footerText}>© 2026 Zhicheng Situ</span>
            </div>
            <div className={styles.footerRight}>
              <span className={styles.footerTagline}>Designed for clarity. Built with purpose.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
