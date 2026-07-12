"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Heavy, purely-decorative client components are code-split out of the initial
// bundle and only mounted when they add value:
//   - The WebGL gradient background loads everywhere (single cheap shader).
//   - The 3D heart (three.js + r3f + drei — hundreds of KB) and the custom
//     cursor only mount on desktop with a fine pointer. 95% of traffic is
//     mobile, so this keeps their critical path lean and fast.

const WebGLBackground = dynamic(
  () => import("@/components/WebGLBackground").then((m) => m.WebGLBackground),
  { ssr: false }
);
const GiftBox3D = dynamic(
  () => import("@/components/GiftBox3D").then((m) => m.GiftBox3D),
  { ssr: false }
);
const CustomCursor = dynamic(
  () => import("@/components/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false }
);

export function ClientDecor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <WebGLBackground />
      {isDesktop && <CustomCursor />}
      {isDesktop && <GiftBox3D />}
    </>
  );
}
