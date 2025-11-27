import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Award, Globe, CheckCircle, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { ReviewsList } from "./ReviewsList";

interface InstructorCardNewProps {
  id: string;
  name: string;
  imageUrl: string;
  instrument: string;
  yearsExperience: number;
  languages: string[];
  hourlyRate: number;
  matchScore: number;
  genres: string[];
  verified?: boolean;
  rating?: number;
  totalReviews?: number;
  onHire: (id: string) => void;
}

export function InstructorCardNew({
  id,
  name,
  imageUrl,
  instrument,
  yearsExperience,
  languages,
  hourlyRate,
  matchScore,
  genres = [],
  verified = true,
  rating = 0,
  totalReviews = 0,
  onHire,
}: InstructorCardNewProps) {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl border-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl shadow-premium bg-card">
        {/* Large Background Image */}
        <div className="relative aspect-[4/6] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20"></div>

          {/* Match Badge - Top Right */}
          <div className="absolute top-5 right-5">
            <div className="px-4 py-1.5 rounded-full bg-secondary text-white text-sm font-semibold shadow-lg backdrop-blur-sm">
              Match: {matchScore}%
            </div>
          </div>

          {/* Rating Badge - Top Left */}
          {rating > 0 && (
            <div className="absolute top-5 left-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{rating.toFixed(1)}</span>
                <span className="text-white/70 text-xs">({totalReviews})</span>
              </div>
            </div>
          )}

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            {/* Name and Instrument */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold text-white">{name}</h3>
                {verified && (
                  <CheckCircle className="h-5 w-5 text-secondary fill-secondary" />
                )}
              </div>
              <p className="text-white/90">{instrument}</p>
            </div>

            {/* Experience and Languages */}
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>{yearsExperience} years experience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{languages.join(", ")}</span>
              </div>
            </div>

            {/* Genre Tags */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="bg-white/15 text-white border-white/20 backdrop-blur-sm hover:bg-white/25 transition-colors"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Price and Buttons */}
            <div className="pt-4 border-t border-white/15 space-y-3">
              <div>
                <p className="text-xs text-white/70 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-white">
                  KES {hourlyRate.toLocaleString()}
                  <span className="text-base font-normal text-white/80">/hour</span>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onHire(id)}
                  className="flex-1 gradient-teal text-white border-0 transition-all duration-200 hover:shadow-xl h-12 text-base group-hover:scale-105"
                >
                  Hire Instructor
                </Button>

                {totalReviews > 0 && (
                  <Button
                    onClick={() => setShowReviews(true)}
                    variant="outline"
                    className="h-12 px-4 bg-white/15 border-white/20 text-white hover:bg-white/25 backdrop-blur-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews Modal */}
      <ReviewsList
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        targetType="instructor"
        targetId={id}
        targetName={name}
      />
    </>
  );
}