"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { API, type Artifacts, type Citation } from "../lib/api";
import { ClickSpark } from "./reactbits/ClickSpark";
import { StarBorder } from "./reactbits/StarBorder";

function dossierUrl(path?: string): string | null {
  if (!path) return null;
  const file = path.split(/[/\\]/).pop();
  return file ? `${API}/artifacts/${file}` : null;
}

function DocGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13 3v5h5M9 13h6M9 16.5h4" />
    </svg>
  );
}

function recyclerDistance(r: { distance_km?: number; distance?: number }) {
  const d = r.distance_km ?? r.distance;
  return typeof d === "number" ? `${d.toFixed(1)} km` : null;
}

/** Severity → palette-locked styling. high leans clay-on-forest for emphasis. */
function severityStyle(severity?: string): { label: string; cls: string } {
  const s = (severity ?? "").toLowerCase();
  if (s === "high")
    return {
      label: "High severity",
      cls: "border-clay/40 bg-clay/10 text-clay",
    };
  if (s === "medium")
    return {
      label: "Medium severity",
      cls: "border-clay-soft/50 bg-clay-soft/10 text-clay",
    };
  if (s === "low")
    return {
      label: "Low severity",
      cls: "border-stone-300 bg-stone-100 text-stone-600",
    };
  return { label: `${severity} severity`, cls: "border-stone-300 bg-stone-100 text-stone-600" };
}

/** Small confidence meter — forest bar over stone track. */
function Confidence({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-cream px-3 py-1.5 text-sm text-stone-600">
      <span className="text-stone-600/70">Confidence</span>
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-stone-300">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-forest"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </span>
      <span className="font-medium text-forest">{pct}%</span>
    </span>
  );
}

/** A citation chip; clicking reveals the `why` rationale beneath. */
function CitationChip({ c }: { c: Citation }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={c.why}
        className="inline-flex items-center gap-1.5 rounded-lg border border-forest/20 bg-forest/[0.06] px-3 py-1.5 text-left text-xs font-medium text-forest transition-colors hover:bg-forest/10"
      >
        <span>{c.act}</span>
        <span className="text-forest-soft">·</span>
        <span className="text-forest-soft">{c.section}</span>
      </button>
      {open && c.why && (
        <motion.span
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 max-w-xs rounded-md bg-stone-100 px-2.5 py-1.5 text-[11px] leading-relaxed text-stone-600"
        >
          {c.why}
        </motion.span>
      )}
    </span>
  );
}

