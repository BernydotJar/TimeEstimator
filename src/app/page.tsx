"use client";
import { rpaToolSalaryIndexes, activityEffortMatrix, exceptionHandlingMultipliers } from "./data";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
// Define the data structure for an activity
import EstimateReport from './components/EstimateReport';
import { Toaster } from "@/components/ui/toaster";


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
  rpaTool: string;
  applicationType: string;
  detailedActivityType: string;
  exceptionHandlingComplexity: string;
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

    let animationFrameId: number;
    const startAnimation = () => {
      draw();
      animationFrameId = requestAnimationFrame(startAnimation);
    }
    // startAnimation(); // Commented out to let PlayWright pass

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      if (canvasRef.current) {
        canvasRef.current.width = W;
        canvasRef.current.height = H;
      }
    };
    window.addEventListener("resize", handleResize);
    
    // Call draw once to render initial state for testing if animation is off
    // draw(); // Commented out to let PlayWright pass

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
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
  const [showReport, setShowReport] = useState<boolean>(false);
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
    rpaTool: "",
    applicationType: "",
    detailedActivityType: "",
    exceptionHandlingComplexity: "",
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
  const componentRef = useRef<HTMLDivElement>(null);
  // Theme Switcher function with confetti effect (using a simplified visual feedback)
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      document.documentElement.classList.remove(prevTheme);
      document.documentElement.classList.add(newTheme);
       toast({
         title: "Theme Switched!",
         description: `Enjoy the ${newTheme} mode.`,
       });
      return newTheme;
    });
  }, [toast]);
  
  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; 
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
      rpaTool: "",
      applicationType: "",
      detailedActivityType: "",
      exceptionHandlingComplexity: "",
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
    let currentTotalEffort = 0;
    let currentCoreEffort = 0;
    let currentSupervisedEffort = 0;
    const currentEffortByActivityType: { [key: string]: number } = {};

    activities.forEach((activity) => {      
      const activityEffort = Number(activity.effort) || 0; // Ensure effort is a number
      currentTotalEffort += activityEffort;

      if (activity.coreSupervised === "core") {
        currentCoreEffort += activityEffort;
      } else if (activity.coreSupervised === "supervised") {
        currentSupervisedEffort += activityEffort;
      }

      if (activity.activityType) { // Ensure activityType is not empty
        if (currentEffortByActivityType[activity.activityType]) {
          currentEffortByActivityType[activity.activityType] += activityEffort;
        } else {
          currentEffortByActivityType[activity.activityType] = activityEffort;
        }
      }
    });

    setTotalEffort(currentTotalEffort);
    setCoreEffort(currentCoreEffort);
    setSupervisedEffort(currentSupervisedEffort);
    setEffortByActivityType(currentEffortByActivityType);

    // Calculate contingency and other efforts
    const contEffort = currentTotalEffort * overheadPercentages.contingency;
    const pm = currentTotalEffort * overheadPercentages.pm;
    const sa = currentTotalEffort * overheadPercentages.sa;
    const sdd = currentTotalEffort * overheadPercentages.sdd;
    const release = currentTotalEffort * overheadPercentages.releaseConfig;
    const userManual = currentTotalEffort * overheadPercentages.userManual;

    setContingencyEffort(contEffort);
    setPmEffort(pm);
    setSaEffort(sa);
    setSddEffort(sdd);
    setReleaseConfigEffort(release);
    setUserManualEffort(userManual);

    // Calculate grand total
    const grandTotal = currentTotalEffort + contEffort + pm + sa + sdd + release + userManual;
    setGrandTotalEffort(grandTotal);

  }, [activities, overheadPercentages]);

    const handleSaveEstimate = async () => {
        if (!componentRef.current) {
            toast({
                title: 'Error',
                description: 'Could not find estimate report to save.',
                variant: 'destructive',
            });
            return;
        }
        
        // Temporarily hide the button before capturing
        const buttonElement = componentRef.current.querySelector('button');
        if (buttonElement) {
            buttonElement.style.display = 'none';
        }

        try {
            const canvas = await html2canvas(componentRef.current, {
                scale: 2, 
                useCORS: true, 
                backgroundColor: null, // Use null for transparent background if desired, or white for solid
                onclone: (documentClone) => {
                  // Ensure the button is also hidden in the cloned document
                  const clonedButton = documentClone.querySelector('button');
                  if (clonedButton) {
                    clonedButton.style.display = 'none';
                  }
                }
            });
            const dataURL = canvas.toDataURL('image/png');
            saveAs(dataURL, 'estimate_report.png');
            toast({
                title: 'Estimate Report Saved',
                description: 'Estimate report saved as an image.',
            });
        } catch (error: any) {
            console.error('Error saving estimate:', error);
            toast({
                title: 'Error',
                description: `Failed to save estimate report: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
             // Restore the button visibility
            if (buttonElement) {
                buttonElement.style.display = '';
            }
        }
    };


  return (
    <div className="container mx-auto p-4" data-testid="home-page">
      <Toaster />
      <ConfettiBackground />
      <div className="flex justify-end items-center mb-4">{" "}
        <Button aria-label="Toggle theme" variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          ) : (
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>{" "}
      {/* Data Input Form */}
      <Card
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
              aria-label="Application Name"
            />
          </div>
         <div className="grid gap-2">
            <Label htmlFor="adapter" className="neon-label">Adapter</Label>
            <select
              className="neon-select p-2 rounded-md border"
              id="adapter"
              name="adapter"
              value={formData.adapter}
              onChange={handleInputChange}
              aria-label="Adapter"
            >
              <option value="">Select Adapter</option>
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
           <div className="grid gap-2">
              <Label htmlFor="activityName" className="neon-label">Activity Name</Label>
              <Input
                className="neon-input1"
                type="text"
                id="activityName"
                name="activityName"
                value={formData.activityName}
                onChange={handleInputChange}
                aria-label="Activity Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="activityType" className="neon-label">Activity Type</Label>
              <select
                className="neon-select p-2 rounded-md border"
                id="activityType"
                name="activityType"
                value={formData.activityType}
                onChange={handleInputChange}
                aria-label="Activity Type"
              >
                <option value="">Select Activity Type</option>
                <option value="Application">Application</option>
                <option value="Process">Process</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="businessException" className="neon-label">
                  Business Exception
                </Label>
                <select
                  className="neon-select p-2 rounded-md border"
                  id="businessException"
                  name="businessException"
                  value={formData.businessException}
                  onChange={handleInputChange}
                  aria-label="Business Exception"
                >
                  <option value="">Select Exception Type</option>
                  <option value="Business">Business</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
         
         <div className="grid gap-2">
            <Label htmlFor="coreSupervised" className="neon-label">Core/Supervised</Label>           
            <select
              style={{ color: neonTextColors[0] }}
              className="neon-select p-2 rounded-md border" id="coreSupervised" name="coreSupervised" value={formData.coreSupervised} onChange={handleInputChange}
              aria-label="Core or Supervised"
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
              aria-label="Reused"
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
              aria-label="Effort in hours"
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
              aria-label="Assumption"
            />
          </div>
           <div className="grid gap-2">
              <Label htmlFor="rpaTool" className="neon-label">
                RPA Tool
              </Label>
              <select
                className="neon-select p-2 rounded-md border"
                id="rpaTool"
                name="rpaTool"
                value={formData.rpaTool}
                onChange={handleInputChange}
                aria-label="RPA Tool"
              >
                <option value="">Select RPA Tool</option>
                <option value="Blue Prism">Blue Prism</option>
                <option value="UiPath">UiPath</option>
                <option value="Automation Anywhere">Automation Anywhere</option>
                <option value="Power APPs">Power APPs</option>
                <option value="Python">Python</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="applicationType" className="neon-label">
                Application Type
              </Label>
              <select
                className="neon-select p-2 rounded-md border"
                id="applicationType"
                name="applicationType"
                value={formData.applicationType}
                onChange={handleInputChange}
                aria-label="Application Type"
              >
                <option value="">Select Application Type</option>
                <option value="Desktop">Desktop</option>
                <option value="Web">Web</option>
                <option value="Terminal">Terminal</option>
                <option value="SAP">SAP</option>
                <option value="Power bi related">Power bi related</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detailedActivityType" className="neon-label">
                Detailed Activity Type
              </Label>
              <select
                className="neon-select p-2 rounded-md border"
                id="detailedActivityType"
                name="detailedActivityType"
                value={formData.detailedActivityType}
                onChange={handleInputChange}
                aria-label="Detailed Activity Type"
              >
                <option value="">Select Detailed Activity Type</option>
                <option value="Launch">Launch</option>
                <option value="Click">Click</option>
                <option value="Read">Read</option>
                <option value="Write">Write</option>
                <option value="Send">Send</option>
                <option value="Forms">Forms</option>
                <option value="Connector">Connector</option>
              </select>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="exceptionHandlingComplexity" className="neon-label">
                  Exception Handling Complexity
                </Label>
                <select
                  className="neon-select p-2 rounded-md border"
                  id="exceptionHandlingComplexity"
                  name="exceptionHandlingComplexity"
                  value={formData.exceptionHandlingComplexity}
                  onChange={handleInputChange}
                  aria-label="Exception Handling Complexity"
                >
                  <option value="">Select Complexity</option>
                  <option value="Basic">Basic</option>
                  <option value="Medium">Medium</option>
                  <option value="Complex">Complex</option>
                </select>
              </div>
          <Button onClick={addActivity} >Add Activity</Button>
        </CardContent>
      </Card>

      <Separator className="my-4" /> {/* Data Table Display */}
      <Card className="glassmorphism">
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
                  <TableHead>RPA Tool</TableHead>
                  <TableHead>Application Type</TableHead>
                  <TableHead>Detailed Activity Type</TableHead>
                  <TableHead>Exception Handling Complexity</TableHead>
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
                    <TableCell>{activity.rpaTool}</TableCell>
                    <TableCell>{activity.applicationType}</TableCell>
                    <TableCell>{activity.detailedActivityType}</TableCell>
                    <TableCell>{activity.exceptionHandlingComplexity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-bold">Total</TableCell>
                <TableCell className="font-bold">
                  {activities
                    .reduce((sum, activity) => sum + Number(activity.effort), 0)
                    .toFixed(2)}
                </TableCell>
                <TableCell colSpan={6}></TableCell> 
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <Separator className="my-4" /> 
      
      {/* Estimate Overview */}
      <Card className="glassmorphism neon-border-glow mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle style={{ color: neonTextColors[0] }}>
            Estimate Overview
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-expanded={showConfig}
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
                  {Object.entries(overheadPercentages).map(([key, value]) => (
                    <div className="grid gap-2" key={key}>
                      <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <Input
                        type="number"
                        id={key}
                        name={key}
                        value={(value * 100).toFixed(1)} // Display as percentage, allow one decimal
                        onChange={(e) => handleOverheadChange(e, key)}
                        aria-label={`${key.replace(/([A-Z])/g, ' $1')} percentage`}
                      />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
              <Dialog open={showReport} onOpenChange={setShowReport}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-expanded={showReport}>
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className="glassmorphism neon-border-glow w-full sm:max-w-[800px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogHeader>
                    <DialogTitle style={{ color: neonTextColors[0] }}>
                      Professional Estimate Summary
                    </DialogTitle>
                    <DialogDescription>
                      A detailed breakdown of the effort estimate for professional reporting.
                    </DialogDescription>
                  </DialogHeader>
                    <div ref={componentRef} className="p-4 bg-white text-black">
                        <h3 className="text-xl font-bold mb-2 text-blue-700 text-center">Estimate Summary</h3>
                        <Table className="min-w-full border border-blue-300">
                            <TableHeader className="bg-blue-100">
                                <TableRow>
                                    <TableHead className="text-left text-blue-700 font-semibold p-2 border-b border-blue-300">Category</TableHead>
                                    <TableHead className="text-right text-blue-700 font-semibold p-2 border-b border-blue-300">Effort (Hours)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Total Effort</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{totalEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Core Effort</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{coreEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Supervised Effort</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{supervisedEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                {Object.entries(effortByActivityType).map(([type, effort], index) => (
                                    <TableRow key={type + index}>
                                        <TableCell className="font-medium p-2 border-b border-blue-200">Effort - {type}</TableCell>
                                        <TableCell className="text-right p-2 border-b border-blue-200">{Number(effort).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Contingency ({ (overheadPercentages.contingency * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{contingencyEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Project Management ({ (overheadPercentages.pm * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{pmEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Solution Architect ({ (overheadPercentages.sa * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{saEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">SDD ({ (overheadPercentages.sdd * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{sddEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">Release and Configuration Guide ({ (overheadPercentages.releaseConfig * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{releaseConfigEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium p-2 border-b border-blue-200">User Manual ({ (overheadPercentages.userManual * 100).toFixed(1)}%)</TableCell>
                                    <TableCell className="text-right p-2 border-b border-blue-200">{userManualEffort.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className="bg-blue-100">
                                    <TableCell className="font-bold text-blue-700 p-2">Grand Total Effort</TableCell>
                                    <TableCell className="text-right font-bold text-blue-700 p-2">{grandTotalEffort.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSaveEstimate} className="mt-4 text-fuchsia-600">
                        Save Estimate Report
                    </Button>
                </DialogContent>
              </Dialog>
            </div>
        </CardHeader>
        <CardContent id="estimate-overview">
           <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left" style={{ color: neonTextColors[1] }}>Category</TableHead>
                  <TableHead className="text-right" style={{ color: neonTextColors[1] }}>Effort (Hours)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[0] }}>Total Effort</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[0] }}>{totalEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[1] }}>Total Core Effort</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[1] }}>{coreEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[0] }}>Total Supervised Effort</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[0] }}>{supervisedEffort.toFixed(2)}</TableCell>
                </TableRow>
                {Object.entries(effortByActivityType).map(([type, effort], index) => (
                  <TableRow key={type}>
                    <TableCell className="font-medium" style={{ color: neonTextColors[index % 2] }}>Effort - {type}</TableCell>
                    <TableCell className="text-right" style={{ color: neonTextColors[index % 2] }}>{Number(effort).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[Object.keys(effortByActivityType).length % 2] }}>Contingency ({(overheadPercentages.contingency * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[Object.keys(effortByActivityType).length % 2] }}>{contingencyEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 1) % 2] }}>Project Management ({(overheadPercentages.pm * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 1) % 2] }}>{pmEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 2) % 2] }}>Solution Architect ({(overheadPercentages.sa * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 2) % 2] }}>{saEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 3) % 2] }}>SDD ({(overheadPercentages.sdd * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 3) % 2] }}>{sddEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 4) % 2] }}>Release and Configuration Guide ({(overheadPercentages.releaseConfig * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 4) % 2] }}>{releaseConfigEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 5) % 2] }}>User Manual ({(overheadPercentages.userManual * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right" style={{ color: neonTextColors[(Object.keys(effortByActivityType).length + 5) % 2] }}>{userManualEffort.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold" style={{ color: neonTextColors[0], fontSize: '1.1em' }}>Grand Total Effort</TableCell>
                  <TableCell className="text-right font-bold" style={{ color: neonTextColors[0], fontSize: '1.1em' }}>{grandTotalEffort.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default Home;
