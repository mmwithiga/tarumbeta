import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Music, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { View } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface SignUpProps {
  onNavigate: (view: View) => void;
}

export function SignUp({ onNavigate }: SignUpProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    wantToRent: false,
    wantToTeach: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const role = formData.wantToTeach ? 'instructor' : 'learner';
      const { error } = await signUp(formData.email, formData.password, formData.name, role);

      if (error) {
        toast.error("Sign up failed", {
          description: error.message || "Please try again"
        });
      } else {
        toast.success("Account created!", {
          description: "Welcome to Tarumbeta! Let's find your perfect instrument."
        });
        onNavigate("landing");
      }
    } catch (error: any) {
      toast.error("An error occurred", {
        description: error.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info("Google Sign-Up coming soon!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      {/* Background Illustration */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <img
          src="https://images.unsplash.com/photo-1597169428734-9e8bfb346cb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5naW5nJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjIxNTk3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt=""
          className="h-full w-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
      </div>

      <Card className="relative w-full max-w-md p-8 shadow-premium-hover">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Music className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tarumbeta
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join Tarumbeta
          </h1>
          <p className="text-muted-foreground">
            Start your musical journey today
          </p>
        </div>

        {/* Google Sign Up */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 mb-6"
          onClick={handleGoogleSignUp}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <div className="relative mb-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or sign up with email
          </span>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="pl-10 bg-input-background h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="pl-10 bg-input-background h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pl-10 bg-input-background h-11"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="pl-10 bg-input-background h-11"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="space-y-3 pt-2">
            <Label>I want to:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rent"
                  checked={formData.wantToRent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, wantToRent: checked as boolean })
                  }
                />
                <label
                  htmlFor="rent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Rent instruments
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teach"
                  checked={formData.wantToTeach}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, wantToTeach: checked as boolean })
                  }
                />
                <label
                  htmlFor="teach"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Teach music
                </label>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-teal text-white border-0 h-12 text-lg"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("signin")}
            className="text-primary font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </Card>
    </div>
  );
}