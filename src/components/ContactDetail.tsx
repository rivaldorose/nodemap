"use client";

import { useState } from "react";
import type { Contact } from "./ContactCard";
import { getTagColor } from "@/lib/utils";

interface ContactDetailProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Contact>) => void;
  onDelete: (id: string) => void;
  onAddTag: (contactId: string, label: string) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function ContactDetail({
  contact,
  onClose,
  onUpdate,
  onDelete,
  onAddTag,
  onDeleteTag,
}: ContactDetailProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(contact.name);
  const [role, setRole] = useState(contact.role || "");
  const [company, setCompany] = useState(contact.company || "");
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [notes, setNotes] = useState(contact.notes || "");
  const [status, setStatus] = useState(contact.status);
  const [tagInput, setTagInput] = useState("");

  const handleSave = () => {
    onUpdate(contact.id, { name, role, company, email, phone, notes, status });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: contact.color || "#3b82f6" }}
            />
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-semibold text-slate-800 dark:text-slate-100 text-sm border-b border-blue-400 focus:outline-none bg-transparent"
              />
            ) : (
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                {contact.name}
              </h3>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none dark:bg-slate-700 dark:text-slate-200"
            />
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none dark:bg-slate-700 dark:text-slate-200"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none dark:bg-slate-700 dark:text-slate-200"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              type="tel"
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none dark:bg-slate-700 dark:text-slate-200"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows={2}
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm focus:outline-none resize-none dark:bg-slate-700 dark:text-slate-200"
            />
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "active" | "pending" | "inactive")
              }
              className="w-full px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {contact.role && (
              <p className="text-slate-600 dark:text-slate-300">{contact.role}</p>
            )}
            {contact.company && (
              <p className="text-slate-500 dark:text-slate-400">{contact.company}</p>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-blue-500 text-xs hover:underline block"
              >
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="text-blue-500 text-xs hover:underline block"
              >
                {contact.phone}
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-xs hover:underline block"
              >
                LinkedIn Profile
              </a>
            )}
            {contact.notes && (
              <p className="text-slate-400 dark:text-slate-500 text-xs">{contact.notes}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 pt-1">
              {contact.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 flex items-center gap-1"
                  style={{ backgroundColor: getTagColor(tag.label) }}
                >
                  #{tag.label}
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            {/* Add tag input */}
            <div className="flex gap-1">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    onAddTag(contact.id, tagInput.trim());
                    setTagInput("");
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-600 rounded text-xs focus:outline-none dark:bg-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(contact.id);
                  onClose();
                }}
                className="px-3 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
