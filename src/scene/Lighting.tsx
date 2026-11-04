import { Environment, Lightformer, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useMemo } from "react";
import { AdditiveBlending, CanvasTexture, SRGBColorSpace, type PointLight } from "three";
import { SOC_WORLD } from "./layout";
import { S } from "./sceneState";

/**
 * Studio lighting from procedural softboxes (no HDRI download, so no network request),
 * one shadow-casting key light, a cobalt rim, a warm fill, and a glossy reflective floor under a desk mat.
 */
export function Lighting({ quality, reducedMotion }: { quality: "high" | "low"; reducedMotion: boolean }) {
  const socLight = useRef<PointLight>(null);
  const pool = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(150,130,255,0.42)"); gr.addColorStop(0.5, "rgba(120,100,230,0.14)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace; return tex;
  }, []);
  useFrame(() => { if (socLight.current) socLight.current.intensity = S.glow * 14; });
  const high = quality === "high";
  return (
    <>
      <Environment resolution={512} background={false} environmentIntensity={1.5}>
        {/* big overhead softbox */}
        <Lightformer form="rect" intensity={4.2} color="#ffffff" position={[0, 16, 4]} rotation-x={Math.PI / 2} scale={[34, 14, 1]} />
        {/* front key strip */}
        <Lightformer form="rect" intensity={3.2} color="#f3f6ff" position={[10, 7, 18]} rotation-y={0.4} scale={[18, 5, 1]} />
        {/* cobalt rim strips left and back */}
        <Lightformer form="rect" intensity={5.5} color="#8f7dff" position={[-18, 6, -4]} rotation-y={Math.PI / 2} scale={[22, 3, 1]} />
        <Lightformer form="rect" intensity={3.4} color="#8f7dff" position={[0, 8, -22]} scale={[30, 3, 1]} />
        {/* warm kicker */}
        <Lightformer form="rect" intensity={2.4} color="#ffb48a" position={[20, 3, 2]} rotation-y={-Math.PI / 2} scale={[12, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.12} />
      <directionalLight
        position={[12, 24, 16]} intensity={3.4} color="#fff6ea" castShadow={high}
        shadow-mapSize={[1536, 1536]} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34}
        shadow-camera-near={1} shadow-camera-far={90} shadow-bias={-0.0003} shadow-normalBias={0.03} shadow-radius={6}
      />
      <directionalLight position={[-18, 8, -14]} intensity={2.6} color="#8f7dff" />
      <pointLight position={[0, 7, -2]} intensity={16} distance={32} decay={2} color="#ffe2a8" />
      <pointLight ref={socLight} position={[SOC_WORLD[0], SOC_WORLD[1] + 1.8, SOC_WORLD[2]]} intensity={0} distance={14} decay={2} color="#ffb347" />

      {/* glossy studio floor, fading into the background with fog */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow userData={{ noCast: true }}>
        <circleGeometry args={[120, 96]} />
        {high ? (
          <MeshReflectorMaterial
            blur={[260, 90]} resolution={512} mixBlur={1} mixStrength={14} mirror={0.55} roughness={0.9} depthScale={1.1}
            minDepthThreshold={0.4} maxDepthThreshold={1.5} color="#0a0a0f" metalness={0.6}
          />
        ) : (
          <meshStandardMaterial color="#0a0a0f" roughness={0.7} metalness={0.3} />
        )}
      </mesh>
      {/* soft pool of light under the product */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 2]} userData={{ noShadow: true }}>
        <planeGeometry args={[70, 70]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <fog attach="fog" args={["#09090b", 55, 150]} />
      {high && <Sparkles count={46} scale={[46, 22, 36]} position={[0, 10, 0]} size={2.2} speed={reducedMotion ? 0 : 0.22} opacity={0.4} color="#c9d8ff" noise={0.6} />}
    </>
  );
}
