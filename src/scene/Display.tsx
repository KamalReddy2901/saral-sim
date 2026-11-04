import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { LearnerApp } from "../learner/LearnerApp";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { Hotspot } from "./Hotspot";
import { partHandlers } from "./interactions";
import { S } from "./sceneState";
import { occluders } from "./hotspotStore";
import { DISPLAY_POS, DISPLAY_TILT, EMBED_H, EMBED_W, SCREEN_H, SCREEN_W } from "./layout";

/** Scale from CSS pixels to scene units for <Html transform>. Calibrated so EMBED_W px spans SCREEN_W cm. */
const HTML_SCALE = (SCREEN_W / EMBED_W) * 40; // drei maps 1 world unit to 40 CSS px at scale 1 when no distanceFactor is set

export function Display({ showHotspots, interactive }: { showHotspots: boolean; interactive: boolean }) {
  const lift = useRef<Group>(null);
  useFrame(() => { if (lift.current) lift.current.position.y = (S.hov.display ?? 0) * 0.6; });
  const passage = useActivePassage();
  const settings = useStore((s) => s.learner);
  const setLearner = useStore((s) => s.setLearner);
  const key = useStore((s) => s.learnerKey);
  const dim = useStore((s) => s.chapter === 4);
  const wrap = useRef<HTMLDivElement>(null);

  // The embedded learner is only in the tab order and reachable by assistive tech in chapter 8.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (interactive) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [interactive]);

  return (
    <group position={[DISPLAY_POS[0], DISPLAY_POS[1], DISPLAY_POS[2]]} rotation={[DISPLAY_TILT, 0, 0]}>
     <group ref={lift} {...partHandlers("display")}>
      {/* aluminium back shell, black front bezel and a thin lit edge */}
      <RoundedBox args={[SCREEN_W + 1.9, SCREEN_H + 1.9, 1.3]} radius={0.75} smoothness={5} position={[0, 0, -0.15]}>
        <meshPhysicalMaterial color="#aeb7c7" metalness={1} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[SCREEN_W + 1.5, SCREEN_H + 1.5, 0.5]} radius={0.6} smoothness={5} position={[0, 0, 0.45]}>
        <meshPhysicalMaterial color="#05080d" roughness={0.22} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>
      <mesh position={[0, 0, 0.72]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbfcff" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -(SCREEN_H / 2 + 0.55), 0.72]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial color="#14ff8a" emissive="#14ff8a" emissiveIntensity={2} />
      </mesh>
      <Html transform occlude={[occluders.pi, occluders.usb]} position={[0, 0, 0.76]} scale={HTML_SCALE} zIndexRange={[5, 0]} style={{ pointerEvents: interactive ? "auto" : "none", opacity: dim ? 0.18 : 1, transition: "opacity 0.6s" }} className="html-learner">
        <div ref={wrap} className="embedded-learner" style={{ width: EMBED_W, height: EMBED_H }}>
          <LearnerApp key={key} passage={passage} settings={settings} onSettingsChange={setLearner} manageFocus={interactive} />
          <span className="glass-glare" aria-hidden="true" />
        </div>
      </Html>
     </group>
      {/* stand: angled aluminium kickstand and a weighted base */}
      <RoundedBox args={[10.5, 9.8, 0.9]} radius={0.35} smoothness={3} position={[0, -0.9, -2.8]} rotation={[0.62, 0, 0]}>
        <meshPhysicalMaterial color="#8d97a8" metalness={1} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[13.5, 0.7, 6.8]} radius={0.3} smoothness={3} position={[0, -5.95, 0.9]}>
        <meshPhysicalMaterial color="#8d97a8" metalness={1} roughness={0.34} />
      </RoundedBox>
      <mesh position={[0, -5.5, 4.3]}><boxGeometry args={[12, 0.14, 0.14]} /><meshStandardMaterial color="#ffc933" emissive="#ffc933" emissiveIntensity={3} /></mesh>
      {[-5.2, 5.2].map((x) => (
        <mesh key={x} position={[x, -6.4, 3.2]}><cylinderGeometry args={[0.55, 0.6, 0.25, 20]} /><meshStandardMaterial color="#0b0f17" roughness={0.9} /></mesh>
      ))}
      {showHotspots && (
        <>
          <Hotspot id="display" position={[SCREEN_W / 2 + 1.2, SCREEN_H / 2 + 1, 1]} visible />
          <Hotspot id="stand" position={[0, -3, -4]} visible />
        </>
      )}
    </group>
  );
}
