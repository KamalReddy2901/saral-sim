import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector3, type Mesh, type MeshBasicMaterial } from "three";
import type { EasySentence } from "../data/passages";
import { pictogramUrl } from "../utils/pictograms";
import { CARD_H, CARD_TARGETS, CARD_W, DISPLAY_POS, SOC_WORLD } from "./layout";
import { S } from "./sceneState";
import { makeCardTexture } from "./textures";

const FROM = new Vector3(SOC_WORLD[0], SOC_WORLD[1] + 2.5, SOC_WORLD[2]);
const SLOT = new Vector3(DISPLAY_POS[0], DISPLAY_POS[1] + 1.5, DISPLAY_POS[2] + 1.2);
const tmp = new Vector3();
const tmp2 = new Vector3();

/** Easy-read sentence cards: rise out of the chip, hover above the display, then slot onto it. */
export function Cards({ sentences }: { sentences: EasySentence[] }) {
  const { invalidate } = useThree();
  const meshes = useRef<(Mesh | null)[]>([]);
  const textures = useMemo(
    () =>
      sentences.slice(0, 6).map((s) =>
        makeCardTexture({ text: s.text, key: s.key, pictogramUrl: s.pictogram ? pictogramUrl(s.pictogram.replace(/\.(svg|png)$/, ""))?.url ?? null : null }, invalidate),
      ),
    [sentences, invalidate],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  useFrame(() => {
    const visible = S.cards > 0.01 && S.slot < 0.99;
    textures.forEach((_, i) => {
      const m = meshes.current[i];
      if (!m) return;
      m.visible = visible;
      if (!visible) return;
      const local = MathUtils.clamp(S.cards * 1.8 - i * 0.14, 0, 1);
      const e = local * local * (3 - 2 * local);
      const target = CARD_TARGETS[i];
      tmp.set(target[0], target[1], target[2]);
      tmp2.lerpVectors(FROM, tmp, e);
      tmp2.y += Math.sin(Math.PI * e) * 2.2;
      // slot: drift down onto the display and fade
      const s = MathUtils.clamp(S.slot, 0, 1);
      tmp2.lerp(SLOT, s);
      m.position.copy(tmp2);
      const sc = (0.15 + 0.85 * e) * (1 - 0.35 * s);
      m.scale.set(sc, sc, 1);
      (m.material as MeshBasicMaterial).opacity = e * (1 - s);
    });
  });

  return (
    <>
      {textures.map((t, i) => (
        <mesh key={i} ref={(m) => { meshes.current[i] = m; }} visible={false}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshBasicMaterial map={t} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