/** Letterhead seal — a small forest monogram. */
function Seal() {
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest/30 text-forest"
      style={{ fontFamily: "var(--font-display)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M20 4C9 4 4 10.5 4 17c0 1.2.2 2.3.5 3 .3-3.7 2.4-7.4 6-9.6 2.7-1.7 6-2.6 9.5-2.9-2.8 1-5 2.4-6.6 4-2 2-3 4.4-3.4 7 3.8.2 7-.7 9.3-3C28 11 22 4 20 4Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function ApproveGate({
  artifacts,
  onResume,
  running,
}: {
  artifacts: Artifacts;
  onResume: (value: unknown) => void;
  running: boolean;
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState("");
  const [sending, setSending] = useState(false);

  const draft = artifacts.complaint ?? artifacts.draft ?? "";
  const issue = artifacts.issue;
  const authority = artifacts.authority ?? artifacts.routing?.authority;
  const recyclers = artifacts.routing?.recyclers ?? [];
  const nearestRecycler = recyclers[0];
  const wardAuthority = artifacts.routing?.authority;
  const citations = artifacts.citations ?? [];
  const sdgs = artifacts.sdgs ?? [];
  const dossier = dossierUrl(artifacts.dossier_path);
  const sev = issue ? severityStyle(issue.severity) : null;

  function approve() {
    setSending(true);
    onResume({ action: "approved" });
  }

  const busy = running || sending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden p-6 sm:p-7"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-clay" />
          </span>
          Ready for your approval
        </span>
        {dossier && (
          <a
            href={dossier}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest underline-offset-4 hover:underline"
          >
            <DocGlyph />
            Evidence dossier
          </a>
        )}
      </div>

      <h3 className="mt-3 text-xl sm:text-2xl">Review the drafted complaint</h3>

      {/* Issue meta: category, severity, confidence */}
      {issue && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-forest/20 bg-forest/[0.06] px-3 py-1.5 text-sm font-medium text-forest">
            {issue.category}
          </span>
          {sev && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${sev.cls}`}
            >
              {sev.label}
            </span>
          )}
          {typeof issue.confidence === "number" && (
            <Confidence value={issue.confidence} />
          )}
        </div>
      )}

      {/* Hazards */}
      {issue?.hazards?.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {issue.hazards.map((h) => (
            <span
              key={h}
              className="rounded-full border border-stone-300 bg-cream px-2.5 py-1 text-xs text-stone-600"
            >
              {h}
            </span>
          ))}
        </div>
      ) : null}

      {/* Citations */}
      {citations.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest text-stone-600">
            Grounded in law
          </p>
          <div className="mt-2 flex flex-wrap items-start gap-2">
            {citations.map((c, i) => (
              <CitationChip key={`${c.act}-${c.section}-${i}`} c={c} />
            ))}
          </div>
        </div>
      )}

      {/* Routing */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-widest text-stone-600">
          Routing
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {authority && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-cream px-3 py-1.5 text-sm text-stone-600">
              <span className="text-stone-600/70">To</span>
              <span className="font-medium text-forest">{authority}</span>
            </span>
          )}
          {nearestRecycler ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-cream px-3 py-1.5 text-sm text-stone-600">
              <span className="text-stone-600/70">Nearest recycler</span>
              <span className="font-medium text-forest">
                {nearestRecycler.name}
              </span>
              {recyclerDistance(nearestRecycler) && (
                <span className="text-clay">
                  · {recyclerDistance(nearestRecycler)}
                </span>
              )}
            </span>
          ) : (
            wardAuthority &&
            wardAuthority !== authority && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-cream px-3 py-1.5 text-sm text-stone-600">
                <span className="text-stone-600/70">Ward authority</span>
                <span className="font-medium text-forest">{wardAuthority}</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* SDGs */}
      {sdgs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {sdgs.map((s) => (
            <span
              key={s}
              className="rounded-full bg-forest-soft/10 px-2.5 py-1 text-xs font-medium text-forest-soft"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Drafted complaint — letterhead card */}
      <div className="mt-5 overflow-hidden rounded-xl border border-stone-300 bg-paper">
        <div className="h-1 w-full bg-forest" />
        <div className="flex items-center gap-3 border-b border-stone-300/70 px-5 py-3.5">
          <Seal />
          <div className="min-w-0">
            <p
              className="text-sm font-medium text-forest"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Formal Complaint
            </p>
            {authority && (
              <p className="truncate text-xs text-stone-600">To: {authority}</p>
            )}
          </div>
        </div>
        <div className="max-h-72 overflow-auto px-5 py-4">
          <p className="mx-auto max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-stone-900">
            {draft || "No draft text was returned."}
          </p>
        </div>
      </div>

      {/* Optional edit instruction */}
      {showEdit && (
        <motion.textarea
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          value={edit}
          onChange={(e) => setEdit(e.target.value)}
          disabled={busy}
          placeholder="What should the agent change? e.g. Add the time of day and a firmer tone."
          rows={3}
          className="mt-4 w-full resize-none rounded-[14px] border border-stone-300 bg-paper px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-600/70 focus:border-forest-soft disabled:opacity-60"
        />
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-3">
        <StarBorder className="w-full">
          <ClickSpark className="w-full" color="#e07a5f">
            <button
              type="button"
              disabled={busy}
              onClick={approve}
              className="btn-primary w-full justify-center text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Sending…" : "Approve & Send"}
            </button>
          </ClickSpark>
        </StarBorder>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (showEdit && edit.trim()) {
                onResume({ action: "edit", edit: edit.trim() });
              } else {
                setShowEdit((v) => !v);
              }
            }}
            className="btn-ghost flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {showEdit
              ? edit.trim()
                ? "Submit edit"
                : "Cancel edit"
              : "Request edit"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onResume({ action: "rejected" })}
            className="rounded-[14px] border border-stone-300 px-5 py-3 text-sm font-medium text-clay transition-colors hover:border-clay/50 hover:bg-clay/5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            Reject
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-stone-600">
        Demo-safe: nothing is sent to a real authority.
      </p>
    </motion.div>
  );
}
