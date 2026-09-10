import { useRef, useState, type ReactNode } from "react";
import { CalcResult } from "./CalculatorPage";
import {
  DEFAULT_GPA_SCALE,
  NEPAL_GRADES,
  gpaToPercent,
  gradeForGpa,
  tidy,
  weightedGpa,
  type GradeRow,
} from "../../lib/grading";

/**
 * The marksheet both Nepali GPA calculators are built on — a row per
 * subject, weighted by credit hours.
 *
 * TWO PAGES, ONE COMPONENT, and it is worth saying why this one IS shared
 * when the other three calculators deliberately are not. NEB and SEE are not
 * two similar-looking problems: they are the same problem. The letter grades
 * are identical, the grade points are identical and the weighting is
 * identical (see NEPAL_GRADES in lib/grading). What differs is how many
 * subjects a student sat and the credit hours beside each — which is a
 * starting state, not a behaviour. So the two pages hand this their opening
 * rows and their own copy, and nothing else.
 *
 * If the boards ever grade differently from one another, that is the moment
 * to split this, not a moment to add a flag to it.
 */

export default function GradeSheet({
  /** How many rows the sheet opens with, and their credit hours. */
  rows: startingRows,
  credit: startingCredit,
  /** Where the student can find their credit hours, in the exam's own words. */
  creditHint,
}: {
  rows: number;
  credit: number;
  creditHint: ReactNode;
}) {
  /* Ids come from a counter rather than the array index. React keys off an
     index put the wrong value in the wrong box the moment a row was deleted
     from the middle — the inputs are uncontrolled-feeling text fields and
     they visibly swapped. */
  const nextId = useRef(startingRows);
  const [rows, setRows] = useState<GradeRow[]>(() =>
    Array.from({ length: startingRows }, (_, i) => ({
      id: i,
      subject: "",
      grade: "",
      credit: startingCredit,
    }))
  );

  const update = (id: number, patch: Partial<GradeRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { id: nextId.current++, subject: "", grade: "", credit: startingCredit },
    ]);

  /* The last row is never removable — an empty sheet has no "add" button
     anchored to anything and no shape for the eye to come back to. */
  const removeRow = (id: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  /* Fresh ids, so every input is a new element rather than an old one being
     told it is now empty. Same reason as the keys above. */
  const reset = () =>
    setRows(
      Array.from({ length: startingRows }, () => ({
        id: nextId.current++,
        subject: "",
        grade: "",
        credit: startingCredit,
      }))
    );

  const gpa = weightedGpa(rows);
  const counted = rows.filter((r) => r.grade !== "" && r.credit > 0);
  const totalCredits = counted.reduce((a, r) => a + r.credit, 0);
  const letter = gpa === null ? null : gradeForGpa(gpa);

  return (
    <div className="calc-lay">
      <div className="calc-inputs">
        <div className="calc-sheet" role="group" aria-label="Your subjects">
          {/* Column headings, shown once above the rows rather than as a
              label on each — on a sheet this repetitive, a label per field
              is more words than data. Each input keeps its own aria-label
              so nothing is lost to a screen reader. */}
          <div className="calc-sheet-head" aria-hidden="true">
            <span>Subject</span>
            <span>Grade</span>
            <span>Credit hours</span>
            <span />
          </div>

          {rows.map((row, i) => (
            <div className="calc-sheet-row" key={row.id}>
              <input
                className="calc-input"
                type="text"
                placeholder={`Subject ${i + 1}`}
                aria-label={`Subject ${i + 1} name`}
                value={row.subject}
                onChange={(e) => update(row.id, { subject: e.target.value })}
              />
              <select
                className="calc-select"
                aria-label={`Subject ${i + 1} grade`}
                value={row.grade}
                onChange={(e) => update(row.id, { grade: e.target.value })}
              >
                <option value="">—</option>
                {NEPAL_GRADES.map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.grade}
                    {g.point > 0 ? ` (${tidy(g.point, 1)})` : " (0)"}
                  </option>
                ))}
              </select>
              <input
                className="calc-input"
                type="number"
                inputMode="decimal"
                min={0}
                max={20}
                step="any"
                aria-label={`Subject ${i + 1} credit hours`}
                value={Number.isFinite(row.credit) ? row.credit : ""}
                onChange={(e) =>
                  update(row.id, {
                    /* NaN for an emptied box, which weightedGpa skips —
                       coercing it to 0 would count the subject as failed
                       while the student was still typing. */
                    credit:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
              <button
                type="button"
                className="calc-row-drop"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                aria-label={`Remove subject ${i + 1}`}
                title="Remove this subject"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <p className="calc-field-hint calc-sheet-hint">{creditHint}</p>

        <div className="calc-sheet-actions">
          <button type="button" className="calc-add" onClick={addRow}>
            + Add a subject
          </button>
          <button type="button" className="calc-reset" onClick={reset}>
            Clear
          </button>
        </div>
      </div>

      <CalcResult
        empty={gpa === null}
        value={gpa === null ? "—" : tidy(gpa, 2)}
        caption={
          gpa === null
            ? "Add a grade and credit hours to see your GPA"
            : "Grade point average"
        }
        note={
          gpa === null ? undefined : (
            <>
              Weighted across {counted.length}{" "}
              {counted.length === 1 ? "subject" : "subjects"} and{" "}
              {tidy(totalCredits, 2)} credit hours
              {letter ? (
                <>
                  {" "}
                  — around a <strong>{letter.grade}</strong>
                </>
              ) : null}
              , or about{" "}
              <strong>
                {tidy(gpaToPercent(gpa, DEFAULT_GPA_SCALE), 2)}%
              </strong>
              .
            </>
          )
        }
      />
    </div>
  );
}
