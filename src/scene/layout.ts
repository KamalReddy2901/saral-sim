// World layout of the 3D scene. Units: 1 = 1 cm. Proportions are approximate, not engineering-accurate.
export const PI_POS = [-6.5, 0.9, 6.5] as const;
export const PI_SCALE = 0.14; // board is modelled in millimetres, drawn about 1.4x real size for legibility
export const DISPLAY_POS = [0, 6.1, -6] as const;
export const DISPLAY_TILT = -0.16; // radians, leans back

/** Screen glass size in cm (about a 7-inch display). */
export const SCREEN_W = 15.4;
export const SCREEN_H = 9.6;
/** The learner UI is rendered at this CSS pixel size inside the 3D display. */
export const EMBED_W = 640;
export const EMBED_H = 400;

export const TOKEN_ORIGIN = [5, 10, 10] as const;
export const SOC_WORLD = [PI_POS[0] - 10 * PI_SCALE, PI_POS[1] + 5.2 * PI_SCALE, PI_POS[2] + 2 * PI_SCALE] as const;
export const CARD_TARGETS: readonly (readonly [number, number, number])[] = [
  [-7.6, 17.2, -4], [0, 17.2, -4], [7.6, 17.2, -4],
  [-7.6, 13.6, -4], [0, 13.6, -4], [7.6, 13.6, -4],
];
export const CARD_W = 7.1;
export const CARD_H = 3.1;
