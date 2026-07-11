"use client";
import { useRef, MouseEvent, ReactNode } from "react";

export function MagneticButton({ children, className = "", href, onClick }: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement | null>(null);

  function handleMouseMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) scale(1.04)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0,0) scale(1)";
  }

  const props = {
    ref,
    className: `magnetic-btn ${className}`,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick,
  };

  if (href) {
    return <a {...props} href={href}>{children}</a>;
  }
  return <button {...props}>{children}</button>;
}
