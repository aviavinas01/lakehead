import GuidePage from "../../components/study-abroad/GuidePage";
import { AUSTRALIA_GUIDE } from "../../data/guides/australia";

/* Content lives in data/guides/australia.ts; the layout is GuidePage. */
export default function StudyInAustralia() {
  return <GuidePage guide={AUSTRALIA_GUIDE} />;
}
