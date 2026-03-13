"use client";

import { useRef, useState, useCallback, type MouseEvent } from "react";
import { getTagColor } from "@/lib/utils";

export interface ContactTag {
  id: string;
  label: string;
}

export interface Contact {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  linkedin?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  status: "active" | "pending" | "inactive";
  color?: string | null;
  x: number;
  y: number;
  tags: ContactTag[];
}

interface ContactCardProps {
  contact: Contact;
  onDragEnd: (id: string, x: number, y: number) => void;
  onClick: (contact: Contact) => void;
  onShiftDragStart?: (contactId: string) => void;
  onShiftDragEnd?: (contactId: string) => void;
  isConnecting?: boolean;
}

const STATUS_COLORS = {
  active: "bg-green-400",
  pending: "bg-yellow-400",
  inactive: "bg-gray-400",
};

export default function ContactCard({
  contact,
  onDragEnd,
  onClick,
  onShiftDragStart,
  onShiftDragEnd,
  isConnecting,
}: ContactCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: contact.x, y: contact.y });
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      if (e.shiftKey && onShiftDragStart) {
        onShiftDragStart(contact.id);
        return;
      }

      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: contact.x,
        origY: contact.y,
      };

      const handleMove = (ev: globalThis.MouseEvent) => {
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        setDragPos({
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        });
      };

      const handleUp = (ev: globalThis.MouseEvent) => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        setIsDragging(false);

        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;

        // If barely moved, treat as click
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
          onClick(contact);
        } else {
          onDragEnd(
            contact.id,
            dragRef.current.origX + dx,
            dragRef.current.origY + dy
          );
        }
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [contact, onDragEnd, onClick, onShiftDragStart]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (e.shiftKey && onShiftDragEnd) {
        onShiftDragEnd(contact.id);
      }
    },
    [contact.id, onShiftDragEnd]
  );

  const x = isDragging ? dragPos.x : contact.x;
  const y = isDragging ? dragPos.y : contact.y;

  return (
    <div
      className={`absolute select-none transition-shadow ${
        isDragging ? "z-50 shadow-lg" : "z-10 shadow-sm"
      } ${isConnecting ? "ring-2 ring-blue-400" : ""}`}
      style={{
        left: x - 137,
        top: y - 50,
        width: 275,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 cursor-move hover:shadow-md transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[contact.status]}`}
          />
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: contact.color || "#3b82f6" }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-800 text-sm truncate">
              {contact.name}
            </h4>
            {contact.role && (
              <p className="text-xs text-slate-500 truncate">{contact.role}</p>
            )}
          </div>
        </div>

        {contact.company && (
          <p className="text-xs text-slate-400 mb-2 truncate">
            {contact.company}
          </p>
        )}

        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {contact.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium text-slate-600"
                style={{ backgroundColor: getTagColor(tag.label) }}
              >
                #{tag.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
