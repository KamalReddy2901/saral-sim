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
      <RoundedBox args={[LENGTH, 2.2, 1.1]} radius={0.38} smoothness={4}>
        <meshPhysicalMaterial color="#7a66ff" roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1.9, 1.9, 0.9]} radius={0.15} smoothness={2} position={[-LENGTH / 2 - 0.8, 0, 0]}>
        <meshStandardMaterial color="#d7deea" metalness={1} roughness={0.2} />
      </RoundedBox>
      <mesh position={[-LENGTH / 2 - 0.8, 0, 0.46]}><boxGeometry args={[1.3, 0.9, 0.06]} /><meshStandardMaterial color="#05080d" roughness={0.8} /></mesh>
      <mesh position={[LENGTH / 2 - 0.7, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.12, 10, 24]} /><meshStandardMaterial color="#d7deea" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0.4, 0, 0.56]}><boxGeometry args={[0.5, 0.2, 0.05]} /><meshStandardMaterial color="#ffc933" emissive="#ffc933" emissiveIntensity={1.6} /></mesh>
      <Hotspot id="usb" position={[0, 2.2, 0]} visible={showHotspots} />
    </group>
  );
}
