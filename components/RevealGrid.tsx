"use client";
import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

// Wraps a grid (or any children) and adds the `revealed` class when it scrolls
// into view, triggering the existing `.stagger-grid` fade-up animation.
// Purely additive — respects the global prefers-reduced-motion guard.
//
// When `pauseFloatsOffscreen` is set, a lightweight IntersectionObserver adds a
// `floats-paused` class while the grid is out of view, so continuous card-float
// animations stop ticking off-screen (saves battery/GPU).
export function RevealGrid({
  className = "",
  children,
  pauseFloatsOffscreen = false,
}: {
  className?: string;
  children: React.ReactNode;
  pauseFloatsOffscreen?: boolean;
}) {
  const { ref, visible } = useReveal();
  const [floatsPaused, setFloatsPaused] = useState(false);

  useEffect(() => {
    if (!pauseFloatsOffscreen) return;
    const el = (ref as React.RefObject<HTMLDivElement>).current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFloatsPaused(!entry.isIntersecting),
      { rootMargin: "150px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pauseFloatsOffscreen, ref]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`stagger-grid ${visible ? "revealed" : ""} ${
        floatsPaused ? "floats-paused" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
