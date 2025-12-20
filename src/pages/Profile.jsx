import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Calendar, Edit, Save, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Profile() {
  const { profile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);

  // Sync state if profile loads late
  // useEffect(() => setFullName(profile?.full_name), [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || "");
    setIsEditing(false);
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
          <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.full_name}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-md"
          >
            <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="fullname"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="font-semibold">{profile?.email}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Role</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {profile?.role}
              </Badge>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="font-semibold">
                {profile?.created_at
                  ? format(new Date(profile.created_at), "MMMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Status</span>
              </div>
               <Badge variant={profile?.active ? "default" : "destructive"}>
                  {profile?.active ? "Active" : "Inactive"}
               </Badge>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
          <CardHeader>
              <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            <div>
                <p className="text-sm text-muted-foreground mb-2">Password</p>
                <p className="font-semibold mb-3">••••••••</p>
                <Button variant="outline" disabled>
                Change Password (Coming Soon)
                </Button>
            </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

