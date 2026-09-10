import { Link } from "react-router-dom";
import CalculatorPage from "../../components/CalculatorPage";
import GradeSheet from "../../components/GradeSheet";
import GradeScaleTable from "../../components/GradeScaleTable";
import { calculatorBySlug } from "../../data/calculators";

/**
 * NEB to GPA Calculator — /resources/neb-to-gpa-calculator.
 *
 * Grades 11 and 12, National Examinations Board. The sheet, the grade scale
 * and the arithmetic are all shared with the SEE page — see GradeSheet for
 * why that sharing is sound here and not elsewhere. What is this page's own
 * is what it opens with (six subjects at five credit hours, which is the
 * commonest NEB shape) and the copy around it.
 */

const CALC = calculatorBySlug("neb-to-gpa-calculator")!;

export default function NebGpa() {
  return (
    <CalculatorPage
      calc={CALC}
      method={
        <>
          <p>
            Each subject contributes its grade point multiplied by its credit
            hours. Add those up, divide by the total credit hours, and that is
            the GPA:
          </p>
          <p className="calc-formula">
            GPA = Σ (credit hours × grade point) ÷ Σ credit hours
          </p>
          <p>
            It is a <strong>weighted</strong> average, which is the part that
            surprises people. A five-credit subject moves your GPA further
            than a three-credit one, so a weak grade in a major subject costs
            more than the same grade in a smaller one. Averaging the grade
            points on their own gives a different — and wrong — answer.
          </p>

          <GradeScaleTable />

          <p>
            <strong>NG</strong> is non-graded. It carries no grade point, but
            its credit hours still count in the divisor, which is exactly how
            a subject you have not passed pulls the average down.
          </p>
          <p className="calc-aside-note">
            Need that GPA as a percentage for an application form? The{" "}
            <Link to="/resources/gpa-to-percentage-calculator">
              GPA to percentage calculator
            </Link>{" "}
            shows the conversion and its working. Sat SEE rather than grade
            12?{" "}
            <Link to="/resources/see-to-gpa-calculator">
              That sheet is here
            </Link>
            .
          </p>
        </>
      }
    >
      <GradeSheet
        rows={6}
        credit={5}
        creditHint={
          <>
            Credit hours are printed on your marksheet beside each subject —
            five is the usual NEB figure, but compulsory subjects often carry
            fewer, so change them to match yours. If your marksheet reports
            theory and practical separately, enter them as two rows with their
            own credit hours.
          </>
        }
      />
    </CalculatorPage>
  );
}
