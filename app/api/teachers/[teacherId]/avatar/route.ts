import { NextResponse } from "next/server";

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

export async function GET(request: Request, context: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await context.params;
  if (!teacherId?.trim()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const row = await db.teacher.findUnique({
    where: { id: teacherId },
    select: {
      avatarImage: true,
      avatarImageMimeType: true,
      avatarUrl: true
    }
  });

  if (!row) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bytes = row.avatarImage;
  if (byteLength(bytes as Buffer | undefined) > 0) {
    const mimeType = row.avatarImageMimeType?.trim() || "image/jpeg";
    return new NextResponse(bytes as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  }

  const external = row.avatarUrl?.trim();
  if (external?.startsWith("http://") || external?.startsWith("https://")) {
    return NextResponse.redirect(external, 302);
  }

  if (external?.startsWith("/")) {
    return NextResponse.redirect(new URL(external, request.url), 302);
  }

  return new NextResponse("Not found", { status: 404 });
}
