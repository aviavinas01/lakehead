import GuidePage from "../components/GuidePage";
import { JAPAN_GUIDE } from "../data/guides/japan";

/* Content lives in data/guides/japan.ts; the layout is GuidePage. */
export default function StudyInJapan() {
  return <GuidePage guide={JAPAN_GUIDE} />;
}
