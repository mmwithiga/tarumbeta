import { FilterBar } from "./FilterBar";
import { InstrumentCard } from "./InstrumentCard";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import { instrumentsService, type Instrument } from "../services/instrumentsService";
import { toast } from "sonner";

interface BrowseInstrumentsProps {
  onRent: (instrument: Instrument) => void;
}

export function BrowseInstruments({ onRent }: BrowseInstrumentsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);

  // Load instruments from Supabase
  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    try {
      setIsLoading(true);
      const result = await instrumentsService.getAll();
      setInstruments(result.instruments);
      setFilteredInstruments(result.instruments);
    } catch (error) {
      console.error("Error loading instruments:", error);
      toast.error("Failed to load instruments", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...instruments];

    // Filter by instrument type
    if (filters.instrumentType && filters.instrumentType !== "all") {
      filtered = filtered.filter(
        (inst) => inst.instrument_type === filters.instrumentType
      );
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter((inst) =>
        inst.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by price range
    if (filters.priceRange && filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter((inst) => {
        const price = inst.price_per_day;
        if (max) {
          return price >= min && price <= max;
        }
        return price >= min;
      });
    }

    // Filter by condition
    if (filters.condition && filters.condition !== "all") {
      filtered = filtered.filter((inst) => inst.condition === filters.condition);
    }

    setFilteredInstruments(filtered);
  };

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
            Browse Instruments
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Discover a wide range of quality musical instruments available for rent. 
            Perfect for beginners, professionals, or anyone looking to try something new.
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Found {filteredInstruments.length} {filteredInstruments.length === 1 ? "instrument" : "instruments"}
            </p>
          </div>
        )}

        {/* Instruments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredInstruments.length > 0 ? (
            // Instrument cards with real data
            filteredInstruments.map((instrument) => (
              <InstrumentCard
                key={instrument.id}
                id={instrument.id}
                name={instrument.name}
                type={instrument.instrument_type}
                imageUrl={instrument.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                hourlyRate={instrument.price_per_day}
                location={instrument.location || "Unknown"}
                condition={instrument.condition}
                available={instrument.is_available}
                onRent={() => onRent(instrument)}
              />
            ))
          ) : (
            // No results
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                No instruments found matching your criteria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>

        {/* Empty State - No instruments in database */}
        {!isLoading && instruments.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No instruments available yet</h3>
            <p className="text-muted-foreground">
              Check back soon for new listings!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}