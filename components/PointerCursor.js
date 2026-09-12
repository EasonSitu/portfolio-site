import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./PointerCursor.module.scss";

// Portal keeps viewport coordinates independent of animated page containers.
export default function PointerCursor() {
  const layerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return undefined;
    const layer = layerRef.current;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0, y = 0, ringX = 0, ringY = 0, positioned = false;
    const hide = () => {
      layer.dataset.visible = "false";
      layer.dataset.pressed = "false";
      delete document.documentElement.dataset.editorialPointer;
      document.documentElement.classList.remove(styles.enabled);
      cancelAnimationFrame(frame);
      frame = 0;
      positioned = false;
    };
    const follow = () => {
      frame = 0;
      ringX += (x - ringX) * .18;
      ringY += (y - ringY) * .18;
      layer.style.setProperty("--ring-x", `${ringX}px`);
      layer.style.setProperty("--ring-y", `${ringY}px`);
      if (Math.abs(x - ringX) + Math.abs(y - ringY) > .15) frame = requestAnimationFrame(follow);
    };
    const target = (event) => {
      layer.dataset.interactive = Boolean(event.target.closest?.("a, button, [role='button'], [data-cursor-label]"));
    };
    const move = (event) => {
      if (!fine.matches || reduced.matches || event.pointerType !== "mouse") { hide(); return; }
      x = event.clientX; y = event.clientY;
      layer.style.setProperty("--dot-x", `${x}px`);
      layer.style.setProperty("--dot-y", `${y}px`);
      if (!positioned) { ringX = x; ringY = y; positioned = true; follow(); }
      if (!frame) frame = requestAnimationFrame(follow);
      target(event);
      layer.dataset.visible = "true";
      document.documentElement.dataset.editorialPointer = "on";
      document.documentElement.classList.add(styles.enabled);
    };
    const press = () => { layer.dataset.pressed = "true"; };
    const release = () => { layer.dataset.pressed = "false"; };
    const leave = (event) => { if (!event.relatedTarget) hide(); };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", target);
    document.addEventListener("pointerout", leave);
    document.addEventListener("pointerdown", press);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    fine.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      hide();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", target);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      fine.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
    };
  }, [mounted]);
  return mounted ? createPortal(
    <div ref={layerRef} className={styles.pointer} aria-hidden="true" data-visible="false">
      <span className={styles.dot} /><span className={styles.ring} />
    </div>, document.body) : null;
}
