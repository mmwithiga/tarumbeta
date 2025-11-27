import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Star, MessageSquare, Calendar, Award, CheckCircle, Clock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { reviewsService } from "../services/reviewsService";
import { lessonsService } from "../services/lessonsService";
import { ReviewModal } from "./ReviewModal";
import { toast } from "sonner";
import { format } from "date-fns";

interface LessonWithInstructor {
  id: string;
  lesson_id: string;
  instructor_id: string;
  instructor_name: string;
  instructor_image: string;
  instrument: string;
  skill_level: string;
  experience_years: number;
  hourly_rate: number;
  is_verified: boolean;
  scheduled_time: string;
  status: string;
  review_count: number; // How many times user reviewed this instructor
}

export function MyInstructors() {
  const [lessons, setLessons] = useState<LessonWithInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithInstructor | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view your lessons");
        return;
      }
      setCurrentUserId(user.id);

      // Get all lessons for this learner using the service (returns enriched data)
      const lessonsData = await lessonsService.getLearnerLessons(user.id);

      if (!lessonsData || lessonsData.length === 0) {
        setLessons([]);
        setIsLoading(false);
        return;
      }

      // Map lessons and get review counts per instructor
      const lessonsWithReviewCounts = await Promise.all(
        lessonsData.map(async (lesson) => {
          const profile = lesson.instructor_profiles as any;

          // Count how many reviews user has written for this instructor
          const userReviews = await reviewsService.getUserReviewsForTarget(
            user.id,
            'instructor',
            lesson.instructor_id
          );

          return {
            id: lesson.id,
            lesson_id: lesson.id,
            instructor_id: lesson.instructor_id,
            instructor_name: profile?.users?.full_name || "Unknown Instructor",
            instructor_image: profile?.profile_image_url || profile?.users?.avatar_url || "",
            instrument: profile?.instrument || lesson.instrument || "Unknown",
            skill_level: profile?.skill_level || lesson.skill_level || "intermediate",
            experience_years: profile?.experience_years || 0,
            hourly_rate: profile?.hourly_rate || 0,
            is_verified: profile?.is_verified || false,
            scheduled_time: lesson.scheduled_time || "",
            status: lesson.status || "pending",
            review_count: userReviews.length,
          };
        })
      );

      setLessons(lessonsWithReviewCounts);
    } catch (error) {
      console.error("Error loading lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReviewModal = (lesson: LessonWithInstructor) => {
    setSelectedLesson(lesson);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadLessons(); // Reload to show updated review count
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Award className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Lessons Yet
            </h3>
            <p className="text-muted-foreground">
              You haven't scheduled any lessons yet. Find your perfect instructor in the Matching Dashboard!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Lessons</h2>
          <p className="text-muted-foreground">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} • Leave a review for each lesson
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {lessons.map((lesson) => (
          <Card key={lesson.lesson_id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-6 p-6">
              {/* Instructor Image */}
              <div className="relative flex-shrink-0">
                <div className="h-32 w-32 rounded-xl overflow-hidden bg-muted">
                  {lesson.instructor_image ? (
                    <img
                      src={lesson.instructor_image}
                      alt={lesson.instructor_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                      {lesson.instructor_name.charAt(0)}
                    </div>
                  )}
                </div>
                {lesson.is_verified && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle className="h-7 w-7 text-secondary fill-secondary" />
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">
                      {lesson.instructor_name}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {lesson.instrument} • {lesson.experience_years} years experience
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {format(new Date(lesson.scheduled_time), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="font-normal">
                      {lesson.skill_level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={lesson.status === "approved" ? "default" : lesson.status === "completed" ? "secondary" : "outline"}
                    >
                      {lesson.status}
                    </Badge>
                  </div>
                </div>

                {/* Review Status - ALWAYS show button to add review */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {lesson.review_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          You've written {lesson.review_count} review{lesson.review_count !== 1 ? 's' : ''} for this instructor
                        </span>
                      </div>
                    )}
                    <Button
                      className="gradient-teal"
                      size="sm"
                      onClick={() => handleOpenReviewModal(lesson)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Leave a Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedLesson && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedLesson(null);
          }}
          targetType="instructor"
          targetId={selectedLesson.instructor_id}
          targetName={selectedLesson.instructor_name}
          userId={currentUserId}
          existingReview={null} // Always allow new reviews
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
