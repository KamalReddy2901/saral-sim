import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Object3D, Vector3 } from "three";
import { words } from "../utils/wordcount";
import { TOKEN_ORIGIN, SOC_WORLD } from "./layout";
import { S } from "./sceneState";

const MAX_TOKENS = 70;
const A = new Vector3(...TOKEN_ORIGIN);
const B = new Vector3(SOC_WORLD[0], SOC_WORLD[1] + 0.9, SOC_WORLD[2]);
const o = new Object3D();
const tmp = new Vector3();
const sun = new Color("#ffc933");
const mist = new Color("#e8eef7");

/** The passage's words detach as small tokens (width follows each word's length) and arc into the chip. */
export function TokenStream({ text }: { text: string }) {
  const ref = useRef<InstancedMesh>(null);
  const lens = useMemo(() => {
    const w = words(text);
    const step = Math.max(1, Math.floor(w.length / MAX_TOKENS));
    return Array.from({ length: MAX_TOKENS }, (_, i) => Math.min(8, Math.max(2, (w[(i * step) % w.length] ?? "word").length)));
  }, [text]);
  const seeds = useMemo(() => Array.from({ length: MAX_TOKENS }, (_, i) => ({ phase: i / MAX_TOKENS, dx: Math.sin(i * 12.9898) * 1.6, dz: Math.cos(i * 78.233) * 1.4, arc: 3 + (i % 5) * 0.7 })), []);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    lens.forEach((_, i) => m.setColorAt(i, i % 4 === 0 ? sun : mist));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [lens]);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    m.visible = S.stream > 0.01;
    if (!m.visible) return;
    const t = state.clock.elapsedTime * 0.45;
    for (let i = 0; i < MAX_TOKENS; i++) {
      const s = seeds[i];
      const e = (t + s.phase) % 1;
      tmp.lerpVectors(A, B, e);
      tmp.x += s.dx * (1 - e);
      tmp.z += s.dz * (1 - e);
      tmp.y += Math.sin(Math.PI * e) * s.arc;
      o.position.copy(tmp);
      const sc = S.stream * (e < 0.08 ? e / 0.08 : e > 0.9 ? (1 - e) / 0.1 : 1);
      o.scale.set(lens[i] * 0.17 * sc, 0.32 * sc, 0.32 * sc);
      o.rotation.set(0, e * 6, e * 3);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MAX_TOKENS]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial emissive="#ffc933" emissiveIntensity={0.55} roughness={0.4} />
    </instancedMesh>
  );
}
