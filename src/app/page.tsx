import { Suspense } from "react";

import { CrmDashboard } from "@/components/crm/crm-dashboard";
import { CrmDashboardSkeleton } from "@/components/crm/crm-dashboard-skeleton";
import { requireUser } from "@/lib/auth";
import { getContacts } from "@/lib/contacts-data";

async function Contacts() {
  const user = await requireUser();
  const contacts = await getContacts();
  return <CrmDashboard contacts={contacts} userEmail={user.email} />;
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
