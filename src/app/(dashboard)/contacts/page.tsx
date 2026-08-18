import { AdminShell } from "@/components/layout/admin-shell";
import { listContacts } from "@/services/contacts.service";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default async function ContactsPage() {
  const contacts = await listContacts();

  return (
    <AdminShell title="Contact Messages">
      <ContactsTable contacts={contacts} />
    </AdminShell>
  );
}
