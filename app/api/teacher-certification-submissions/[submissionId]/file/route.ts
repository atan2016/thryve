import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
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

export async function GET(_request: Request, context: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await context.params;
  if (!submissionId?.trim()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const row = await db.teacherCertificationSubmission.findUnique({
    where: { id: submissionId },
    select: {
      fileData: true,
      mimeType: true,
      fileName: true,
      teacher: {
        select: {
          userId: true
        }
      }
    }
  });

  const body = row?.fileData;
  if (!row || byteLength(body as Buffer | undefined) === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAdmin = session.role === "admin";
  const ownerUserId = row.teacher.userId;
  const isOwner = Boolean(ownerUserId && ownerUserId === session.userId);

  if (!isAdmin && !isOwner) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const mimeType = row.mimeType?.trim() || "application/octet-stream";
  const safeName = row.fileName.replace(/[\r\n"]/g, "_").slice(0, 180);

  return new NextResponse(body as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
