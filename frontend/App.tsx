import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { BrowseInstruments } from "./components/BrowseInstruments";
import { ListInstrument } from "./components/ListInstrument";
import { MatchingDashboard } from "./components/MatchingDashboard";
import { BookingCheckout } from "./components/BookingCheckout";
import { Confirmation } from "./components/Confirmation";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { BecomeInstructor } from "./components/BecomeInstructor";
import { MyRentals } from "./components/MyRentals";
import { InstructorDashboard } from "./components/InstructorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { LearnerDashboard } from "./components/LearnerDashboard";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { ProfileSettings } from "./components/ProfileSettings";
import { DecisionModal } from "./components/DecisionModal";
import { ScheduleLesson } from "./components/ScheduleLesson";
import { SupabaseDiagnostic } from "./components/SupabaseDiagnostic";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import type { Instrument } from "./services/instrumentsService";
import type { Instructor } from "./services/instructorsService";

type View = 
  | "landing" 
  | "browse" 
  | "list" 
  | "dashboard" 
  | "checkout" 
  | "confirmation"
  | "signin"
  | "signup"
  | "become-instructor"
  | "my-rentals"
  | "instructor-dashboard"
  | "admin-dashboard"
  | "learner-dashboard"
  | "owner-dashboard"
  | "profile-settings"
  | "schedule-lesson";

interface BookingData {
  instrument: {
    id: string;
    name: string;
    instrument_type: string;
    imageUrl: string;
    duration: number;
    cost: number;
  } | null;
  instructor: {
    id: string;
    name: string;
    imageUrl: string;
    instrument: string;
    cost: number;
  } | null;
  rentalId?: string;
}

