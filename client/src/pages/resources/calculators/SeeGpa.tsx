import { Link } from "react-router-dom";
import CalculatorPage from "../../../components/resources/CalculatorPage";
import GradeSheet from "../../../components/resources/GradeSheet";
import GradeScaleTable from "../../../components/resources/GradeScaleTable";
import { calculatorBySlug } from "../../../data/calculators";

/**
 * SEE to GPA Calculator — /resources/see-to-gpa-calculator.
 *
 * The Secondary Education Examination, at the end of grade 10. Identical
 * arithmetic and identical grade scale to the NEB page; it opens with eight
 * subjects at four credit hours instead of six at five, which is the
 * commonest SEE shape. See GradeSheet for why the two share a component.
 */

const CALC = calculatorBySlug("see-to-gpa-calculator")!;

export default function SeeGpa() {
  return (
    <CalculatorPage
      calc={CALC}
      method={
        <>
          <p>
            Every subject contributes its grade point multiplied by its credit
            hours. Those are added together and divided by the total credit
            hours:
          </p>
          <p className="calc-formula">
            GPA = Σ (credit hours × grade point) ÷ Σ credit hours
          </p>
          <p>
            Because it is weighted, subjects with more credit hours pull the
            average further. On most SEE marksheets the credit hours are the
            same across subjects, in which case the weighting makes no
            difference and this comes out as a plain average — but enter what
            your marksheet actually says rather than assuming that.
          </p>

          <GradeScaleTable />

          <p>
            <strong>NG</strong> is non-graded: no grade point, but its credit
            hours still count against the total, which is what brings the
            average down.
          </p>
          <p className="calc-aside-note">
            Moving on to grade 11 and 12? The{" "}
            <Link to="/resources/neb-to-gpa-calculator">
              NEB calculator
            </Link>{" "}
            does the same job for those. For a percentage on an application
            form, see the{" "}
            <Link to="/resources/gpa-to-percentage-calculator">
              GPA to percentage calculator
            </Link>
            .
          </p>
        </>
      }
    >
      <GradeSheet
        rows={8}
        credit={4}
        creditHint={
          <>
            Credit hours sit beside each subject on your marksheet — four is
            the usual SEE figure, and optional or additional subjects
            sometimes carry fewer. Change any that differ, and add or remove
            rows to match the number of subjects you sat.
          </>
        }
      />
    </CalculatorPage>
  );
}
