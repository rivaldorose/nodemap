"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Canvas from "@/components/Canvas";
import RootCard from "@/components/RootCard";
import ContactCard from "@/components/ContactCard";
import type { Contact } from "@/components/ContactCard";
import EdgeLayer from "@/components/EdgeLayer";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/Sidebar";
import AddContactModal from "@/components/AddContactModal";
import ContactDetail from "@/components/ContactDetail";

interface EventData {
  id: string;
  name: string;
  description: string | null;
  date: string | null;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  dashed: boolean;
}

const ROOT_X = 2500;
const ROOT_Y = 2500;

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addPosition, setAddPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  // Load events list for toolbar dropdown
  useEffect(() => {
    if (session) {
      fetch("/api/events")
        .then((r) => r.json())
        .then(setEvents)
        .catch(console.error);
    }
  }, [session]);

  // Load event contacts and connections
  useEffect(() => {
    if (!session || !eventId) return;

    fetch(`/api/contacts?eventId=${eventId}`)
      .then((r) => r.json())
      .then(setContacts)
      .catch(console.error);

    fetch("/api/connections")
      .then((r) => r.json())
      .then(setConnections)
      .catch(console.error);
  }, [session, eventId]);

  // Set current event from events list
  useEffect(() => {
    const found = events.find((e) => e.id === eventId);
    if (found) setEvent(found);
  }, [events, eventId]);

  // Center the canvas on the root card on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPan({
        x: window.innerWidth / 2 - ROOT_X,
        y: window.innerHeight / 2 - ROOT_Y,
      });
    }
  }, []);

  const handleDoubleClick = useCallback((canvasX: number, canvasY: number) => {
    setAddPosition({ x: canvasX, y: canvasY });
    setShowAddModal(true);
  }, []);

  const handleAddContact = useCallback(
    async (data: {
      name: string;
      role: string;
      company: string;
      linkedin: string;
      notes: string;
      status: "active" | "pending" | "inactive";
      color: string;
      tags: string[];
      x?: number;
      y?: number;
    }) => {
      const body: Record<string, unknown> = {
        eventId,
        name: data.name,
        role: data.role || null,
        company: data.company || null,
        linkedin: data.linkedin || null,
        notes: data.notes || null,
        status: data.status,
        color: data.color,
        tags: data.tags,
      };
      if (data.x !== undefined && data.y !== undefined) {
        body.x = Math.round(data.x);
        body.y = Math.round(data.y);
      }

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const contact = await res.json();
        setContacts((prev) => [...prev, contact]);
      }
    },
    [eventId]
  );

  const handleDragEnd = useCallback(
    async (id: string, x: number, y: number) => {
      // Optimistic update
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, x: Math.round(x), y: Math.round(y) } : c
        )
      );
      await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: Math.round(x), y: Math.round(y) }),
      });
    },
    []
  );

  const handleContactClick = useCallback((contact: Contact) => {
    setSelectedContact(contact);
  }, []);

  const handleUpdateContact = useCallback(
    async (id: string, data: Partial<Contact>) => {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    []
  );

  const handleDeleteContact = useCallback(async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.fromId !== id && c.toId !== id)
    );
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
  }, []);

  const handleAddTag = useCallback(
    async (contactId: string, label: string) => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, label }),
      });
      if (res.ok) {
        const tag = await res.json();
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId ? { ...c, tags: [...c.tags, tag] } : c
          )
        );
        // Update selected contact too
        setSelectedContact((prev) =>
          prev && prev.id === contactId
            ? { ...prev, tags: [...prev.tags, tag] }
            : prev
        );
      }
    },
    []
  );

  const handleDeleteTag = useCallback(async (tagId: string) => {
    await fetch(`/api/tags?id=${tagId}`, { method: "DELETE" });
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        tags: c.tags.filter((t) => t.id !== tagId),
      }))
    );
    setSelectedContact((prev) =>
      prev
        ? { ...prev, tags: prev.tags.filter((t) => t.id !== tagId) }
        : prev
    );
  }, []);

  // Connection creation via Shift+drag
  const handleShiftDragStart = useCallback((contactId: string) => {
    setConnectingFrom(contactId);
  }, []);

  const handleShiftDragEnd = useCallback(
    async (contactId: string) => {
      if (!connectingFrom || connectingFrom === contactId) {
        setConnectingFrom(null);
        return;
      }
      // Check for duplicate
      const exists = connections.some(
        (c) =>
          (c.fromId === connectingFrom && c.toId === contactId) ||
          (c.fromId === contactId && c.toId === connectingFrom)
      );
      if (exists) {
        setConnectingFrom(null);
        return;
      }

      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: connectingFrom,
          toId: contactId,
          dashed: false,
        }),
      });
      if (res.ok) {
        const conn = await res.json();
        setConnections((prev) => [...prev, conn]);
      }
      setConnectingFrom(null);
    },
    [connectingFrom, connections]
  );

  const handleFitView = useCallback(() => {
    if (typeof window !== "undefined") {
      setZoom(1);
      setPan({
        x: window.innerWidth / 2 - ROOT_X,
        y: window.innerHeight / 2 - ROOT_Y,
      });
    }
  }, []);

  const handleEventChange = useCallback(
    (newEventId: string) => {
      router.push(`/map/${newEventId}`);
    },
    [router]
  );

  if (status === "loading" || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="animate-pulse text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar
        onAddContact={() => setShowAddModal(true)}
        onFitView={handleFitView}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.2, 3))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
      />

      <Toolbar
        events={events}
        currentEventId={eventId}
        onEventChange={handleEventChange}
        contactCount={contacts.length}
        userName={session?.user?.name}
        userImage={session?.user?.image}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <Canvas
        zoom={zoom}
        pan={pan}
        onZoomChange={setZoom}
        onPanChange={setPan}
        onDoubleClick={handleDoubleClick}
      >
        <EdgeLayer
          contacts={contacts}
          connections={connections}
          rootX={ROOT_X}
          rootY={ROOT_Y}
        />
        <RootCard
          name={event.name}
          description={event.description}
          date={event.date}
          contactCount={contacts.length}
          x={ROOT_X}
          y={ROOT_Y}
        />
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onDragEnd={handleDragEnd}
            onClick={handleContactClick}
            onShiftDragStart={handleShiftDragStart}
            onShiftDragEnd={handleShiftDragEnd}
            isConnecting={connectingFrom === contact.id}
          />
        ))}
      </Canvas>

      <AddContactModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddPosition(null);
        }}
        onSubmit={handleAddContact}
        defaultX={addPosition?.x}
        defaultY={addPosition?.y}
      />

      {selectedContact && (
        <ContactDetail
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={handleUpdateContact}
          onDelete={handleDeleteContact}
          onAddTag={handleAddTag}
          onDeleteTag={handleDeleteTag}
        />
      )}
    </div>
  );
}
