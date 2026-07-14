"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Edit3,
  FolderKanban,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";

import CinematicBackground from "@/app/components/CinematicBackground";
import { Project } from "@/app/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";

const projectTotal = (project: Project) => {
  const base = project.activities.reduce(
    (sum, activity) => sum + Number(activity.effort || 0),
    0,
  );
  const overhead = Object.values(project.overheadPercentages).reduce(
    (sum, percentage) => sum + percentage,
    0,
  );
  return base * (1 + overhead);
};

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { projects, createProject, updateProject, deleteProject } =
    useProjects();

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const portfolio = useMemo(() => {
    const activities = projects.reduce(
      (sum, project) => sum + project.activities.length,
      0,
    );
    const effort = projects.reduce(
      (sum, project) => sum + projectTotal(project),
      0,
    );
    return { activities, effort };
  }, [projects]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const handleCreate = () => {
    const name = createName.trim();
    if (!name) return;

    const project = createProject(name, createDescription.trim());
    setShowCreate(false);
    setCreateName("");
    setCreateDescription("");
    router.push(`/project?id=${project.id}`);
  };

  const handleRename = () => {
    const name = editName.trim();
    if (!editingProject || !name) return;

    updateProject(editingProject.id, { name });
    setEditingProject(null);
    toast({ title: "Project renamed", description: `Now tracking “${name}”.` });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteProject(deletingId);
    setDeletingId(null);
    toast({ title: "Project deleted" });
  };

  return (
    <main className="cinematic-shell" data-testid="home-page">
      <Toaster />
      <CinematicBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:py-10">
        <header className="cinematic-panel cinematic-hero">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-cyan-200/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1">
                <FolderKanban className="h-3.5 w-3.5" />
                RPA Portfolio Console
              </span>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-amber-100">
                SHIP Mode
              </span>
            </div>

            <div className="max-w-4xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">
                TimeEstimator
              </h1>
              <p className="text-base leading-7 text-slate-300 md:text-lg">
                Cinematic command center for RPA discovery, effort governance,
                assumptions, and executive-ready delivery estimates.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className="cinematic-button"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4" />
                New estimation project
              </Button>
              <Button
                aria-label="Toggle theme"
                className="cinematic-button-secondary"
                onClick={toggleTheme}
                variant="outline"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Change theme</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-black/30 p-4 shadow-2xl shadow-cyan-950/30 md:min-w-[340px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Projects
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {projects.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Activities
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {portfolio.activities}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">
                Portfolio effort
              </p>
              <p className="mt-2 text-3xl font-semibold text-cyan-100">
                {portfolio.effort.toFixed(2)} h
              </p>
            </div>
          </div>
        </header>

        <section className="cinematic-panel" aria-labelledby="projects-title">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="panel-kicker">Active estimates</div>
              <h2 className="panel-title" id="projects-title">
                Project command deck
              </h2>
              <p className="panel-copy">
                Open a workstream to capture activities, configure delivery
                overhead, use n8n assistance, and generate its report pack.
              </p>
            </div>
            <Badge className="w-fit border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {projects.length === 0 ? (
            <div className="empty-ledger">
              <Sparkles className="mx-auto h-8 w-8 text-cyan-200" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                No estimation projects yet
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Create your first project to begin a governed RPA discovery and
                sizing session.
              </p>
              <Button
                className="cinematic-button mt-5"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.055]"
                  key={project.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                        Estimation workstream
                      </p>
                      <h3 className="mt-2 truncate text-xl font-semibold text-white">
                        {project.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                      <Button
                        aria-label={`Rename ${project.name}`}
                        className="cinematic-button-secondary h-8 w-8"
                        onClick={() => {
                          setEditingProject(project);
                          setEditName(project.name);
                        }}
                        size="icon"
                        variant="outline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        aria-label={`Delete ${project.name}`}
                        className="h-8 w-8 border border-rose-300/20 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
                        onClick={() => setDeletingId(project.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs text-slate-400">Activities</p>
                      <p className="mt-1 text-xl font-semibold text-white">
                        {project.activities.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                      <p className="text-xs text-cyan-100/70">Grand total</p>
                      <p className="mt-1 text-xl font-semibold text-cyan-100">
                        {projectTotal(project).toFixed(1)} h
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(new Date(project.updatedAt), "MMM d, yyyy")}
                    </span>
                    <Button
                      className="cinematic-button-secondary"
                      onClick={() => router.push(`/project?id=${project.id}`)}
                      size="sm"
                      variant="outline"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Capture", "Guide workshop inputs and preserve every assumption."],
            ["02", "Calibrate", "Apply governed overheads and transparent formulas."],
            ["03", "Communicate", "Produce executive-ready estimates and report artifacts."],
          ].map(([number, title, copy]) => (
            <div className="cinematic-panel" key={number}>
              <div className="panel-kicker">Signal {number}</div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
            </div>
          ))}
        </section>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New estimation project</DialogTitle>
            <DialogDescription>
              Create a browser-local workstream for this RPA estimate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-project-name">Project Name *</Label>
              <Input
                autoFocus
                className="cinematic-input"
                id="new-project-name"
                onChange={(event) => setCreateName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleCreate()}
                placeholder="e.g. Invoice automation wave"
                value={createName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-project-description">
                Description (optional)
              </Label>
              <Textarea
                id="new-project-description"
                onChange={(event) => setCreateDescription(event.target.value)}
                placeholder="Scope, business unit, or workshop context"
                value={createDescription}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="cinematic-button"
              disabled={!createName.trim()}
              onClick={handleCreate}
            >
              Create &amp; Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingProject)}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent className="border-white/10 bg-slate-950 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <Label className="sr-only" htmlFor="rename-project">
            Project name
          </Label>
          <Input
            autoFocus
            className="cinematic-input"
            id="rename-project"
            onChange={(event) => setEditName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleRename()}
            value={editName}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button
              className="cinematic-button"
              disabled={!editName.trim()}
              onClick={handleRename}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="border-white/10 bg-slate-950 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              Its activities and configuration are stored only in this browser
              and will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-500"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
