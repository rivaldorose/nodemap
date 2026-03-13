import { NextRequest } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  const userEvents = await db
    .select()
    .from(events)
    .orderBy(events.createdAt);
  return jsonResponse(userEvents);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, date } = body;

  if (!name) {
    return errorResponse("Name is required");
  }

  const [newEvent] = await db
    .insert(events)
    .values({
      name,
      description: description || null,
      date: date ? new Date(date) : null,
    })
    .returning();

  return jsonResponse(newEvent, 201);
}
