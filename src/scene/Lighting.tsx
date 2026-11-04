import { Environment, Grid, Lightformer, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, Fog, type MeshStandardMaterial, type PointLight } from "three";
import { EnergyRings, LightPool, ScanWall } from "./Fx";
import { SOC_WORLD } from "./layout";
import { S } from "./sceneState";

const tmp = new Color();

/**
 * Dark instrument-room lighting: dim white softboxes, a yellow strip on one side, a teal strip on the other,
 * a glossy floor with a fading grid, and an accent pool whose colour follows the chapter.
 */
export function Lighting({ quality, reducedMotion }: { quality: "high" | "low"; reducedMotion: boolean }) {
  const { scene } = useThree();
  const accent = useRef<PointLight>(null);
  const socLight = useRef<PointLight>(null);
  const floor = useRef<MeshStandardMaterial>(null);
  const high = quality === "high";

  useEffect(() => {
    scene.background = new Color("#06070d");
    scene.fog = new Fog("#06070d", 60, 170);
    return () => { scene.background = null; scene.fog = null; };
  }, [scene]);

  useFrame(() => {
    tmp.setRGB(S.bg.r, S.bg.g, S.bg.b);
    (scene.background as Color | null)?.copy(tmp);
    scene.fog?.color.copy(tmp);
    floor.current?.color.copy(tmp);
    accent.current?.color.setRGB(S.glowCol.r, S.glowCol.g, S.glowCol.b);
    if (socLight.current) socLight.current.intensity = S.glow * 22;
  });

  return (
    <>
      <Environment resolution={512} background={false} environmentIntensity={0.75}>
        <Lightformer form="rect" intensity={2.6} color="#dfe6ff" position={[0, 18, 4]} rotation-x={Math.PI / 2} scale={[40, 14, 1]} />
        <Lightformer form="rect" intensity={7} color="#ffc933" position={[-22, 6, 6]} rotation-y={Math.PI / 2} scale={[26, 3, 1]} />
        <Lightformer form="rect" intensity={7} color="#4de1d2" position={[22, 6, -4]} rotation-y={-Math.PI / 2} scale={[26, 3, 1]} />
        <Lightformer form="rect" intensity={4} color="#3b6bff" position={[0, 7, -26]} scale={[36, 4, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[12, 9, 22]} rotation-y={0.4} scale={[14, 5, 1]} />
      </Environment>
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[-12, 26, 18]} intensity={2.2} color="#f4f6ff" castShadow={high}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-34} shadow-camera-right={34} shadow-camera-top={34} shadow-camera-bottom={-34}
        shadow-camera-near={1} shadow-camera-far={100} shadow-bias={-0.0003} shadow-normalBias={0.03} shadow-radius={6}
      />
      <pointLight ref={accent} position={[-14, 5, 12]} intensity={90} distance={55} decay={2} color="#ffc933" />
      <pointLight position={[16, 6, -6]} intensity={40} distance={45} decay={2} color="#4de1d2" />
      <pointLight ref={socLight} position={[SOC_WORLD[0], SOC_WORLD[1] + 1.8, SOC_WORLD[2]]} intensity={0} distance={16} decay={2} color="#ffb347" />

      {/* glossy floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow userData={{ noCast: true }}>
        <circleGeometry args={[220, 64]} />
        {high ? (
          <MeshReflectorMaterial
            ref={floor as never} blur={[320, 110]} resolution={384} mixBlur={1.1} mixStrength={16} mirror={0.7} roughness={0.85} depthScale={1.2}
            minDepthThreshold={0.4} maxDepthThreshold={1.5} color="#06070d" metalness={0.7}
          />
        ) : (
          <meshStandardMaterial ref={floor} color="#06070d" roughness={0.5} metalness={0.6} />
        )}
      </mesh>
      <Grid position={[0, 0.02, 0]} args={[200, 200]} cellSize={1} cellThickness={0.5} cellColor="#233156" sectionSize={6} sectionThickness={1} sectionColor="#3a5190" fadeDistance={58} fadeStrength={1.6} infiniteGrid userData={{ noShadow: true }} />
      <LightPool />
      <ScanWall />
      <EnergyRings />
      {high && <Sparkles count={70} scale={[50, 24, 40]} position={[0, 11, 2]} size={2.4} speed={reducedMotion ? 0 : 0.25} opacity={0.5} color="#bcd0ff" noise={0.7} />}
    </>
  );
}
