import { Environment, Lightformer, MeshReflectorMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { PointLight } from "three";
import { SOC_WORLD } from "./layout";
import { S } from "./sceneState";

/**
 * Studio lighting from procedural softboxes (no HDRI download, so no network request),
 * one shadow-casting key light, a cobalt rim, a warm fill, and a glossy reflective floor under a desk mat.
 */
export function Lighting({ quality, reducedMotion }: { quality: "high" | "low"; reducedMotion: boolean }) {
  const socLight = useRef<PointLight>(null);
  useFrame(() => { if (socLight.current) socLight.current.intensity = S.glow * 14; });
  const high = quality === "high";
  return (
    <>
      <Environment resolution={512} background={false} environmentIntensity={0.9}>
        {/* big overhead softbox */}
        <Lightformer form="rect" intensity={4.2} color="#ffffff" position={[0, 16, 4]} rotation-x={Math.PI / 2} scale={[34, 14, 1]} />
        {/* front key strip */}
        <Lightformer form="rect" intensity={3.2} color="#f3f6ff" position={[10, 7, 18]} rotation-y={0.4} scale={[18, 5, 1]} />
        {/* cobalt rim strips left and back */}
        <Lightformer form="rect" intensity={5.5} color="#3a64ff" position={[-18, 6, -4]} rotation-y={Math.PI / 2} scale={[22, 3, 1]} />
        <Lightformer form="rect" intensity={3.4} color="#3a64ff" position={[0, 8, -22]} scale={[30, 3, 1]} />
        {/* warm kicker */}
        <Lightformer form="rect" intensity={2.4} color="#ffcf8a" position={[20, 3, 2]} rotation-y={-Math.PI / 2} scale={[12, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[12, 24, 16]} intensity={2.4} color="#fff6ea" castShadow={high}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34}
        shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0003} shadow-normalBias={0.03} shadow-radius={6}
      />
      <directionalLight position={[-18, 8, -14]} intensity={2.6} color="#3a64ff" />
      <pointLight position={[0, 7, -2]} intensity={16} distance={32} decay={2} color="#ffe2a8" />
      <pointLight ref={socLight} position={[SOC_WORLD[0], SOC_WORLD[1] + 1.8, SOC_WORLD[2]]} intensity={0} distance={14} decay={2} color="#ffb347" />

      {/* glossy studio floor, fading into the background with fog */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.45, 0]} receiveShadow userData={{ noCast: true }}>
        <circleGeometry args={[120, 96]} />
        {high ? (
          <MeshReflectorMaterial
            blur={[260, 90]} resolution={768} mixBlur={1} mixStrength={14} mirror={0.55} roughness={0.9} depthScale={1.1}
            minDepthThreshold={0.4} maxDepthThreshold={1.5} color="#0c1626" metalness={0.6}
          />
        ) : (
          <meshStandardMaterial color="#0c1626" roughness={0.7} metalness={0.3} />
        )}
      </mesh>
      {/* desk mat the product sits on */}
      <RoundedBox args={[52, 0.5, 36]} radius={1.6} smoothness={3} position={[0, -0.25, 3]} receiveShadow userData={{ noCast: true }}>
        <meshStandardMaterial color="#1a2436" roughness={0.88} metalness={0.05} />
      </RoundedBox>
      <fog attach="fog" args={["#0b1424", 55, 150]} />
      {high && <Sparkles count={46} scale={[46, 22, 36]} position={[0, 10, 0]} size={2.2} speed={reducedMotion ? 0 : 0.22} opacity={0.4} color="#c9d8ff" noise={0.6} />}
    </>
  );
}
