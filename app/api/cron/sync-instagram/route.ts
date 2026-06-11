import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { syncConfiguredInstagramAccounts } from "@/lib/instagram-sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await syncConfiguredInstagramAccounts();

  revalidatePath("/");
  for (const synced of result.results) {
    revalidatePath(`/teachers/${synced.teacherSlug}`);
  }

  return NextResponse.json({
    ok: true,
    ...result
  });
}
