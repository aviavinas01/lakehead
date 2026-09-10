import { useState } from "react";
import { Link } from "react-router-dom";
import CalculatorPage, { CalcResult } from "../../../components/resources/CalculatorPage";
import { calculatorBySlug } from "../../../data/calculators";
import {
  PTE_FLOOR,
  PTE_IELTS_CONCORDANCE,
  ieltsToPte,
  pteToIelts,
} from "../../../lib/grading";

/**
 * PTE Score Calculator — /resources/pte-score-calculator.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS A COMPARISON AND NOT AN "OVERALL SCORE" CALCULATOR.
 *
 * The obvious build is four boxes for the communicative skills and their
 * average as the overall. It would be wrong. PTE Academic's overall score is
 * produced by Pearson's own scoring model across the whole test, not by
 * averaging the four skills a score report happens to list, and the two come
 * apart often enough to matter — a student can average 65 across the skills
 * and hold an overall that is not 65. Publishing the average as "your PTE
 * score" would be inventing a number and putting it under our name.
 *
 * What students actually want here is the other thing: whether the score
 * they hold clears a requirement written in the other test, or which test to
 * sit. That is a published concordance rather than arithmetic of ours, so
 * that is what this page is.
 * ------------------------------------------------------------------
 */

const CALC = calculatorBySlug("pte-score-calculator")!;

/** Which way round the page is working. */
type Direction = "pte-to-ielts" | "ielts-to-pte";

const PTE_CEILING = 90;

export default function PteScore() {
  const [direction, setDirection] = useState<Direction>("pte-to-ielts");
  /* Held as text, not a number. A number input that has been emptied gives
     "" back, and coercing that to 0 mid-edit makes the panel flash "below
     4.5" between keystrokes. */
  const [pte, setPte] = useState("");
  const [ielts, setIelts] = useState("");

  const pteNum = Number(pte);
  const ptePresent = pte.trim() !== "" && Number.isFinite(pteNum);
  const pteInRange = ptePresent && pteNum >= 10 && pteNum <= PTE_CEILING;
  const band = pteInRange ? pteToIelts(pteNum) : null;

  const equivalent = ielts === "" ? null : ieltsToPte(Number(ielts));

  const toIelts = direction === "pte-to-ielts";

  return (
    <CalculatorPage
      calc={CALC}
      method={
        <>
          <p>
            This is Pearson's published concordance between PTE Academic
            overall scores and IELTS bands. It is a comparison between two
            differently scored tests, not a conversion — no university accepts
            a converted score, and every one of them states its requirement in
            whichever test it asks for.
          </p>
          <p>
            Going from PTE to IELTS, the band shown is the one your score{" "}
            <strong>reaches</strong>, never the nearest one. A PTE 64 shows as
            6.5, because 65 is what the table puts against 7.0 — rounding a
            student up to a band they have not reached is the one mistake on
            this page that could cost somebody an application fee.
          </p>

          <div className="calc-table-wrap">
            <table className="calc-table">
              <caption>The concordance, in full</caption>
              <thead>
                <tr>
                  <th scope="col">IELTS band</th>
                  <th scope="col">PTE Academic</th>
                </tr>
              </thead>
              <tbody>
                {PTE_IELTS_CONCORDANCE.map((r) => (
                  <tr key={r.ielts}>
                    <td>{r.ielts.toFixed(1)}</td>
                    <td>{r.pte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="calc-aside-note">
            Working out an IELTS overall band from four skill scores instead?
            That is the{" "}
            <Link to="/resources/ielts-band-score-calculator">
              IELTS band score calculator
            </Link>
            .
          </p>
        </>
      }
    >
      <div className="calc-lay">
        <div className="calc-inputs">
          {/* Two buttons rather than a select: there are exactly two states,
              and both are worth being able to see before choosing. */}
          <div
            className="calc-toggle"
            role="group"
            aria-label="Which way to compare"
          >
            <button
              type="button"
              className={toIelts ? "is-on" : undefined}
              aria-pressed={toIelts}
              onClick={() => setDirection("pte-to-ielts")}
            >
              PTE to IELTS
            </button>
            <button
              type="button"
              className={!toIelts ? "is-on" : undefined}
              aria-pressed={!toIelts}
              onClick={() => setDirection("ielts-to-pte")}
            >
              IELTS to PTE
            </button>
          </div>

          {toIelts ? (
            <label className="calc-field">
              <span className="calc-field-label">
                PTE Academic overall score
              </span>
              <input
                className="calc-input"
                type="number"
                inputMode="numeric"
                min={10}
                max={PTE_CEILING}
                step={1}
                placeholder="e.g. 65"
                value={pte}
                onChange={(e) => setPte(e.target.value)}
              />
              <span className="calc-field-hint">
                The overall score on your score report, between 10 and{" "}
                {PTE_CEILING}.
              </span>
            </label>
          ) : (
            <label className="calc-field">
              <span className="calc-field-label">IELTS overall band</span>
              <select
                className="calc-select"
                value={ielts}
                onChange={(e) => setIelts(e.target.value)}
              >
                <option value="">—</option>
                {PTE_IELTS_CONCORDANCE.map((r) => (
                  <option key={r.ielts} value={r.ielts}>
                    {r.ielts.toFixed(1)}
                  </option>
                ))}
              </select>
              <span className="calc-field-hint">
                The table runs from 4.5 upwards; below that there is no
                published equivalence.
              </span>
            </label>
          )}
        </div>

        {toIelts ? (
          <CalcResult
            empty={!pteInRange}
            value={band === null ? `below 4.5` : band.toFixed(1)}
            caption={
              pteInRange
                ? "Comparable IELTS band"
                : ptePresent
                  ? `Enter a score between 10 and ${PTE_CEILING}`
                  : "Enter your PTE overall score"
            }
            note={
              pteInRange ? (
                band === null ? (
                  <>
                    The concordance stops at {PTE_FLOOR}, which is IELTS 4.5.
                    Below that there is no published equivalence.
                  </>
                ) : (
                  <>
                    PTE {Math.round(pteNum)} reaches the {band.toFixed(1)} row
                    and not the one above it.
                  </>
                )
              ) : undefined
            }
          />
        ) : (
          <CalcResult
            empty={equivalent === null}
            value={equivalent === null ? "—" : String(equivalent)}
            caption={
              equivalent === null
                ? "Choose an IELTS band to see the PTE score"
                : "Comparable PTE Academic score"
            }
            note={
              equivalent === null ? undefined : (
                <>
                  A university asking for IELTS {Number(ielts).toFixed(1)}{" "}
                  will usually state PTE {equivalent} as its own requirement —
                  but check the one you are applying to.
                </>
              )
            }
          />
        )}
      </div>
    </CalculatorPage>
  );
}
