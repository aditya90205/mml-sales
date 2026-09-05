import { AppPage } from "../../../components/common/AppPage.jsx";
import VisitsMeetingsTab from "../deal-tabs/VisitsMeetingsTab.jsx";

/**
 * Same "Visits & Meetings" content shown inside a deal's tabs, surfaced here
 * as its own page for the "Smart Home & Office Visits" quick link on the
 * Pipeline Board — so both entry points show one consistent view.
 */
export default function HomeOfficeVisitsPage() {
  return (
    <AppPage title="Smart Home & Office Visits">
      <VisitsMeetingsTab />
    </AppPage>
  );
}
