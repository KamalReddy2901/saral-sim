import { copy } from "../data/copy";
import { iconSrc } from "../utils/pictograms";

export function Banner() {
  return (
    <div className="banner" role="note">
      <img src={iconSrc("question")} alt="" width="22" height="22" />
      <span>{copy.banner}</span>
    </div>
  );
}
