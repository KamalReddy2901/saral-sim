// ---------------------------------------------------------------------------
// THE ONE FILE TO EDIT AFTER BENCHMARKING ON THE REAL RASPBERRY PI.
//
//  1. Replace the values below with your measured numbers.
//  2. Set  source: "measured"  and fill  measuredOn.
//  3. Rebuild and redeploy. Every badge and the dashboard switch automatically.
//
// A value of null shows "To be measured" in the dashboard.
// ---------------------------------------------------------------------------

export interface MetricsConfig {
  source: "simulated" | "measured";
  measuredOn?: { hardware: string; os: string; executorch: string; date: string };
  model: { name: string; quant: string; backend: string; fileMB: number | null };
  memoryMB: { modelOnly: number | null; withUI: number | null };
  timeS: {
    load: number | null; easyRead: number | null; checkA: number | null;
    questions: number | null; checkB: number | null; pictograms: number | null; total: number | null;
  };
  tokensPerS: number | null;
  quality: {
    firstAttemptPassA: number | null; firstAttemptPassB: number | null;
    fallbackUsedPct: number | null; pictogramCoveragePct: number | null;
  };
}

export const metrics: MetricsConfig = {
  source: "simulated",
  // measuredOn: { hardware: "Raspberry Pi 5 8 GB + active cooler", os: "Raspberry Pi OS 64-bit", executorch: "x.y.z", date: "2026-11-14" },

  // PLACEHOLDER, replace with measured values
  model: { name: "Llama-3.2-1B-Instruct (example model)", quant: "8da4w", backend: "ExecuTorch + XNNPACK", fileMB: 1100 },
  // PLACEHOLDER, replace with measured values
  memoryMB: { modelOnly: 1500, withUI: 1800 },
  // PLACEHOLDER, replace with measured values (total = sum of the stages)
  timeS: { load: 5, easyRead: 20, checkA: 0.1, questions: 15, checkB: 0.1, pictograms: 0.1, total: 40.3 },
  // PLACEHOLDER, replace with measured values
  tokensPerS: 8,
  // PLACEHOLDER, replace with measured values
  quality: { firstAttemptPassA: 60, firstAttemptPassB: 80, fallbackUsedPct: 10, pictogramCoveragePct: 90 },
};
