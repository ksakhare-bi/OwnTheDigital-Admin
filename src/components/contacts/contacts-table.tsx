"use client";

import { useState, useTransition } from "react";
import {
  Mail,
  Phone,
  Trash2,
  CheckCircle,
  Eye,
  Search,
  MessageSquare,
  X,
  Send,
  Archive,
  Clock,
} from "lucide-react";
import type { Contact, ContactStatus } from "@/types/contact";
import { updateContactStatusAction, deleteContactAction } from "@/app/actions";

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: ContactStatus) => {
    setActionError(null);
    startTransition(async () => {
      const res = await updateContactStatusAction(id, newStatus);
      if (!res.success) {
        setActionError(res.error || "Failed to update status");
      } else {
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await deleteContactAction(id);
      if (!res.success) {
        setActionError(res.error || "Failed to delete message");
      } else {
        setDeleteConfirmId(null);
        if (selectedContact?.id === id) {
          setSelectedContact(null);
        }
      }
    });
  };

  const openContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (contact.status === "new") {
      handleStatusChange(contact.id, "read");
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesStatus =
      filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset">
            <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
            New
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-500/20 ring-inset">
            <Clock className="size-3 text-zinc-500" />
            Read
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
            <CheckCircle className="size-3 text-emerald-600" />
            Replied
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 ring-inset">
            <Archive className="size-3 text-amber-600" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex justify-between items-center">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All Messages", count: contacts.length },
            {
              id: "new",
              label: "New",
              count: contacts.filter((c) => c.status === "new").length,
            },
            {
              id: "read",
              label: "Read",
              count: contacts.filter((c) => c.status === "read").length,
            },
            {
              id: "replied",
              label: "Replied",
              count: contacts.filter((c) => c.status === "replied").length,
            },
            {
              id: "archived",
              label: "Archived",
              count: contacts.filter((c) => c.status === "archived").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  filterStatus === tab.id
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-1.5 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xs">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto size-10 text-zinc-300" />
            <h3 className="mt-3 text-sm font-bold text-zinc-800">No contact messages found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "When users submit the website contact form, their inquiries will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Contact Name</th>
                  <th className="px-5 py-3.5">Email & Phone</th>
                  <th className="px-5 py-3.5">Message Snippet</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Received Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-zinc-50/80 transition-colors ${
                      contact.status === "new" ? "bg-blue-50/20 font-medium" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                          {contact.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-zinc-900">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                        >
                          <Mail className="size-3.5" />
                          <span>{contact.email}</span>
                        </a>
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <Phone className="size-3.5" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="truncate text-zinc-600">{contact.message}</p>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(contact.status)}</td>
                    <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">
                      {new Date(contact.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openContact(contact)}
                          title="View Message Details"
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                          <Eye className="size-4" />
                        </button>
                        <a
                          href={`mailto:${contact.email}?subject=${encodeURIComponent(
                            "Re: Your inquiry on Own The Digital"
                          )}`}
                          onClick={() => {
                            if (contact.status !== "replied") {
                              handleStatusChange(contact.id, "replied");
                            }
                          }}
                          title="Reply via Email"
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Send className="size-4" />
                        </a>
                        <button
                          onClick={() => setDeleteConfirmId(contact.id)}
                          title="Delete Contact"
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-zinc-900">{selectedContact.name}</h3>
                  {getStatusBadge(selectedContact.status)}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Received on{" "}
                  {new Date(selectedContact.createdAt).toLocaleString(undefined, {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Contact Info Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</p>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="mt-1 flex items-center gap-2 font-semibold text-blue-600 hover:underline text-sm"
                  >
                    <Mail className="size-4" />
                    <span>{selectedContact.email}</span>
                  </a>
                </div>
                <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Phone Number</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold text-zinc-800 text-sm">
                    <Phone className="size-4 text-zinc-500" />
                    <span>{selectedContact.phone || "Not provided"}</span>
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Message / Question</p>
                <div className="rounded-xl bg-zinc-50/80 p-5 border border-zinc-200 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </div>
              </div>

              {/* Quick Status Setter */}
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["new", "read", "replied", "archived"] as ContactStatus[]).map((st) => (
                    <button
                      key={st}
                      disabled={isPending}
                      onClick={() => handleStatusChange(selectedContact.id, st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        selectedContact.status === st
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      Mark as {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
              <button
                disabled={isPending}
                onClick={() => setDeleteConfirmId(selectedContact.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="size-4" />
                <span>Delete Inquiry</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                    "Re: Your inquiry on Own The Digital"
                  )}`}
                  onClick={() => handleStatusChange(selectedContact.id, "replied")}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Send className="size-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900">Delete Contact Inquiry?</h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isPending}
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
