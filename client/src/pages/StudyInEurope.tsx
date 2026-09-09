import GuidePage from "../components/GuidePage";
import { EUROPE_GUIDE } from "../data/guides/europe";

/* Content lives in data/guides/europe.ts; the layout is GuidePage. */
export default function StudyInEurope() {
  return <GuidePage guide={EUROPE_GUIDE} />;
}
