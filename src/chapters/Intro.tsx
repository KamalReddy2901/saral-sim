import { Panel } from "../ui/Panel";

/** Side panel for chapter 0: how this simulation works. The headline itself lives in the viewport briefing. */
export function Intro() {
  return (
    <Panel title="How this simulation works">
      <ul className="facts">
        <li><strong>Offline.</strong> The device needs no internet and sends nothing anywhere.</li>
        <li><strong>On-device AI.</strong> A small model runs on the Raspberry Pi itself.</li>
        <li><strong>Easy-read with pictograms.</strong> Short sentences, one idea each, a picture where there is a match.</li>
        <li><strong>Checks in plain code.</strong> The AI proposes, code verifies what the learner sees.</li>
      </ul>
      <p className="muted">Follow the tour with the arrow keys or the chapter list. Press <kbd>F</kbd> for a fullscreen viewport.</p>
    </Panel>
  );
}
