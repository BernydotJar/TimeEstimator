import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Activity } from "./estimate-types";

interface ActivityIntakePanelProps {
  formData: Activity;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onReusedChange: (checked: boolean) => void;
  onAddActivity: () => void;
}

const activityTypes = ["Application", "Process", "Infrastructure"];
const adapters = ["API", "Database", "Email", "File System", "Web", "SAP", "Mainframe", "Terminal", "Citrix"];
const rpaTools = ["Blue Prism", "UiPath", "Automation Anywhere", "Power APPs", "Python"];
const applicationTypes = ["Desktop", "Web", "Terminal", "SAP", "Power bi related"];
const detailedTypes = ["Launch", "Click", "Read", "Write", "Send", "Forms", "Connector"];
const complexities = ["Basic", "Medium", "Complex"];

const SelectField = ({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: keyof Activity;
  label: string;
  value: string;
  onChange: ActivityIntakePanelProps["onInputChange"];
  children: React.ReactNode;
}) => (
  <div className="grid gap-2">
    <Label className="cinematic-label" htmlFor={id}>{label}</Label>
    <select
      aria-label={label}
      className="cinematic-select"
      id={id}
      name={id}
      onChange={onChange}
      value={value}
    >
      {children}
    </select>
  </div>
);

const ActivityIntakePanel = ({
  formData,
  onInputChange,
  onReusedChange,
  onAddActivity,
}: ActivityIntakePanelProps) => {
  return (
    <section className="cinematic-panel" aria-labelledby="activity-intake-title">
      <div className="panel-kicker">Guided capture</div>
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 id="activity-intake-title" className="panel-title">Activity intake</h2>
          <p className="panel-copy">
            Capture the process surface, automation channel, classification, and delivery assumptions in one workshop flow.
          </p>
        </div>
        <Button className="cinematic-button" onClick={onAddActivity} type="button">
          <PlusCircle className="h-4 w-4" />
          Add activity
        </Button>
      </div>

      <div className="grid gap-5">
        <div className="form-section">
          <h3 className="form-section-title">1. Process context</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="cinematic-label" htmlFor="applicationName">Application name</Label>
              <Input
                aria-label="Application Name"
                className="cinematic-input"
                id="applicationName"
                name="applicationName"
                onChange={onInputChange}
                type="text"
                value={formData.applicationName}
              />
            </div>
            <SelectField id="adapter" label="Adapter" onChange={onInputChange} value={formData.adapter}>
              <option value="">Select adapter</option>
              {adapters.map((adapter) => <option key={adapter} value={adapter}>{adapter}</option>)}
            </SelectField>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">2. Activity classification</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-2">
              <Label className="cinematic-label" htmlFor="activityName">Activity name</Label>
              <Input
                aria-label="Activity Name"
                className="cinematic-input"
                id="activityName"
                name="activityName"
                onChange={onInputChange}
                type="text"
                value={formData.activityName}
              />
            </div>
            <SelectField id="activityType" label="Activity type" onChange={onInputChange} value={formData.activityType}>
              <option value="">Select activity type</option>
              {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </SelectField>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">3. Automation surface</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField id="rpaTool" label="RPA tool" onChange={onInputChange} value={formData.rpaTool}>
              <option value="">Select RPA tool</option>
              {rpaTools.map((tool) => <option key={tool} value={tool}>{tool}</option>)}
            </SelectField>
            <SelectField id="applicationType" label="Application type" onChange={onInputChange} value={formData.applicationType}>
              <option value="">Select application type</option>
              {applicationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </SelectField>
            <SelectField id="detailedActivityType" label="Detailed activity" onChange={onInputChange} value={formData.detailedActivityType}>
              <option value="">Select detail</option>
              {detailedTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </SelectField>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">4. Effort, risk and assumptions</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <SelectField id="coreSupervised" label="Core / supervised" onChange={onInputChange} value={formData.coreSupervised}>
              <option value="">Select</option>
              <option value="core">Core</option>
              <option value="supervised">Supervised</option>
            </SelectField>
            <SelectField id="businessException" label="Exception type" onChange={onInputChange} value={formData.businessException}>
              <option value="">Select exception</option>
              <option value="Business">Business</option>
              <option value="Technical">Technical</option>
            </SelectField>
            <SelectField id="exceptionHandlingComplexity" label="Exception complexity" onChange={onInputChange} value={formData.exceptionHandlingComplexity}>
              <option value="">Select complexity</option>
              {complexities.map((complexity) => <option key={complexity} value={complexity}>{complexity}</option>)}
            </SelectField>
            <div className="grid gap-2">
              <Label className="cinematic-label" htmlFor="effort">Effort [h]</Label>
              <Input
                aria-label="Effort in hours"
                className="cinematic-input"
                id="effort"
                min="0"
                name="effort"
                onChange={onInputChange}
                type="number"
                value={formData.effort}
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-2">
              <Label className="cinematic-label" htmlFor="assumption">Assumption</Label>
              <Input
                aria-label="Assumption"
                className="cinematic-input"
                id="assumption"
                name="assumption"
                onChange={onInputChange}
                type="text"
                value={formData.assumption}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <Label className="cinematic-label" htmlFor="reused">Reused?</Label>
              <Switch
                aria-label="Reused"
                checked={formData.reused}
                id="reused"
                name="reused"
                onCheckedChange={onReusedChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivityIntakePanel;
