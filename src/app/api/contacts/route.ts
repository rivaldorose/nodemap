import { NextRequest } from "next/server";
import { db } from "@/db";
import { contacts, tags } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  requireAuth,
  jsonResponse,
  errorResponse,
  getRadialPosition,
} from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const eventId = req.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return errorResponse("eventId is required");
    }

    const contactList = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, session.user!.id!),
          eq(contacts.eventId, eventId)
        )
      )
      .orderBy(contacts.createdAt);

    // Fetch tags for each contact
    const contactsWithTags = await Promise.all(
      contactList.map(async (contact) => {
        const contactTags = await db
          .select()
          .from(tags)
          .where(eq(tags.contactId, contact.id));
        return { ...contact, tags: contactTags };
      })
    );

    return jsonResponse(contactsWithTags);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { eventId, name, role, company, linkedin, notes, status, color } =
      body;

    if (!eventId || !name) {
      return errorResponse("eventId and name are required");
    }

    // Count existing contacts for radial positioning
    const existing = await db
      .select()
      .from(contacts)
      .where(eq(contacts.eventId, eventId));

    const position = getRadialPosition(
      existing.length,
      existing.length + 1,
      600,
      400
    );

    const [newContact] = await db
      .insert(contacts)
      .values({
        userId: session.user!.id!,
        eventId,
        name,
        role: role || null,
        company: company || null,
        linkedin: linkedin || null,
        notes: notes || null,
        status: status || "active",
        color: color || "#3b82f6",
        x: body.x ?? position.x,
        y: body.y ?? position.y,
      })
      .returning();

    // Create tags if provided
    if (body.tags && Array.isArray(body.tags)) {
      for (const label of body.tags) {
        await db.insert(tags).values({ contactId: newContact.id, label });
      }
    }

    const contactTags = await db
      .select()
      .from(tags)
      .where(eq(tags.contactId, newContact.id));

    return jsonResponse({ ...newContact, tags: contactTags }, 201);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
