export const API = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export type Step = { node: string; text: string; ts: string };

export type Interrupt =
  | { type: "clarify"; question: string }
  | { type: "approve"; artifacts: Artifacts };

export type Recycler = { name: string; distance_km?: number; distance?: number };

export type Routing = {
  authority?: string;
  recyclers?: Recycler[];
};

export type Artifacts = {
  complaint?: string;
  draft?: string;
  authority?: string;
  dossier_path?: string;
  routing?: Routing;
  [key: string]: unknown;
};

export type CaseRecord = {
  tracking_id: string;
  category: string;
  lat: number;
  lng: number;
  authority: string;
  address: string;
  created_at: string;
};

export async function* sse(
  path: string,
  body: unknown,
): AsyncGenerator<{ event: string; data: Record<string, unknown> }> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const p of parts) {
      const ev = p.match(/event: (.*)/)?.[1] ?? "message";
      const data = JSON.parse(p.match(/data: (.*)/s)?.[1] ?? "{}");
      yield { event: ev, data };
    }
  }
}
