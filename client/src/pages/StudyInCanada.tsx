import GuidePage from "../components/GuidePage";
import { CANADA_GUIDE } from "../data/guides/canada";

/* Content lives in data/guides/canada.ts; the layout is GuidePage. */
export default function StudyInCanada() {
  return <GuidePage guide={CANADA_GUIDE} />;
}
