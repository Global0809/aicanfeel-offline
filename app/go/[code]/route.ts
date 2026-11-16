import { campaignRedirect } from "@/lib/server/tracking";

export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  try { return await campaignRedirect((await context.params).code, true); }
  catch { return new Response("This campaign link is temporarily unavailable.", { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
export async function HEAD(_request: Request, context: { params: Promise<{ code: string }> }) {
  try { return await campaignRedirect((await context.params).code, false); }
  catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

