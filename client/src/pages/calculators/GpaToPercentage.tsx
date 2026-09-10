import { useState } from "react";
import { Link } from "react-router-dom";
import CalculatorPage, { CalcResult } from "../../components/CalculatorPage";
import GradeScaleTable from "../../components/GradeScaleTable";
import { calculatorBySlug } from "../../data/calculators";
import {
  DEFAULT_GPA_SCALE,
  GPA_SCALES,
  gpaToPercent,
  gradeForGpa,
  percentToGpa,
  tidy,
  type GpaScale,
} from "../../lib/grading";

/**
 * GPA to Percentage Calculator — /resources/gpa-to-percentage-calculator.
 *
 * THE SCALE SELECTOR IS THE POINT OF THIS PAGE. "GPA times 25" is the answer
 * everybody has been given, and it is right on exactly one scale — the
 * four-point one Nepal's boards use. Students arrive here holding transcripts
 * on five- and ten-point scales as well, and applying the four-point
 * multiplier to a ten-point GPA gives a number two and a half times too
 * large, which is the sort of error that gets spotted by an admissions
 * office rather than by the applicant. So the scale is asked for rather than
 * assumed, and the working is printed under the answer with the scale named
 * in it.
 */

const CALC = calculatorBySlug("gpa-to-percentage-calculator")!;

type Direction = "gpa-to-percent" | "percent-to-gpa";

export default function GpaToPercentage() {
  const [scale, setScale] = useState<GpaScale>(DEFAULT_GPA_SCALE);
  const [direction, setDirection] = useState<Direction>("gpa-to-percent");
  /* Text, not numbers — an emptied box gives "" and coercing it to 0 would
     put a confident "0%" on screen between keystrokes. */
  const [gpa, setGpa] = useState("");
  const [percent, setPercent] = useState("");

  const forward = direction === "gpa-to-percent";

  const gpaNum = Number(gpa);
  const gpaOk =
    gpa.trim() !== "" && Number.isFinite(gpaNum) && gpaNum >= 0 && gpaNum <= scale;

  const pctNum = Number(percent);
  const pctOk =
    percent.trim() !== "" &&
    Number.isFinite(pctNum) &&
    pctNum >= 0 &&
    pctNum <= 100;

  /* Only meaningful on the four-point scale, which is the one the Nepali
     boards grade against — a letter for a 10-point GPA would be inventing an
     equivalence nobody publishes. */
  const letter =
    forward && gpaOk && scale === 4 ? gradeForGpa(gpaNum) : null;

  return (
    <CalculatorPage
      calc={CALC}
      method={
        <>
          <p>
            <strong>There is no official conversion.</strong> Neither the NEB
            nor the SEE publishes one — the boards report a grade and a grade
            point and stop there. What everybody uses in practice, and what
            this page does, is to express the GPA as a proportion of the top
            of its scale:
          </p>
          <p className="calc-formula">
            Percentage = GPA ÷ scale × 100
          </p>
          <p>
            On the four-point scale Nepal's boards use, that is the familiar{" "}
            <strong>GPA × 25</strong>: a 3.6 becomes 90%, a 3.2 becomes 80%.
            On a ten-point scale the same formula is GPA × 10, which is why
            the scale has to be chosen rather than assumed — applying the
            four-point multiplier to a ten-point GPA overstates it by two and
            a half times.
          </p>
          <p>
            Treat the result as an approximation, because it is one. The
            percentage behind a letter grade is a <em>range</em> rather than a
            point — a B+ is anything from 70 to just under 80 — so a GPA
            reconstructed into a percentage cannot recover the marks that
            produced it. Where a university publishes its own conversion, its
            one is the one that counts.
          </p>

          <GradeScaleTable />

          <p className="calc-aside-note">
            Working out the GPA itself first? The{" "}
            <Link to="/resources/neb-to-gpa-calculator">NEB</Link> and{" "}
            <Link to="/resources/see-to-gpa-calculator">SEE</Link> calculators
            weight your subjects by their credit hours.
          </p>
        </>
      }
    >
      <div className="calc-lay">
        <div className="calc-inputs">
          <div
            className="calc-toggle"
            role="group"
            aria-label="Which way to convert"
          >
            <button
              type="button"
              className={forward ? "is-on" : undefined}
              aria-pressed={forward}
              onClick={() => setDirection("gpa-to-percent")}
            >
              GPA to percentage
            </button>
            <button
              type="button"
              className={!forward ? "is-on" : undefined}
              aria-pressed={!forward}
              onClick={() => setDirection("percent-to-gpa")}
            >
              Percentage to GPA
            </button>
          </div>

          <label className="calc-field">
            <span className="calc-field-label">Your GPA scale</span>
            <select
              className="calc-select"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value) as GpaScale)}
            >
              {GPA_SCALES.map((s) => (
                <option key={s} value={s}>
                  {s.toFixed(1)} point scale
                  {s === 4 ? " — NEB and SEE" : ""}
                </option>
              ))}
            </select>
            <span className="calc-field-hint">
              Printed at the top of your transcript. Nepal's boards grade on
              the four-point scale.
            </span>
          </label>

          {forward ? (
            <label className="calc-field">
              <span className="calc-field-label">GPA</span>
              <input
                className="calc-input"
                type="number"
                inputMode="decimal"
                min={0}
                max={scale}
                step="any"
                placeholder={`0 to ${tidy(scale, 1)}`}
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
              />
              <span className="calc-field-hint">
                Anything from 0 to {tidy(scale, 1)} on the scale you chose.
              </span>
            </label>
          ) : (
            <label className="calc-field">
              <span className="calc-field-label">Percentage</span>
              <input
                className="calc-input"
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="any"
                placeholder="0 to 100"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
              />
              <span className="calc-field-hint">
                The aggregate percentage on your transcript.
              </span>
            </label>
          )}
        </div>

        {forward ? (
          <CalcResult
            empty={!gpaOk}
            value={gpaOk ? `${tidy(gpaToPercent(gpaNum, scale), 2)}%` : "—"}
            caption={
              gpaOk
                ? "Approximate percentage"
                : gpa.trim() === ""
                  ? "Enter your GPA to see the percentage"
                  : `Enter a GPA between 0 and ${tidy(scale, 1)}`
            }
            note={
              gpaOk ? (
                <>
                  <code>
                    {tidy(gpaNum, 2)} ÷ {tidy(scale, 1)} × 100
                  </code>
                  , on the {tidy(scale, 1)} point scale
                  {letter ? (
                    <>
                      {" "}
                      — around a <strong>{letter.grade}</strong>
                    </>
                  ) : null}
                  .
                </>
              ) : undefined
            }
          />
        ) : (
          <CalcResult
            empty={!pctOk}
            value={pctOk ? tidy(percentToGpa(pctNum, scale), 2) : "—"}
            caption={
              pctOk
                ? `Approximate GPA on the ${tidy(scale, 1)} point scale`
                : percent.trim() === ""
                  ? "Enter a percentage to see the GPA"
                  : "Enter a percentage between 0 and 100"
            }
            note={
              pctOk ? (
                <>
                  <code>
                    {tidy(pctNum, 2)} ÷ 100 × {tidy(scale, 1)}
                  </code>
                  , the same formula run backwards.
                </>
              ) : undefined
            }
          />
        )}
      </div>
    </CalculatorPage>
  );
}
