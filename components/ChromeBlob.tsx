"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { blobFocus, scroll, useReducedMotion } from "./Providers";
import { projects } from "@/data/portfolio";

type Look = { x: number; y: number; scale: number; amp: number; freq: number; lens: number };

// Per-section shapes. Light, text-heavy sections push the blob to an edge so dark text stays readable.
// x is a fraction of viewport width; sections opt in with data-blob="<key>". lens = hero name refraction.
const PRESETS: Record<string, Look> = {
  hero: { x: 0.2, y: -0.12, scale: 0.95, amp: 0.12, freq: 0.9, lens: 1 },
  about: { x: -0.5, y: 0.3, scale: 0.55, amp: 0.2, freq: 1.0, lens: 0 },
  skills: { x: 0.44, y: 0.36, scale: 0.36, amp: 0.16, freq: 1.1, lens: 0 },
  work: { x: 0.5, y: -0.36, scale: 0.5, amp: 0.14, freq: 0.9, lens: 0 },
  experience: { x: 0.5, y: -0.3, scale: 0.55, amp: 0.18, freq: 1.0, lens: 0 },
  project: { x: 0.53, y: 0.4, scale: 0.36, amp: 0.16, freq: 1.0, lens: 0 },
  contact: { x: 0.1, y: 0.16, scale: 0.9, amp: 0.13, freq: 0.85, lens: 0 },
};

// Hovering a project row: each project gets its own shape (reflection tint comes from data).
const PROJECT_SHAPES: Look[] = [
  { amp: 0.24, freq: 1.3 },
  { amp: 0.1, freq: 0.6 },
  { amp: 0.18, freq: 1.6 },
  { amp: 0.3, freq: 0.9 },
].map((s) => ({ ...s, x: 0.06, y: -0.02, scale: 0.6, lens: 0 }));

