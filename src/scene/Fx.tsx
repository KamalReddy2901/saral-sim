import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, CanvasTexture, DoubleSide, SRGBColorSpace, type Mesh, type MeshBasicMaterial } from "three";
import { SOC_WORLD } from "./layout";
import { S } from "./sceneState";

function gradientTexture(kind: "wall" | "pool"): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  if (kind === "pool") {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(0.45, "rgba(255,255,255,0.14)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  } else {
    const gr = g.createLinearGradient(0, 256, 0, 0);
    gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.08, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "rgba(255,255,255,0.35)";
    for (let x = 0; x < 256; x += 8) g.fillRect(x, 0, 1, 256);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** A sheet of light that sweeps through the product whenever the chapter changes. */
export function ScanWall() {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const tex = useMemo(() => gradientTexture("wall"), []);
  useFrame(() => {
    const m = mesh.current, mt = mat.current;
    if (!m || !mt) return;
    const s = S.scan;
    m.visible = s > 0.001 && s < 0.999;
    m.position.z = -18 + s * 46;
    mt.opacity = Math.sin(Math.PI * s) * 0.55;
    mt.color.setRGB(S.glowCol.r, S.glowCol.g, S.glowCol.b);
  });
  return (
    <mesh ref={mesh} position={[0, 10, -18]} visible={false} userData={{ noShadow: true }} frustumCulled={false}>
      <planeGeometry args={[70, 20]} />
      <meshBasicMaterial ref={mat} map={tex} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/** Expanding rings that radiate from the chip while the model runs. */
export function EnergyRings() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    for (let i = 0; i < 3; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const on = S.pulse > 0.05;
      m.visible = on;
      if (!on) continue;
      const ph = (state.clock.elapsedTime * 0.55 + i / 3) % 1;
      const sc = 0.6 + ph * 9;
      m.scale.set(sc, sc, 1);
      (m.material as MeshBasicMaterial).opacity = (1 - ph) * 0.75 * S.pulse;
    }
  });
  return (
    <>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }} position={[SOC_WORLD[0], SOC_WORLD[1] + 0.1, SOC_WORLD[2]]} rotation-x={-Math.PI / 2} visible={false} userData={{ noShadow: true }} frustumCulled={false}>
          <ringGeometry args={[0.97, 1, 72]} />
          <meshBasicMaterial color="#4de1d2" transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/** Soft pool of accent light on the floor under the product. */
export function LightPool() {
  const mat = useRef<MeshBasicMaterial>(null);
  const tex = useMemo(() => gradientTexture("pool"), []);
  useFrame(() => { mat.current?.color.setRGB(S.glowCol.r, S.glowCol.g, S.glowCol.b); });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, 3]} userData={{ noShadow: true }}>
      <planeGeometry args={[78, 78]} />
      <meshBasicMaterial ref={mat} map={tex} transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </mesh>
  );
}
