import { apiFailure, apiJson, requireAdmin } from "@/lib/server/runtime";
import { assertSameOrigin, readJson } from "@/lib/server/security";
import { saveTracking, trackingReport } from "@/lib/server/tracking";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const url = new URL(request.url);
    return apiJson(await trackingReport(id, url.origin, url.searchParams));
  } catch (error) { return apiFailure(error); }
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    return apiJson(await saveTracking(id, await readJson(request), new URL(request.url).origin));
  } catch (error) { return apiFailure(error); }
}

