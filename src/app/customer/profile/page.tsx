"use client";

import { CustomerLayout } from "@/components/layout/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/services/api";
import { User as UserType } from "@/types";
import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Shield, Loader2, Pencil, Lock, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(authUser);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [editError, setEditError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.me();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError("");
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    if (!name.trim()) {
      setEditError("Full name is required");
      return;
    }
    
    try {
      const response = await authApi.updateProfile({
        name: name,
        phone: formData.get("phone") as string,
      });
      
      if (response.success) {
        setUser(response.data);
        setShowEditDialog(false);
        showSuccessToast("Profile updated successfully!");
      } else {
        setEditError(response.message || "Failed to update profile");
      }
    } catch {
      setEditError("An error occurred. Please try again.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    const formData = new FormData(e.currentTarget);
    
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        setShowPasswordDialog(false);
        showSuccessToast("Password changed successfully!");
      } else {
        setPasswordError(response.message || "Failed to change password");
      }
    } catch {
      setPasswordError("An error occurred. Please try again.");
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load profile. Please try logging in again.
          </div>
        ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user?.phone || "Not set"}</p>
                </div>
              </div>
              {user?.role === "admin" && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{user?.role || "N/A"}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {editError}
                </div>
              )}
              <div className="space-y-2">
                <label>Full Name</label>
                <Input 
                  name="name" 
                  defaultValue={user?.name} 
                />
              </div>
              <div className="space-y-2">
                <label>Phone</label>
                <Input 
                  name="phone" 
                  defaultValue={user?.phone || ""} 
                />
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {passwordError}
                </div>
              )}
              <div className="space-y-2">
                <label>Current Password</label>
                <Input 
                  name="currentPassword" 
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <label>New Password</label>
                <Input 
                  name="newPassword" 
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <label>Confirm New Password</label>
                <Input 
                  name="confirmPassword" 
                  type="password"
                />
              </div>
              <Button type="submit" className="w-full">
                Change Password
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}