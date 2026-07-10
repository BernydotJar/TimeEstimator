"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/app/types";
import { parseSteps } from "@/ai/client/parse-steps";

/* ── Enum sanitizers ──────────────────────────────────────────────── */
const VALID_ACTIVITY_TYPES = ["Application", "Process", "Infrastructure"];
const VALID_ADAPTERS = [
  "API",
  "Database",
  "Email",
  "File System",
  "Web",
  "SAP",
  "Mainframe",
  "Terminal",
  "Citrix",
];
const VALID_APP_TYPES = [
  "Desktop",
  "Web",
  "Terminal",
  "SAP",
  "Power bi related",
];
const VALID_DETAILED_TYPES = [
  "Launch",
  "Click",
  "Read",
  "Write",
  "Send",
  "Forms",
  "Connector",
];
const VALID_COMPLEXITIES = ["Basic", "Medium", "Complex"];

function sanitize(value: string, valids: string[]): string {
  if (valids.includes(value)) return value;
  // Case-insensitive fallback
  const match = valids.find(
    (v) => v.toLowerCase() === value?.toLowerCase(),
  );
  return match ?? valids[0];
}

/* ── Local types ──────────────────────────────────────────────────── */
type SuggestedActivity = Activity & { selected: boolean };

const SEL =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-accessible-cyan/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/* ── Component ────────────────────────────────────────────────────── */
interface StepsImportTabProps {
  onAddAll: (activities: Activity[]) => void;
}

