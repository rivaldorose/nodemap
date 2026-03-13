import { NextRequest } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, jsonResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, session.user!.id!))
      .orderBy(events.createdAt);
    return jsonResponse(userEvents);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { name, description, date } = body;

    if (!name) {
      return errorResponse("Name is required");
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        userId: session.user!.id!,
        name,
        description: description || null,
        date: date ? new Date(date) : null,
      })
      .returning();

    return jsonResponse(newEvent, 201);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
