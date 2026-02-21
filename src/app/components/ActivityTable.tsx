"use client";

import { Copy, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "@/app/types";

interface ActivityTableProps {
  activities: Activity[];
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

export function ActivityTable({
  activities,
  onDelete,
  onClone,
}: ActivityTableProps) {
  const totalHours = activities.reduce((s, a) => s + Number(a.effort), 0);

  return (
    <Card className="bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4 pt-6">
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          {activities.length === 0
            ? "No activities yet — add one above."
            : `${activities.length} activit${activities.length !== 1 ? "ies" : "y"} · ${totalHours.toFixed(1)}h base effort`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="rounded-md border border-dashed border-accessible-cyan/40 bg-accessible-cyan/5 p-6 text-center text-sm text-muted-foreground">
            Add your first activity using the form above.
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-md border bg-background p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {a.applicationName || "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.activityName || "Unnamed"} ·{" "}
                        {a.activityType || "—"}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onClone(a.id)}
                        aria-label="Clone activity"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDelete(a.id)}
                        aria-label="Delete activity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {a.coreSupervised && (
                      <Badge
                        variant={
                          a.coreSupervised === "core" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {a.coreSupervised}
                      </Badge>
                    )}
                    {a.reused && (
                      <Badge variant="outline" className="text-xs">
                        Reused
                      </Badge>
                    )}
                    {a.exceptionHandlingComplexity && (
                      <Badge variant="outline" className="text-xs">
                        {a.exceptionHandlingComplexity}
                      </Badge>
                    )}
                    <span className="ml-auto text-sm font-semibold">
                      {Number(a.effort).toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-auto rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Complexity
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Assumption
                    </TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.applicationName || "—"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{a.activityName || "—"}</p>
                          {a.reused && (
                            <Badge
                              variant="outline"
                              className="mt-0.5 text-xs"
                            >
                              Reused
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.activityType || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.rpaTool || "—"}
                      </TableCell>
                      <TableCell>
                        {a.coreSupervised ? (
                          <Badge
                            variant={
                              a.coreSupervised === "core"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {a.coreSupervised}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm lg:table-cell">
                        {a.exceptionHandlingComplexity || "—"}
                      </TableCell>
                      <TableCell className="hidden max-w-[160px] truncate text-xs text-muted-foreground xl:table-cell">
                        {a.assumption || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number(a.effort).toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onClone(a.id)}
                            aria-label="Clone"
                            title="Clone activity"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onDelete(a.id)}
                            aria-label="Delete"
                            title="Delete activity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