export function StepsImportTab({ onAddAll }: StepsImportTabProps) {
  const { toast } = useToast();
  const [steps, setSteps] = useState("");
  const [rpaTool, setRpaTool] = useState("");
  const [applicationContext, setApplicationContext] = useState("");
  const [parsing, setParsing] = useState(false);
  const [summary, setSummary] = useState("");
  const [summarySource, setSummarySource] = useState<"n8n" | "heuristic" | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedActivity[]>([]);

  const hasSuggestions = suggestions.length > 0;
  const selected = suggestions.filter((s) => s.selected);
  const totalSelectedHours = selected.reduce((s, a) => s + a.effort, 0);

  /* ── Parse handler ── */
  const handleParse = async () => {
    if (!steps.trim()) {
      toast({
        title: "Paste your process steps first",
        variant: "destructive",
      });
      return;
    }
    setParsing(true);
    setSuggestions([]);
    setSummary("");
    try {
      const result = await parseSteps({
        steps: steps.trim(),
        rpaTool: rpaTool.trim(),
        applicationContext: applicationContext.trim(),
      });

      const mapped: SuggestedActivity[] = result.activities.map((a) => ({
        id: crypto.randomUUID(),
        selected: true,
        applicationName: a.applicationName ?? "",
        activityName: a.activityName ?? "",
        activityType: sanitize(a.activityType, VALID_ACTIVITY_TYPES),
        coreSupervised: ["core", "supervised"].includes(a.coreSupervised)
          ? a.coreSupervised
          : "core",
        effort: Math.max(0.5, Number(a.effort) || 1),
        adapter: sanitize(a.adapter, VALID_ADAPTERS),
        applicationType: sanitize(a.applicationType, VALID_APP_TYPES),
        detailedActivityType: sanitize(
          a.detailedActivityType,
          VALID_DETAILED_TYPES,
        ),
        exceptionHandlingComplexity: sanitize(
          a.exceptionHandlingComplexity,
          VALID_COMPLEXITIES,
        ),
        assumption: a.assumption ?? "",
        reused: false,
        businessException: "",
        rpaTool: rpaTool.trim(),
      }));

      setSuggestions(mapped);
      setSummary(result.summary);
      setSummarySource(result.source);
    } catch {
      toast({
        title: "AI parsing failed",
        description: "The local parser could not extract activities. Review the steps or configure a public n8n endpoint in AI Integrations.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  /* ── Selection helpers ── */
  const toggleAll = (checked: boolean) =>
    setSuggestions((prev) => prev.map((s) => ({ ...s, selected: checked })));

  const toggleOne = (id: string, checked: boolean) =>
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: checked } : s)),
    );

  const updateEffort = (id: string, value: string) =>
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, effort: Math.max(0.5, Number(value) || 0.5) } : s,
      ),
    );

  /* ── Add selected ── */
  const handleAddSelected = () => {
    if (selected.length === 0) {
      toast({ title: "Select at least one activity", variant: "destructive" });
      return;
    }
    // Strip the `selected` flag before passing up
    const toAdd: Activity[] = selected.map(
      ({ selected: wasSelected, ...rest }) => {
        void wasSelected;
        return {
          ...rest,
          id: crypto.randomUUID(), // fresh ID
        };
      },
    );
    onAddAll(toAdd);
    setSuggestions([]);
    setSummary("");
    setSummarySource(null);
    setSteps("");
  };

  const allChecked =
    suggestions.length > 0 && suggestions.every((s) => s.selected);
  const someChecked = suggestions.some((s) => s.selected);

  return (
    <div className="space-y-4">
      {/* Context row */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="steps-application-context" className="text-xs font-medium text-muted-foreground">
            Application / System (optional)
          </Label>
          <Input
            id="steps-application-context"
            placeholder="e.g., SAP ERP, Salesforce CRM"
            value={applicationContext}
            onChange={(e) => setApplicationContext(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="steps-rpa-tool" className="text-xs font-medium text-muted-foreground">
            RPA Tool (optional)
          </Label>
          <select
            id="steps-rpa-tool"
            className={SEL}
            value={rpaTool}
            onChange={(e) => setRpaTool(e.target.value)}
          >
            <option value="">Select tool (helps AI estimate)</option>
            <option value="Blue Prism">Blue Prism</option>
            <option value="UiPath">UiPath</option>
            <option value="Automation Anywhere">Automation Anywhere</option>
            <option value="Power APPs">Power APPs</option>
            <option value="Python">Python</option>
          </select>
        </div>
      </div>

      {/* Steps textarea */}
      <div className="grid gap-1.5">
        <Label htmlFor="process-steps" className="text-xs font-medium text-muted-foreground">
          Process Steps
        </Label>
        <Textarea
          id="process-steps"
          placeholder={`Paste steps in any format — numbered list, bullets, or plain description:\n\n1. Login to SAP ERP\n2. Navigate to the invoice module\n3. Search for all pending invoices by date range\n4. For each invoice, extract header and line items\n5. Validate totals against GL codes\n6. Export validated invoices to Excel`}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={9}
          className="resize-none font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Parse button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleParse}
          disabled={parsing || !steps.trim()}
          className="gap-2"
        >
          {parsing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {parsing ? "Parsing…" : "Parse Steps"}
        </Button>
        {hasSuggestions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleParse}
            disabled={parsing}
            className="text-muted-foreground"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Re-parse
          </Button>
        )}
      </div>

      {/* AI summary banner */}
      {summary && (
        <div className="rounded-lg border border-accessible-cyan/30 bg-accessible-cyan/5 px-4 py-3">
          <p className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-accessible-cyan" />
            <span>
              <strong className="mr-1">
                {summarySource === "n8n" ? "n8n AI:" : "Local parser:"}
              </strong>
              {summary}
            </span>
          </p>
        </div>
      )}

      {/* Review table */}
      {hasSuggestions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Review &amp; Edit
            </p>
            <span className="text-xs text-muted-foreground">
              Click effort to edit · Uncheck to skip
            </span>
          </div>

          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2.5 text-left">
                    <Checkbox
                      checked={allChecked}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">
                    Activity
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">
                    Application
                  </th>
                  <th className="hidden px-3 py-2.5 text-left font-medium md:table-cell">
                    Adapter
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">Type</th>
                  <th className="px-3 py-2.5 text-left font-medium">Model</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Hours
                  </th>
                  <th className="hidden px-3 py-2.5 text-left font-medium lg:table-cell">
                    Complexity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className={
                      s.selected
                        ? "bg-background"
                        : "bg-muted/20 opacity-50"
                    }
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={s.selected}
                        onCheckedChange={(v) => toggleOne(s.id, Boolean(v))}
                        aria-label={`Select ${s.activityName}`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium leading-snug">
                        {s.activityName}
                      </p>
                      {s.assumption && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          ℹ {s.assumption}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s.applicationName}
                    </td>
                    <td className="hidden px-3 py-2 md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {s.adapter}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary" className="text-xs">
                        {s.activityType}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          s.coreSupervised === "core" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {s.coreSupervised}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={s.effort}
                        onChange={(e) => updateEffort(s.id, e.target.value)}
                        className="h-8 w-20 text-right text-sm"
                        aria-label={`Effort hours for ${s.activityName}`}
                      />
                    </td>
                    <td className="hidden px-3 py-2 lg:table-cell">
                      <span
                        className={
                          s.exceptionHandlingComplexity === "Complex"
                            ? "text-accessible-magenta"
                            : s.exceptionHandlingComplexity === "Medium"
                              ? "text-amber-600"
                              : "text-muted-foreground"
                        }
                      >
                        {s.exceptionHandlingComplexity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {selected.length}
              </span>{" "}
              of {suggestions.length} selected ·{" "}
              <span className="font-semibold text-accessible-cyan">
                {totalSelectedHours.toFixed(1)}h
              </span>{" "}
              total
            </p>
            <Button
              onClick={handleAddSelected}
              disabled={!someChecked}
            >
              Add {selected.length} Activit
              {selected.length !== 1 ? "ies" : "y"} to Estimate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
