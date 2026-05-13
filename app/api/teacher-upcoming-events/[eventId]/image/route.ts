import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

function byteLength(value: Buffer | Uint8Array | null | undefined): number {
  if (value == null) {
    return 0;
  }
  if (Buffer.isBuffer(value)) {
    return value.length;
  }
  if (value instanceof Uint8Array) {
    return value.byteLength;
  }
  return 0;
}

export async function GET(_request: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  if (!eventId?.trim()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const row = await db.teacherUpcomingEvent.findUnique({
    where: { id: eventId },
    select: {
      eventImage: true,
      eventImageMimeType: true,
      teacher: {
        select: {
          published: true,
          userId: true
        }
      }
    }
  });

  const body = row?.eventImage;
  if (!row || byteLength(body as Buffer | undefined) === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const mimeType = row.eventImageMimeType?.trim() || "application/octet-stream";

  if (row.teacher.published) {
    return new NextResponse(body as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  }

  const user = await getCurrentUser();
  if (user && user.id === row.teacher.userId) {
    return new NextResponse(body as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, no-store"
      }
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}
