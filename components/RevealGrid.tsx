"use client";
import { useReveal } from "@/hooks/useReveal";

// Wraps a grid (or any children) and adds the `revealed` class when it scrolls
// into view, triggering the existing `.stagger-grid` fade-up animation.
// Purely additive — respects the global prefers-reduced-motion guard.
export function RevealGrid({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`stagger-grid ${visible ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
