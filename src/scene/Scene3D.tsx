import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Vector3, type PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { detectCapabilities } from "../utils/capabilities";
import { BACKDROPS, GLOWS } from "./backdrops";
import { Cards } from "./Cards";
import { CAMERA_POSES } from "./cameraPoses";
import { Display } from "./Display";
import { useHotspot } from "./hotspotStore";
import { PART_IDS } from "./interactions";
import { Lighting } from "./Lighting";
import { PiBoard } from "./PiBoard";
import { S, tween } from "./sceneState";
import { TokenStream } from "./TokenStream";
import { UsbStick } from "./UsbStick";

if (import.meta.env.DEV) (window as unknown as { __S: typeof S }).__S = S;
const EX_KEYS = ["board", "soc", "cooler", "sd", "power"] as const;
const bgColor = new Color();

/** Maps store state (chapter, mode, run) to the mutable scene animation state. */
function useSceneDriver() {
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const cableOut = useStore((s) => s.cableOut);
  const runStatus = useStore((s) => s.runStatus);
  const runStage = useStore((s) => s.runStage);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    bgColor.set(BACKDROPS[chapter]);
    tween(S.bg, { r: bgColor.r, g: bgColor.g, b: bgColor.b }, reduced, { duration: 1.1, ease: "power2.inOut" });
    bgColor.set(GLOWS[chapter]);
    tween(S.glowCol, { r: bgColor.r, g: bgColor.g, b: bgColor.b }, reduced, { duration: 1.1, ease: "power2.inOut" });
    if (!reduced) { S.scan = 0; gsap.to(S, { scan: 1, duration: 1.6, ease: "power1.inOut" }); }
  }, [chapter, reduced]);

  useEffect(() => {
    const exploded = chapter === 2 || mode === "explore";
    if (mode === "explore") useHotspot.getState().setExplode(1);
    EX_KEYS.forEach((k, i) => {
      tween(S.ex, { [k]: exploded ? 1 : 0 }, reduced, { duration: 1.5, delay: (exploded ? i : EX_KEYS.length - 1 - i) * 0.12 });
    });
  }, [chapter, mode, reduced]);

  useEffect(() => { tween(S, { usb: chapter >= 3 ? 1 : 0 }, reduced, { duration: 1.6 }); }, [chapter, reduced]);
  useEffect(() => { tween(S, { away: chapter === 8 ? 1 : 0 }, reduced, { duration: 1.4, ease: "power3.inOut" }); }, [chapter, reduced]);
  useEffect(() => { tween(S, { cable: cableOut ? 1 : 0 }, reduced, { duration: 1.2, ease: "power2.inOut" }); }, [cableOut, reduced]);

  useEffect(() => {
    const running = runStatus === "running";
    tween(S, { fan: running ? 1 : 0 }, reduced, { duration: running ? 1 : 2.5, ease: "power2.out" });
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
      gsap.to(S, { slot: 1, duration: 1.1, delay: 3.6, ease: "power2.in" });
    }
  }, [runStatus, runStage, reduced]);
}

/** Smooths each part's hover amount, so lifts ease in and out. */
function HoverDriver() {
  const hover = useRef<string | null>(null);
  useEffect(() => useHotspot.subscribe((s) => { hover.current = s.hover; }), []);
  useFrame(() => {
    for (const id of PART_IDS) {
      const cur = S.hov[id] ?? 0;
      S.hov[id] = cur + ((hover.current === id ? 1 : 0) - cur) * 0.2;
    }
  });
  return null;
}

const fwd = new Vector3();
const rightV = new Vector3();
const upV = new Vector3();

