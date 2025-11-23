import { useState, useEffect } from "react";
import type { View } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { User, Mail, MapPin, Phone, Save, ArrowLeft } from "lucide-react";

interface ProfileSettingsProps {
  onNavigate: (view: View) => void;
}

export function ProfileSettings({ onNavigate }: ProfileSettingsProps) {
  const { userProfile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    location: "",
    phone: "",
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        location: userProfile.location || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.full_name) return "U";
    const names = userProfile.full_name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userProfile.full_name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate("landing")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userProfile?.full_name || "User"}</CardTitle>
                <CardDescription>{userProfile?.email}</CardDescription>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary capitalize">
                    {userProfile?.role || "learner"}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Nairobi, Kenya"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate("landing")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
