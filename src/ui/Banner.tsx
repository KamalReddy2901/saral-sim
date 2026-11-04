import { copy } from "../data/copy";

export function Banner() {
  return (
    <div className="banner" role="note">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.500" fill="none" stroke="currentColor" strokeWidth="1.400" /><path d="M8 7v4M8 5v.1" stroke="currentColor" strokeWidth="1.600" strokeLinecap="round" /></svg>
      <span>{copy.banner}</span>
    </div>
  );
}
