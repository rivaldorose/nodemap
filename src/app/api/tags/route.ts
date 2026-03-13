import { NextRequest } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, jsonResponse, errorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
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
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return errorResponse("id is required");
    }

    await db.delete(tags).where(eq(tags.id, id));
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
