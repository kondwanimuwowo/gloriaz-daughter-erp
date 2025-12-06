import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Edit, Save, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { format } from "date-fns";

export default function Profile() {
  const { profile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);

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

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700 border-red-300",
      manager: "bg-blue-100 text-blue-700 border-blue-300",
      employee: "bg-green-100 text-green-700 border-green-300",
    };
    return colors[role] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {profile?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.full_name}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="secondary"
              icon={Edit}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={User}
            />
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                icon={X}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button icon={Save} onClick={handleSave} loading={loading}>
                Save Changes
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail size={18} />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-gray-900 font-semibold">{profile?.email}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Shield size={18} />
                <span className="text-sm font-medium">Role</span>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(profile?.role)}`}
              >
                {profile?.role?.charAt(0).toUpperCase() +
                  profile?.role?.slice(1)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={18} />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {profile?.created_at
                  ? format(new Date(profile.created_at), "MMMM dd, yyyy")
                  : "N/A"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User size={18} />
                <span className="text-sm font-medium">Status</span>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile?.active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {profile?.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Security Card */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Password</p>
            <p className="text-gray-900 font-semibold mb-3">••••••••</p>
            <Button variant="secondary" disabled>
              Change Password (Coming Soon)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
