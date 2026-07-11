"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, RoundedBox } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Group, Mesh } from "three";

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function makeHeartShape(s: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, s * 0.35);
  shape.bezierCurveTo(s * 0.1, s * 0.6, s * 0.7, s * 0.6, s * 0.7, s * 0.15);
  shape.bezierCurveTo(s * 0.7, -s * 0.15, s * 0.4, -s * 0.35, 0, -s * 0.55);
  shape.bezierCurveTo(-s * 0.4, -s * 0.35, -s * 0.7, -s * 0.15, -s * 0.7, s * 0.15);
  shape.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.1, s * 0.6, 0, s * 0.35);
  return shape;
}

function useHeartGeo(size = 1.1, depth = 0.5) {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(makeHeartShape(size), {
      depth,
      bevelEnabled: true,
      bevelSegments: 10,
      steps: 2,
      bevelSize: 0.07,
      bevelThickness: 0.07,
    });
    geo.center();
    return geo;
  }, [size, depth]);
}

function useSmallHeartGeo() {
  return useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(makeHeartShape(0.32), {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    geo.center();
    return geo;
  }, []);
}

function GiftScene() {
  const group = useRef<Group>(null);
  const giftRef = useRef<Group>(null);
  const progress = useScrollProgress();
  const mouse = useRef({ x: 0, y: 0 });
  const heartGeo = useHeartGeo();
  const smallHeartGeo = useSmallHeartGeo();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (group.current) {
      const targetY = progress * Math.PI * 2 + mouse.current.x * 0.35;
      const targetX = 0.05 - mouse.current.y * 0.18;
      const k = Math.min(1, delta * 2.5);
      group.current.rotation.y += (targetY - group.current.rotation.y) * k;
      group.current.rotation.x += (targetX - group.current.rotation.x) * k;
    }
    if (giftRef.current) {
      giftRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.35;
      giftRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.3) * 0.06;
    }
  });

  return (
    <group ref={group}>
      {/* ── Solid glossy heart (fast, no transmission) ── */}
      <mesh geometry={heartGeo} castShadow>
        <meshStandardMaterial
          color="#ec4899"
          roughness={0.18}
          metalness={0.35}
          emissive="#9d1a6e"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Small brighter heart accent on the surface */}
      <mesh geometry={smallHeartGeo} position={[-0.32, 0.34, 0.44]} scale={0.7}>
        <meshStandardMaterial color="#fbcfe8" roughness={0.15} metalness={0.2} emissive="#f472b6" emissiveIntensity={0.4} />
      </mesh>

      {/* ── Cute gift box nestled in the heart ── */}
      <group ref={giftRef} position={[0, -0.05, 0.62]} scale={0.36}>
        {/* chunky rounded body */}
        <RoundedBox args={[0.95, 0.85, 0.95]} radius={0.16} smoothness={5} position={[0, -0.06, 0]}>
          <meshStandardMaterial color="#fff5fb" roughness={0.35} metalness={0.05} />
        </RoundedBox>
        {/* puffy lid */}
        <RoundedBox args={[1.05, 0.34, 1.05]} radius={0.14} smoothness={5} position={[0, 0.42, 0]}>
          <meshStandardMaterial color="#ffd6ec" roughness={0.3} metalness={0.05} />
        </RoundedBox>

        {/* soft ribbon (vertical + horizontal) */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.18, 1.2, 1.02]} />
          <meshStandardMaterial color="#ff9ecb" roughness={0.3} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[1.02, 1.2, 0.18]} />
          <meshStandardMaterial color="#ff9ecb" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* big fluffy bow */}
        <mesh position={[-0.19, 0.66, 0]} rotation={[0, 0, 0.55]}>
          <torusGeometry args={[0.19, 0.075, 12, 28]} />
          <meshStandardMaterial color="#ff7fb6" roughness={0.28} metalness={0.05} />
        </mesh>
        <mesh position={[0.19, 0.66, 0]} rotation={[0, 0, -0.55]}>
          <torusGeometry args={[0.19, 0.075, 12, 28]} />
          <meshStandardMaterial color="#ff7fb6" roughness={0.28} metalness={0.05} />
        </mesh>
        {/* ribbon tails */}
        <mesh position={[-0.12, 0.5, 0.02]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.08, 0.26, 0.05]} />
          <meshStandardMaterial color="#ff7fb6" roughness={0.28} />
        </mesh>
        <mesh position={[0.12, 0.5, 0.02]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.08, 0.26, 0.05]} />
          <meshStandardMaterial color="#ff7fb6" roughness={0.28} />
        </mesh>
        {/* bow knot */}
        <mesh position={[0, 0.64, 0.02]}>
          <sphereGeometry args={[0.1, 18, 18]} />
          <meshStandardMaterial color="#ffb3d9" roughness={0.2} />
        </mesh>

        {/* kawaii face */}
        <mesh position={[-0.16, -0.05, 0.49]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          <meshStandardMaterial color="#4b2338" roughness={0.4} />
        </mesh>
        <mesh position={[0.16, -0.05, 0.49]}>
          <sphereGeometry args={[0.055, 14, 14]} />
          <meshStandardMaterial color="#4b2338" roughness={0.4} />
        </mesh>
        {/* blush cheeks */}
        <mesh position={[-0.26, -0.16, 0.46]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#ff9ec4" roughness={0.5} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.26, -0.16, 0.46]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#ff9ec4" roughness={0.5} transparent opacity={0.8} />
        </mesh>
        {/* smile */}
        <mesh position={[0, -0.16, 0.49]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.07, 0.016, 10, 20, Math.PI]} />
          <meshStandardMaterial color="#4b2338" roughness={0.4} />
        </mesh>
      </group>

      {/* Sparkles */}
      {[0,1,2,3,4].map(i => <Sparkle key={i} index={i} />)}
    </group>
  );
}

function Sparkle({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const angle = useRef((index / 5) * Math.PI * 2);
  const r = 0.9 + (index % 3) * 0.24;
  const spd = 0.38 + index * 0.065;
  const yo = -0.25 + Math.sin((index / 5) * Math.PI * 2) * 0.55;
  useFrame((_, delta) => {
    angle.current += delta * spd;
    if (ref.current) {
      ref.current.position.x = Math.cos(angle.current) * r;
      ref.current.position.z = Math.sin(angle.current) * r;
      ref.current.position.y = yo + Math.sin(angle.current * 1.5) * 0.18;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.024 + (index % 3) * 0.008, 8, 8]} />
      <meshStandardMaterial color="#f9a8d4" emissive="#ec4899" emissiveIntensity={4} />
    </mesh>
  );
}

export function GiftBox3D() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Wait for a few animation frames so the canvas has painted real
    // content before we fade it in — avoids a pop/flash on mobile.
    let raf1 = 0, raf2 = 0;
    const t = setTimeout(() => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setReady(true));
      });
    }, 250);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return (
    <div className={`heart3d-fixed${ready ? " is-ready" : ""}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.1, 8.0], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        scene={{ background: null }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 6, 3]} intensity={2.6} />
          <directionalLight position={[-4, 2, -2]} intensity={1.2} color="#c4b5fd" />
          <pointLight position={[2, -1.5, 3]} intensity={14} color="#fda4cf" />
          <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
            <GiftScene />
          </Float>
          <ContactShadows position={[0, -1.85, 0]} opacity={0.22} scale={5} blur={3} far={4} color="#9d1a6e" />
        </Suspense>
      </Canvas>
    </div>
  );
}
