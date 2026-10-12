"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scroll } from "./Providers";

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

// Liquid ripple on hover + RGB-split wave driven by velocity.
const fragment = /* glsl */ `
uniform sampler2D uTex; uniform float uTime; uniform float uHover; uniform float uVel;
uniform vec2 uScale; // cover-fit
varying vec2 vUv;
void main(){
  vec2 uv = (vUv - .5) * uScale + .5;
  float d = distance(vUv, vec2(.5));
  uv += (vUv - .5) * sin(d * 22. - uTime * 5.) * .018 * uHover;
  float wave = sin(vUv.y * 9. + uTime * 3.) * uVel * .03;
  uv.x += wave;
  float s = uVel * .02 + uHover * .004;
  vec4 c = texture2D(uTex, uv);
  c.r = texture2D(uTex, uv + vec2(s, 0.)).r;
  c.b = texture2D(uTex, uv - vec2(s, 0.)).b;
  gl_FragColor = c;
}
`;

export type Signals = { hover: number; velocity: number };

function Plane({ images, index, signals }: { images: string[]; index: number; signals: React.RefObject<Signals> }) {
  const textures = useTexture(images);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTex: { value: textures[0] },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uVel: { value: 0 },
      uScale: { value: new THREE.Vector2(1, 1) },
    }),
    [textures]
  );
  const mat = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }, delta) => {
    const tex = textures[index];
    tex.colorSpace = THREE.SRGBColorSpace;
    const img = tex.image as HTMLImageElement;
    const ia = img.width / img.height;
    const pa = size.width / size.height;
    uniforms.uTex.value = tex;
    uniforms.uScale.value.set(pa > ia ? 1 : pa / ia, pa > ia ? ia / pa : 1);
    uniforms.uTime.value = clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta);
    const s = signals.current;
    uniforms.uHover.value += ((s?.hover ?? 0) - uniforms.uHover.value) * k;
    const vel = Math.max(-1, Math.min(1, (s?.velocity ?? 0) + scroll.smooth / 40));
    uniforms.uVel.value += (vel - uniforms.uVel.value) * k;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

// Canvas overlay only; the caller renders a plain <img> underneath as fallback/LCP/alt text.
export default function DistortImage({ images, index = 0, signals }: {
  images: string[]; index?: number; signals: React.RefObject<Signals>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }} // R3F defaults to auto, which would steal hover/clicks
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      frameloop="always"
      aria-hidden
    >
      <Suspense fallback={null}>
        <Plane images={images} index={index} signals={signals} />
      </Suspense>
    </Canvas>
  );
}
