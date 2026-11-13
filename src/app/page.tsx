import { Suspense } from "react";

import { CrmDashboard } from "@/components/crm/crm-dashboard";
import { CrmDashboardSkeleton } from "@/components/crm/crm-dashboard-skeleton";
import { getContacts } from "@/lib/contacts-data";

async function Contacts() {
  const contacts = await getContacts();
  return <CrmDashboard contacts={contacts} />;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<CrmDashboardSkeleton />}>
        <Contacts />
      </Suspense>
    </main>
  );
}
