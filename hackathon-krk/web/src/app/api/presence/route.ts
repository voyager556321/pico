/**
 * Editor heartbeat. A VS Code extension (or any local tool) can POST here
 * while the executor is in the editor. The work page polls GET and counts a
 * fresh beat as presence, even if the browser tab is in the background.
 *
 * POST { "taskId": "...", "wallet": "...", "source": "editor" }
 */

const beats = new Map<string, number>();
const FRESH_MS = 8_000;

function keyOf(taskId: string, wallet: string) {
  return `${taskId}:${wallet}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    taskId?: string;
    wallet?: string;
    source?: string;
  } | null;
  if (!body?.taskId || !body.wallet) {
    return Response.json({ error: "taskId and wallet are required" }, { status: 400 });
  }
  beats.set(keyOf(body.taskId, body.wallet), Date.now());
  return Response.json({ ok: true, source: body.source === "editor" ? "editor" : "web" });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId") ?? "";
  const wallet = url.searchParams.get("wallet") ?? "";
  const at = beats.get(keyOf(taskId, wallet)) ?? 0;
  return Response.json({ at, fresh: at > 0 && Date.now() - at < FRESH_MS });
}
