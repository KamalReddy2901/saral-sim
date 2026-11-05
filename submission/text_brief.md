**Try the simulation first: https://saral-sim.pages.dev/** (3D, any browser, no sign-in; click "Start the tour"). It is a simulation of our prototype: example outputs are prepared by the team and metrics are labelled Simulated until measured on the Raspberry Pi.

**What makes Saral different.** Most offline study aids for this problem statement will serve a general student with a summary and a quiz. Saral is built for one specific group that standard material leaves out: learners with Down syndrome. That changes the product, not just the pitch:
1. **A lesson, not just text.** Each sentence is short, has one idea, a highlighted key word and a verified pictogram, shown one idea at a time on a large-print, high-contrast screen. The screen is a core feature.
2. **Trust by construction.** The AI proposes, plain code verifies: length, reading level, faithfulness to the passage, and that every answer is findable on screen. Failures are retried, then replaced by a safe fallback, so three verified questions always appear.
3. **Private by design.** Learner data never leaves the device, which matters for children with disabilities.
4. **Honest and testable.** Every number is labelled Simulated or Measured, and we state what we do not claim. Judges can explore the whole device, the offline proof and the checks in the simulation before the live day.

**Barrier and learners.** Standard study text uses long, abstract sentences with no picture support, and an easy-read version of a given passage is not available on demand, least of all offline. Learners with Down syndrome differ widely, so Saral adjusts text size and contrast rather than assuming one reading level.

**Solution and approach.** A Raspberry Pi with a large-print screen. A quantized lightweight instruct model runs locally through ExecuTorch (no cloud inference) and turns a 150-300 word passage into an easy-read summary of 5-7 short sentences, at least three yes/no or two-choice questions answerable from the text on screen, and a key word and pictogram per sentence. Terminal output always works. Offline operation is shown with Wi-Fi off and Ethernet unplugged. Model: one primary and one backup (examples: Llama 3.2 1B Instruct, Qwen3 0.6B), subject to organiser approval and compatibility testing.

**Measurement.** Model, quantization, file size, peak memory (with and without the screen), time per stage and total, sentence length and reading grade before and after, and check pass rates. Measured on the Pi after a warm-up, three runs per passage, on five or more passages, with a two-person quality review. Limitations are reported honestly.

**Impact.** A learner can read a passage in an accessible form and check their own understanding straight away, offline. We will show a before/after sentence from the organiser's passage (in our example, 16 words and two ideas become 8 words and one idea, with a picture). We make no learning-outcome claims and do not claim Easy-to-Read certification; review with special educators and learners is planned.

Team: The Primes (Kamal, Medha, Shruti), BMSIT&M. Code: https://github.com/KamalReddy2901/saral-sim
