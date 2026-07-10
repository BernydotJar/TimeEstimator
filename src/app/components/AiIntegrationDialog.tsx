"use client";

import { useMemo, useState } from "react";
import { PlugZap, RotateCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  mergeN8nConfig,
  N8nConfig,
  N8N_CONFIG_STORAGE_KEY,
  N8nOperation,
  normalizeN8nConfig,
  readEnvN8nConfig,
  resolveN8nWebhookUrl,
} from "@/lib/n8n-config";

const OPERATION_LABELS: Array<{ key: N8nOperation; label: string }> = [
  { key: "analyzeEstimate", label: "Analyze effort" },
  { key: "estimateDefaults", label: "Overhead defaults" },
  { key: "summarizeActivities", label: "Executive summary" },
  { key: "parseSteps", label: "Parse process steps" },
];

function toInputValue(value: string | undefined): string {
  return value ?? "";
}

export function AiIntegrationDialog() {
  const { toast } = useToast();
  const envConfig = useMemo(() => readEnvN8nConfig(), []);
  const [storedConfig, setStoredConfig] = useLocalStorage<N8nConfig>(
    N8N_CONFIG_STORAGE_KEY,
    {},
  );

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<N8nConfig>(storedConfig);

  const mergedConfig = useMemo(
    () => mergeN8nConfig(envConfig, storedConfig),
    [envConfig, storedConfig],
  );

  const resolvedEndpoints = useMemo(
    () =>
      OPERATION_LABELS.map(({ key, label }) => ({
        key,
        label,
        url: resolveN8nWebhookUrl(key, mergedConfig),
      })),
    [mergedConfig],
  );

  const connectedCount = resolvedEndpoints.filter((item) => item.url).length;

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(storedConfig);
    setOpen(next);
  };

  const updateField = (key: keyof N8nConfig, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = () => {
    const providedValues = Object.values(draft).filter(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    const normalized = normalizeN8nConfig(draft);

    if (Object.keys(normalized).length !== providedValues.length) {
      toast({
        title: "Invalid webhook URL",
        description:
          "Use HTTPS endpoints. HTTP is accepted only for localhost development.",
        variant: "destructive",
      });
      return;
    }

    setStoredConfig(normalized);
    setOpen(false);
    toast({ title: "AI integration settings saved" });
  };

  const resetConfig = () => {
    setStoredConfig({});
    setDraft({});
    toast({ title: "AI integration settings reset" });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="AI Integrations">
          <PlugZap className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">AI Integrations</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>n8n AI Integration</DialogTitle>
          <DialogDescription>
            Configure public webhook endpoints for GitHub Pages-compatible AI features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-sm font-medium">
              Status: {connectedCount}/4 AI endpoints configured
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure one base URL or explicit per-operation URLs. Local values
              override build-time environment values.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5 md:col-span-2">
              <Label htmlFor="n8n-base-url">Webhook base URL</Label>
              <Input
                id="n8n-base-url"
                placeholder="https://n8n.your-domain.com/webhook/time-estimator"
                value={toInputValue(draft.webhookBaseUrl)}
                onChange={(event) =>
                  updateField("webhookBaseUrl", event.target.value)
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="n8n-analyze-url">Analyze estimate URL</Label>
              <Input
                id="n8n-analyze-url"
                placeholder="Optional override"
                value={toInputValue(draft.analyzeEstimateUrl)}
                onChange={(event) =>
                  updateField("analyzeEstimateUrl", event.target.value)
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="n8n-defaults-url">Defaults URL</Label>
              <Input
                id="n8n-defaults-url"
                placeholder="Optional override"
                value={toInputValue(draft.estimateDefaultsUrl)}
                onChange={(event) =>
                  updateField("estimateDefaultsUrl", event.target.value)
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="n8n-summary-url">Summary URL</Label>
              <Input
                id="n8n-summary-url"
                placeholder="Optional override"
                value={toInputValue(draft.summarizeActivitiesUrl)}
                onChange={(event) =>
                  updateField("summarizeActivitiesUrl", event.target.value)
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="n8n-parse-url">Parse steps URL</Label>
              <Input
                id="n8n-parse-url"
                placeholder="Optional override"
                value={toInputValue(draft.parseStepsUrl)}
                onChange={(event) =>
                  updateField("parseStepsUrl", event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resolved endpoints
            </p>
            <div className="grid gap-2">
              {resolvedEndpoints.map((endpoint) => (
                <div
                  key={endpoint.key}
                  className="grid grid-cols-[150px_1fr] gap-2 text-xs"
                >
                  <span className="font-medium text-foreground">
                    {endpoint.label}
                  </span>
                  <code className="truncate rounded bg-muted px-2 py-1 text-muted-foreground">
                    {endpoint.url ?? "Not configured"}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            GitHub Pages runs entirely in the browser. Do not place bearer tokens,
            API keys, provider credentials, or privileged webhook secrets in this
            configuration. Protect sensitive n8n workflows behind a server-side
            gateway and apply rate limits and schema validation to public endpoints.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={resetConfig}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button type="button" onClick={saveConfig}>
            <Save className="mr-2 h-3.5 w-3.5" />
            Save AI Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
