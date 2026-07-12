"use client";
import { useEffect, useState } from "react";

const STATS = ["3500+ orders", "1.4L YouTube subscribers", "67K Instagram followers"];

// Rotating social-proof stat with a Hello Monday–style masked reveal: the new
// line slides up from below into a fixed mask window.
export function TrustStat() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setI((p) => (p + 1) % STATS.length);
        setPhase("in");
      }, 480);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="trust-stat-mask">
      <span key={i} className={`trust-stat-line ${phase === "in" ? "is-in" : "is-out"}`}>
        {STATS[i]}
      </span>
    </span>
  );
}
