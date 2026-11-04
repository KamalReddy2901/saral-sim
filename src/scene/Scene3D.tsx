import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3, type PerspectiveCamera } from "three";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { detectCapabilities } from "../utils/capabilities";
import { Cards } from "./Cards";
import { CAMERA_POSES } from "./cameraPoses";
import { Display } from "./Display";
import { Lighting } from "./Lighting";
import { PiBoard } from "./PiBoard";
import { S, tween } from "./sceneState";
import { TokenStream } from "./TokenStream";
import { UsbStick } from "./UsbStick";

const EX_KEYS = ["board", "soc", "cooler", "sd", "power"] as const;

/** Maps store state (chapter, mode, run) to the mutable scene animation state. */
function useSceneDriver() {
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const cableOut = useStore((s) => s.cableOut);
  const runStatus = useStore((s) => s.runStatus);
  const runStage = useStore((s) => s.runStage);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const exploded = chapter === 2 || mode === "explore";
    EX_KEYS.forEach((k, i) => {
      tween(S.ex, { [k]: exploded ? 1 : 0 }, reduced, { duration: 1.5, delay: (exploded ? i : EX_KEYS.length - 1 - i) * 0.12 });
    });
  }, [chapter, mode, reduced]);

  useEffect(() => { tween(S, { usb: chapter >= 3 ? 1 : 0 }, reduced, { duration: 1.6 }); }, [chapter, reduced]);
  useEffect(() => { tween(S, { cable: cableOut ? 1 : 0 }, reduced, { duration: 1.2, ease: "power2.inOut" }); }, [cableOut, reduced]);

  useEffect(() => {
    const running = runStatus === "running";
    tween(S, { fan: running ? 1 : runStatus === "done" ? 0 : 0 }, reduced, { duration: running ? 1 : 2.5, ease: "power2.out" });
    tween(S, { glow: running ? 1 : runStatus === "done" ? 0.25 : 0 }, reduced, { duration: 0.8 });
    tween(S, { pulse: running ? 1 : 0 }, reduced, { duration: 0.6 });
  }, [runStatus, reduced]);

  useEffect(() => {
    const streaming = runStatus === "running" && runStage >= 1 && runStage <= 3;
    tween(S, { stream: streaming && !reduced ? 1 : 0 }, reduced, { duration: 0.6 });
  }, [runStatus, runStage, reduced]);

  useEffect(() => {
    if (runStatus === "idle") {
      gsap.killTweensOf(S, "cards,slot");
      S.cards = 0; S.slot = 0;
    } else if (runStatus === "running" && runStage >= 5) {
      tween(S, { cards: 1 }, reduced, { duration: 2.2, ease: "power2.out" });
    } else if (runStatus === "done") {
      gsap.killTweensOf(S, "cards,slot");
      if (reduced) { S.cards = 1; S.slot = 1; return; }
      gsap.to(S, { cards: 1, duration: 0.9, ease: "power2.out" });
      gsap.to(S, { slot: 1, duration: 1.1, delay: 1.7, ease: "power2.in" });
    }
  }, [runStatus, runStage, reduced]);
}

const fwd = new Vector3();
const rightV = new Vector3();
const upV = new Vector3();

