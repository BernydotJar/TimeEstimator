
"use client";

import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from '@/components/icons';

// Define the data structure for an activity
interface Activity {
    applicationName: string;
    adapter: string;
    activityName: string;
    activityType: string;
    quantity: number;
    coreSupervised: string;
    reused: boolean;
    effort: number;
    businessException: string;
    assumption: string;
}

const Home: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [formData, setFormData] = useState<Activity>({
        applicationName: "",
        adapter: "",
        activityName: "",
        activityType: "",
        quantity: 0,
        coreSupervised: "",
        reused: false,
        effort: 0,
        businessException: "",
        assumption: "",
    });
    const [totalEffort, setTotalEffort] = useState(0);
    const { toast } = useToast();
    const [theme, setTheme] = React.useState<"light" | "dark">("light");

    // Theme Switcher function with confetti effect (using a simplified visual feedback)
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
        document.documentElement.classList.toggle("dark");

        // Simplified confetti feedback (you might want to use a proper confetti library for a real effect)
        toast({
            title: "Theme Switched!",
            description: `Enjoy the ${theme === "light" ? "dark" : "light"} mode.`,
        });
    }, [theme, toast]);

    // Function to handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Function to add a new activity
    const addActivity = () => {
        setActivities(prevActivities => [...prevActivities, formData]);
        setTotalEffort(prevTotal => prevTotal + formData.effort);
        setFormData({
            applicationName: "",
            adapter: "",
            activityName: "",
            activityType: "",
            quantity: 0,
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

    return (
        <div className="container mx-auto p-4 dark:bg-black dark:text-white">

            {/* Theme Switcher */}
            <div className="flex justify-end mb-4">
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                    {theme === "light" ? <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> : <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            {/* Data Input Form */}
            <Card className="glassmorphism mb-4">
                <CardHeader>
                    <CardTitle>Activity Input</CardTitle>
                    <CardDescription>Enter the details for the activity.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="applicationName">Application Name</Label>
                        <Input type="text" id="applicationName" name="applicationName" value={formData.applicationName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="adapter">Adapter</Label>
                        <Input type="text" id="adapter" name="adapter" value={formData.adapter} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="activityName">Activity Name</Label>
                        <Input type="text" id="activityName" name="activityName" value={formData.activityName} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="activityType">Activity Type</Label>
                        <Input type="text" id="activityType" name="activityType" value={formData.activityType} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="coreSupervised">Core/Supervised</Label>
                        <select id="coreSupervised" name="coreSupervised" value={formData.coreSupervised} onChange={handleInputChange} className="rounded-md shadow-sm border-gray-300 dark:bg-dark-gray dark:border-gray-600 dark:text-white">
                            <option value="">Select</option>
                            <option value="core">Core</option>
                            <option value="supervised">Supervised</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="reused">Reused?</Label>
                        <Switch id="reused" name="reused" checked={formData.reused} onCheckedChange={(checked) => setFormData(prevData => ({ ...prevData, reused: checked }))} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="effort">Effort [h]</Label>
                        <Input type="number" id="effort" name="effort" value={formData.effort} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="businessException">Business Exception</Label>
                        <Input type="text" id="businessException" name="businessException" value={formData.businessException} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="assumption">Assumption</Label>
                        <Input type="text" id="assumption" name="assumption" value={formData.assumption} onChange={handleInputChange} />
                    </div>
                    <Button onClick={addActivity}>Add Activity</Button>
                </CardContent>
            </Card>

            <Separator className="my-4" />

            {/* Data Table Display */}
            <Card className="glassmorphism mb-4">
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
                                <TableHead>Quantity</TableHead>
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
                                    <TableCell>{activity.quantity}</TableCell>
                                    <TableCell>{activity.coreSupervised}</TableCell>
                                    <TableCell>{activity.reused ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{activity.effort}</TableCell>
                                    <TableCell>{activity.businessException}</TableCell>
                                    <TableCell>{activity.assumption}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7}>Total</TableCell>
                                <TableCell>{totalEffort}</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>

            {/* Estimate Overview */}
            <Card className="glassmorphism">
                <CardHeader>
                    <CardTitle>Estimate Overview</CardTitle>
                    <CardDescription>Summary of the estimation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Total Effort: {totalEffort} hours</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Home;
