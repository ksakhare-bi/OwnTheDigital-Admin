import { connectToDatabase } from "@/lib/db";
import { ContactModel } from "@/models/contact.model";
import type { Contact, ContactStatus } from "@/types/contact";

type DbContactDoc = {
  _id: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
};

function mapContact(doc: DbContactDoc): Contact {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone || "",
    message: doc.message,
    status: doc.status || "new",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listContacts(status?: ContactStatus): Promise<Contact[]> {
  await connectToDatabase();
  const query = status ? { status } : {};
  const contacts = await ContactModel.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return (contacts as unknown as DbContactDoc[]).map(mapContact);
}

export async function getContactById(id: string): Promise<Contact | null> {
  await connectToDatabase();
  const contact = await ContactModel.findById(id).lean();
  return contact ? mapContact(contact as unknown as DbContactDoc) : null;
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
): Promise<Contact | null> {
  await connectToDatabase();
  const contact = await ContactModel.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  ).lean();

  return contact ? mapContact(contact as unknown as DbContactDoc) : null;
}

export async function deleteContact(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ContactModel.findByIdAndDelete(id);
  return Boolean(result);
}

export async function getContactStats() {
  await connectToDatabase();

  const [total, newCount, readCount, repliedCount, archivedCount] =
    await Promise.all([
      ContactModel.countDocuments(),
      ContactModel.countDocuments({ status: "new" }),
      ContactModel.countDocuments({ status: "read" }),
      ContactModel.countDocuments({ status: "replied" }),
      ContactModel.countDocuments({ status: "archived" }),
    ]);

  return {
    total,
    newCount,
    readCount,
    repliedCount,
    archivedCount,
  };
}
