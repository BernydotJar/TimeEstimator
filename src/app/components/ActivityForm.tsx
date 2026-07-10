"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Activity, DEFAULT_FORM_DATA } from "@/app/types";
import { analyzeEstimate } from "@/ai/client/estimate-analysis";
import { StepsImportTab } from "@/app/components/StepsImportTab";

const SEL =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:border-accessible-cyan/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const LBL = "text-xs font-medium text-muted-foreground";

interface ActivityFormProps {
  onAdd: (activity: Activity) => void;
}

export function ActivityForm({ onAdd }: ActivityFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Omit<Activity, "id">>(DEFAULT_FORM_DATA);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "effort"
          ? Number(value)
          : type === "checkbox"
            ? checked
            : value,
    }));
  };

  const handleAdd = useCallback(() => {
    if (!form.activityName.trim() && !form.applicationName.trim()) {
      toast({
        title: "Fill in at least Activity Name or Application Name",
        variant: "destructive",
      });
      return;
    }
    onAdd({ ...form, id: crypto.randomUUID() });
    setForm(DEFAULT_FORM_DATA);
  }, [form, onAdd, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLElement).tagName !== "BUTTON" &&
      (e.target as HTMLElement).tagName !== "SELECT"
    ) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSuggestEffort = async () => {
    const desc = [
      form.activityName,
      form.activityType,
      form.rpaTool,
      form.applicationType,
      form.detailedActivityType,
      form.exceptionHandlingComplexity &&
        `${form.exceptionHandlingComplexity} exception handling`,
    ]
      .filter(Boolean)
      .join(", ");

    if (!desc.trim()) {
      toast({
        title: "Add some details first",
        description:
          "Fill in activity name, type, or tool to get an AI suggestion.",
      });
      return;
    }

    setAiLoading(true);
    try {
      const result = await analyzeEstimate({ activityDescription: desc });
      setForm((prev) => ({ ...prev, effort: result.suggestedEffort }));
      const shortReason = result.reasoning.slice(0, 140);
      toast({
        title: `AI suggests ${result.suggestedEffort}h`,
        description:
          shortReason +
          (result.reasoning.length > 140 ? "…" : ""),
      });
    } catch {
      toast({
        title: "AI suggestion unavailable",
        description: "Configure n8n webhooks in AI Integrations or set GOOGLE_GENAI_API_KEY for local Genkit mode.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddAll = (activities: Activity[]) => {
    activities.forEach(onAdd);
  };

  return (
    <Card className="bg-card/90 shadow-sm backdrop-blur-sm">
      <Tabs defaultValue="manual">
        <CardHeader className="pb-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-accessible-cyan">
                Add Activity
              </CardTitle>
              <CardDescription className="mt-1">
                Add manually or paste process steps for AI to parse.
              </CardDescription>
            </div>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="manual" className="flex-1 sm:flex-none">
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="import" className="flex-1 sm:flex-none">
                ✨ Import from Steps
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="manual" className="mt-0">
            <div className="space-y-5" onKeyDown={handleKeyDown}>
        {/* Section 1: Core identity */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Activity
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="applicationName" className={LBL}>
                Application Name
              </Label>
              <Input
                id="applicationName"
                name="applicationName"
                placeholder="e.g., SAP ERP"
                value={form.applicationName}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="activityName" className={LBL}>
                Activity Name
              </Label>
              <Input
                id="activityName"
                name="activityName"
                placeholder="e.g., Login to application"
                value={form.activityName}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="activityType" className={LBL}>
                Activity Type
              </Label>
              <select
                id="activityType"
                name="activityType"
                className={SEL}
                value={form.activityType}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="Application">Application</option>
                <option value="Process">Process</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="adapter" className={LBL}>
                Adapter
              </Label>
              <select
                id="adapter"
                name="adapter"
                className={SEL}
                value={form.adapter}
                onChange={handleChange}
              >
                <option value="">Select adapter</option>
                <option value="API">API</option>
                <option value="Database">Database</option>
                <option value="Email">Email</option>
                <option value="File System">File System</option>
                <option value="Web">Web</option>
                <option value="SAP">SAP</option>
                <option value="Mainframe">Mainframe</option>
                <option value="Terminal">Terminal</option>
                <option value="Citrix">Citrix</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Technical metadata */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Technical Details
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="rpaTool" className={LBL}>
                RPA Tool
              </Label>
              <select
                id="rpaTool"
                name="rpaTool"
                className={SEL}
                value={form.rpaTool}
                onChange={handleChange}
              >
                <option value="">Select tool</option>
                <option value="Blue Prism">Blue Prism</option>
                <option value="UiPath">UiPath</option>
                <option value="Automation Anywhere">Automation Anywhere</option>
                <option value="Power APPs">Power APPs</option>
                <option value="Python">Python</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="applicationType" className={LBL}>
                Application Type
              </Label>
              <select
                id="applicationType"
                name="applicationType"
                className={SEL}
                value={form.applicationType}
                onChange={handleChange}
              >
                <option value="">Select app type</option>
                <option value="Desktop">Desktop</option>
                <option value="Web">Web</option>
                <option value="Terminal">Terminal</option>
                <option value="SAP">SAP</option>
                <option value="Power bi related">Power BI related</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="detailedActivityType" className={LBL}>
                Detailed Type
              </Label>
              <select
                id="detailedActivityType"
                name="detailedActivityType"
                className={SEL}
                value={form.detailedActivityType}
                onChange={handleChange}
              >
                <option value="">Select detailed type</option>
                <option value="Launch">Launch</option>
                <option value="Click">Click</option>
                <option value="Read">Read</option>
                <option value="Write">Write</option>
                <option value="Send">Send</option>
                <option value="Forms">Forms</option>
                <option value="Connector">Connector</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="exceptionHandlingComplexity" className={LBL}>
                Exception Complexity
              </Label>
              <select
                id="exceptionHandlingComplexity"
                name="exceptionHandlingComplexity"
                className={SEL}
                value={form.exceptionHandlingComplexity}
                onChange={handleChange}
              >
                <option value="">Select complexity</option>
                <option value="Basic">Basic</option>
                <option value="Medium">Medium</option>
                <option value="Complex">Complex</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Effort + model */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Effort &amp; Model
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="effort" className={LBL}>
                Estimated Effort (hours)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  id="effort"
                  name="effort"
                  min={0}
                  step={0.5}
                  value={form.effort}
                  onChange={handleChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSuggestEffort}
                  disabled={aiLoading}
                  title="Get AI effort suggestion"
                  aria-label="Get AI effort suggestion"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-accessible-cyan" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="coreSupervised" className={LBL}>
                Delivery Model
              </Label>
              <select
                id="coreSupervised"
                name="coreSupervised"
                className={SEL}
                value={form.coreSupervised}
                onChange={handleChange}
              >
                <option value="">Select model</option>
                <option value="core">Core</option>
                <option value="supervised">Supervised</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="businessException" className={LBL}>
                Business Exception
              </Label>
              <select
                id="businessException"
                name="businessException"
                className={SEL}
                value={form.businessException}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="Business">Business</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="assumption" className={LBL}>
                Assumption
              </Label>
              <Input
                id="assumption"
                name="assumption"
                placeholder="Any assumptions for this activity"
                value={form.assumption}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="reused"
              checked={form.reused}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, reused: checked }))
              }
            />
            <Label htmlFor="reused" className={LBL}>
              Reused activity
            </Label>
          </div>
        </div>

            <Button onClick={handleAdd} className="w-full sm:w-auto">
              Add Activity
            </Button>
          </div>
          </TabsContent>

          <TabsContent value="import" className="mt-0">
            <StepsImportTab onAddAll={handleAddAll} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
