import { RoundedBox } from "@react-three/drei";
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

const metal = new MeshStandardMaterial({ color: "#cfd7e6", metalness: 1, roughness: 0.2 });
const darkMetal = new MeshStandardMaterial({ color: "#7d8799", metalness: 1, roughness: 0.34 });
const anodised = new MeshStandardMaterial({ color: "#3a4352", metalness: 0.95, roughness: 0.38 });
const blackPkg = new MeshStandardMaterial({ color: "#07090d", metalness: 0.3, roughness: 0.42 });
const plastic = new MeshStandardMaterial({ color: "#0d1119", roughness: 0.5 });
const gold = new MeshStandardMaterial({ color: "#f0c25a", metalness: 1, roughness: 0.18 });
const cavity = new MeshStandardMaterial({ color: "#020305", roughness: 1 });
const tongueBlack = new MeshStandardMaterial({ color: "#23283a", roughness: 0.5 });
const tongueBlue = new MeshStandardMaterial({ color: "#7a66ff", roughness: 0.4 });
const tongueWhite = new MeshStandardMaterial({ color: "#e9edf5", roughness: 0.45 });
const ledGreen = new MeshStandardMaterial({ color: "#14ff8a", emissive: "#14ff8a", emissiveIntensity: 2.2 });
const ledAmber = new MeshStandardMaterial({ color: "#ffb020", emissive: "#ffb020", emissiveIntensity: 2.2 });

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
    const g = new ExtrudeGeometry(s, { depth: BT, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 1, curveSegments: 12 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
}

const TRACES: { seg: [number, number, number, number]; phase: number }[] = [
  { seg: [-10, 2, 14, 2], phase: 0 }, { seg: [14, 2, 14, 17], phase: 0.12 }, { seg: [14, 17, 28, 17], phase: 0.24 },
  { seg: [14, 2, 14, -3], phase: 0.12 }, { seg: [14, -3, 30, -3], phase: 0.24 }, { seg: [-10, 2, -26, -6], phase: 0.1 },
  { seg: [-10, 2, -10, 20], phase: 0.1 }, { seg: [-10, 20, -22, 24], phase: 0.2 },
];

/** A metal USB-A receptacle on the right edge, with a dark cavity and a coloured tongue. */
function UsbPort({ z, y, tongue }: { z: number; y: number; tongue: MeshStandardMaterial }) {
  return (
    <group position={[36, TOP + y, z]}>
      <RoundedBox args={[17, 7.2, 14]} radius={0.5} smoothness={2} material={metal} />
      <mesh position={[8.6, 0, 0]} material={cavity}><boxGeometry args={[0.3, 5.2, 11.6]} /></mesh>
      <mesh position={[8.2, 0, 0]} material={tongue}><boxGeometry args={[0.5, 1.2, 9.6]} /></mesh>
    </group>
  );
}

export function PiBoard({ showHotspots }: { showHotspots: boolean }) {
  const pcb = usePcbGeometry();
  const silk = useMemo(() => makeSilkscreen(), []);
  const boardRef = useRef<Group>(null);
  const socRef = useRef<Group>(null);
  const coolerRef = useRef<Group>(null);
  const sdRef = useRef<Group>(null);
  const powerRef = useRef<Group>(null);
  const fanRef = useRef<Group>(null);
  const ethRef = useRef<Group>(null);
  const socMat = useRef<MeshStandardMaterial>(null);
  const gpio = useRef<InstancedMesh>(null);
  const traceMats = useMemo(() => TRACES.map(() => new MeshStandardMaterial({ color: "#1f7a4a", emissive: new Color("#7fb0ff"), emissiveIntensity: 0, roughness: 0.5 })), []);
  const glowColor = useMemo(() => new Color("#ffb347"), []);

  useEffect(() => {
    const m = gpio.current;
    if (!m) return;
    const o = new Object3D();
    let i = 0;
    for (let col = 0; col < 20; col++) {
      for (let row = 0; row < 2; row++) {
        o.position.set(-27.4 + 1.27 + col * 2.54, TOP + 4.6, -24 + (row === 0 ? -1.27 : 1.27));
        o.updateMatrix();
        m.setMatrixAt(i++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  const cables = useMemo(() => {
    const tube = (pts: [number, number, number][], r: number) =>
      new TubeGeometry(new CatmullRomCurve3(pts.map(([x, y, z]) => new Vector3(x, y, z))), 64, r, 12, false);
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
      socMat.current.emissiveIntensity = S.glow * (0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 3));
    }
    const t = state.clock.elapsedTime;
    traceMats.forEach((m, i) => {
      const wave = 0.5 + 0.5 * Math.sin(t * 7 - TRACES[i].phase * 28);
      m.emissiveIntensity = S.pulse * (0.2 + 2.6 * wave);
    });
  });

  const hx = (id: string, p: readonly [number, number, number]) => <Hotspot id={id} position={p} visible={showHotspots} />;

  return (
    <group ref={occluders.pi} position={[PI_POS[0], PI_POS[1], PI_POS[2]]} scale={PI_SCALE}>
      {/* rubber standoffs */}
      {([[-39, -24.5], [-39, 24.5], [19, -24.5], [19, 24.5]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, STANDOFF / 2, z]}>
          <cylinderGeometry args={[2.5, 2.8, STANDOFF, 20]} />
          <meshStandardMaterial color="#1b2230" roughness={0.7} />
        </mesh>
      ))}

      <group ref={boardRef} position={[0, STANDOFF, 0]}>
        {/* PCB: soldermask with silkscreen, copper detail and vias */}
        <mesh geometry={pcb}>
          <meshPhysicalMaterial color="#14693d" roughness={0.38} clearcoat={0.85} clearcoatRoughness={0.28} />
        </mesh>
        <mesh position={[0, TOP + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BW, BD]} />
          <meshBasicMaterial map={silk} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} toneMapped={false} side={DoubleSide} />
        </mesh>

        {/* glowing traces for the pulse */}
        {TRACES.map((t, i) => {
          const [x1, z1, x2, z2] = t.seg;
          const len = Math.hypot(x2 - x1, z2 - z1);
          return (
            <mesh key={i} material={traceMats[i]} position={[(x1 + x2) / 2, TOP + 0.1, (z1 + z2) / 2]} rotation={[0, -Math.atan2(z2 - z1, x2 - x1), 0]}>
              <boxGeometry args={[len, 0.16, 0.9]} />
            </mesh>
          );
        })}

        {/* chips */}
        <RoundedBox args={[12, 1.2, 12]} radius={0.35} smoothness={2} position={[-33, TOP + 0.6, -6]} material={blackPkg} />
        <RoundedBox args={[15, 1.3, 15]} radius={0.4} smoothness={2} position={[14, TOP + 0.65, -2]} material={blackPkg} />
        <RoundedBox args={[7, 0.9, 7]} radius={0.25} smoothness={2} position={[-28, TOP + 0.45, 16]} material={blackPkg} />
        <RoundedBox args={[10, 2.3, 10]} radius={0.3} smoothness={2} position={[-35, TOP + 1.15, -19]} material={darkMetal} />
        {[[-8, 14], [-3, 14], [3, 16], [9, 12], [20, 8], [-20, -10]].map(([x, z], i) => (
          <mesh key={i} position={[x, TOP + 0.35, z]} material={i % 2 ? gold : tongueBlack}><boxGeometry args={[2.2, 0.7, 1.2]} /></mesh>
        ))}

        {/* GPIO header */}
        <RoundedBox args={[50.8, 8.2, 5.1]} radius={0.3} smoothness={2} position={[-2, TOP + 4.1, -24]} material={plastic} />
        <instancedMesh ref={gpio} args={[undefined, undefined, 40]} material={gold}>
          <boxGeometry args={[0.64, 5, 0.64]} />
        </instancedMesh>

        {/* Ethernet RJ45 on the right edge, with contacts and link LEDs */}
        <group position={[34, TOP + 6.75, 17]}>
          <RoundedBox args={[21, 13.5, 16]} radius={0.5} smoothness={2} material={metal} />
          <mesh position={[10.6, -0.5, 0]} material={cavity}><boxGeometry args={[0.3, 9.4, 12.4]} /></mesh>
          <mesh position={[10, -2.2, 0]} material={tongueWhite}><boxGeometry args={[0.6, 4.6, 11]} /></mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[10.4, 0.6, -4.2 + i * 1.2]} material={gold}><boxGeometry args={[0.4, 3, 0.35]} /></mesh>
          ))}
          <mesh position={[10.6, 5.4, -4.5]} material={ledGreen}><boxGeometry args={[0.35, 1.2, 2]} /></mesh>
          <mesh position={[10.6, 5.4, 4.5]} material={ledAmber}><boxGeometry args={[0.35, 1.2, 2]} /></mesh>
        </group>
        <UsbPort z={-3} y={8} tongue={tongueBlack} />
        <UsbPort z={-20} y={8} tongue={tongueBlue} />
        <mesh position={[36, TOP + 8, -11.5]} material={darkMetal}><boxGeometry args={[17, 15, 0.8]} /></mesh>

        {/* Ethernet cable and plug: pulled out in chapter 4 */}
        <group ref={ethRef}>
          <RoundedBox args={[22, 11, 12]} radius={0.8} smoothness={3} position={[55, TOP + 6.2, 17]}>
            <meshPhysicalMaterial color="#e3e9f4" roughness={0.18} transmission={0.25} thickness={2} />
          </RoundedBox>
          <RoundedBox args={[10, 13, 14]} radius={1.2} smoothness={3} position={[62, TOP + 6.2, 17]}>
            <meshStandardMaterial color="#6a56f0" roughness={0.55} />
          </RoundedBox>
          <mesh geometry={cables.eth}><meshStandardMaterial color="#7a66ff" roughness={0.62} /></mesh>
        </group>

        {/* front edge: two micro-HDMI, flat-cable connectors */}
        {[-18, -5].map((x) => (
          <group key={x} position={[x, TOP + 1.6, 24.5]}>
            <RoundedBox args={[6.8, 3.3, 6.2]} radius={0.6} smoothness={2} material={metal} />
            <mesh position={[0, 0, 3.1]} material={cavity}><boxGeometry args={[4.8, 1.7, 0.2]} /></mesh>
          </group>
        ))}
        <RoundedBox args={[9, 2.6, 4]} radius={0.3} smoothness={2} position={[6, TOP + 1.3, 24.5]} material={plastic} />
        <RoundedBox args={[9, 2.6, 4]} radius={0.3} smoothness={2} position={[17, TOP + 1.3, 24.5]} material={plastic} />
        <mesh position={[-38, TOP + 1.2, 12]} material={plastic}><boxGeometry args={[4, 2.4, 4]} /></mesh>
        <mesh position={[-38, TOP + 2.5, 12]} material={ledGreen}><cylinderGeometry args={[0.9, 0.9, 0.4, 16]} /></mesh>

        {/* SoC heat spreader */}
        <group ref={socRef}>
          <RoundedBox args={[16, 2.4, 16]} radius={0.5} smoothness={3} position={[-10, TOP + 1.5, 2]}>
            <meshStandardMaterial ref={socMat} color="#dfe5f1" metalness={1} roughness={0.16} />
          </RoundedBox>
          {hx("soc", [-10, TOP + 7, 2])}
        </group>

        {/* active cooler: anodised heatsink, fin stack and a bladed fan */}
        <group ref={coolerRef}>
          <group position={[-10, TOP + 2.7, 2]}>
            <RoundedBox args={[30, 2.5, 30]} radius={0.6} smoothness={2} position={[0, 1.25, 0]} material={anodised} />
            {Array.from({ length: 13 }, (_, i) => (
              <mesh key={i} position={[-13.2 + i * 2.2, 5.1, 0]} material={anodised}><boxGeometry args={[0.7, 5.4, 28]} /></mesh>
            ))}
            <mesh position={[0, 8.6, 0]} material={plastic}><cylinderGeometry args={[12.2, 12.2, 3.6, 48]} /></mesh>
            <mesh position={[0, 10.5, 0]} rotation={[Math.PI / 2, 0, 0]} material={anodised}><torusGeometry args={[11.4, 0.9, 12, 48]} /></mesh>
            <group ref={fanRef} position={[0, 10.2, 0]}>
              {Array.from({ length: 11 }, (_, i) => {
                const a = (i * Math.PI * 2) / 11;
                return (
                  <mesh key={i} rotation={[0, a, 0.0]} position={[Math.cos(a) * 5.4, 0, -Math.sin(a) * 5.4]}>
                    <boxGeometry args={[8.6, 0.5, 3.6]} />
                    <meshStandardMaterial color="#1c2536" roughness={0.45} metalness={0.2} />
                  </mesh>
                );
              })}
              <mesh><cylinderGeometry args={[3.2, 3.2, 1.2, 28]} /><meshStandardMaterial color="#cfd7e6" metalness={1} roughness={0.22} /></mesh>
            </group>
            {hx("cooler", [0, 16, 0])}
          </group>
        </group>

        {/* microSD card, slides in underneath the left edge */}
        <group ref={sdRef}>
          <RoundedBox args={[15, 1, 11]} radius={0.35} smoothness={2} position={[-34, -1.5, 0]} material={plastic} />
          <mesh position={[-29, -1.5, 0]} material={gold}><boxGeometry args={[5, 1.05, 8]} /></mesh>
          <mesh position={[-36, -0.95, 0]} material={tongueBlue}><boxGeometry args={[7, 0.08, 6]} /></mesh>
          {hx("sd", [-36, -6, 0])}
        </group>

        {/* USB-C power plug on the front edge */}
        <group ref={powerRef}>
          <RoundedBox args={[9, 3.8, 8]} radius={1.2} smoothness={3} position={[-31, TOP + 1.9, 25.5]} material={metal} />
          <RoundedBox args={[15, 8, 14]} radius={1.6} smoothness={3} position={[-31, TOP + 1.9, 34]} material={plastic} />
          <mesh geometry={cables.power}><meshStandardMaterial color="#2a3345" roughness={0.75} /></mesh>
          {hx("power", [-31, TOP + 9, 36])}
        </group>
      </group>
    </group>
  );
}
