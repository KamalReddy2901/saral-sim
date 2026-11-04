import { copy } from "../data/copy";

export function Banner() {
  return (
    <div className="banner" role="note">
      <strong className="banner-brand">{copy.brand}</strong>
      <span>{copy.banner}</span>
    </div>
  );
}
