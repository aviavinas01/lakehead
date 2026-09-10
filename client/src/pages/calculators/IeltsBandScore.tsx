import { useState } from "react";
import { Link } from "react-router-dom";
import CalculatorPage, { CalcResult } from "../../components/CalculatorPage";
import { calculatorBySlug } from "../../data/calculators";
import { IELTS_BAND_STEPS, ieltsOverall, tidy } from "../../lib/grading";

/**
 * IELTS Band Score Calculator — /resources/ielts-band-score-calculator.
 *
 * WHAT IT DOES NOT DO: turn raw answers into a band. Every second student
 * asks for "35 out of 40 in Listening", and the honest answer is that the
 * conversion is set per paper — the boards adjust it so that the same band
 * means the same thing across sittings of different difficulty, and the
 * tables circulating online are somebody's average of past papers presented
 * as fact. Publishing one would give a confident wrong number to the
 * student least able to spot it, so this page works from bands, which is
 * what the test report form actually gives you.
 */

const CALC = calculatorBySlug("ielts-band-score-calculator")!;

const SKILLS = ["Listening", "Reading", "Writing", "Speaking"] as const;
type Skill = (typeof SKILLS)[number];

/** "" until a band is chosen — see the note on the waiting state below. */
type Bands = Record<Skill, string>;

const BLANK: Bands = {
  Listening: "",
  Reading: "",
  Writing: "",
  Speaking: "",
};

export default function IeltsBandScore() {
  const [bands, setBands] = useState<Bands>(BLANK);

  /* ALL FOUR OR NOTHING. An overall band from two skills is not a smaller
     version of the answer, it is a different and wrong one — and a figure
     that climbs as you fill the form in invites reading it before it is
     finished. So the panel waits until every skill has a band. */
  const entered = SKILLS.map((s) => bands[s]).filter((v) => v !== "");
  const complete = entered.length === SKILLS.length;

  const values = entered.map(Number);
  const mean = complete
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;
  const overall = complete ? ieltsOverall(values) : 0;

  const set = (skill: Skill, value: string) =>
    setBands((b) => ({ ...b, [skill]: value }));

  return (
    <CalculatorPage
      calc={CALC}
      method={
        <>
          <p>
            Add the four band scores, divide by four, then round that average
            to the nearest half band. That is the whole rule, and the two
            cases people get caught by both fall out of it: an average ending
            in <strong>.25</strong> rounds up to the next half band, and one
            ending in <strong>.75</strong> rounds up to the next whole band.
          </p>
          <ul className="calc-worked">
            <li>
              <code>6.5, 7.0, 6.0, 7.0</code> average <code>6.625</code>,
              which rounds to <strong>6.5</strong>
            </li>
            <li>
              <code>6.5, 7.0, 6.5, 7.0</code> average <code>6.75</code>, which
              rounds up to <strong>7.0</strong>
            </li>
            <li>
              <code>7.0, 7.0, 6.5, 7.0</code> average <code>6.875</code>,
              which rounds to <strong>7.0</strong>
            </li>
          </ul>
          <p>
            Nothing is rounded on the way in — each skill is reported at a
            whole or half band already, and the rounding happens once, to the
            average. Rounding each skill first is the commonest way to end up
            half a band out.
          </p>
          <p className="calc-aside-note">
            Sitting PTE instead, or holding a score in one test against a
            requirement written in the other? See the{" "}
            <Link to="/resources/pte-score-calculator">PTE comparison</Link>.
          </p>
        </>
      }
    >
      <div className="calc-lay">
        <div className="calc-inputs">
          <fieldset className="calc-fields">
            <legend className="calc-legend">
              Your four band scores
              <span>From your test report form. Half bands included.</span>
            </legend>

            <div className="calc-row-grid">
              {SKILLS.map((skill) => (
                <label className="calc-field" key={skill}>
                  <span className="calc-field-label">{skill}</span>
                  <select
                    className="calc-select"
                    value={bands[skill]}
                    onChange={(e) => set(skill, e.target.value)}
                  >
                    <option value="">—</option>
                    {IELTS_BAND_STEPS.map((b) => (
                      <option key={b} value={b}>
                        {b.toFixed(1)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="calc-reset"
            onClick={() => setBands(BLANK)}
          >
            Clear
          </button>
        </div>

        <CalcResult
          empty={!complete}
          value={overall.toFixed(1)}
          caption={
            complete
              ? "Overall band score"
              : "Choose all four bands to see your overall score"
          }
          note={
            complete ? (
              <>
                Your four bands average <code>{tidy(mean, 3)}</code>, which
                rounds to the nearest half band.
                {overall > mean ? " That rounding is in your favour." : null}
              </>
            ) : undefined
          }
        />
      </div>
    </CalculatorPage>
  );
}
