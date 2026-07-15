"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  projectArtifactToMarkdown,
  type DocumentationArtifact,
  type DocumentationSection,
} from "@/domain/discovery";
import { useProjects } from "@/hooks/use-projects";

export function DocumentationWorkspace({
  projectId,
  artifacts,
  onClose,
}: {
  projectId: string;
  artifacts: DocumentationArtifact[];
  onClose: () => void;
}) {
  const { saveDocumentationArtifact, regenerateDocumentation } = useProjects();
  const [selectedId, setSelectedId] = useState(artifacts[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const selected = artifacts.find((artifact) => artifact.id === selectedId) ?? artifacts[0];
  const markdown = useMemo(() => selected ? projectArtifactToMarkdown(selected) : "", [selected]);

  if (!selected) return null;

  const addManualNote = () => {
    const section: DocumentationSection = {
      id: `section:${selected.type}:manual:${Date.now()}`,
      title: "Manual Notes",
      order: selected.sections.length + 1,
      origin: "manual",
      blocks: [{
        id: `block:manual:${Date.now()}`,
        type: "paragraph",
        content: "Add reviewed manual context here.",
        origin: "manual",
        manualOverride: true,
        updatedAt: new Date().toISOString(),
      }],
      sourceRefs: [],
      lockedFromRegeneration: true,
      updatedAt: new Date().toISOString(),
    };
    saveDocumentationArtifact(projectId, {
      ...selected,
      sections: [...selected.sections, section],
      updatedAt: new Date().toISOString(),
    });
    setMessage("Manual section added and locked from regeneration.");
  };

  return (
    <section className="cinematic-panel space-y-5" aria-labelledby="documentation-workspace-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="panel-kicker">Generated drafts</div>
          <h2 id="documentation-workspace-title" className="mt-1 text-2xl font-semibold text-white">
            Documentation and flow
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Generator {selected.generatorVersion ?? "unknown"} · snapshot {selected.sourceSnapshotHash}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>Back</Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Documentation artifacts" className="space-y-2">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              type="button"
              className={`w-full rounded-lg border p-3 text-left text-sm ${artifact.id === selected.id ? "border-cyan-500 bg-cyan-950/30 text-white" : "border-slate-800 bg-slate-950/50 text-slate-300"}`}
              onClick={() => setSelectedId(artifact.id)}
            >
              <span className="block font-semibold">{artifact.title}</span>
              <span className="mt-1 block text-xs opacity-70">v{artifact.version} · {artifact.status}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={addManualNote}>Add manual note</Button>
            <Button type="button" variant="outline" onClick={() => regenerateDocumentation(projectId, selected.id, "preserve_manual")}>Regenerate and preserve manual</Button>
            <Button type="button" variant="outline" onClick={() => regenerateDocumentation(projectId, selected.id, "explicit_replace")}>Explicitly replace generated draft</Button>
            <Button type="button" variant="outline" onClick={() => copyText(markdown, setMessage, "Markdown copied.")}>Copy Markdown</Button>
          </div>

          {(selected.warnings?.length || selected.unknowns?.length) ? (
            <div className="rounded-xl border border-amber-700/60 bg-amber-950/20 p-4" aria-live="polite">
              <h3 className="font-semibold text-amber-100">Limitations</h3>
              {selected.unknowns?.map((item) => <p key={`unknown:${item}`} className="mt-1 text-sm text-amber-200">Unknown: {item}</p>)}
              {selected.warnings?.map((item) => <p key={`warning:${item}`} className="mt-1 text-sm text-amber-200">Warning: {item}</p>)}
            </div>
          ) : null}

          {selected.sections.map((section) => (
            <article key={section.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-white">{section.title}</h3>
                <span className="text-xs text-slate-500">{section.origin}{section.lockedFromRegeneration ? " · locked" : ""}</span>
              </div>
              {section.blocks.map((block) => <BlockPreview key={block.id} block={block} setMessage={setMessage} />)}
              {section.sourceRefs.length ? (
                <details className="mt-3 text-xs text-slate-400">
                  <summary>Source references ({section.sourceRefs.length})</summary>
                  <ul className="mt-2 space-y-1">
                    {section.sourceRefs.map((reference) => <li key={reference.id}>{reference.targetType}: {reference.targetId}</li>)}
                  </ul>
                </details>
              ) : null}
            </article>
          ))}

          {selected.reconciliationHistory?.length ? (
            <details className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
              <summary>Regeneration history ({selected.reconciliationHistory.length})</summary>
              {selected.reconciliationHistory.map((item) => (
                <p key={item.id} className="mt-2">v{item.previousVersion} → v{item.nextVersion}: {item.decision}; conflicts {item.conflicts.length}</p>
              ))}
            </details>
          ) : null}
        </div>
      </div>
      {message ? <p role="status" className="text-sm text-slate-300">{message}</p> : null}
    </section>
  );
}

function BlockPreview({ block, setMessage }: { block: DocumentationSection["blocks"][number]; setMessage: (value: string) => void }) {
  if (block.type === "paragraph" || block.type === "callout") return <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{String(block.content)}</p>;
  if (block.type === "bullet_list") return <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">{(block.content as string[]).map((item) => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "metric_group") return <dl className="mt-3 grid gap-2 sm:grid-cols-3">{Object.entries(block.content as Record<string, number>).map(([key, value]) => <div key={key}><dt className="text-xs text-slate-500">{key}</dt><dd className="text-sm text-white">{value}</dd></div>)}</dl>;
  if (block.type === "data_table") {
    const value = block.content as { headers: string[]; rows: unknown[][] };
    return <div className="mt-3 overflow-x-auto"><table className="min-w-full text-left text-sm text-slate-300"><thead><tr>{value.headers.map((header) => <th key={header} className="border-b border-slate-700 p-2">{header}</th>)}</tr></thead><tbody>{value.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="border-b border-slate-800 p-2">{String(cell)}</td>)}</tr>)}</tbody></table></div>;
  }
  if (block.type === "flow_reference") {
    const value = block.content as { mermaid: string; text: string };
    return <div className="mt-3 space-y-3"><div><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold text-white">Mermaid source</h4><Button type="button" size="sm" variant="outline" onClick={() => copyText(value.mermaid, setMessage, "Mermaid source copied.")}>Copy</Button></div><pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">{value.mermaid}</pre></div><div><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold text-white">Textual flow</h4><Button type="button" size="sm" variant="outline" onClick={() => copyText(value.text, setMessage, "Textual flow copied.")}>Copy</Button></div><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-black/40 p-3 text-xs text-slate-300">{value.text}</pre></div></div>;
  }
  return null;
}

function copyText(value: string, setMessage: (value: string) => void, message: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(value);
  setMessage(message);
}
