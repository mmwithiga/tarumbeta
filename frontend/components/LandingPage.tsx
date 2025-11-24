import { Button } from "./ui/button";
import { InstrumentCard } from "./InstrumentCard";
import { ThreeStepGraphic } from "./ThreeStepGraphic";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";
import { instrumentsService, type Instrument } from "../services/instrumentsService";
import type { View } from "../types";

interface LandingPageProps {
  onNavigate: (view: View, instrumentId?: string) => void;
  onRent: (instrument: Instrument) => void;
}

export function LandingPage({ onNavigate, onRent }: LandingPageProps) {
  const [featuredInstruments, setFeaturedInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedInstruments();
  }, [refreshKey]);

  const loadFeaturedInstruments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Loading featured instruments...");

      const result = await instrumentsService.getAll({ page: 1, page_size: 4 });

      console.log("✅ Loaded instruments:", result.instruments.length);
      setFeaturedInstruments(result.instruments.slice(0, 4));
    } catch (error: any) {
      console.error("❌ Error loading featured instruments:", error);
      setError(error?.message || 'Failed to load instruments');
      // Use empty array on error
      setFeaturedInstruments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh instruments (can be called after rental, etc.)
  const refreshInstruments = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1642946795468-3ca1a1e0068d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMGd1aXRhciUyMHN0dWRpb3xlbnwxfHx8fDE3NjIwODgxMzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Musician with guitar"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="inline-block mb-4 rounded-full bg-secondary/10 backdrop-blur-sm px-4 py-2 border border-secondary/20">
              <span className="text-secondary font-semibold">🎵 Rent • Learn • Play</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your instrument.<br />
              Your instructor.<br />
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Your stage.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Rent your instrument. Meet your teacher. Play your rhythm.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white text-lg px-8 h-14"
                onClick={() => onNavigate("browse")}
              >
                <Play className="mr-2 h-5 w-5" />
                Browse Instruments
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-lg px-8 h-14"
                onClick={() => onNavigate("list")}
              >
                List Your Instrument
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Instruments & How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Featured Instruments */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Featured Instruments
                </h2>
                <p className="text-lg text-muted-foreground">
                  Premium instruments ready for your musical journey
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {isLoading ? (
                  // Loading state
                  <div className="col-span-2 text-center py-8">
                    <p className="text-muted-foreground">Loading featured instruments...</p>
                  </div>
                ) : featuredInstruments.length > 0 ? (
                  featuredInstruments.map((instrument) => (
                    <InstrumentCard
                      key={instrument.id}
                      id={instrument.id}
                      name={instrument.name}
                      type={instrument.instrument_type}
                      imageUrl={instrument.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                      hourlyRate={instrument.price_per_day}
                      location={instrument.location || 'Unknown'}
                      condition={instrument.condition}
                      available={instrument.is_available}
                      onRent={() => onRent(instrument)}
                    />
                  ))
                ) : (
                  // No instruments found
                  <div className="col-span-2 text-center py-8">
                    <p className="text-muted-foreground">No featured instruments found.</p>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => onNavigate("browse")}
                >
                  View All Instruments
                </Button>
              </div>
            </div>

            {/* Right: How It Works */}
            <div className="lg:pl-8">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground">
                  Three simple steps to start your musical journey
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 shadow-premium">
                <ThreeStepGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary via-primary/95 to-secondary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to start your musical journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of musicians who trust Tarumbeta for their instruments and instruction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14"
              onClick={() => onNavigate("browse")}
            >
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 text-lg px-8 h-14"
              onClick={() => onNavigate("list")}
            >
              List Your Instrument
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}