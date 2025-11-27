import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Star, MessageSquare, User } from "lucide-react";
import { reviewsService, Review } from "../services/reviewsService";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewsListProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "instructor" | "instrument";
  targetId: string;
  targetName: string;
}

export function ReviewsList({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
    }
  }, [isOpen, targetId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, ratingData] = await Promise.all([
        reviewsService.getByTarget(targetType, targetId),
        reviewsService.getAverageRating(targetType, targetId),
      ]);

      setReviews(reviewsData);
      setAverageRating(ratingData.average);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reviews</DialogTitle>
          <DialogDescription>
            What learners say about <span className="font-semibold text-foreground">{targetName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Overall Rating Summary */}
        {!isLoading && reviews.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(averageRating), "lg")}
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => Math.round(r.rating) === star
                  ).length;
                  const percentage = reviews.length > 0 
                    ? (count / reviews.length) * 100 
                    : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4 mt-6">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </Card>
            ))
          ) : reviews.length === 0 ? (
            // Empty state
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Reviews Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to share your experience with {targetName}!
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            // Reviews
            reviews.map((review) => (
              <Card key={review.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Reviewer Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.users?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {review.users?.full_name
                        ? review.users.full_name.charAt(0).toUpperCase()
                        : <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {review.users?.full_name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.created_at), "MMMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {renderStars(review.rating)}
                        <span className="ml-2 font-semibold">{review.rating.toFixed(1)}</span>
                      </Badge>
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-foreground/90 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