function CameraRig() {
  const { camera, size, pointer } = useThree();
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const reduced = useStore((s) => s.reducedMotion);
  const rig = useRef({ pos: new Vector3(...CAMERA_POSES[0].position), tgt: new Vector3(...CAMERA_POSES[0].target), fov: CAMERA_POSES[0].fov, ox: 0, oy: 0 });
  const first = useRef(true);
  const lastFov = useRef(0);
  const par = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (mode !== "guided") return;
    const pose = CAMERA_POSES[chapter];
    const mobile = size.width < 600;
    const ox = mobile ? 0 : pose.offsetX;
    const oy = mobile ? pose.offsetYMobile : pose.offsetY ?? 0;
    const r = rig.current;
    if (first.current) { r.ox = ox; r.oy = oy; }
    const instant = reduced || first.current;
    first.current = false;
    if (!instant) r.pos.copy(camera.position);
    const o = { duration: 1.5, ease: "power3.inOut" };
    const ap = (t: object, p: Record<string, number>) => tween(t, p, instant, o);
    ap(r.pos, { x: pose.position[0], y: pose.position[1], z: pose.position[2] });
    ap(r.tgt, { x: pose.target[0], y: pose.target[1], z: pose.target[2] });
    ap(r, { fov: pose.fov, ox, oy });
  }, [chapter, mode, reduced, size.width, camera]);

  useFrame((state) => {
    if (mode !== "guided") return;
    const r = rig.current;
    const k = Math.max(1, 1.25 / (camera as PerspectiveCamera).aspect);
    camera.position.copy(r.pos);
    if (k > 1) camera.position.sub(r.tgt).multiplyScalar(k).add(r.tgt);
    camera.lookAt(r.tgt);
    const cam = camera as unknown as { fov: number; aspect: number; updateProjectionMatrix: () => void };
    if (lastFov.current !== r.fov) { cam.fov = r.fov; cam.updateProjectionMatrix(); lastFov.current = r.fov; }
    camera.updateMatrixWorld();
    rightV.setFromMatrixColumn(camera.matrixWorld, 0);
    upV.setFromMatrixColumn(camera.matrixWorld, 1);
    fwd.subVectors(r.tgt, camera.position);
    const h = 2 * fwd.length() * Math.tan((r.fov * Math.PI) / 360);
    // sideways slide keeps the product clear of the chapter panel
    if (r.ox !== 0 || r.oy !== 0) camera.position.addScaledVector(rightV, r.ox * h * cam.aspect).addScaledVector(upV, -r.oy * h);
    // the picture leans a little toward the pointer, so the model feels physical
    if (!reduced) {
      par.current.x += (pointer.x - par.current.x) * 0.05;
      par.current.y += (pointer.y - par.current.y) * 0.05;
      camera.position.addScaledVector(rightV, par.current.x * h * 0.05).addScaledVector(upV, par.current.y * h * 0.035);
      if (chapter === 0) {
        camera.position.x += Math.sin(state.clock.elapsedTime * 0.25) * 1.0;
        camera.position.y += Math.sin(state.clock.elapsedTime * 0.18) * 0.4;
      }
      camera.lookAt(r.tgt);
    }
  });

  useEffect(() => {
    if (mode === "explore") (camera as unknown as { clearViewOffset: () => void }).clearViewOffset();
  }, [mode, camera]);
  return null;
}

function Controls() {
  const mode = useStore((s) => s.mode);
  const focus = useHotspot((s) => s.focus);
  const viewReset = useHotspot((s) => s.viewReset);
  const { camera } = useThree();
  const ref = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || !focus) return;
    gsap.to(c.target, { x: focus[0], y: focus[1], z: focus[2], duration: 0.9, ease: "power3.inOut" });
    const dir = camera.position.clone().sub(c.target).normalize();
    const dist = Math.max(11, Math.min(camera.position.distanceTo(c.target), 26));
    gsap.to(camera.position, { x: focus[0] + dir.x * dist, y: focus[1] + dir.y * dist, z: focus[2] + dir.z * dist, duration: 0.9, ease: "power3.inOut" });
  }, [focus, camera]);

  useEffect(() => {
    const c = ref.current;
    if (!c || viewReset === 0) return;
    const p = CAMERA_POSES[2];
    gsap.to(c.target, { x: -2, y: 5, z: 4, duration: 1, ease: "power3.inOut" });
    gsap.to(camera.position, { x: p.position[0], y: p.position[1], z: p.position[2], duration: 1, ease: "power3.inOut" });
  }, [viewReset, camera]);

  if (mode !== "explore") return null;
  return (
    <OrbitControls
      ref={ref as never} makeDefault enableDamping dampingFactor={0.08} enablePan={false}
      minPolarAngle={0.25} maxPolarAngle={Math.PI / 2 - 0.04} minDistance={8} maxDistance={60} target={[-2, 5, 4]}
    />
  );
}

/** Flags the scene as ready after a few frames (drives the loading veil) and enables shadows on every product mesh. */
function ReadySignal({ shadows }: { shadows: boolean }) {
  const { scene } = useThree();
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 4 && shadows) {
      scene.traverse((o) => {
        const m = o as unknown as { isMesh?: boolean; castShadow: boolean; receiveShadow: boolean; userData: Record<string, boolean> };
        if (m.isMesh && !m.userData.noShadow && !m.userData.shadowCatcher) { m.castShadow = !m.userData.noCast; m.receiveShadow = true; }
      });
    }
    if (frames.current === 8) useStore.setState({ sceneReady: true });
  });
  return null;
}

function SceneContents({ lowPower }: { lowPower: boolean }) {
  useSceneDriver();
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const passage = useActivePassage();
  const reduced = useStore((s) => s.reducedMotion);
  const showHotspots = chapter === 2 || mode === "explore";
  return (
    <>
      <Lighting quality={lowPower ? "low" : "high"} reducedMotion={reduced} />
      <ReadySignal shadows={!lowPower} />
      <HoverDriver />
      <CameraRig />
      <Controls />
      <PiBoard showHotspots={showHotspots} />
      <Display showHotspots={showHotspots} interactive={chapter === 8} />
      <UsbStick showHotspots={showHotspots} />
      <TokenStream text={passage.text} />
      <Cards sentences={passage.easyRead} />
      {!lowPower && (
        <EffectComposer multisampling={2}>
          <Bloom intensity={0.55} luminanceThreshold={0.85} luminanceSmoothing={0.25} mipmapBlur radius={0.6} />
          <Vignette eskil={false} offset={0.3} darkness={0.55} />
          <Noise opacity={0.025} blendFunction={BlendFunction.SOFT_LIGHT} />
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
        dpr={[1, caps.mobile ? 1.25 : 1.5]}
        camera={{ fov: 38, near: 0.5, far: 260, position: [23, 17, 44] }}
        shadows={!caps.lowPower}
        flat
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
