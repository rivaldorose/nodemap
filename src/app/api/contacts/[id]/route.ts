import { NextRequest } from "next/server";
import { db } from "@/db";
import { contacts, tags, connections } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { requireAuth, jsonResponse, errorResponse } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const body = await req.json();
    const { id } = params;

    const updateData: Record<string, unknown> = {};
    const fields = [
      "name",
      "role",
      "company",
      "linkedin",
      "notes",
      "status",
      "color",
      "x",
      "y",
    ];
    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const [updated] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();

    if (!updated) {
      return errorResponse("Contact not found", 404);
    }

    const contactTags = await db
      .select()
      .from(tags)
      .where(eq(tags.contactId, id));

    return jsonResponse({ ...updated, tags: contactTags });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const { id } = params;

    // Delete related connections first
    await db
      .delete(connections)
      .where(or(eq(connections.fromId, id), eq(connections.toId, id)));

    // Delete tags
    await db.delete(tags).where(eq(tags.contactId, id));

    // Delete the contact
    const [deleted] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();

    if (!deleted) {
      return errorResponse("Contact not found", 404);
    }

    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
