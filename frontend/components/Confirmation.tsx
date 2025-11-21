import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { CheckCircle2, MessageSquare, Calendar, Home, Music, Users, Star, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ConfirmationProps {
  instrument: {
    name: string;
    imageUrl: string;
    duration: number;
  };
  instructor: {
    name: string;
    imageUrl: string;
    instrument: string;
  } | null;
  onNavigateHome: () => void;
  onViewRentals: () => void;
  onMessageInstructor: () => void;
  onScheduleLesson: () => void;
  onFindInstructor?: () => void;
}

export function Confirmation({
  instrument,
  instructor,
  onNavigateHome,
  onViewRentals,
  onMessageInstructor,
  onScheduleLesson,
  onFindInstructor,
}: ConfirmationProps) {
  return (
    <div className="min-h-screen py-12 md:py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 shadow-2xl">
              <CheckCircle2 className="h-20 w-20 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Booking Confirmed! 🎶
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            You've successfully rented the {instrument.name}.
            {instructor && ` Your instructor ${instructor.name} has been notified!`}
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Rental Details Card */}
          <Card className="p-6 shadow-premium">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Your Rental</h2>
                <p className="text-sm text-muted-foreground">Active for {instrument.duration} days</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={instrument.imageUrl}
                  alt={instrument.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{instrument.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Rental expires in {instrument.duration} days
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={onViewRentals}
            >
              View My Rentals
            </Button>
          </Card>

          {/* Instructor Details Card OR Find Instructor CTA */}
          {instructor ? (
            <Card className="p-6 shadow-premium">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Your Instructor</h2>
                  <p className="text-sm text-muted-foreground">Ready to begin lessons</p>
                </div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-secondary/20">
                  <img
                    src={instructor.imageUrl}
                    alt={instructor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">{instructor.instrument} Instructor</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full gradient-teal text-white border-0"
                  onClick={onScheduleLesson}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule First Lesson
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onMessageInstructor}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Instructor
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 shadow-premium relative overflow-hidden border-2 border-secondary/30">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-accent/5 to-primary/10"></div>
              
              {/* Sparkle Effect */}
              <div className="absolute top-4 right-4">
                <Sparkles className="h-8 w-8 text-secondary/40 animate-pulse" />
              </div>

              <div className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-accent shadow-md">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      Ready to Master Your Instrument?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Accelerate your learning with expert guidance
                    </p>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-0.5">
                      <Star className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Expert Instructors</p>
                      <p className="text-xs text-muted-foreground">Learn from qualified professionals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 mt-0.5">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Faster Progress</p>
                      <p className="text-xs text-muted-foreground">Personalized lessons tailored to you</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Flexible Schedule</p>
                      <p className="text-xs text-muted-foreground">Book lessons at your convenience</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full gradient-teal text-white border-0 shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  onClick={onFindInstructor}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Find Your Perfect Instructor
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Join 500+ learners who achieved their musical goals
                </p>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90"
            onClick={onNavigateHome}
          >
            <Home className="h-5 w-5 mr-2" />
            Return to Home
          </Button>
          {instructor && (
            <Button
              size="lg"
              className="gradient-teal text-white border-0"
              onClick={onScheduleLesson}
            >
              Start Your First Lesson
            </Button>
          )}
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <button onClick={onNavigateHome} className="hover:text-foreground transition-colors">
              Home
            </button>
            <button onClick={onViewRentals} className="hover:text-foreground transition-colors">
              My Rentals
            </button>
            <button className="hover:text-foreground transition-colors">
              My Instructors
            </button>
            <button className="hover:text-foreground transition-colors">
              Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}