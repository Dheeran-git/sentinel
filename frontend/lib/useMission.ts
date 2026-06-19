"use client";
import { useState } from "react";
import { sse, type Step, type Interrupt } from "./api";

export function useMission() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [interrupt, setInterrupt] = useState<Interrupt | null>(null);
  const [threadId, setThreadId] = useState<string>("");
  const [done, setDone] = useState<{ tracking_id: string } | null>(null);
  const [running, setRunning] = useState(false);

  async function consume(
    gen: AsyncGenerator<{ event: string; data: Record<string, unknown> }>,
  ) {
    for await (const { event, data } of gen) {
      if (event === "thread") setThreadId(data.thread_id as string);
      else if (event === "step") setSteps((s) => [...s, data as unknown as Step]);
      else if (event === "interrupt") setInterrupt(data as unknown as Interrupt);
      else if (event === "done") setDone(data as unknown as { tracking_id: string });
    }
  }

  async function start(image_b64: string, lat?: number, lng?: number) {
    setSteps([]);
    setInterrupt(null);
    setDone(null);
    setRunning(true);
    try {
      await consume(sse("/mission/start", { image_b64, lat, lng }));
    } finally {
      setRunning(false);
    }
  }

  async function resume(value: unknown) {
    setInterrupt(null);
    setRunning(true);
    try {
      await consume(sse("/mission/resume", { thread_id: threadId, value }));
    } finally {
      setRunning(false);
    }
  }

  return { steps, interrupt, done, running, start, resume };
}
