**Try the simulation first: https://saral-sim.pages.dev/** (3D, runs in any browser, no sign-in; start with "Start the tour". Note: this is a simulation of our prototype. Example outputs are prepared by the team, and metrics are labelled Simulated until measured on the Raspberry Pi.)

**Barrier and learners.** Standard study text uses long, abstract sentences with no picture support, and an easy-read version of a given passage is not available on demand, least of all offline. Our learners are people with Down syndrome who benefit from simplified text and visual support. Reading levels and needs differ widely, so Saral adjusts text size and contrast rather than assuming one level.

**Solution (Saral).** An offline study aid on a Raspberry Pi with a large-print screen. A quantized lightweight instruct model runs locally through ExecuTorch (no cloud inference) and turns a 150-300 word passage into: (1) an easy-read summary of 5-7 short sentences, one idea each, following Easy-to-Read principles; (2) at least three yes/no or two-choice questions, each answerable from the text on screen; (3) a highlighted key word and a verified pictogram per sentence where an exact match exists.

**Approach.** Staged prompts, and "AI proposes, code verifies": plain code checks sentence length, reading level and that names, numbers and key terms come from the passage, and that every answer is findable on screen. Failed output is retried twice, then replaced by selected original sentences and template questions, so three verified questions always appear. Terminal output always works; the large-print screen is built on top. Offline operation is shown with Wi-Fi off and Ethernet unplugged. The model is one primary plus one backup (examples: Llama 3.2 1B Instruct, Qwen3 0.6B), subject to organiser approval and ExecuTorch compatibility testing.

**Measurement.** Model, quantization, file size, peak memory (with and without the screen), time per stage and total, easy-read metrics before and after, and check pass rates, measured on the Pi after a warm-up with three runs per passage on at least five passages, plus a two-person quality review. Limitations will be reported honestly.

**Impact.** A learner gets the passage in an accessible form, with pictures, and can check their own understanding straight away, offline and with no data leaving the device. We will show a before/after sentence from the organiser's passage. We make no learning-outcome claims and do not claim Easy-to-Read certification; validation with special educators is planned.

**Plan.** Now to 10 Nov: pipeline, checks, pictograms and screen. If shortlisted, 11-13 Nov: finalist training and Pi benchmarks. 14 Nov: live run on the organiser's passage.

Team: The Primes (Kamal, Medha, Shruti), BMSIT&M. Code: https://github.com/KamalReddy2901/saral-sim
