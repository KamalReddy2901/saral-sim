import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, InstancedMesh, MeshStandardMaterial, Object3D, Path, Shape, TubeGeometry, Vector3, type Group,
} from "three";
import { Hotspot } from "./Hotspot";
import { occluders } from "./hotspotStore";
import { PI_POS, PI_SCALE } from "./layout";
import { S } from "./sceneState";
import { makeSilkscreen } from "./textures";

// All geometry below is in millimetres inside a group scaled by PI_SCALE. Board top surface is y = TOP.
const BW = 85, BD = 56, BT = 1.6, TOP = BT;
const STANDOFF = 4;

const metal = new MeshStandardMaterial({ color: "#c9d3e3", metalness: 0.95, roughness: 0.28 });
const darkMetal = new MeshStandardMaterial({ color: "#8d99ac", metalness: 0.9, roughness: 0.4 });
const blackPkg = new MeshStandardMaterial({ color: "#0b0f16", metalness: 0.2, roughness: 0.55 });
const plastic = new MeshStandardMaterial({ color: "#10151f", roughness: 0.6 });
const usbBlue = new MeshStandardMaterial({ color: "#2f5bea", roughness: 0.5 });
const gold = new MeshStandardMaterial({ color: "#e8b94a", metalness: 1, roughness: 0.25 });

