import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  viewBox: "0 0 48 48", width: "1.2em", height: "1.2em", fill: "none", stroke: "currentColor",
  strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false, ...p,
});

export const TickIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M9 25l10 10L39 12" /></svg>;
export const NoIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="24" cy="24" r="17" /><path d="M13 35L35 13" /></svg>;
export const CircleIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="24" cy="24" r="15" fill="currentColor" /></svg>;
export const SquareIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="9" y="9" width="30" height="30" rx="5" fill="currentColor" /></svg>;
export const EyeIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 24c6-10 14-14 20-14s14 4 20 14c-6 10-14 14-20 14S10 34 4 24z" /><circle cx="24" cy="24" r="6" fill="currentColor" /></svg>;
export const GearIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} strokeWidth={4}>
    <circle cx="24" cy="24" r="6" />
    <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4.2 4.2M33.3 33.3l4.2 4.2M10.5 37.5l4.2-4.2M33.3 14.7l4.2-4.2" />
  </svg>
);
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M8 24h30M26 11l13 13-13 13" /></svg>;
export const ArrowLeft = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M40 24H10M22 11L9 24l13 13" /></svg>;
