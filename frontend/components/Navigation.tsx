import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Moon, Sun, Menu, X, Music, Bell, LogOut, Calendar, FileText, Settings, LayoutDashboard, Package } from "lucide-react";
import { useState } from "react";
import type { View } from "../types";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'learner' | 'instructor' | 'owner' | 'admin';
  avatar_url?: string;
}

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLoggedIn?: boolean;
  onSignOut?: () => void;
  userRole?: 'learner' | 'instructor' | 'owner' | 'admin';
  userProfile?: UserProfile | null;
}

export function Navigation({
  // currentView,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  isLoggedIn = false,
  onSignOut,
  userRole,
  userProfile,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userProfile?.full_name) return "U";
    const names = userProfile.full_name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return userProfile.full_name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tarumbeta
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate("landing")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => onNavigate("browse")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Browse Instruments
            </button>
            <button
              onClick={() => onNavigate("list")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              List Your Instrument
            </button>
            <button
              onClick={() => onNavigate("become-instructor")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Become Instructor
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-secondary"></span>
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{userProfile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{userProfile?.email || ""}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate("profile-settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("learner-dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("owner-dashboard")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("my-rentals")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>My Rentals</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("my-matches")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Matches</span>
                    </DropdownMenuItem>
                    {(userRole === 'instructor' || userRole === 'admin') && (
                      <DropdownMenuItem onClick={() => onNavigate("instructor-dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Instructor Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {userRole === 'admin' && (
                      <DropdownMenuItem onClick={() => onNavigate("admin-dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="hidden md:flex"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {!isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  className="hidden md:flex"
                  onClick={() => onNavigate("signin")}
                >
                  Login
                </Button>
                <Button
                  className="hidden md:flex bg-primary hover:bg-primary/90"
                  onClick={() => onNavigate("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !isLoggedIn && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            <button
              onClick={() => {
                onNavigate("landing");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => {
                onNavigate("browse");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Browse Instruments
            </button>
            <button
              onClick={() => {
                onNavigate("list");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              List Your Instrument
            </button>
            <button
              onClick={() => {
                onNavigate("become-instructor");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Become Instructor
            </button>
            <div className="flex gap-2 px-4 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onNavigate("signin");
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                className="flex-1 bg-primary"
                onClick={() => {
                  onNavigate("signup");
                  setMobileMenuOpen(false);
                }}
              >
                Sign Up
              </Button>
            </div>
            <div className="px-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={onToggleDarkMode}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}