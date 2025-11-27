import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

import { Badge } from "./ui/badge";
import { Upload, CheckCircle2, Award, Music2, Lock } from "lucide-react";
import { useState } from "react";
import type { View } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface BecomeInstructorProps {
  onNavigate: (view: View) => void;
}

export function BecomeInstructor({ onNavigate }: BecomeInstructorProps) {
  const { user, userProfile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instrument: "",
    experienceYears: "",
    hourlyRate: "",
    bio: "",
    certifications: "",
  });

  const genres = ["Classical", "Jazz", "Rock", "Blues", "Pop", "Folk", "Contemporary", "R&B"];

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Form data:", formData);
    console.log("🎵 Selected genres:", selectedGenres);

    if (!user || !userProfile) {
      toast.error("Please sign in to apply");
      return;
    }

    // Validate required fields
    if (!formData.instrument || !formData.experienceYears || !formData.hourlyRate || !formData.bio) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 Submitting application...");

      // Create instructor application
      const { data, error } = await supabase
        .from('instructor_applications')
        .insert({
          user_id: user.id,
          instrument: formData.instrument,
          experience_years: parseInt(formData.experienceYears),
          hourly_rate: parseFloat(formData.hourlyRate),
          bio: formData.bio,
          genre: selectedGenres.length > 0 ? selectedGenres.join(", ") : null,
          certifications: formData.certifications || null,
          status: 'pending', // Will be reviewed by admin
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Database error:", error);
        throw error;
      }

      console.log("✅ Application created:", data);

      setSubmitted(true);
      toast.success("Application submitted!", {
        description: "Our team will review it soon.",
      });

      setTimeout(() => {
        onNavigate("landing");
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error submitting application:", error);
      toast.error("Failed to submit application", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center shadow-premium">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Share Your Musical Expertise?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            To become an instructor on Tarumbeta, you'll need to sign in first. Join our community of talented music educators and inspire the next generation of musicians!
          </p>

          {/* Benefits List */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              <Award className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Earn Money</h3>
                <p className="text-sm text-muted-foreground">Set your own rates and teach on your schedule</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              <Music2 className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Share Your Passion</h3>
                <p className="text-sm text-muted-foreground">Inspire students and grow your teaching career</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              <CheckCircle2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Verified Profile</h3>
                <p className="text-sm text-muted-foreground">Get a verified badge after approval</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
              <Music2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Flexible Teaching</h3>
                <p className="text-sm text-muted-foreground">Teach online or in-person, your choice</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate("signin")}
              className="gradient-teal text-white border-0 h-12 px-8"
              size="lg"
            >
              Sign In to Apply
            </Button>
            <Button
              onClick={() => onNavigate("signup")}
              variant="outline"
              size="lg"
              className="h-12 px-8"
            >
              Create New Account
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            💡 <strong>Tip:</strong> When creating your account, make sure to check "I want to teach music" to be eligible for instructor applications!
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="max-w-md w-full mx-4 p-8 text-center shadow-premium">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Application Submitted!
          </h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to become an instructor. Our team will review your application and contact you within 2-3 business days.
          </p>
          <Button
            onClick={() => onNavigate("landing")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Become an Instructor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your musical expertise and inspire the next generation of musicians. Join our community of passionate instructors.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center shadow-premium">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-3">
              <Music2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Flexible Schedule</h3>
            <p className="text-sm text-muted-foreground">Teach on your own time</p>
          </Card>
          <Card className="p-4 text-center shadow-premium">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mx-auto mb-3">
              <Award className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Earn Money</h3>
            <p className="text-sm text-muted-foreground">Set your own rates</p>
          </Card>
          <Card className="p-4 text-center shadow-premium">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Matched Students</h3>
            <p className="text-sm text-muted-foreground">Smart student matching</p>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="p-6 md:p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    className="bg-input-background"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className="bg-input-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 700 000 000"
                  required
                  className="bg-input-background"
                />
              </div>
            </div>

            {/* Teaching Details */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Teaching Details</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instrument">Primary Instrument *</Label>
                  <Select
                    required
                    value={formData.instrument}
                    onValueChange={(value) => setFormData({ ...formData, instrument: value })}
                  >
                    <SelectTrigger id="instrument" className="bg-input-background">
                      <SelectValue placeholder="Select your instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guitar">Guitar</SelectItem>
                      <SelectItem value="Piano">Piano</SelectItem>
                      <SelectItem value="Drums">Drums</SelectItem>
                      <SelectItem value="Saxophone">Saxophone</SelectItem>
                      <SelectItem value="Violin">Violin</SelectItem>
                      <SelectItem value="Bass">Bass Guitar</SelectItem>
                      <SelectItem value="Vocals">Vocals</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Teaching Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="5"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (KES) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="50"
                    placeholder="1500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    required
                    className="bg-input-background"
                  />
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications & Certifications</Label>
              <Textarea
                id="qualifications"
                placeholder="List your music education, certifications, and achievements..."
                rows={3}
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                className="bg-input-background resize-none"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Teaching Philosophy & Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your teaching approach and experience..."
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                required
                className="bg-input-background resize-none"
              />
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label>Genres You Teach</Label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Upload Photo - Optional */}
            <div className="space-y-2">
              <Label htmlFor="photo">Profile Photo (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-input-background hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  id="photo"
                  className="hidden"
                  accept="image/*"
                />
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload your photo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 gradient-teal text-white border-0 h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("landing")}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}