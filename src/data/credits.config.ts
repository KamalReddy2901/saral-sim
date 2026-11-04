// Placeholders for the team to fill in before linking the site from the PDF.
export const credits = {
  hackathon: "Namma AI Hackathon, Problem Statement 1: AI for Inclusive Education (Offline Smart Learning Assistant)",
  teamName: "[Team name: to be filled in]",
  members: ["[Member 1: to be filled in]", "[Member 2: to be filled in]", "[Member 3: to be filled in]"],
  college: "[College: to be filled in]",
  repoUrl: "https://github.com/your-org/saral", // PLACEHOLDER
  pdfUrl: "", // PLACEHOLDER: link to the 2-page supporting PDF
  contact: "[Contact: to be filled in]",
};

export const openSource: { name: string; licence: string; use: string }[] = [
  { name: "React, React DOM", licence: "MIT", use: "UI" },
  { name: "three.js", licence: "MIT", use: "3D rendering" },
  { name: "@react-three/fiber, @react-three/drei", licence: "MIT", use: "3D in React" },
  { name: "zustand", licence: "MIT", use: "State" },
  { name: "GSAP", licence: "Standard no-charge licence (gsap.com/standard-license)", use: "Camera tweens" },
  { name: "Vite", licence: "MIT", use: "Build" },
  { name: "Inter Tight (@fontsource-variable/inter-tight)", licence: "SIL Open Font License 1.1", use: "Site UI and headings" },
  { name: "Instrument Serif (@fontsource/instrument-serif)", licence: "SIL Open Font License 1.1", use: "Accent type" },
  { name: "Atkinson Hyperlegible (@fontsource/atkinson-hyperlegible)", licence: "SIL Open Font License 1.1", use: "Learner screen" },
];