function usePcbGeometry() {
  return useMemo(() => {
    const r = 3;
    const s = new Shape();
    const x0 = -BW / 2, x1 = BW / 2, y0 = -BD / 2, y1 = BD / 2;
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
    s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
    s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
    s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
    for (const [hx, hy] of [[-39, -24.5], [-39, 24.5], [19, -24.5], [19, 24.5]] as const) {
      const h = new Path(); h.absarc(hx, hy, 1.4, 0, Math.PI * 2, true); s.holes.push(h);
    }
    const g = new ExtrudeGeometry(s, { depth: BT, bevelEnabled: false, curveSegments: 10 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
}

const TRACES: { seg: [number, number, number, number]; phase: number }[] = [
  { seg: [-10, 2, 14, 2], phase: 0 }, { seg: [14, 2, 14, 17], phase: 0.12 }, { seg: [14, 17, 28, 17], phase: 0.24 },
  { seg: [14, 2, 14, -3], phase: 0.12 }, { seg: [14, -3, 30, -3], phase: 0.24 }, { seg: [-10, 2, -26, -6], phase: 0.1 },
  { seg: [-10, 2, -10, 20], phase: 0.1 }, { seg: [-10, 20, -22, 24], phase: 0.2 },
];

export function PiBoard({ showHotspots }: { showHotspots: boolean }) {
  const pcb = usePcbGeometry();
  const silk = useMemo(() => makeSilkscreen(), []);
  const boardRef = useRef<Group>(null);
  const socRef = useRef<Group>(null);
  const coolerRef = useRef<Group>(null);
  const sdRef = useRef<Group>(null);
  const powerRef = useRef<Group>(null);
  const fanRef = useRef<Group>(null);
  const socMat = useRef<MeshStandardMaterial>(null);
  const gpio = useRef<InstancedMesh>(null);
  const ethRef = useRef<Group>(null);
  const traceMats = useMemo(() => TRACES.map(() => new MeshStandardMaterial({ color: "#1a5a37", emissive: new Color("#7fb0ff"), emissiveIntensity: 0, roughness: 0.6 })), []);
  const glowColor = useMemo(() => new Color("#ffb347"), []);

  useEffect(() => {
    const m = gpio.current;
    if (!m) return;
    const o = new Object3D();
    let i = 0;
    for (let col = 0; col < 20; col++) {
      for (let row = 0; row < 2; row++) {
        o.position.set(-27.4 + 1.27 + col * 2.54, TOP + 4.2, -24 + (row === 0 ? -1.27 : 1.27));
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  const cables = useMemo(() => {
    const tube = (pts: [number, number, number][], r: number) =>
      new TubeGeometry(new CatmullRomCurve3(pts.map(([x, y, z]) => new Vector3(x, y, z))), 48, r, 10, false);
    return {
      eth: tube([[66, 7.6, 17], [95, 4.5, 18], [130, -3, 24], [180, -7.5, 34], [260, -7.5, 40], [330, -7.5, 30]], 1.7),
      power: tube([[-31, 4, 41], [-31, 3, 50], [-45, -3, 60], [-80, -7.5, 52], [-160, -7.5, 24], [-300, -7.5, -20]], 1.5),
    };
  }, []);

  useEffect(() => () => { pcb.dispose(); silk.dispose(); traceMats.forEach((m) => m.dispose()); cables.eth.dispose(); cables.power.dispose(); }, [pcb, silk, traceMats, cables]);

  useFrame((state, dt) => {
    const ex = S.ex;
    if (boardRef.current) boardRef.current.position.y = STANDOFF + ex.board * 14;
    if (socRef.current) socRef.current.position.y = ex.soc * 20;
    if (coolerRef.current) coolerRef.current.position.y = ex.cooler * 46;
    if (sdRef.current) { sdRef.current.position.x = -ex.sd * 34; sdRef.current.position.y = -ex.sd * 24; }
    if (powerRef.current) { powerRef.current.position.z = ex.power * 38; powerRef.current.position.x = -ex.power * 8; }
    if (ethRef.current) { ethRef.current.position.x = S.cable * 110; ethRef.current.position.y = S.cable * 9; }
    if (fanRef.current) fanRef.current.rotation.y += dt * (S.fan * 38);
    if (socMat.current) {
      socMat.current.emissive.copy(glowColor);
      socMat.current.emissiveIntensity = S.glow * (0.55 + 0.25 * Math.sin(state.clock.elapsedTime * 3));
    }
    const t = state.clock.elapsedTime;
    traceMats.forEach((m, i) => {
      const wave = 0.5 + 0.5 * Math.sin(t * 7 - TRACES[i].phase * 28);
      m.emissiveIntensity = S.pulse * (0.15 + 1.9 * wave);
    });
  });

  const hx = (id: string, p: readonly [number, number, number]) => <Hotspot id={id} position={p} visible={showHotspots} />;

  return (
    <group ref={occluders.pi} position={[PI_POS[0], PI_POS[1], PI_POS[2]]} scale={PI_SCALE}>
      {/* standoffs */}
      {([[-39, -24.5], [-39, 24.5], [19, -24.5], [19, 24.5]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, STANDOFF / 2, z]}>
          <cylinderGeometry args={[2.4, 2.4, STANDOFF, 16]} />
          <meshStandardMaterial color="#3a4658" roughness={0.6} />
        </mesh>
      ))}

      <group ref={boardRef} position={[0, STANDOFF, 0]}>
        {/* PCB */}
        <mesh geometry={pcb}>
          <meshPhysicalMaterial color="#17794a" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.35} />
        </mesh>
        <mesh position={[0, TOP + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BW, BD]} />
          <meshBasicMaterial map={silk} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} toneMapped={false} side={DoubleSide} />
        </mesh>

        {/* pulse traces */}
        {TRACES.map((t, i) => {
          const [x1, z1, x2, z2] = t.seg;
          const len = Math.hypot(x2 - x1, z2 - z1);
          return (
            <mesh key={i} material={traceMats[i]} position={[(x1 + x2) / 2, TOP + 0.08, (z1 + z2) / 2]} rotation={[0, -Math.atan2(z2 - z1, x2 - x1), 0]}>
              <boxGeometry args={[len, 0.12, 0.9]} />
            </mesh>
          );
        })}

        {/* chips */}
        <mesh position={[-33, TOP + 0.55, -6]} material={blackPkg}><boxGeometry args={[12, 1.1, 12]} /></mesh>
        <mesh position={[14, TOP + 0.6, -2]} material={blackPkg}><boxGeometry args={[15, 1.2, 15]} /></mesh>
        <mesh position={[-28, TOP + 0.4, 16]} material={blackPkg}><boxGeometry args={[7, 0.8, 7]} /></mesh>
        <mesh position={[-35, TOP + 1.1, -19]} material={darkMetal}><boxGeometry args={[10, 2.2, 10]} /></mesh>

        {/* GPIO header */}
        <mesh position={[-2, TOP + 4.1, -24]} material={plastic}><boxGeometry args={[50.8, 8.2, 5.1]} /></mesh>
        <instancedMesh ref={gpio} args={[undefined, undefined, 40]} material={gold}>
          <boxGeometry args={[0.64, 4.6, 0.64]} />
        </instancedMesh>

        {/* Ethernet RJ45 (right edge) and USB stacks */}
        <group>
          <mesh position={[34, TOP + 6.75, 17]} material={metal}><boxGeometry args={[21, 13.5, 16]} /></mesh>
          <mesh position={[44.55, TOP + 6, 17]} material={blackPkg}><boxGeometry args={[0.2, 9, 12]} /></mesh>
          <mesh position={[36, TOP + 8, -3]} material={metal}><boxGeometry args={[17, 16, 14]} /></mesh>
          <mesh position={[44.55, TOP + 4.5, -3]} material={blackPkg}><boxGeometry args={[0.2, 5.5, 11]} /></mesh>
          <mesh position={[44.55, TOP + 11.5, -3]} material={blackPkg}><boxGeometry args={[0.2, 5.5, 11]} /></mesh>
          <mesh position={[36, TOP + 8, -20]} material={metal}><boxGeometry args={[17, 16, 14]} /></mesh>
          <mesh position={[44.55, TOP + 4.5, -20]} material={usbBlue}><boxGeometry args={[0.2, 5.5, 11]} /></mesh>
          <mesh position={[44.55, TOP + 11.5, -20]} material={usbBlue}><boxGeometry args={[0.2, 5.5, 11]} /></mesh>
        </group>

        {/* Ethernet cable and plug: pulled out in chapter 4 */}
        <group ref={ethRef}>
          <mesh position={[55, TOP + 6.2, 17]}><boxGeometry args={[22, 11, 12]} /><meshPhysicalMaterial color="#dfe6f2" roughness={0.25} transmission={0} /></mesh>
          <mesh position={[62, TOP + 6.2, 17]}><boxGeometry args={[10, 13, 14]} /><meshStandardMaterial color="#2f5bea" roughness={0.5} /></mesh>
          <mesh geometry={cables.eth}><meshStandardMaterial color="#2f5bea" roughness={0.45} /></mesh>
        </group>

        {/* front edge: two micro-HDMI, flat-cable connectors */}
        <mesh position={[-18, TOP + 1.6, 24.5]} material={metal}><boxGeometry args={[6.6, 3.2, 6.2]} /></mesh>
        <mesh position={[-5, TOP + 1.6, 24.5]} material={metal}><boxGeometry args={[6.6, 3.2, 6.2]} /></mesh>
        <mesh position={[6, TOP + 1.3, 24.5]} material={plastic}><boxGeometry args={[9, 2.6, 4]} /></mesh>
        <mesh position={[17, TOP + 1.3, 24.5]} material={plastic}><boxGeometry args={[9, 2.6, 4]} /></mesh>
        {/* power button */}
        <mesh position={[-38, TOP + 1.2, 12]} material={plastic}><boxGeometry args={[4, 2.4, 4]} /></mesh>

        {/* SoC heat spreader */}
        <group ref={socRef}>
          <mesh position={[-10, TOP + 1.5, 2]}>
            <boxGeometry args={[16, 2.4, 16]} />
            <meshStandardMaterial ref={socMat} color="#d5dcea" metalness={0.95} roughness={0.22} />
          </mesh>
          {hx("soc", [-10, TOP + 7, 2])}
        </group>

        {/* active cooler: aluminium heatsink with a fan */}
        <group ref={coolerRef}>
          <group position={[-10, TOP + 2.7, 2]}>
            <mesh position={[0, 1.25, 0]} material={darkMetal}><boxGeometry args={[30, 2.5, 30]} /></mesh>
            {Array.from({ length: 9 }, (_, i) => (
              <mesh key={i} position={[-12 + i * 3, 4.6, 0]} material={metal}><boxGeometry args={[0.9, 4.4, 28]} /></mesh>
            ))}
            <mesh position={[0, 8.4, 0]} material={plastic}><cylinderGeometry args={[11.5, 11.5, 3.4, 40]} /></mesh>
            <group ref={fanRef} position={[0, 10.3, 0]}>
              {Array.from({ length: 7 }, (_, i) => (
                <mesh key={i} rotation={[0, (i * Math.PI * 2) / 7, 0]} position={[Math.cos((i * Math.PI * 2) / 7) * 5, 0, -Math.sin((i * Math.PI * 2) / 7) * 5]}>
                  <boxGeometry args={[9, 0.5, 3.4]} />
                  <meshStandardMaterial color="#2a3446" roughness={0.5} />
                </mesh>
              ))}
              <mesh><cylinderGeometry args={[2.6, 2.6, 1.2, 20]} /><meshStandardMaterial color="#c9d3e3" metalness={0.8} roughness={0.3} /></mesh>
            </group>
            {hx("cooler", [0, 15, 0])}
          </group>
        </group>

        {/* microSD card, slides in underneath the left edge */}
        <group ref={sdRef}>
          <mesh position={[-34, -1.5, 0]} material={plastic}><boxGeometry args={[15, 1, 11]} /></mesh>
          <mesh position={[-30.5, -1.5, 0]} material={gold}><boxGeometry args={[7, 1.05, 8]} /></mesh>
          {hx("sd", [-36, -6, 0])}
        </group>

        {/* USB-C power plug on the front edge */}
        <group ref={powerRef}>
          <mesh position={[-31, TOP + 1.9, 25.5]} material={metal}><boxGeometry args={[9, 3.8, 8]} /></mesh>
          <mesh position={[-31, TOP + 1.9, 34]} material={plastic}><boxGeometry args={[15, 8, 14]} /></mesh>
          <mesh geometry={cables.power}><meshStandardMaterial color="#e8eef7" roughness={0.5} /></mesh>
          {hx("power", [-31, TOP + 9, 36])}
        </group>
      </group>
    </group>
  );
}
