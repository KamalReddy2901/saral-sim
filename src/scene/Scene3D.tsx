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
const UP = new Vector3(0, 1, 0);

interface Home { pos: Vector3; tgt: Vector3; fov: number }

/** Camera pose for a chapter, shifted so the product sits clear of the briefing card, and backed off on portrait screens. */
function homeFor(chapter: number, width: number, height: number): Home {
  const pose = CAMERA_POSES[chapter];
  const aspect = width / Math.max(1, height);
  const mobile = width < 600;
  const tgt = new Vector3(...pose.target);
  const pos = new Vector3(...pose.position);
  const k = Math.max(1, 1.25 / aspect);
  if (k > 1) pos.sub(tgt).multiplyScalar(k).add(tgt);
  fwd.subVectors(tgt, pos);
  const h = 2 * fwd.length() * Math.tan((pose.fov * Math.PI) / 360);
  fwd.normalize();
  rightV.crossVectors(fwd, UP).normalize();
  upV.crossVectors(rightV, fwd).normalize();
  const ox = mobile ? 0 : pose.offsetX;
  const oy = mobile ? pose.offsetYMobile : pose.offsetY ?? 0;
  const shift = new Vector3().addScaledVector(rightV, ox * h * aspect).addScaledVector(upV, -oy * h);
  return { pos: pos.add(shift), tgt: tgt.add(shift), fov: pose.fov };
}

/**
 * One OrbitControls for everything. Guided mode: drag to look around within a tight range around the chapter's
 * pose, and the view eases back when you let go. Explore mode: free orbit. Chapter changes glide the camera.
 */
function CameraControls() {
  const { camera, size } = useThree();
  const chapter = useStore((s) => s.chapter);
  const mode = useStore((s) => s.mode);
  const reduced = useStore((s) => s.reducedMotion);
  const focus = useHotspot((s) => s.focus);
  const viewReset = useHotspot((s) => s.viewReset);
  const ref = useRef<OrbitControlsImpl | null>(null);
  const home = useRef<Home>(homeFor(chapter, size.width, size.height));
  const first = useRef(true);
  const timer = useRef<number>(0);
  const cam = camera as PerspectiveCamera;
  if (import.meta.env.DEV) (window as unknown as { __cam: unknown }).__cam = camera;

  const applyLimits = (c: OrbitControlsImpl, h: Home) => {
    if (mode === "explore") {
      c.minAzimuthAngle = -Infinity; c.maxAzimuthAngle = Infinity;
      c.minPolarAngle = 0.2; c.maxPolarAngle = Math.PI / 2 - 0.03;
      c.minDistance = 8; c.maxDistance = 70;
      return;
    }
    const off = h.pos.clone().sub(h.tgt);
    const d = off.length();
    const az = Math.atan2(off.x, off.z);
    const pol = Math.acos(Math.min(1, Math.max(-1, off.y / d)));
    c.minAzimuthAngle = az - 0.75; c.maxAzimuthAngle = az + 0.75;
    c.minPolarAngle = Math.max(0.2, pol - 0.4); c.maxPolarAngle = Math.min(Math.PI / 2 - 0.03, pol + 0.4);
    c.minDistance = d * 0.55; c.maxDistance = d * 1.45;
  };

  const glideTo = (h: Home, instant: boolean, duration = 1.4) => {
    const c = ref.current;
    if (!c) return;
    gsap.killTweensOf(camera.position); gsap.killTweensOf(c.target); gsap.killTweensOf(cam);
    applyLimits(c, h);
    if (instant) {
      camera.position.copy(h.pos); c.target.copy(h.tgt); cam.fov = h.fov; cam.updateProjectionMatrix(); c.update();
      return;
    }
    const ease = "power3.inOut";
    gsap.to(camera.position, { x: h.pos.x, y: h.pos.y, z: h.pos.z, duration, ease });
    gsap.to(c.target, { x: h.tgt.x, y: h.tgt.y, z: h.tgt.z, duration, ease });
    gsap.to(cam, { fov: h.fov, duration, ease, onUpdate: () => cam.updateProjectionMatrix() });
  };

  // chapter, mode or size changed: fly to the chapter pose
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const h = homeFor(chapter, size.width, size.height);
    home.current = h;
    const instant = reduced || first.current;
    first.current = false;
    glideTo(h, instant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, mode, reduced, size.width, size.height]);

  // guided mode: after the visitor lets go, ease back to the pose
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const onStart = () => { window.clearTimeout(timer.current); gsap.killTweensOf(camera.position); gsap.killTweensOf(c.target); };
    const onEnd = () => {
      if (mode === "explore" || reduced) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => glideTo(home.current, false, 1.1), 1800);
    };
    c.addEventListener("start", onStart);
    c.addEventListener("end", onEnd);
    return () => { c.removeEventListener("start", onStart); c.removeEventListener("end", onEnd); window.clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reduced]);

  // explore: click a part to fly to it
  useEffect(() => {
    const c = ref.current;
    if (!c || !focus || mode !== "explore") return;
    const dir = camera.position.clone().sub(c.target).normalize();
    const dist = Math.max(11, Math.min(camera.position.distanceTo(c.target), 26));
    gsap.to(c.target, { x: focus[0], y: focus[1], z: focus[2], duration: 0.9, ease: "power3.inOut" });
    gsap.to(camera.position, { x: focus[0] + dir.x * dist, y: focus[1] + dir.y * dist, z: focus[2] + dir.z * dist, duration: 0.9, ease: "power3.inOut" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  useEffect(() => {
    if (viewReset === 0) return;
    glideTo(home.current, reduced, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewReset]);

  return (
    <OrbitControls
      ref={ref as never} makeDefault enableDamping dampingFactor={0.09} enablePan={false}
      rotateSpeed={0.65} zoomSpeed={0.7} screenSpacePanning={false}
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
      <CameraControls />
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
