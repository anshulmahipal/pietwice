import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { progressToStepIndex } from "../lib/scrollProgressLogic";

const STEPS = [
  {
    src: "/screenshots/money-clarity-couples.png",
    title: "Money clarity for couples",
    sub: "Track, plan, and stay in sync — without stress",
    kicker: "Home snapshot",
    caption: "Household income, what is left, and quick actions—without menu diving.",
  },
  {
    src: "/screenshots/split-expenses.png",
    title: "Split expenses in seconds",
    sub: "Auto-categorize groceries, utilities, and more",
    kicker: "Supermarket bill",
    caption: "Assign quick splits; the rest flows to your default category.",
  },
  {
    src: "/screenshots/take-control-finances.png",
    title: "Take control of your finances",
    sub: "See trends, budgets, and spending patterns",
    kicker: "Trends & patterns",
    caption: "See spending in context with budgets and calendars.",
  },
] as const;

function useSectionScrollProgress(sectionRef: RefObject<HTMLElement | null>, stepCount: number) {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const update = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const topDoc = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(0, el.offsetHeight - window.innerHeight);
    const scrolled = window.scrollY - topDoc;
    const p = scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0;
    setProgress(p);
    setActiveIndex(progressToStepIndex(p, stepCount));
  }, [sectionRef, stepCount]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return { progress, activeIndex };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function ScrollFeatureShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { progress, activeIndex } = useSectionScrollProgress(sectionRef, STEPS.length);
  const reduceMotion = usePrefersReducedMotion();

  const scrollToStep = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const topDoc = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(0, el.offsetHeight - window.innerHeight);
    const target = topDoc + (scrollable * (i + 0.45)) / STEPS.length;
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const step = STEPS[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="stories"
      className="scrolly"
      style={{ height: `${STEPS.length * 100}vh` }}
    >
      <div className="scrolly__sticky">
        <div className="scrolly__ambient" aria-hidden="true">
          <span className="scrolly__blob scrolly__blob--a" />
          <span className="scrolly__blob scrolly__blob--b" />
          <span className="scrolly__grid" />
        </div>

        <div className="scrolly__inner">
          <div className="scrolly__rail" aria-hidden="true">
            <div className="scrolly__rail-fill" style={{ transform: `scaleY(${progress})` }} />
          </div>

          <div className="scrolly__copy" aria-live="polite">
            <p className="scrolly__label">{step.kicker}</p>
            <h2 className="scrolly__title">{step.title}</h2>
            <p className="scrolly__sub">{step.sub}</p>
            <p className="scrolly__desc">{step.caption}</p>

            <div className="scrolly__dots" role="group" aria-label="Feature steps">
              {STEPS.map((s, i) => (
                <button
                  key={s.kicker}
                  type="button"
                  aria-current={activeIndex === i ? "step" : undefined}
                  aria-label={`Show ${s.kicker}`}
                  className={`scrolly__dot ${activeIndex === i ? "is-active" : ""}`}
                  onClick={() => scrollToStep(i)}
                />
              ))}
            </div>
            <p className="scrolly__hint">
              Scroll down — the next screen lifts from the stack. Use the dots to jump.
            </p>
          </div>

          <div className="scrolly__visual">
            <div
              className="phone-stack"
              style={{
                perspective: reduceMotion ? "none" : "1400px",
              }}
            >
              {STEPS.map((s, i) => {
                const dist = Math.abs(activeIndex - i);
                const front = dist === 0;
                const tz = reduceMotion ? 0 : -dist * 72;
                const sc = reduceMotion ? 1 : 1 - dist * 0.07;
                const rot = reduceMotion ? 0 : (i - activeIndex) * -5;
                return (
                  <div
                    key={s.src}
                    className={`phone-stack__layer ${front ? "is-front" : ""}`}
                    style={{
                      transform: `translateZ(${tz}px) scale(${sc}) rotateY(${rot}deg)`,
                      opacity: front ? 1 : 0.42,
                      zIndex: 10 - dist,
                      transition: reduceMotion
                        ? "opacity 0.15s ease"
                        : "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease",
                    }}
                  >
                    <img
                      src={s.src}
                      alt={front ? `${s.title} — app screenshot` : ""}
                      width={520}
                      height={980}
                      decoding="async"
                      draggable={false}
                      aria-hidden={!front}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
