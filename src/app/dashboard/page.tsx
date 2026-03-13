"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/events")
        .then((r) => r.json())
        .then(setEvents)
        .catch(console.error);
    }
  }, [session]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        date: date || null,
      }),
    });
    if (res.ok) {
      const event = await res.json();
      setEvents((prev) => [event, ...prev]);
      setName("");
      setDescription("");
      setDate("");
      setShowCreate(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">NodeMap</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Your Events</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700"
          >
            + New Event
          </button>
        </div>

        {showCreate && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Event name"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No events yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => router.push(`/map/${event.id}`)}
                className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-medium text-slate-800">{event.name}</h3>
                {event.description && (
                  <p className="text-sm text-slate-500 mt-1">
                    {event.description}
                  </p>
                )}
                {event.date && (
                  <p className="text-xs text-slate-400 mt-2">{event.date}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
