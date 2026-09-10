import GuidePage from "../../components/study-abroad/GuidePage";
import { UK_GUIDE } from "../../data/guides/uk";

/* Content lives in data/guides/uk.ts; the layout is GuidePage. */
export default function StudyInUK() {
  return <GuidePage guide={UK_GUIDE} />;
}
