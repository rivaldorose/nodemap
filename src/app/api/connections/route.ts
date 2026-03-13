import { NextRequest } from "next/server";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  const allConnections = await db.select().from(connections);
  return jsonResponse(allConnections);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fromId, toId, dashed } = body;

  if (!fromId || !toId) {
    return errorResponse("fromId and toId are required");
  }

  if (fromId === toId) {
    return errorResponse("Cannot connect a contact to itself");
  }

  // Check if connection already exists
  const existing = await db
    .select()
    .from(connections)
    .where(and(eq(connections.fromId, fromId), eq(connections.toId, toId)));

  if (existing.length > 0) {
    return errorResponse("Connection already exists");
  }

  const [newConnection] = await db
    .insert(connections)
    .values({
      fromId,
      toId,
      dashed: dashed || false,
    })
    .returning();

  return jsonResponse(newConnection, 201);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return errorResponse("id is required");
  }

  await db.delete(connections).where(eq(connections.id, id));
  return jsonResponse({ success: true });
}
