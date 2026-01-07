import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    User,
    Shield,
    DollarSign,
    Scissors,
    Warehouse,
    Palette,
    Bell,
    Lock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GarmentTypeManager from "../components/finance/GarmentTypeManager";
import FinancialSettings from "../components/finance/FinancialSettings";
import Profile from "./Profile";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
    const { profile } = useAuthStore();
    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your business profile and system preferences</p>
                </div>
            </div>

            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="general" className="gap-2">
                        <Warehouse size={16} />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="gap-2">
                        <DollarSign size={16} />
                        Financial
                    </TabsTrigger>
                    <TabsTrigger value="workshop" className="gap-2">
                        <Scissors size={16} />
                        Workshop
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <User size={16} />
                        Account
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Profile</CardTitle>
                            <CardDescription>Public information about your workshop</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input id="businessName" defaultValue="Gloria's Daughter" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Base Currency</Label>
                                    <Input id="currency" defaultValue="ZMW (K)" disabled />
                                    <p className="text-[10px] text-muted-foreground italic">Currency is currently fixed to Zambian Kwacha</p>
                                </div>
                            </div>
                            <Button>Save General Settings</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of your ERP</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">Dark Mode</p>
                                    <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
                                </div>
                                <Badge variant="secondary">Managed by browser</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Financial Settings */}
                <TabsContent value="financial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Rules & Pricing</CardTitle>
                            <CardDescription>Configurations for margins, taxes, and overhead calculations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FinancialSettings onClose={() => { }} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workshop Settings */}
                <TabsContent value="workshop" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workshop Configuration</CardTitle>
                            <CardDescription>Manage garment types, complexity levels, and default labour rates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GarmentTypeManager />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security & Account Settings */}
                <TabsContent value="security" className="space-y-4">
                    <Profile />
                </TabsContent>
            </Tabs>
        </div>
    );
}
