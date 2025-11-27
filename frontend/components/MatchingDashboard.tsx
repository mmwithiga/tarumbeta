import { InstructorCardNew } from "./InstructorCardNew";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Search, Music, Sparkles, Brain, Target, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { type Instructor, instructorsService } from "../services/instructorsService";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface MatchingDashboardProps {
  rentedInstrument?: string;
  instrumentId?: string;
  onHireInstructor?: (instructor: Instructor) => void;
}

export function MatchingDashboard({
  rentedInstrument = "Guitar",
  onHireInstructor
}: MatchingDashboardProps) {
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false); // NEW: For full-page AI matching animation
  const [matchingProgress, setMatchingProgress] = useState(0); // NEW: Progress bar
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filters, setFilters] = useState({
    instrument: rentedInstrument, // Default to rented instrument
    skillLevel: "",
    preferredLanguage: "",
    availability: "",
    learningGoal: "",
    genre: "",
    minRating: 0,
    location: "", // New location filter
  });

  useEffect(() => {
    // Load all instructors on mount
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      // Query instructor_profiles directly from Supabase
      const { data, error } = await supabase
        .from('instructor_profiles')
        .select('*, users!instructor_profiles_user_id_fkey(full_name, email, location, avatar_url)')
        .eq('is_verified', true);

      if (error) throw error;

      // Ensure instructors is always an array
      const instructorsList = Array.isArray(data) ? data : [];
      setInstructors(instructorsList);
    } catch (error) {
      console.error("Error loading instructors:", error);
      toast.error("Failed to load instructors");
      setInstructors([]); // Set empty array on error
    }
  };

  const handleFindInstructors = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsMatching(true); // Start matching animation
    setMatchingProgress(0);
    setShowResults(false); // Hide previous results while matching

    // Simulate AI matching process with progress updates (16 second duration)
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += (Math.random() * 2) + 2; // Increment by 2-4% (slower for 16 seconds)

      if (progressValue >= 90) {
        progressValue = 90; // Cap at 90% until API completes
        clearInterval(progressInterval);
      }

      setMatchingProgress(progressValue);
    }, 500); // Update every 500ms for 16-second duration

    try {
      // Construct profile for ML model
      const profile = {
        instrument_type: filters.instrument === "all" ? "" : filters.instrument,
        skill_level: filters.skillLevel === "all" ? "" : filters.skillLevel,
        experience_level: filters.skillLevel === "all" ? "" : filters.skillLevel, // Required by backend validation
        teaching_language: filters.preferredLanguage === "all" ? "" : filters.preferredLanguage,
        learning_goals: filters.learningGoal === "all" ? [] : [filters.learningGoal],
        // Construct bio keywords from goal and genre
        bio_keywords: [
          filters.learningGoal !== "all" ? filters.learningGoal : "",
          filters.genre !== "all" ? filters.genre : ""
        ].filter(Boolean).join(" "),
        budget: 2000, // Default budget if not specified
        location: filters.location === "all" || !filters.location ? "Nairobi" : filters.location, // Default to Nairobi if not selected
        genre: filters.genre === "all" ? "" : filters.genre // Add genre for strict matching
      };

      console.log("🚀 Sending profile to ML model:", profile);

      // Call ML API
      const matches = await instructorsService.findMatches(profile);

      // Ensure interval is cleared
      clearInterval(progressInterval);

      // Complete the progress to 100%
      setMatchingProgress(100);

      // Longer delay to show 100% and let users appreciate the animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set results and show them
      // The ML API returns enriched instructor objects, but we might need to map them if the shape differs slightly
      // The backend returns a list of dicts that matches the Instructor interface mostly
      // Ensure matches are sorted by score descending
      const sortedMatches = [...matches].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      setInstructors(sortedMatches);
      setShowResults(true);

      toast.success(`Found ${matches.length} instructors`, {
        description: "Matched to your preferences using AI",
      });
    } catch (error) {
      console.error("Error finding instructors:", error);
      toast.error("Failed to find instructors");
      clearInterval(progressInterval);
      setInstructors([]); // Set empty array on error
    } finally {
      // Clean up - ensure interval is cleared
      clearInterval(progressInterval);
      setIsLoading(false);
      setIsMatching(false); // End matching animation
      setMatchingProgress(0);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                Find Your Instructor
              </h1>
              <p className="text-sm text-muted-foreground">
                {rentedInstrument ? `For: ${rentedInstrument}` : "All Instruments"}
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Get matched with the perfect instructor based on your learning preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Matching Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-premium sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Your Preferences
              </h2>
              <form onSubmit={handleFindInstructors} className="space-y-5">
                {/* Instrument (pre-filled) */}
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select
                    value={filters.instrument}
                    onValueChange={(value) => setFilters({ ...filters, instrument: value })}
                  >
                    <SelectTrigger id="instrument" className="bg-input-background">
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guitar">Guitar</SelectItem>
                      <SelectItem value="Piano">Piano</SelectItem>
                      <SelectItem value="Drums">Drums</SelectItem>
                      <SelectItem value="Saxophone">Saxophone</SelectItem>
                      <SelectItem value="Violin">Violin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Skill Level */}
                <div className="space-y-2">
                  <Label htmlFor="skill-level">Skill Level</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, skillLevel: value })}
                  >
                    <SelectTrigger id="skill-level" className="bg-input-background">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Language */}
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, preferredLanguage: value })}
                  >
                    <SelectTrigger id="language" className="bg-input-background">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Learning Goal */}
                <div className="space-y-2">
                  <Label htmlFor="learning-goal">Learning Goal</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, learningGoal: value })}
                  >
                    <SelectTrigger id="learning-goal" className="bg-input-background">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Goals</SelectItem>
                      <SelectItem value="hobby">Hobby / Fun</SelectItem>
                      <SelectItem value="professional">Professional Development</SelectItem>
                      <SelectItem value="performance">Performance Preparation</SelectItem>
                      <SelectItem value="exam">Exam Preparation</SelectItem>
                      <SelectItem value="recording">Recording & Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, availability: value })}
                  >
                    <SelectTrigger id="availability" className="bg-input-background">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="mornings">Mornings</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, location: value })}
                  >
                    <SelectTrigger id="location" className="bg-input-background">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Nairobi">Nairobi</SelectItem>
                      <SelectItem value="Mombasa">Mombasa</SelectItem>
                      <SelectItem value="Kisumu">Kisumu</SelectItem>
                      <SelectItem value="Nakuru">Nakuru</SelectItem>
                      <SelectItem value="Eldoret">Eldoret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre Preference */}
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre Preference</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, genre: value })}
                  >
                    <SelectTrigger id="genre" className="bg-input-background">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Classical">Classical</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Blues">Blues</SelectItem>
                      <SelectItem value="Afrobeat">Afrobeat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <Select
                    onValueChange={(value) => setFilters({ ...filters, minRating: Number(value) })}
                  >
                    <SelectTrigger id="rating" className="bg-input-background">
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.8">4.8+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? "Searching..." : "Find Instructors"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Instructors:</span>
                    <span className="font-semibold text-foreground">{Array.isArray(instructors) ? instructors.length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified:</span>
                    <span className="font-semibold text-foreground">
                      {Array.isArray(instructors) ? instructors.filter(i => i.is_verified).length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            {!showResults && !isLoading ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-lg border border-border backdrop-blur-sm">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Find Your Instructor?
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Set your preferences and click "Find Instructors" to see personalized matches based on your needs.
                </p>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-24 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : instructors.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {instructors.length} Instructor{instructors.length !== 1 ? "s" : ""} Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sorted by match score
                  </p>
                </div>

                {/* Grid layout for 2 instructors per row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {instructors.map((instructor, index) => (
                    <InstructorCardNew
                      key={`${instructor.id}-${index}`}
                      id={instructor.id}
                      name={instructor.instructor_name || instructor.users?.full_name || "Unknown Instructor"}
                      imageUrl={instructor.instructor_avatar || instructor.profile_image_url || instructor.users?.avatar_url || ""}
                      instrument={instructor.instrument}
                      yearsExperience={instructor.experience_years}
                      languages={instructor.languages || ["English", "Swahili"]} // Use dynamic languages
                      hourlyRate={instructor.hourly_rate}
                      matchScore={instructor.match_score || Math.min(95, 70 + (instructor.rating * 5) + (instructor.experience_years * 0.5))}
                      genres={
                        // Handle both array and string formats
                        Array.isArray(instructor.genre)
                          ? instructor.genre
                          : instructor.genre
                            ? instructor.genre.split(",").map(g => g.trim())
                            : []
                      }
                      verified={instructor.is_verified}
                      rating={instructor.rating}
                      totalReviews={instructor.total_reviews}
                      onHire={() => onHireInstructor?.(instructor)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-card/50 rounded-lg border border-border">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Instructors Found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  No instructors match your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Matching Animation Overlay */}
      <AnimatePresence>
        {isMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <div className="relative w-full max-w-2xl px-8">
              {/* Main Content */}
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center space-y-8"
              >
                {/* Animated Icon */}
                <div className="relative mx-auto w-32 h-32">
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-20"
                  />
                  <motion.div
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-4 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary"
                  >
                    <Brain className="h-12 w-12 text-white" />
                  </motion.div>

                  {/* Orbiting icons */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 h-6 w-6 text-primary" />
                    <Target className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 h-6 w-6 text-secondary" />
                    <Zap className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-6 w-6 text-accent" />
                    <Music className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-6 w-6 text-primary" />
                  </motion.div>
                </div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Finding Your Perfect Match
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Our AI is analyzing thousands of data points to find your ideal instructor
                  </p>
                </motion.div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${matchingProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                    />
                    <motion.div
                      animate={{
                        x: ["0%", "100%"],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      style={{ width: "30%" }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {Math.round(matchingProgress)}% Complete
                  </p>
                </div>

                {/* Status Messages */}
                <motion.div
                  key={Math.floor(matchingProgress / 25)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-muted-foreground"
                >
                  {matchingProgress < 25 && "🔍 Analyzing your preferences..."}
                  {matchingProgress >= 25 && matchingProgress < 50 && "🎯 Evaluating instructor profiles..."}
                  {matchingProgress >= 50 && matchingProgress < 75 && "⚡ Calculating compatibility scores..."}
                  {matchingProgress >= 75 && matchingProgress < 100 && "✨ Preparing your perfect matches..."}
                  {matchingProgress >= 100 && "✅ Match complete!"}
                </motion.div>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {[
                    "Machine Learning",
                    "Skill Analysis",
                    "Preference Matching",
                    "Expert Selection"
                  ].map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}