function CameraRig() {
  const { camera, size } = useThree();
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const reduced = useStore((s) => s.reducedMotion);
  const rig = useRef({ pos: new Vector3(...CAMERA_POSES[0].position), tgt: new Vector3(...CAMERA_POSES[0].target), fov: CAMERA_POSES[0].fov, ox: 0, oy: 0 });
  const first = useRef(true);
  const lastFov = useRef(0);

  useEffect(() => {
    if (mode !== "guided") return;
    const pose = CAMERA_POSES[chapter];
    const mobile = size.width < 900;
    const ox = mobile ? 0 : pose.offsetX;
    const oy = mobile ? pose.offsetYMobile : 0;
    const r = rig.current;
    if (first.current) { r.ox = ox; r.oy = oy; }
    const instant = reduced || first.current;
    first.current = false;
    // start from the shown camera position (for example after leaving Explore mode)
    if (!instant && mode === "guided") r.pos.copy(camera.position);
    const o = { duration: 1.5, ease: "power3.inOut" };
    const ap = (t: object, p: Record<string, number>) => tween(t, p, instant, o);
    ap(r.pos, { x: pose.position[0], y: pose.position[1], z: pose.position[2] });
    ap(r.tgt, { x: pose.target[0], y: pose.target[1], z: pose.target[2] });
    ap(r, { fov: pose.fov, ox, oy });
  }, [chapter, mode, reduced, size.width, camera]);

  useFrame((state) => {
    if (mode !== "guided") return;
    const r = rig.current;
    // Portrait screens: back the camera off so the device still fits across the narrow width.
    const k = Math.max(1, 1.25 / (camera as PerspectiveCamera).aspect);
    camera.position.copy(r.pos);
    if (k > 1) camera.position.sub(r.tgt).multiplyScalar(k).add(r.tgt);
    if (!reduced && chapter === 0) { // slow idle drift in the hero shot
      camera.position.x += Math.sin(state.clock.elapsedTime * 0.25) * 1.4;
      camera.position.y += Math.sin(state.clock.elapsedTime * 0.18) * 0.5;
    }
    camera.lookAt(r.tgt);
    const cam = camera as unknown as { fov: number; aspect: number; updateProjectionMatrix: () => void };
    if (lastFov.current !== r.fov) { cam.fov = r.fov; cam.updateProjectionMatrix(); lastFov.current = r.fov; }
    // Shift the picture clear of the chapter panel by sliding the camera sideways (keeps the CSS3D display aligned).
    if (r.ox !== 0 || r.oy !== 0) {
      fwd.subVectors(r.tgt, camera.position);
      const h = 2 * fwd.length() * Math.tan((r.fov * Math.PI) / 360);
      camera.updateMatrixWorld();
      rightV.setFromMatrixColumn(camera.matrixWorld, 0);
      upV.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(rightV, r.ox * h * cam.aspect).addScaledVector(upV, -r.oy * h);
    }
  });
  return null;
}

function Controls() {
  const mode = useStore((s) => s.mode);
  if (mode !== "explore") return null;
  return (
    <OrbitControls
      makeDefault enableDamping dampingFactor={0.08} enablePan={false}
      minPolarAngle={0.25} maxPolarAngle={Math.PI / 2 - 0.04} minDistance={9} maxDistance={55}
      target={[-1, 4.5, 3]}
    />
  );
}

/** Flags the scene as ready after a few rendered frames (drives the loading veil) and enables shadows on every product mesh. */
function ReadySignal({ shadows }: { shadows: boolean }) {
  const { scene } = useThree();
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4) {
      if (shadows) {
        scene.traverse((o) => {
          const m = o as unknown as { isMesh?: boolean; castShadow: boolean; receiveShadow: boolean; userData: Record<string, boolean> };
          if (m.isMesh && !m.userData.noShadow) { m.castShadow = !m.userData.noCast; m.receiveShadow = true; }
        });
      }
    }
    if (frames.current === 8) useStore.setState({ sceneReady: true });
  });
  return null;
}

function SceneContents({ lowPower }: { lowPower: boolean }) {
  useSceneDriver();
  const reduced = useStore((s) => s.reducedMotion);
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const passage = useActivePassage();
  const showHotspots = chapter === 2 || mode === "explore";
  return (
    <>
      <color attach="background" args={["#0e1a2b"]} />
      <Lighting quality={lowPower ? "low" : "high"} reducedMotion={reduced} />
      <ReadySignal shadows={!lowPower} />
      <CameraRig />
      <Controls />
      <PiBoard showHotspots={showHotspots} />
      <Display showHotspots={showHotspots} interactive={chapter === 8} />
      <UsbStick showHotspots={showHotspots} />
      <TokenStream text={passage.text} />
      <Cards sentences={passage.easyRead} />
      {!lowPower && (
        <EffectComposer multisampling={4}>
          <Bloom intensity={0.6} luminanceThreshold={0.95} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </>
  );
}

export default function Scene3D() {
  const holder = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  const chapter = useStore((s) => s.chapter);
  const caps = useMemo(() => detectCapabilities(), []);

  useEffect(() => {
    const el = holder.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hiddenChapter = chapter === 1 || chapter >= 9;
  return (
    <div ref={holder} className="canvas-holder">
      <Canvas
        dpr={[1, caps.mobile ? 1.5 : 2]}
        camera={{ fov: 38, near: 0.5, far: 220, position: [15, 11, 24] }}
        shadows={!caps.lowPower}
        flat={!caps.lowPower}
        gl={{ antialias: !caps.lowPower, powerPreference: "high-performance" }}
        frameloop={onScreen && !hiddenChapter ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.domElement.setAttribute("aria-hidden", "true");
          gl.domElement.tabIndex = -1;
        }}
      >
        <SceneContents lowPower={caps.lowPower} />
      </Canvas>
    </div>
  );
}
