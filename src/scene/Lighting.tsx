import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { PointLight } from "three";
import { SOC_WORLD } from "./layout";
import { S } from "./sceneState";

/** Studio lighting from procedural light panels. No HDRI download, so no network request. */
export function Lighting({ shadows }: { shadows: boolean }) {
  const socLight = useRef<PointLight>(null);
  useFrame(() => { if (socLight.current) socLight.current.intensity = S.glow * 9; });
  return (
    <>
      <Environment resolution={256} background={false} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 8, 8]} scale={[16, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#2f5bea" position={[-10, 4, -6]} rotation-y={Math.PI / 2} scale={[14, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffd98a" position={[10, 2, 2]} rotation-y={-Math.PI / 2} scale={[8, 5, 1]} />
        <Lightformer form="circle" intensity={1.6} color="#ffffff" position={[0, 14, -2]} rotation-x={Math.PI / 2} scale={10} />
      </Environment>
      <ambientLight intensity={0.28} />
      {/* key */}
      <directionalLight position={[8, 16, 12]} intensity={2.1} color="#ffffff" />
      {/* cobalt rim */}
      <directionalLight position={[-14, 7, -12]} intensity={2.4} color="#2f5bea" />
      {/* warm fill from the screen glow */}
      <pointLight position={[0, 7, -2]} intensity={14} distance={30} decay={2} color="#ffe2a8" />
      <pointLight ref={socLight} position={[SOC_WORLD[0], SOC_WORLD[1] + 1.5, SOC_WORLD[2]]} intensity={0} distance={12} decay={2} color="#ffb347" />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
        <circleGeometry args={[46, 64]} />
        <meshStandardMaterial color="#14243b" roughness={0.9} metalness={0.05} />
      </mesh>
      {shadows && <ContactShadows position={[0, 0.01, 2]} opacity={0.55} scale={46} blur={2.6} far={9} resolution={512} frames={Infinity} color="#02060d" />}
    </>
  );
}
