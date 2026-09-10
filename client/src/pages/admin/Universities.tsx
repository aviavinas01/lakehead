import AdminNav from "./AdminNav";
import UniversitiesPanel from "./UniversitiesPanel";

/**
 * Partner institutions — /admin/universities.
 *
 * ONE TAB, so this is a thin wrapper rather than a tab strip like Media,
 * Events & news and Our people. It is a separate file all the same, so the
 * screen has the same shape as its siblings: the page owns the chrome, the
 * panel owns the list. If a second tab ever appears here — course listings,
 * say — it goes in beside this one without the panel changing at all.
 */
export default function Universities() {
  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <h1>University partners</h1>
          <p className="adm-quiet">
            What appears on /university-partners, and a page each behind the
            logos.
          </p>
        </div>

        <UniversitiesPanel />
      </main>
    </div>
  );
}