const NOISE = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform float uFreq;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform vec3 uPoint; uniform float uPoke; uniform vec3 uSplashPos; uniform float uSplashT;
float disp(vec3 p){
  float n = snoise(p*uFreq + vec3(uTime*.12, uTime*.09, -uTime*.07));
  n += .18*snoise(p*uFreq*1.9 - uTime*.1);
  n *= uAmp;
  // cursor dent
  float d = distance(p, uPoint);
  n -= uPoke * .22 * exp(-d*d*7.);
  // click splash: ripples travelling out from the hit point
  float age = uTime - uSplashT;
  float ds = distance(p, uSplashPos);
  n += step(0., age) * .09 * sin(ds*16. - age*12.) * exp(-age*1.6) * exp(-ds*1.2);
  return n;
}
vec3 displaced(vec3 p){ vec3 n=normalize(p); return n + n*disp(n); }
`;

// Displace along the normal, then rebuild the normal from two neighbouring displaced points.
const NORMAL_CHUNK = /* glsl */ `
vec3 nrm = normalize(position);
vec3 tng = normalize(cross(nrm, abs(nrm.y) < .99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
vec3 btg = normalize(cross(nrm, tng));
vec3 dp0 = displaced(position);
vec3 dp1 = displaced(position + tng*.01);
vec3 dp2 = displaced(position + btg*.01);
vec3 objectNormal = normalize(cross(dp1 - dp0, dp2 - dp0));
`;

// Liquid lens: inside the blob, the hero name refracted + magnified with an RGB split; chrome at the rim.
const LENS_FRAG = /* glsl */ `
uniform sampler2D tText; uniform vec4 uTextRect; uniform vec2 uRes; uniform vec2 uCenter;
uniform float uLens; uniform vec3 uInk; uniform vec3 uPaper;
float textAlpha(vec2 q){
  vec2 uv = (q - uTextRect.xy) / uTextRect.zw;
  if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return 0.;
  return texture2D(tText, vec2(uv.x, 1. - uv.y)).a;
}
`;
const LENS_APPLY = /* glsl */ `
#include <colorspace_fragment>
if (uLens > .001) {
  vec2 p = vec2(gl_FragCoord.x / uRes.x, 1. - gl_FragCoord.y / uRes.y);
  vec3 vn = normalize(normal);
  float rim = pow(1. - abs(vn.z), 2.5);
  vec2 q = uCenter + (p - uCenter) * .8;          // magnify
  vec2 off = vn.xy * vec2(-1., 1.) * .028;         // refract
  vec3 a = vec3(textAlpha(q + off * 1.12), textAlpha(q + off), textAlpha(q + off * .88)); // thin RGB fringes
  vec3 chrome = gl_FragColor.rgb;
  vec3 glass = mix(uPaper * .9, uInk, a);
  vec3 col = mix(chrome, glass, uLens * (1. - rim));
  col += uLens * smoothstep(.7, 1., max(chrome.r, max(chrome.g, chrome.b))) * .5; // keep specular glints
  gl_FragColor.rgb = col;
}
`;

// Hero name drawn to a texture with the same font + metrics as the DOM <h1>.
function drawName(h1: HTMLElement) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const box = h1.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(box.width * dpr);
  canvas.height = Math.ceil(box.height * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  h1.querySelectorAll<HTMLElement>(":scope > span").forEach((line) => {
    const cs = getComputedStyle(line);
    const r = line.getBoundingClientRect();
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing;
    ctx.fillStyle = "#0e0e0e";
    const text = (line.textContent ?? "").toUpperCase();
    const m = ctx.measureText(text);
    const lineH = parseFloat(cs.lineHeight) || r.height;
    const baseline = r.top - box.top + (lineH - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    ctx.fillText(text, r.left - box.left, baseline);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _ray = new THREE.Ray();
const _hit = new THREE.Vector3();
const _sphere = new THREE.Sphere();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();

function Blob({ reduced, segments }: { reduced: boolean; segments: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const textMesh = useRef<THREE.Mesh>(null!);
  const { viewport, camera, gl, size, raycaster } = useThree();
  const pathname = usePathname();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uFreq: { value: 1.1 },
      uPoint: { value: new THREE.Vector3(0, 0, 1) },
      uPoke: { value: 0 },
      uSplashPos: { value: new THREE.Vector3(0, 0, 1) },
      uSplashT: { value: -100 },
      tText: { value: null as THREE.Texture | null },
      uTextRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uLens: { value: 0 },
      uInk: { value: new THREE.Color("#0e0e0e") },
      uPaper: { value: new THREE.Color("#edebe6") },
    }),
    []
  );
  const state = useRef({ ...PRESETS.hero, appear: 0, nameOn: 0 });
  const section = useRef("hero");
  const focus = useRef(-1);
  const hovering = useRef(false);
  const name = useRef<HTMLElement | null>(null);
  const tint = useMemo(() => new THREE.Color("#ffffff"), []);

  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 1, roughness: 0.04 });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = NOISE + shader.vertexShader
        .replace("#include <beginnormal_vertex>", NORMAL_CHUNK)
        .replace("#include <begin_vertex>", "vec3 transformed = dp0;");
      shader.fragmentShader = LENS_FRAG + shader.fragmentShader.replace("#include <colorspace_fragment>", LENS_APPLY);
    };
    return m;
  }, [uniforms]);

  const textMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }),
    []
  );

  // Section presets
  useEffect(() => {
    const to = (key: string) => {
      section.current = key;
      if (focus.current < 0) gsap.to(state.current, { ...PRESETS[key], duration: reduced ? 0 : 1.8, ease: "expo.out", overwrite: "auto" });
    };
    gsap.to(state.current, { appear: 1, duration: 2.2, ease: "expo.out", delay: 0.2 });
    // Short first sections never cross the trigger line, so start from the page's first preset.
    const firstKey = document.querySelector<HTMLElement>("[data-blob]")?.dataset.blob ?? "hero";
    if (PRESETS[firstKey]) to(firstKey);
    const triggers = gsap.utils.toArray<HTMLElement>("[data-blob]").map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive && PRESETS[el.dataset.blob!]) to(el.dataset.blob!);
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, [reduced, pathname]);

  // Lens: swap the DOM name for the WebGL copy once its letter reveal has finished.
  useEffect(() => {
    if (reduced) return;
    const h1 = document.getElementById("hero-name");
    name.current = h1;
    if (!h1) return;
    let tex: THREE.Texture | null = null;
    const build = () => {
      tex?.dispose();
      tex = drawName(h1);
      textMaterial.map = tex;
      textMaterial.needsUpdate = true;
      uniforms.tText.value = tex;
    };
    const swap = gsap.delayedCall(1.9, async () => {
      await document.fonts.ready;
      build();
      h1.style.color = "transparent"; // stays in the DOM for screen readers + SEO
      state.current.nameOn = 1;
    });
    const onResize = () => state.current.nameOn && build();
    window.addEventListener("resize", onResize);
    return () => {
      swap.kill();
      window.removeEventListener("resize", onResize);
      state.current.nameOn = 0;
      h1.style.color = "";
      tex?.dispose();
    };
  }, [reduced, pathname, textMaterial, uniforms]);

  // Click on the blob → splash
  useEffect(() => {
    const down = () => {
      if (!hovering.current) return;
      uniforms.uSplashPos.value.copy(uniforms.uPoint.value);
      uniforms.uSplashT.value = uniforms.uTime.value;
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, [uniforms]);

  useFrame(({ pointer, clock }, delta) => {
    const s = state.current;
    const m = mesh.current;
    const k = 1 - Math.pow(0.02, delta);

    // Project hover → per-project shape + tint; leaving → back to the section's look
    if (blobFocus.project !== focus.current) {
      focus.current = blobFocus.project;
      const look = focus.current >= 0 ? PROJECT_SHAPES[focus.current % PROJECT_SHAPES.length] : PRESETS[section.current];
      gsap.to(s, { ...look, duration: reduced ? 0 : 1.2, ease: "expo.out", overwrite: "auto" });
      tint.set(focus.current >= 0 ? projects[focus.current]?.tint ?? "#ffffff" : "#ffffff");
    }
    material.color.lerp(tint, k * 0.5);

    if (!reduced) uniforms.uTime.value = clock.elapsedTime;
    uniforms.uAmp.value = s.amp + Math.min(Math.abs(scroll.smooth) * 0.006, 0.25);
    uniforms.uFreq.value = s.freq;

    const narrow = viewport.width < viewport.height; // phones: keep blob nearer the centre
    const tx = s.x * viewport.width * (narrow ? 0.5 : 1) + (reduced ? 0 : pointer.x * 0.35);
    const ty = s.y * viewport.height + (reduced ? 0 : pointer.y * 0.25);
    m.position.x += (tx - m.position.x) * k;
    m.position.y += (ty - m.position.y) * k;
    const sc = s.scale * s.appear * Math.min(1, viewport.width / 7);
    m.scale.setScalar(Math.max(sc, 0.0001));
    if (!reduced) {
      m.rotation.y += delta * 0.08;
      m.rotation.x = pointer.y * 0.2;
    }

    // Cursor poke: analytic ray-sphere test (cheap), hit point in the blob's local unit space
    let hit = false;
    if (!reduced) {
      raycaster.setFromCamera(pointer, camera);
      _ray.copy(raycaster.ray);
      _sphere.set(m.position, sc * 1.05);
      if (_ray.intersectSphere(_sphere, _hit)) {
        hit = true;
        _v.copy(_hit).sub(m.position).normalize().applyQuaternion(_q.copy(m.quaternion).invert());
        uniforms.uPoint.value.lerp(_v, Math.min(1, k * 2)).normalize();
      }
    }
    hovering.current = hit;
    uniforms.uPoke.value += ((hit ? 1 : 0) - uniforms.uPoke.value) * k;

    // Lens: keep the WebGL name glued to the DOM <h1> rect
    const t = textMesh.current;
    const h1 = name.current;
    const lensOn = !!(s.nameOn && h1 && h1.isConnected);
    if (lensOn) {
      const r = h1!.getBoundingClientRect();
      const vp = viewport.getCurrentViewport(camera, _v.set(0, 0, -1.5));
      t.scale.set((r.width / size.width) * vp.width, (r.height / size.height) * vp.height, 1);
      t.position.set(
        ((r.left + r.width / 2) / size.width - 0.5) * vp.width,
        (0.5 - (r.top + r.height / 2) / size.height) * vp.height,
        -1.5
      );
      uniforms.uTextRect.value.set(r.left / size.width, r.top / size.height, r.width / size.width, r.height / size.height);
      gl.getDrawingBufferSize(uniforms.uRes.value);
      _v.copy(m.position).project(camera);
      uniforms.uCenter.value.set(_v.x * 0.5 + 0.5, 0.5 - _v.y * 0.5);
    }
    t.visible = lensOn;
    textMaterial.opacity += ((lensOn ? 1 : 0) - textMaterial.opacity) * Math.min(1, k * 2);
    uniforms.uLens.value = lensOn ? s.lens * textMaterial.opacity : 0;
  });

  return (
    <>
      <mesh ref={textMesh} material={textMaterial} renderOrder={-1} visible={false}>
        <planeGeometry />
      </mesh>
      <mesh ref={mesh} material={material}>
        <sphereGeometry args={[1, segments, segments]} />
      </mesh>
    </>
  );
}

export default function ChromeBlob() {
  const reduced = useReducedMotion();
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Blob reduced={reduced} segments={mobile ? 96 : 192} />
        {/* Procedural studio — no HDR download. A ring of thin strips gives even, crisp chrome bands. */}
        <Environment resolution={mobile ? 128 : 256}>
          <color attach="background" args={["#2a2927"]} />
          <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <Lightformer key={i} form="rect" intensity={i % 2 ? 1.2 : 2.6} position={[Math.sin(a) * 6, 0, Math.cos(a) * 6]} rotation-y={a + Math.PI} scale={[0.5, 12, 1]} />
            );
          })}
          <Lightformer form="rect" intensity={1.5} position={[0, 1.2, -6]} scale={[16, 0.3, 1]} />
          <Lightformer form="rect" color="#c6ff3d" intensity={1.5} position={[5, -2.5, 3]} rotation-y={-Math.PI / 3} scale={[1.5, 0.2, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
