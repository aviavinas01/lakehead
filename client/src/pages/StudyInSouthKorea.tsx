import GuidePage from "../components/GuidePage";
import { SOUTH_KOREA_GUIDE } from "../data/guides/southKorea";

/* Content lives in data/guides/southKorea.ts; the layout is GuidePage. */
export default function StudyInSouthKorea() {
  return <GuidePage guide={SOUTH_KOREA_GUIDE} />;
}
