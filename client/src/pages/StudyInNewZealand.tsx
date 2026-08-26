import GuidePage from "../components/GuidePage";
import { NEW_ZEALAND_GUIDE } from "../data/guides/newZealand";

/* Content lives in data/guides/newZealand.ts; the layout is GuidePage. */
export default function StudyInNewZealand() {
  return <GuidePage guide={NEW_ZEALAND_GUIDE} />;
}
