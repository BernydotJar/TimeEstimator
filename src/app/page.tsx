"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Card as CardNeon,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
// Define the data structure for an activity

interface Activity {
  applicationName: string;
  adapter: string;
  activityName: string;
  activityType: string;
  coreSupervised: string;
  reused: boolean;
  effort: number;
  businessException: string;
  assumption: string;
}
const ConfettiBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const mp = 150; // max particles
    const particles: any[] = [];
    for (let i = 0; i < mp; i++) {
      particles.push({
        x: Math.random() * W, // x-coordinate
        y: Math.random() * H, // y-coordinate
        r: Math.random() * 4 + 1, // radius
        d: Math.random() * mp, // density

        color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.8)`,
        tilt: Math.floor(Math.random() * 330) - 30,
        tiltAngleIncremental: Math.random() * 0.08 + 0.05,
        tiltAngle: 0,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < mp; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.ellipse(p.x, p.y, p.r, 2, 10, 20, 30);
        ctx.fill();
      }

      update();
      requestAnimationFrame(draw);
    };
    // Function to move the snowflakes
    const update = () => {
      for (let i = 0; i < mp; i++) {
        const p = particles[i];
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 1 + p.r / 2) * 0.5;
        p.x += Math.sin(p.tiltAngle - p.r / 2) * 0.5;
        if (p.x > W + 5 || p.x < -5 || p.y > H) {
          p.x = Math.random() * W;
          p.y = -5;
        }
      }
    };
    draw();

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

const Home: React.FC = () => {
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<Activity>({
    applicationName: "",
    adapter: "",
    activityName: "",
    activityType: "",
    coreSupervised: "",
    reused: false,
    effort: 0,
    businessException: "",
    assumption: "",
  });

  const [totalEffort, setTotalEffort] = useState(0);
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  // Estimate Overview States
  const [coreEffort, setCoreEffort] = useState(0);
  const [supervisedEffort, setSupervisedEffort] = useState(0);
  const [effortByActivityType, setEffortByActivityType] = useState<{
    [key: string]: number;
  }>({});
  const [contingencyEffort, setContingencyEffort] = useState(0);
  const [pmEffort, setPmEffort] = useState(0);
  const [saEffort, setSaEffort] = useState(0);
  const [sddEffort, setSddEffort] = useState(0);
  const [releaseConfigEffort, setReleaseConfigEffort] = useState(0);
  const [userManualEffort, setUserManualEffort] = useState(0);
  const neonTextColors = ["#00FFFF", "#FF69B4"]; // Electric Blue and Vibrant Pink
  // Configuration State
  const [overheadPercentages, setOverheadPercentages] = useState({
    contingency: 0.15,
    pm: 0.05,
    sa: 0.05,
    sdd: 0.05,
    releaseConfig: 0.025,
    userManual: 0.025,
  });
  const [grandTotalEffort, setGrandTotalEffort] = useState(0);
  // Theme Switcher function with confetti effect (using a simplified visual feedback)
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
    // Simplified confetti feedback (you might want to use a proper confetti library for a real effect)
    toast({
      title: "Theme Switched!",
      description: `Enjoy the ${theme === "light" ? "dark" : "light"} mode.`,
    });
  }, [theme, toast]);
  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target;
    if (name === "effort") {
      setFormData((prevData) => ({ ...prevData, effort: Number(value) }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Function to add a new activity
  const addActivity = () => {
    setActivities((prevActivities) => [...prevActivities, formData]);
    setFormData({
      applicationName: "",
      adapter: "",
      activityName: "",
      activityType: "",
      coreSupervised: "",
      reused: false,
      effort: 0,
      businessException: "",
      assumption: "",
    });

    toast({
      title: "Activity Added!",
      description: "New activity has been added to the table.",
    });
  };

  // Handler for updating overhead percentages
  const handleOverheadChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const { value } = e.target;
    const parsedValue = Math.max(0, Math.min(100, Number(value))); // Ensure value is between 0 and 100
    setOverheadPercentages((prev) => ({
      ...prev,
      [key]: parsedValue / 100, // Convert to decimal
    }));
  };
  // Calculate Estimate Overview when activities change
  useEffect(() => {
    let total = 0;
    let core = 0;
    let supervised = 0;
    const effortByType: { [key: string]: number } = {};
    activities.forEach((activity) => {
      total += activity.effort;
      if (activity.coreSupervised === "core") {
        core += activity.effort;
      } else if (activity.coreSupervised === "supervised") {
        supervised += activity.effort;
      }
      if (effortByType[activity.activityType]) {
        effortByType[activity.activityType] += activity.effort;
      } else {
        effortByType[activity.activityType] = activity.effort;
      }
    });
    setTotalEffort(total);
    setCoreEffort(core);
    setSupervisedEffort(supervised);
    setEffortByActivityType(effortByType);
    // Calculate contingency and other efforts
    const contEffort = total * overheadPercentages.contingency;
    const pm = total * overheadPercentages.pm;
    const sa = total * overheadPercentages.sa;
    const sdd = total * overheadPercentages.sdd;
    const release = total * overheadPercentages.releaseConfig;
    const userManual = total * overheadPercentages.userManual;
    setContingencyEffort(contEffort);
    setPmEffort(pm);
    setSaEffort(sa);
    setSddEffort(sdd);
    setReleaseConfigEffort(release);
    setUserManualEffort(userManual);
    // Calculate grand total
    let grandTotal = total + contEffort + pm + sa + sdd + release + userManual;
    if (typeof grandTotal !== "number") grandTotal = 0;
    setGrandTotalEffort(grandTotal);
  }, [activities, overheadPercentages]);

  return (
    <div className="container mx-auto p-4 dark:bg-black dark:text-white">
      <ConfettiBackground />
      <div className="flex justify-end items-center mb-4">
        {" "}
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          ) : (
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>{" "}
      {/* Data Input Form */}
      <CardNeon
        className="glassmorphism neon-border-glow"
        style={{ position: "relative", zIndex: 1 }}
      >
        <CardHeader>
          <CardTitle style={{ color: neonTextColors[0] }}>
            Activity Input
          </CardTitle>
          <CardDescription
            style={{ color: neonTextColors[1] }}
          >
            Add a new Activity
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="applicationName" className="neon-label">Application Name</Label>
            <Input
              className="neon-input1"
              type="text"
              id="applicationName"
              name="applicationName"
              value={formData.applicationName}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adapter" className="neon-label">Adapter</Label>
            <Input
              className="neon-input2"
              type="text"
              id="adapter"
              name="adapter"
              value={formData.adapter}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="activityName" className="neon-label">Activity Name</Label>
            <Input
              className="neon-input1"
              type="text"
              id="activityName"
              name="activityName"
              value={formData.activityName}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="activityType" className="neon-label">Activity Type</Label>
            <Input
              className="neon-input2"
              type="text"
              id="activityType"
              name="activityType"
              value={formData.activityType}
              onChange={handleInputChange}
            />
          </div>
         <div className="grid gap-2">
            <Label htmlFor="coreSupervised" className="neon-label">Core/Supervised</Label>           
            <select
              style={{ color: neonTextColors[0] }}
              className="neon-select" id="coreSupervised" name="coreSupervised" value={formData.coreSupervised} onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="core">Core</option>
              <option value="supervised">Supervised</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="reused" className="neon-label">Reused?</Label>
            <Switch style={{ color: neonTextColors[1] }}
              id="reused"
              name="reused"
              checked={formData.reused}
              onCheckedChange={(checked) =>
                setFormData((prevData) => ({ ...prevData, reused: checked }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="effort" className="neon-label">Effort [h]</Label>
            <Input
              className="neon-input1"
              type="number"
              id="effort"
              name="effort"
              value={formData.effort}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="businessException" className="neon-label">Business Exception</Label>
            <Input
              className="neon-input2"
              type="text"
              id="businessException"
              name="businessException"
              value={formData.businessException}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assumption" className="neon-label">Assumption</Label>
            <Input
              className="neon-input1"
              type="text"
              id="assumption"
              name="assumption"
              value={formData.assumption}
              onChange={handleInputChange}
            />
          </div>
          <Button onClick={addActivity}>Add Activity</Button>
        </CardContent>
      </CardNeon>

      <Separator className="my-4" /> {/* Data Table Display */}
      <CardNeon className="glassmorphism">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>A summary of all activities.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application Name</TableHead>
                <TableHead>Adapter</TableHead>
                <TableHead>Activity Name</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Core/Supervised</TableHead>
                <TableHead>Reused?</TableHead>
                <TableHead>Effort [h]</TableHead>
                <TableHead>Business Exception</TableHead>
                <TableHead>Assumption</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.applicationName}</TableCell>
                  <TableCell>{activity.adapter}</TableCell>
                  <TableCell>{activity.activityName}</TableCell>
                  <TableCell>{activity.activityType}</TableCell>
                  <TableCell>{activity.coreSupervised}</TableCell>
                  <TableCell>{activity.reused ? "Yes" : "No"}</TableCell>
                  <TableCell>{activity.effort}</TableCell>
                  <TableCell>{activity.businessException}</TableCell>
                  <TableCell>{activity.assumption}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>Total</TableCell>
                <TableCell>
                  {activities
                    .reduce((sum, activity) => sum + Number(activity.effort), 0)
                    .toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </CardNeon>
      <Separator className="my-4" /> {/* Estimate Overview */}
      <CardNeon className="glassmorphism neon-border-glow mb-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle style={{ color: neonTextColors[0] }}>
            Estimate Overview
          </CardTitle>
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
              >
                {showConfig ? "Hide Config" : "Show Config"}
              </Button>
            </DialogTrigger>
            <DialogContent
              className="glassmorphism neon-border-glow w-full sm:max-w-[425px]"
              onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle style={{ color: neonTextColors[0] }}>
                  Overhead Configuration
                </DialogTitle>
                <DialogDescription>
                  Configure the overhead percentages for the effort estimation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contingency">Contingency (%)</Label>
                  <Input
                    type="number"
                    id="contingency"
                    name="contingency"
                    value={(overheadPercentages.contingency * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "contingency")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pm">Project Management (%)</Label>
                  <Input
                    type="number"
                    id="pm"
                    name="pm"
                    value={(overheadPercentages.pm * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "pm")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sa">Solution Architect (%)</Label>
                  <Input
                    type="number"
                    id="sa"
                    name="sa"
                    value={(overheadPercentages.sa * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "sa")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sdd">SDD (%)</Label>
                  <Input
                    type="number"
                    id="sdd"
                    name="sdd"
                    value={(overheadPercentages.sdd * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "sdd")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="releaseConfig">
                    Release and Configuration Guide (%)
                  </Label>
                  <Input
                    type="number"
                    id="releaseConfig"
                    name="releaseConfig"
                    value={(overheadPercentages.releaseConfig * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "releaseConfig")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="userManual">User Manual (%)</Label>
                  <Input
                    type="number"
                    id="userManual"
                    name="userManual"
                    value={(overheadPercentages.userManual * 100).toFixed(2)}
                    onChange={(e) => handleOverheadChange(e, "userManual")}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <CardDescription style={{ color: neonTextColors[1] }}>
            Summary of the estimation.
          </CardDescription>
          <p style={{ color: neonTextColors[0] }}>
            <strong>Total Effort:</strong> {Number(totalEffort).toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[1] }}>
            <strong>Total Core Effort:</strong>{" "}
            {(() => {
              let effort = coreEffort;
              if (typeof effort !== "number") effort = 0;
              return effort.toFixed(2);
            })()}{" "}
            hours
          </p>
          <p style={{ color: neonTextColors[0] }}>
            <strong>Total Supervised Effort:</strong>{" "}
            {supervisedEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[1] }}>
            <strong>Effort by Activity Type:</strong>
          </p>
          <ul>
            {Object.entries(effortByActivityType).map(([type, effort], index) => (
              <li
                key={type}
                style={{
                  color: neonTextColors[index % neonTextColors.length],
                }}
              >
                {type} {effort.toFixed(2)} hours
              </li>
            ))}
          </ul>
          <p style={{ color: neonTextColors[0] }}>
            <strong>
              Contingency ({overheadPercentages.contingency * 100}%):
            </strong>{" "}
            {contingencyEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[1] }}>
            <strong>
              Project Management ({overheadPercentages.pm * 100}%):
            </strong>{" "}
            {pmEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[0] }}>
            <strong>
              Solution Architect ({overheadPercentages.sa * 100}%):
            </strong>{" "}
            {saEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[1] }}>
            <strong>SDD ({overheadPercentages.sdd * 100}%):</strong>{" "}
            {sddEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[0] }}>
            <strong>
              Release and Configuration Guide (
              {overheadPercentages.releaseConfig * 100}%):
            </strong>{" "}
            {releaseConfigEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[1] }}>
            <strong>
              User Manual ({overheadPercentages.userManual * 100}%):
            </strong>{" "}
            {userManualEffort.toFixed(2)} hours
          </p>
          <p style={{ color: neonTextColors[0], fontSize: "1.2em" }}>
            <strong>Grand Total Effort:</strong>{" "}
            {Number(grandTotalEffort).toFixed(2)} hours
          </p>
        </CardContent>
      </CardNeon>
    </div>
  );
};
export default Home;
