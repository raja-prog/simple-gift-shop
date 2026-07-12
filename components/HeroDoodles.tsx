"use client";
// Hand-drawn hero illustration (Hello Monday–inspired). Cycles through a set of
// relationship scenes — lover ↔ lover, mother ↔ daughter, son ↔ father — each
// showing one person giving a wrapped gift to another. Pure inline SVG line-art,
// no images or network requests. Shown on mobile only.

import { useEffect, useState } from "react";

type Figure = {
  x: number;
  color: string;
  fill: string;
  hair: "bun" | "long" | "short" | "grey";
  facing: 1 | -1; // 1 = facing right, -1 = facing left
  scale?: number; // relative size — children smaller, adults taller
};

type Scene = {
  caption: string;
  left: Figure;
  right: Figure;
};

const SCENES: Scene[] = [
  {
    caption: "Lover \u2192 lover",
    left: { x: 96, color: "#ec4899", fill: "#fce7f3", hair: "long", facing: 1, scale: 1 },
    right: { x: 264, color: "#0ea5e9", fill: "#e0f2fe", hair: "short", facing: -1, scale: 1.02 },
  },
  {
    caption: "Mother \u2192 daughter",
    left: { x: 96, color: "#a855f7", fill: "#f3e8ff", hair: "bun", facing: 1, scale: 1.05 },
    right: { x: 264, color: "#ec4899", fill: "#fce7f3", hair: "long", facing: -1, scale: 0.72 },
  },
  {
    caption: "Son \u2192 father",
    left: { x: 96, color: "#0ea5e9", fill: "#e0f2fe", hair: "short", facing: 1, scale: 0.66 },
    right: { x: 264, color: "#64748b", fill: "#f1f5f9", hair: "grey", facing: -1, scale: 1.1 },
  },
];

function Hair({ f }: { f: Figure }) {
  const cy = 70;
  switch (f.hair) {
    case "bun":
      return (
        <>
          <path d={`M${f.x - 18} 62 C ${f.x - 22} 48, ${f.x + 4} 40, ${f.x + 4} 46`} />
          <circle cx={f.x - 8} cy={52} r={6} fill={f.fill} />
        </>
      );
    case "long":
      return <path d={`M${f.x - 20} ${cy} C ${f.x - 24} 44, ${f.x + 24} 44, ${f.x + 20} ${cy} L ${f.x + 16} 96 M${f.x - 16} ${cy} L ${f.x - 18} 96`} />;
    case "grey":
      return <path d={`M${f.x - 19} 64 C ${f.x - 18} 52, ${f.x + 19} 52, ${f.x + 19} 64`} strokeDasharray="3 3" />;
    case "short":
    default:
      return <path d={`M${f.x - 19} 66 C ${f.x - 20} 52, ${f.x + 20} 50, ${f.x + 20} 66`} />;
  }
}

function Person({ f, giving }: { f: Figure; giving: boolean }) {
  const { x, color, fill, facing } = f;
  const s = f.scale ?? 1;
  const groundY = 186;
  // The arm that reaches toward the centre gift
  const inX = x + facing * 12;
  const giftX = 181;
  return (
    <g
      className="ink person"
      /* scale around the feet so every figure stands on the same ground line */
      transform={`translate(${x} ${groundY}) scale(${s}) translate(${-x} ${-groundY})`}
      stroke={color}
      strokeWidth={2.6 / s}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* head */}
      <circle cx={x} cy={70} r={20} fill={fill} />
      <Hair f={f} />
      {/* face */}
      <path d={`M${x - 6} 74 q 6 6 12 0`} strokeWidth={2.2 / s} />
      <path d={`M${x - 7} 66 h0.5 M${x + 7} 66 h0.5`} strokeWidth={3.2 / s} />
      {/* body */}
      <path d={`M${x} 90 L ${x - 14} 150 L ${x + 14} 150 Z`} fill={fill} />
      {/* reaching arm toward centre */}
      <path d={`M${inX} 108 C ${(inX + giftX) / 2} ${giving ? 104 : 112}, ${giftX - facing * 20} 118, ${giftX - facing * 6} 128`} />
      {/* outer arm */}
      <path d={`M${x - facing * 12} 108 C ${x - facing * 22} 116, ${x - facing * 24} 130, ${x - facing * 18} 140`} />
      {/* legs */}
      <path d={`M${x - 6} 150 L ${x - 10} 186 M${x + 6} 150 L ${x + 10} 186`} />
    </g>
  );
}

export function HeroDoodles() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  // Random per-figure height jitter, re-rolled each cycle so nobody is the same
  // height twice. Starts at 0 (matches server render) to avoid hydration issues.
  const [jitter, setJitter] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const roll = (): [number, number] => [
      0.85 + Math.random() * 0.4, // ±
      0.85 + Math.random() * 0.4,
    ];
    setJitter(roll());
    if (reduce) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((p) => (p + 1) % SCENES.length);
        setJitter(roll());
        setVisible(true);
      }, 450);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const scene = SCENES[i];

  return (
    <div className="hero-doodles lg:hidden" aria-hidden="true">
      <svg
        className={`hero-scene ${visible ? "scene-in" : "scene-out"}`}
        viewBox="0 0 360 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        key={i}
      >
        {/* ground line */}
        <path className="ink ink-ground" d="M20 196 C 100 190, 260 190, 340 196" stroke="#e5e7eb" strokeWidth="2.2" strokeLinecap="round" />

        <Person f={{ ...scene.left, scale: (scene.left.scale ?? 1) * (jitter[0] || 1) }} giving />
        <Person f={{ ...scene.right, scale: (scene.right.scale ?? 1) * (jitter[1] || 1) }} giving={false} />

        {/* wrapped gift in the middle */}
        <g className="ink gift" stroke="#f59e0b" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <rect x={164} y={118} width={34} height={30} rx={4} fill="#fef3c7" />
          <path d="M181 118 V148 M164 132 H198" />
          <path d="M181 118 C 174 108, 166 112, 172 120 M181 118 C 188 108, 196 112, 190 120" />
          <circle cx={181} cy={118} r={2.6} fill="#f59e0b" />
        </g>

        {/* floating hearts */}
        <path className="ink spark spark-1" d="M181 96 c -4 -5 -11 -1 -6 5 l 6 6 6 -6 c 5 -6 -2 -10 -6 -5 Z" fill="#f9a8d4" stroke="#ec4899" strokeWidth={1.6} />
        <path className="ink spark spark-2" d="M150 62 c -3 -4 -8 -1 -4.5 3.6 l 4.5 4.6 4.5 -4.6 c 3.5 -4.6 -1.5 -7.6 -4.5 -3.6 Z" fill="#fbcfe8" stroke="#ec4899" strokeWidth={1.2} />
        <path className="ink spark spark-3" d="M212 60 c -3 -4 -8 -1 -4.5 3.6 l 4.5 4.6 4.5 -4.6 c 3.5 -4.6 -1.5 -7.6 -4.5 -3.6 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth={1.2} />
      </svg>
    </div>
  );
}
