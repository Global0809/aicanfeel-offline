import { apiFailure, apiJson, requireAdmin } from "@/lib/server/runtime";
import { assertSameOrigin, readJson } from "@/lib/server/security";
import { shareDeliverables } from "@/lib/server/deliverables";

export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    return apiJson(await shareDeliverables(id, await readJson(request, 32000), new URL(request.url).origin));
  } catch (error) { return apiFailure(error); }
}

