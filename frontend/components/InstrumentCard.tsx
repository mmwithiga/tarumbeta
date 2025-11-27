import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin } from "lucide-react";

interface InstrumentCardProps {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
  hourlyRate: number;
  location: string;
  condition: string;
  available: boolean;
  onRent: (id: string) => void;
}

export function InstrumentCard({
  id,
  name,
  type,
  imageUrl,
  hourlyRate,
  location,
  condition,
  available,
  onRent,
}: InstrumentCardProps) {
  return (
    <Card className="group overflow-hidden rounded-lg border-0 bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-premium-hover shadow-premium">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white/90 text-sm">See instructor options after rent</p>
          </div>
        </div>
        {condition === "New" && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            New
          </Badge>
        )}
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-primary dark:text-primary dark:brightness-165">KES {hourlyRate}</p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
          <Button
            onClick={() => onRent(id)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Rent Now
          </Button>
        </div>
      </div>
    </Card>
  );
}