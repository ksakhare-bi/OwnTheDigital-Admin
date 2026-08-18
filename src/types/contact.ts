export type ContactStatus = "new" | "read" | "replied" | "archived";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface UpdateContactStatusInput {
  status: ContactStatus;
}
