"use client";
import { useState } from "react";
import { sse, type Step, type Interrupt } from "./api";

export function useMission() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [interrupt, setInterrupt] = useState<Interrupt | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const [done, setDone] = useState<{ tracking_id: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function consume(
    gen: AsyncGenerator<{ event: string; data: Record<string, unknown> }>,
  ) {
    for await (const { event, data } of gen) {
      if (event === "thread") setThreadId(data.thread_id as string);
      else if (event === "step") setSteps((s) => [...s, data as unknown as Step]);
      else if (event === "interrupt") setInterrupt(data as unknown as Interrupt);
      else if (event === "done") setDone(data as unknown as { tracking_id: string });
      else if (event === "error")
        setError((data.message as string) ?? "The agent hit an error mid-mission.");
    }
  }

  /** Wrap consume so a thrown fetch (backend down) surfaces as a calm error. */
  async function run(
    gen: AsyncGenerator<{ event: string; data: Record<string, unknown> }>,
  ) {
    setRunning(true);
    try {
      await consume(gen);
    } catch {
      setError(
        "Could not reach the agent. It may be offline or rate-limited — try again shortly.",
      );
    } finally {
      setRunning(false);
    }
  }

  async function start(image_b64: string, lat?: number, lng?: number) {
    setSteps([]);
    setInterrupt(null);
    setDone(null);
    setError(null);
    await run(sse("/mission/start", { image_b64, lat, lng }));
  }

  async function resume(value: unknown) {
    setInterrupt(null);
    setError(null);
    await run(sse("/mission/resume", { thread_id: threadId, value }));
  }

  /** Clear the mission so the user can file another. */
  function reset() {
    setSteps([]);
    setInterrupt(null);
    setDone(null);
    setError(null);
  }

  return { steps, interrupt, done, running, error, start, resume, reset };
}
