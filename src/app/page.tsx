"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BarChart2,
  Clock,
  Cpu,
  Edit2,
  FolderOpen,
  Layers,
  Moon,
  Plus,
  RefreshCcw,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/use-projects";
import { Project } from "@/app/types";

const architecturePrinciples = [
  "Model estimation rules as reusable parameters, not one-off formulas.",
  "Keep assumptions explicit so every total is explainable in stakeholder reviews.",
  "Design reports for decisions, not just data dumps.",
];

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { projects, createProject, updateProject, deleteProject } =
    useProjects();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [principleIndex, setPrincipleIndex] = useState(0);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.classList.remove(prev);
      document.documentElement.classList.add(next);
      return next;
    });
  }, []);

  const handleCreate = () => {
    if (!createName.trim()) return;
    const project = createProject(createName.trim(), createDesc.trim());
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    router.push(`/project?id=${project.id}`);
  };

  const handleEdit = () => {
    if (!editingProject || !editName.trim()) return;
    updateProject(editingProject.id, { name: editName.trim() });
    toast({
      title: "Project renamed",
      description: `Renamed to "${editName.trim()}"`,
    });
    setEditingProject(null);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setDeletingId(null);
    toast({ title: "Project deleted" });
  };

  const getGrandTotal = (project: Project) => {
    const base = project.activities.reduce(
      (sum, a) => sum + Number(a.effort),
      0,
    );
    const overheadFactor = Object.values(project.overheadPercentages).reduce(
      (sum, p) => sum + p,
      0,
    );
    return base * (1 + overheadFactor);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accessible-cyan/10">
              <Layers className="h-5 w-5 text-accessible-cyan" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">
                TimeEstimator
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                RPA Effort Estimation Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Card className="mb-8 overflow-hidden border-transparent bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 text-slate-100 shadow-lg">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div className="space-y-3">
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20">
                Developer Spotlight
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight">
                Eduardo Sacahuí
              </h2>
              <p className="text-sm text-cyan-100/90">
                Platform Architect building practical tools that accelerate RPA
                delivery planning from discovery to estimate sign-off.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-200/90">
                <Cpu className="h-3.5 w-3.5" />
                <span>Estimation framework author</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Architecture Principle
              </p>
              <p className="min-h-14 text-sm text-slate-100">
                {architecturePrinciples[principleIndex]}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3 bg-white/15 text-slate-100 hover:bg-white/25"
                onClick={() =>
                  setPrincipleIndex(
                    (prev) => (prev + 1) % architecturePrinciples.length,
                  )
                }
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Next Principle
              </Button>
            </div>
          </CardContent>
        </Card>

        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 rounded-full bg-accessible-cyan/10 p-6">
              <BarChart2 className="h-10 w-10 text-accessible-cyan" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Create your first estimation project to capture automation
              activities and generate stakeholder-ready reports.
            </p>
            <Button onClick={() => setShowCreate(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Projects</h2>
              <Badge variant="secondary">
                {projects.length} project
                {projects.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const grandTotal = getGrandTotal(project);
                return (
                  <Card
                    key={project.id}
                    className="group transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base leading-tight">
                          {project.name}
                        </CardTitle>
                        <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                              setEditName(project.name);
                            }}
                            aria-label="Rename project"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(project.id);
                            }}
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {project.description && (
                        <CardDescription className="line-clamp-2 text-xs">
                          {project.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-muted/50 p-2.5">
                          <p className="text-xs text-muted-foreground">
                            Activities
                          </p>
                          <p className="text-xl font-bold text-accessible-cyan">
                            {project.activities.length}
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/50 p-2.5">
                          <p className="text-xs text-muted-foreground">
                            Est. Total
                          </p>
                          <p className="text-xl font-bold text-accessible-magenta">
                            {grandTotal.toFixed(0)}h
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(project.updatedAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/project?id=${project.id}`)
                        }
                      >
                        <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                        Open
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Create Project Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Name your estimation project to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-project-name">Project Name *</Label>
              <Input
                id="new-project-name"
                placeholder="e.g., ACME Corp RPA Phase 2"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-project-desc">Description (optional)</Label>
              <Textarea
                id="new-project-desc"
                placeholder="Brief description of this estimation..."
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setCreateName("");
                setCreateDesc("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!createName.trim()}>
              Create &amp; Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingProject(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its activities.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
