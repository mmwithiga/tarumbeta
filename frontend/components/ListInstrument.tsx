import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Upload, CheckCircle2, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface ListInstrumentProps {
  onNavigate: (view: string) => void;
}

export function ListInstrument({ onNavigate }: ListInstrumentProps) {
  const { user, userProfile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instrumentType: "",
    condition: "",
    pricePerDay: "",
    pricePerWeek: "",
    pricePerMonth: "",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile) {
      toast.error("Please sign in to list an instrument");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create instrument listing (will need admin approval)
      const { data, error } = await supabase
        .from('instrument_listings')
        .insert({
          owner_id: user.id,
          name: formData.name,
          instrument_type: formData.instrumentType,
          condition: formData.condition,
          price_per_day: parseFloat(formData.pricePerDay),
          price_per_week: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : null,
          price_per_month: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : null,
          description: formData.description,
          location: formData.location,
          is_available: false, // Set to false - requires admin approval
          image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800', // Default image
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);
      toast.success("Instrument submitted for approval!", {
        description: "An admin will review your listing shortly.",
      });

      setTimeout(() => {
        onNavigate("landing");
      }, 3000);
    } catch (error: any) {
      console.error("Error listing instrument:", error);
      toast.error("Failed to list instrument", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center shadow-premium border-2">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center animate-pulse">
              <Lock className="h-12 w-12 text-accent" />
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            🎸 You're One Step Away!
          </h1>
          <p className="text-2xl font-semibold text-accent mb-6">
            Start Earning Money From Your Instrument
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of musicians who are making passive income by renting out their instruments. 
            It takes less than 5 minutes to list your first instrument!
          </p>
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Earn KES 10,000+/month</h3>
                <p className="text-sm text-muted-foreground">Top owners make thousands by renting out quality instruments</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">List in 5 Minutes</h3>
                <p className="text-sm text-muted-foreground">Quick setup, instant approval, start earning today</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Protected & Insured</h3>
                <p className="text-sm text-muted-foreground">Your instrument is covered with our rental protection plan</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Set Your Own Prices</h3>
                <p className="text-sm text-muted-foreground">You control pricing, availability, and rental terms</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              ⭐⭐⭐⭐⭐ Trusted by 500+ instrument owners
            </p>
            <p className="italic text-foreground">
              "I listed my guitar and within a week, I had 3 rentals! It's been amazing passive income." 
              <span className="text-sm text-muted-foreground block mt-1">- Sarah K., Nairobi</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              onClick={() => onNavigate("signin")}
              className="gradient-teal text-white border-0 h-14 px-10 text-lg font-semibold"
              size="lg"
            >
              Sign In & Start Earning
            </Button>
            <Button
              onClick={() => onNavigate("signup")}
              variant="outline"
              size="lg"
              className="h-14 px-10 text-lg border-2 border-primary hover:bg-primary hover:text-white"
            >
              Create Free Account
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            ✨ No listing fees • No hidden charges • Get paid directly
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
            Instrument Listed Successfully!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your instrument has been added to our platform. You'll be notified when someone rents it.
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
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            List Your Instrument
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your instrument with aspiring musicians and earn money
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 md:p-8 shadow-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instrument Type */}
            <div className="space-y-2">
              <Label htmlFor="instrument-type">Instrument Type *</Label>
              <Select 
                required
                value={formData.instrumentType}
                onValueChange={(value) => setFormData({ ...formData, instrumentType: value })}
              >
                <SelectTrigger id="instrument-type" className="bg-input-background">
                  <SelectValue placeholder="Select instrument type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Guitar">Guitar</SelectItem>
                  <SelectItem value="Piano">Piano</SelectItem>
                  <SelectItem value="Drums">Drums</SelectItem>
                  <SelectItem value="Saxophone">Saxophone</SelectItem>
                  <SelectItem value="Violin">Violin</SelectItem>
                  <SelectItem value="Bass">Bass Guitar</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Instrument Name */}
            <div className="space-y-2">
              <Label htmlFor="instrument-name">Instrument Name *</Label>
              <Input
                id="instrument-name"
                placeholder="e.g., Yamaha C40 Classical Guitar"
                required
                className="bg-input-background"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select 
                required
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger id="condition" className="bg-input-background">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price-per-day">Price per Day (KES) *</Label>
                <Input
                  id="price-per-day"
                  type="number"
                  placeholder="500"
                  required
                  className="bg-input-background"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-per-week">Price per Week (KES)</Label>
                <Input
                  id="price-per-week"
                  type="number"
                  placeholder="3000"
                  className="bg-input-background"
                  value={formData.pricePerWeek}
                  onChange={(e) => setFormData({ ...formData, pricePerWeek: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-per-month">Price per Month (KES)</Label>
                <Input
                  id="price-per-month"
                  type="number"
                  placeholder="10000"
                  className="bg-input-background"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select 
                required
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location" className="bg-input-background">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
                  <SelectItem value="Nakuru">Nakuru</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Schedule */}
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Schedule</Label>
              <Input
                id="availability"
                placeholder="e.g., Weekdays 9 AM - 5 PM"
                className="bg-input-background"
              />
              <p className="text-xs text-muted-foreground">
                Describe when your instrument is available for rent
              </p>
            </div>

            {/* Upload Photo - Optional */}
            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo (Optional)</Label>
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
                    Click to upload instrument photo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB (Optional - default image will be used)
                  </p>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide details about your instrument, any included accessories, special features, etc."
                rows={4}
                className="bg-input-background resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Listing..." : "List Instrument"}
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

            {/* Optional CTA */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Want to earn more? Become an instructor too!
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-secondary text-secondary hover:bg-secondary/10"
              >
                Become an Instructor
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}