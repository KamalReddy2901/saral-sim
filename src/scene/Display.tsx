import { Html, RoundedBox } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { LearnerApp } from "../learner/LearnerApp";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { Hotspot } from "./Hotspot";
import { occluders } from "./hotspotStore";
import { DISPLAY_POS, DISPLAY_TILT, EMBED_H, EMBED_W, SCREEN_H, SCREEN_W } from "./layout";

/** Scale from CSS pixels to scene units for <Html transform>. Calibrated so EMBED_W px spans SCREEN_W cm. */
const HTML_SCALE = (SCREEN_W / EMBED_W) * 40; // drei maps 1 world unit to 40 CSS px at scale 1 when no distanceFactor is set

export function Display({ showHotspots, interactive }: { showHotspots: boolean; interactive: boolean }) {
  const passage = useActivePassage();
  const settings = useStore((s) => s.learner);
  const setLearner = useStore((s) => s.setLearner);
  const key = useStore((s) => s.learnerKey);
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
      {/* bezel and glass */}
      <RoundedBox args={[SCREEN_W + 1.6, SCREEN_H + 1.6, 1.1]} radius={0.45} smoothness={4}>
        <meshPhysicalMaterial color="#0b121d" roughness={0.38} metalness={0.2} clearcoat={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.56]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbfcff" emissiveIntensity={0.9} />
      </mesh>
      <Html transform occlude={[occluders.pi, occluders.usb]} position={[0, 0, 0.6]} scale={HTML_SCALE} zIndexRange={[5, 0]} style={{ pointerEvents: interactive ? "auto" : "none" }} className="html-learner">
        <div ref={wrap} className="embedded-learner" style={{ width: EMBED_W, height: EMBED_H }}>
          <LearnerApp key={key} passage={passage} settings={settings} onSettingsChange={setLearner} manageFocus={interactive} />
        </div>
      </Html>
      {/* stand */}
      <mesh position={[0, -0.9, -2.7]} rotation={[0.62, 0, 0]}>
        <boxGeometry args={[11, 9.6, 0.8]} />
        <meshPhysicalMaterial color="#1a2638" roughness={0.45} metalness={0.4} />
      </mesh>
      <mesh position={[0, -5.9, 0.9]}>
        <boxGeometry args={[13, 0.5, 6.5]} />
        <meshPhysicalMaterial color="#1a2638" roughness={0.45} metalness={0.4} />
      </mesh>
      {showHotspots && (
        <>
          <Hotspot id="display" position={[SCREEN_W / 2 + 1.2, SCREEN_H / 2 + 1, 1]} visible />
          <Hotspot id="stand" position={[0, -3, -4]} visible />
        </>
      )}
    </group>
  );
}
