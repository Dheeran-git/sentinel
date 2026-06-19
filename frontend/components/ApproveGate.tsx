"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { API, type Artifacts } from "../lib/api";
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

  const draft = artifacts.complaint ?? artifacts.draft ?? "";
  const authority = artifacts.authority ?? artifacts.routing?.authority;
  const recyclers = artifacts.routing?.recyclers ?? [];
  const nearestRecycler = recyclers[0];
  const dossier = dossierUrl(artifacts.dossier_path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card overflow-hidden p-6 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
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

      <h3 className="mt-3 text-xl">Review the drafted complaint</h3>

      {/* Routing summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        {authority && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-cream px-3 py-1.5 text-sm text-stone-600">
            <span className="text-stone-600/70">To</span>
            <span className="font-medium text-forest">{authority}</span>
          </span>
        )}
        {nearestRecycler && (
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
        )}
      </div>

      {/* Drafted complaint */}
      <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-stone-300 bg-stone-100 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-900">
          {draft || "No draft text was returned."}
        </p>
      </div>

      {/* Optional edit instruction */}
      {showEdit && (
        <motion.textarea
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          value={edit}
          onChange={(e) => setEdit(e.target.value)}
          disabled={running}
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
              disabled={running}
              onClick={() => onResume({ action: "approved" })}
              className="btn-primary w-full justify-center text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Sending…" : "Approve & Send"}
            </button>
          </ClickSpark>
        </StarBorder>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={running}
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
            disabled={running}
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
