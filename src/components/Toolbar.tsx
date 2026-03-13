"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  name: string;
}

interface ToolbarProps {
  events: Event[];
  currentEventId: string;
  onEventChange: (eventId: string) => void;
  contactCount: number;
}

export default function Toolbar({
  events,
  currentEventId,
  onEventChange,
  contactCount,
}: ToolbarProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="fixed top-0 left-[52px] right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-40">
      {/* Left: Event selector */}
      <div className="flex items-center gap-3">
        <select
          value={currentEventId}
          onChange={(e) => onEventChange(e.target.value)}
          className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Center: Timer */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-mono">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Right: Contact count */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          {contactCount} contacts
        </span>
      </div>
    </div>
  );
}
