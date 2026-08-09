import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { resolveActiveWorkflow } from "../../lib/heroWorkflow.mjs";
import styles from "./Hero.module.scss";

const HeroScene = dynamic(() => import("../Hero3D/HeroScene"), {
  ssr: false,
  loading: () => <div className={styles.sceneLoading} aria-hidden="true" />,
});

export default function Hero({ copy }) {
  const sectionRef = useRef(null);
  const [activeId, setActiveId] = useState(copy.layers[0].id);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeLayer = useMemo(
    () => resolveActiveWorkflow(copy.layers, activeId),
    [copy.layers, activeId],
  );

  useEffect(() => {
    setActiveId(copy.layers[0].id);
  }, [copy.layers]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const context = gsap.context(() => {
      gsap.from(`.${styles.copy}`, { opacity: 0, y: 24, duration: 0.9, ease: "power3.out" });
      gsap.from(`.${styles.visual}`, { opacity: 0, scale: 0.97, duration: 1.1, delay: 0.12, ease: "power3.out" });
    }, sectionRef);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1 id="hero-title">{copy.heading}</h1>
        <p className={styles.statement}>{copy.statement}</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#experience">{copy.viewExperience}<span aria-hidden="true">↗</span></a>
          <a className={styles.secondary} href="/Zhicheng-Situ-CV.pdf" download>{copy.download}<span aria-hidden="true">↓</span></a>
        </div>

        <div className={styles.workflowCopy} aria-live="polite">
          <span className={styles.workflowNumber}>{activeLayer.number}</span>
          <div>
            <p className={styles.workflowTitle}>{activeLayer.title}</p>
            <p className={styles.workflowDescription}>{activeLayer.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.visual} aria-label={copy.interactionHint}>
        <div className={styles.sceneFrame}>
          <HeroScene
            layers={copy.layers}
            activeId={activeId}
            onActivate={setActiveId}
            reducedMotion={reducedMotion}
            fallbackText={copy.fallback}
          />
        </div>
      </div>
    </section>
  );
}
