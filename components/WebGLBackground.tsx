"use client";
import { useEffect, useRef } from "react";

// Dependency-free WebGL flowing mesh-gradient background.
// Renders a soft, slowly morphing pink/lilac/sky liquid gradient.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

vec2 hash(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                 dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
             mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                 dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++){
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv * 2.4;
  float t = u_time * 0.06;

  float n1 = fbm(p + vec2(t, t * 0.7));
  float n2 = fbm(p * 1.3 - vec2(t * 0.8, t));
  float n = fbm(p + n1 + n2);

  vec3 c1 = vec3(0.988, 0.796, 0.886); // pink
  vec3 c2 = vec3(0.847, 0.796, 0.988); // lilac
  vec3 c3 = vec3(0.792, 0.878, 1.000); // sky
  vec3 c4 = vec3(1.000, 0.925, 0.882); // warm peach

  vec3 col = mix(c4, c1, smoothstep(0.0, 0.5, n));
  col = mix(col, c2, smoothstep(0.3, 0.8, n1));
  col = mix(col, c3, smoothstep(0.5, 1.0, n2));

  // Keep it airy but visible (blend toward cream, not pure white)
  col = mix(vec3(0.984, 0.976, 0.972), col, 0.62);

  // Subtle film grain for a premium, non-flat surface
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) * 43758.5453);
  col += (g - 0.5) * 0.025;

  gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const frame = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = "1";
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}
