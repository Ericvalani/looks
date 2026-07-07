"use client";

import { useEffect, useState } from "react";
import GlowHorizonFM from "./glow-horizon-fm";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Full-screen entrance overlay played on every page load / reload. Uses the
 * GlowHorizonFM effect, then fades out to reveal the app.
 */
export function GlowHorizonIntro() {
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1900);
    const t2 = setTimeout(() => setDone(true), 2650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (done) return null;

  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-700 ease-out",
        fading && "opacity-0"
      )}
    >
      {/* Keep full viewport height (so the component's -50% shift keeps the
          arc on screen) but narrow the width toward the viewport height, so
          the ellipse is rounder and its curve reads as a clear arc. */}
      <div className="absolute left-1/2 top-0 h-full w-[110vh] -translate-x-1/2">
        <GlowHorizonFM variant="top" />
      </div>
      <span
        className="animate-rise absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium tracking-[0.5em] text-white/90"
        style={{ animationDelay: "0.6s" }}
      >
        LOOKS
      </span>
    </div>
  );
}
