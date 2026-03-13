import { NextRequest } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contactId, label } = body;

  if (!contactId || !label) {
    return errorResponse("contactId and label are required");
  }

  const [newTag] = await db
    .insert(tags)
    .values({ contactId, label })
    .returning();

  return jsonResponse(newTag, 201);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return errorResponse("id is required");
  }

  await db.delete(tags).where(eq(tags.id, id));
  return jsonResponse({ success: true });
}
