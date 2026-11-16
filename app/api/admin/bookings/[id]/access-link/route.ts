import { apiFailure, apiJson, requireAdmin } from "@/lib/server/runtime";
import { assertSameOrigin, readJson } from "@/lib/server/security";
import { rotateReceiptLink } from "@/lib/server/operator";

export const dynamic = "force-dynamic";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin(request);
    const { id } = await context.params;
    return apiJson(await rotateReceiptLink(id, await readJson(request)));
  } catch (error) { return apiFailure(error); }
}

