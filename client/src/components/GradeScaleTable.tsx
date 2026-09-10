import { NEPAL_GRADES, tidy } from "../lib/grading";

/**
 * The letter grades, their grade points and the marks each is awarded for.
 *
 * Shown on all three pages that touch the Nepali scale, and drawn from
 * NEPAL_GRADES rather than typed out on each — the point of keeping the
 * scale in lib/grading is that a board revising it is one edit, and a table
 * with its own copy of the numbers would quietly outlive that edit.
 */
export default function GradeScaleTable() {
  return (
    <div className="calc-table-wrap">
      <table className="calc-table">
        <caption>The grade scale this uses</caption>
        <thead>
          <tr>
            <th scope="col">Grade</th>
            <th scope="col">Grade point</th>
            <th scope="col">Marks</th>
          </tr>
        </thead>
        <tbody>
          {NEPAL_GRADES.map((g) => (
            <tr key={g.grade}>
              <td>{g.grade}</td>
              <td>{tidy(g.point, 1)}</td>
              <td>{g.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