function AppContent() {
  const { user, userProfile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>("landing");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    instrument: null,
    instructor: null,
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleNavigate = (view: View, data?: any) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Reset all state to initial
      setCurrentView("landing");
      setBookingData({
        instrument: null,
        instructor: null,
      });
      setShowDecisionModal(false);
      
      toast.success("Signed out successfully", {
        description: "See you next time!",
      });
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Error signing out", {
        description: "Please try again.",
      });
    }
  };

  // Handle renting an instrument - CHECK AUTH FIRST
  const handleRentInstrument = (instrument: Instrument) => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to rent instruments", {
        description: "You need an account to make rentals.",
        action: {
          label: "Sign In",
          onClick: () => handleNavigate("signin"),
        },
      });
      return;
    }

    // Set the actual instrument data
    setBookingData({
      ...bookingData,
      instrument: {
        id: instrument.id,
        name: instrument.name,
        instrument_type: instrument.instrument_type,
        imageUrl: instrument.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        duration: 7, // Default to weekly
        cost: instrument.price_per_week || instrument.price_per_day * 7,
      },
    });

    // Show decision modal
    setShowDecisionModal(true);
  };

  const handleDecisionCheckout = () => {
    setShowDecisionModal(false);
    toast.success("Proceeding to checkout", {
      description: "Complete your rental booking.",
    });
    handleNavigate("checkout");
  };

  const handleDecisionFindInstructor = () => {
    setShowDecisionModal(false);
    toast.success("Great choice!", {
      description: "Let's find you the perfect instructor.",
    });
    handleNavigate("dashboard");
  };

  // Handle hiring an instructor - PASS REAL DATA
  const handleHireInstructor = (instructor: Instructor) => {
    setBookingData({
      ...bookingData,
      instructor: {
        id: instructor.id,
        name: instructor.users?.full_name || 'Unknown Instructor',
        imageUrl: instructor.profile_image_url || instructor.users?.avatar_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        instrument: instructor.instrument,
        cost: instructor.hourly_rate,
      },
    });

    toast.success("Instructor selected!", {
      description: "Proceed to checkout to complete your booking.",
    });

    handleNavigate("checkout");
  };

  const handleProceedToPayment = async (rentalId?: string) => {
    // Store rental ID if provided
    if (rentalId) {
      setBookingData({
        ...bookingData,
        rentalId,
      });
    }

    // Show loading toast and store the ID
    const loadingToastId = toast.loading("Processing payment...");
    
    setTimeout(() => {
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      
      // Show success toast
      toast.success("Payment successful!", {
        description: "Your booking is confirmed.",
      });
      
      handleNavigate("confirmation");
    }, 2000);
  };

  const handleEditInstrument = () => {
    handleNavigate("browse");
  };

  const handleRemoveInstructor = () => {
    setBookingData({
      ...bookingData,
      instructor: null,
    });
    toast.info("Instructor removed from booking");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isLoggedIn={!!user}
        onSignOut={handleSignOut}
        userRole={userProfile?.role}
        userProfile={userProfile}
      />

      {/* Decision Modal */}
      <DecisionModal
        isOpen={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        onCheckout={handleDecisionCheckout}
        onFindInstructor={handleDecisionFindInstructor}
        instrumentName={bookingData.instrument?.name || "instrument"}
      />

      {/* Page Content */}
      {currentView === "landing" && (
        <LandingPage onNavigate={handleNavigate} onRent={handleRentInstrument} />
      )}

      {currentView === "browse" && (
        <BrowseInstruments onRent={handleRentInstrument} />
      )}

      {currentView === "list" && (
        <ListInstrument onNavigate={handleNavigate} />
      )}

      {currentView === "dashboard" && (
        <MatchingDashboard 
          rentedInstrument={bookingData.instrument?.instrument_type || "Guitar"}
          instrumentId={bookingData.instrument?.id}
          onHireInstructor={handleHireInstructor}
        />
      )}

      {currentView === "my-rentals" && (
        <MyRentals onNavigate={handleNavigate} />
      )}

      {currentView === "instructor-dashboard" && (
        <InstructorDashboard onNavigate={handleNavigate} />
      )}

      {currentView === "admin-dashboard" && (
        <AdminDashboard onNavigate={handleNavigate} />
      )}

      {currentView === "learner-dashboard" && (
        <LearnerDashboard onNavigate={handleNavigate} />
      )}

      {currentView === "owner-dashboard" && (
        <OwnerDashboard onNavigate={handleNavigate} />
      )}

      {currentView === "profile-settings" && (
        <ProfileSettings onNavigate={handleNavigate} />
      )}

      {currentView === "checkout" && bookingData.instrument && (
        <BookingCheckout
          instrument={bookingData.instrument}
          instructor={bookingData.instructor}
          onProceedToPayment={handleProceedToPayment}
          onEditInstrument={handleEditInstrument}
          onRemoveInstructor={handleRemoveInstructor}
        />
      )}

      {currentView === "confirmation" && bookingData.instrument && (
        <Confirmation
          instrument={bookingData.instrument}
          instructor={bookingData.instructor}
          onNavigateHome={() => handleNavigate("landing")}
          onViewRentals={() => handleNavigate("my-rentals")}
          onMessageInstructor={() => toast.info("Messaging feature coming soon!")}
          onScheduleLesson={() => {
            // Check if instructor is selected
            if (!bookingData.instructor) {
              toast.error("No instructor selected", {
                description: "Please hire an instructor first."
              });
              return;
            }
            // Navigate to schedule lesson view
            handleNavigate("schedule-lesson");
          }}
          onFindInstructor={() => handleNavigate("dashboard")}
        />
      )}

      {currentView === "schedule-lesson" && bookingData.instructor && (
        <ScheduleLesson
          instructor={bookingData.instructor}
          rentalId={bookingData.rentalId}
          onBack={() => handleNavigate("confirmation")}
          onSuccess={() => {
            handleNavigate("my-rentals");
          }}
        />
      )}

      {currentView === "signin" && (
        <SignIn onNavigate={handleNavigate} />
      )}

      {currentView === "signup" && (
        <SignUp onNavigate={handleNavigate} />
      )}

      {currentView === "become-instructor" && (
        <BecomeInstructor onNavigate={handleNavigate} />
      )}

      {/* Footer */}
      {currentView !== "signin" && currentView !== "signup" && currentView !== "confirmation" && (
        <footer className="border-t border-border bg-muted/30 py-12 mt-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                  Tarumbeta
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your trusted platform for musical instrument rentals and instruction.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button
                      onClick={() => handleNavigate("browse")}
                      className="hover:text-foreground transition-colors"
                    >
                      Browse Instruments
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("list")}
                      className="hover:text-foreground transition-colors"
                    >
                      List Your Instrument
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("become-instructor")}
                      className="hover:text-foreground transition-colors"
                    >
                      Become Instructor
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("landing")}
                      className="hover:text-foreground transition-colors"
                    >
                      How It Works
                    </button>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Safety Guidelines
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      FAQs
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Cookie Policy
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Rental Agreement
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
              <p>© 2025 Tarumbeta. All rights reserved. Made with ♪ for musicians.</p>
            </div>
          </div>
        </footer>
      )}

      <Toaster />
      <SupabaseDiagnostic />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}