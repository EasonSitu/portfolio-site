import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { curtainDestination, entryMode } from '../lib/pageCurtain.mjs';
import styles from './PageCurtain.module.scss';

const RevealedContext = createContext(true);
export const usePageRevealed = () => useContext(RevealedContext);

export default function PageCurtain({children}) {
  const router = useRouter();
  const [phase, setPhase] = useState('intro');
  const phaseRef = useRef('intro'), contentRef = useRef(null);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 700px)');
    const timers = new Set();
    let generation = 0, disposed = false, destination = null, coveredAt = 0;
    const delay = (callback, ms) => {
      const id = setTimeout(() => { timers.delete(id); if (!disposed) callback(); }, ms);
      timers.add(id); return id;
    };
    const change = next => {
      if (next === 'cover') coveredAt = performance.now();
      phaseRef.current = next; setPhase(next);
    };
    const clear = () => { generation++; timers.forEach(clearTimeout); timers.clear(); };
    const finish = () => {
      clear(); change('idle'); destination = null;
      try { sessionStorage.setItem('portfolio-entry-seen', '1'); } catch { /* Private browsing can deny storage. */ }
    };
    const reveal = full => {
      if (reduced.matches) { finish(); return; }
      change(full ? 'reveal' : 'short-reveal');
      delay(finish, mobile.matches ? 520 : full ? 860 : 620);
    };
    const readyToReveal = (full, minimum = 0) => {
      const token = generation;
      const start = performance.now();
      // Only first-screen artwork is critical; never wait for all Hero frames.
      const img = contentRef.current?.querySelector('[data-hero-clarity] figure img, [data-case-study-section="hero"] figure img');
      const fontReady = !document.fonts || document.fonts.status === 'loaded';
      if ((fontReady && (!img || img.complete)) || !full) { delay(() => reveal(full), minimum); return; }
      const poll = () => {
        if (token !== generation) return;
        const elapsed = performance.now() - start;
        if (elapsed >= 2200 || ((!img || img.complete) && (!document.fonts || document.fonts.status === 'loaded'))) {
          delay(() => reveal(full), Math.max(0, minimum - elapsed));
        } else delay(poll, 60);
      };
      poll();
    };
    let seen = false;
    try { seen = sessionStorage.getItem('portfolio-entry-seen') === '1'; } catch { /* use bounded intro */ }
    if (entryMode({seen, reduced: reduced.matches}) === 'skip') finish();
    else readyToReveal(true, 380);

    const onStart = (url, {shallow} = {}) => {
      if (shallow || reduced.matches || !curtainDestination({href:url}, location.href)) return;
      if (phaseRef.current === 'cover' && destination) return;
      clear(); change('cover');
      delay(finish, 4000); // A router error must never leave a blocked page.
    };
    const onComplete = () => {
      if (phaseRef.current !== 'cover') return;
      clear();
      delay(() => readyToReveal(false), Math.max(0, (mobile.matches ? 200 : 280) - (performance.now() - coveredAt)));
    };
    const onError = () => finish();
    const click = event => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || event.defaultPrevented || reduced.matches) return;
      const to = curtainDestination({href:anchor.href,target:anchor.target,
        download:anchor.hasAttribute('download'),modified:event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey}, location.href);
      if (!to) return;
      event.preventDefault(); event.stopPropagation();
      if (phaseRef.current !== 'idle') return;
      clear(); destination = to; change('cover');
      delay(() => {
        router.push(to).catch(() => finish());
      }, mobile.matches ? 200 : 280);
      delay(finish, 4000);
    };
    const preference = () => { if (reduced.matches) finish(); };
    const escape = event => { if (event.key === 'Escape') finish(); };
    const restored = event => { if (event.persisted) finish(); };
    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onComplete);
    router.events.on('routeChangeError', onError);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', escape);
    window.addEventListener('pageshow', restored);
    reduced.addEventListener('change', preference);
    return () => {
      disposed = true; clear();
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onComplete);
      router.events.off('routeChangeError', onError);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('pageshow', restored);
      reduced.removeEventListener('change', preference);
    };
  }, [router.events]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = phase !== 'idle';
  }, [phase]);

  return <RevealedContext.Provider value={phase === 'idle'}>
    <div ref={contentRef} className={styles.content} data-entry-phase={phase} aria-busy={phase !== 'idle'}>{children}</div>
    <div className={styles.curtain} data-page-curtain data-phase={phase} aria-hidden="true">
      <svg className={styles.signature} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <path fill="#F4F0E7" d="M22 15h56v12H36v14h42v12H36v15h42v12H22V15Z" />
        <path fill="#174EA6" d="M36 41h42v12H36l-9 9V50l9-9Z" />
      </svg>
      <svg className={styles.curve} viewBox="0 0 1000 120" preserveAspectRatio="none"><path d="M0 0 H1000 Q500 240 0 0Z" /></svg>
    </div>
    <noscript><style>{'[data-page-curtain]{display:none!important}'}</style></noscript>
  </RevealedContext.Provider>;
}
