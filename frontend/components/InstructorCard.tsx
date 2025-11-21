import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Award, Globe } from "lucide-react";

interface InstructorCardProps {
  id: string;
  name: string;
  imageUrl: string;
  instrument: string;
  yearsExperience: number;
  languages: string[];
  hourlyRate: number;
  matchScore: number;
  rating: number;
  totalStudents: number;
  onHire: (id: string) => void;
}

export function InstructorCard({
  id,
  name,
  imageUrl,
  instrument,
  yearsExperience,
  languages,
  hourlyRate,
  matchScore,
  rating,
  totalStudents,
  onHire,
}: InstructorCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-lg border-0 bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-hover shadow-premium">
      <Badge className="absolute top-4 right-4 z-10 bg-secondary text-secondary-foreground px-3 py-1">
        Match: {matchScore}%
      </Badge>
      
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-secondary/20">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-card-foreground truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">{instrument} Instructor</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-medium">{rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                • {totalStudents} students
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm">{yearsExperience} years exp.</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm">{languages.join(", ")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-primary">KES {hourlyRate}</p>
            <p className="text-xs text-muted-foreground">per hour</p>
          </div>
          <Button
            onClick={() => onHire(id)}
            className="gradient-teal text-white border-0 transition-all duration-200 hover:shadow-lg"
          >
            Hire Instructor
          </Button>
        </div>
      </div>
    </Card>
  );
}
