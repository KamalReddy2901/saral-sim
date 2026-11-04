import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { Hotspot } from "./Hotspot";
import { occluders } from "./hotspotStore";
import { PI_POS, PI_SCALE } from "./layout";
import { S } from "./sceneState";

// The stick approaches the Pi's right edge (USB ports) from +x. Plugged-in position puts the metal tip at the port mouth.
const PORT_X = PI_POS[0] + 45 * PI_SCALE;
const PORT_Z = PI_POS[2] + -3 * PI_SCALE;
const PORT_Y = PI_POS[1] + (4 + 1.6 + 8) * PI_SCALE;
const LENGTH = 6.4;

export function UsbStick({ showHotspots }: { showHotspots: boolean }) {
  const ref = useRef<Group>(null);
  useEffect(() => { (occluders.usb as { current: Group | null }).current = ref.current; }, []);
  useFrame(() => {
    if (!ref.current) return;
    // rest position 9 cm out, plugged position with the tip inside the port
    ref.current.position.x = PORT_X + 1.4 + LENGTH / 2 + (1 - S.usb) * 9;
    ref.current.position.y = PORT_Y + (1 - S.usb) * -0.2;
    ref.current.position.z = PORT_Z + (1 - S.usb) * 2.4;
  });
  return (
    <group ref={ref}>
      <RoundedBox args={[LENGTH, 2.2, 1.1]} radius={0.28} smoothness={3}>
        <meshPhysicalMaterial color="#2f5bea" roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[-LENGTH / 2 - 0.55, 0, 0]}>
        <boxGeometry args={[1.6, 1.8, 0.5]} />
        <meshStandardMaterial color="#d3dbe8" metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[LENGTH / 2 - 0.6, 0, 0.56]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#0b121d" />
      </mesh>
      <Hotspot id="usb" position={[0, 2.2, 0]} visible={showHotspots} />
    </group>
  );
}
