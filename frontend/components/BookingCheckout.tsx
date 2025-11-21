import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Edit, X, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { rentalsService } from "../services/rentalsService";
import { toast } from "sonner@2.0.3";

interface BookingCheckoutProps {
  instrument: {
    id: string;
    name: string;
    imageUrl: string;
    duration: number;
    cost: number;
  };
  instructor: {
    id: string;
    name: string;
    imageUrl: string;
    instrument: string;
    cost: number;
  } | null;
  onProceedToPayment: (rentalId?: string) => void;
  onEditInstrument: () => void;
  onRemoveInstructor: () => void;
}

export function BookingCheckout({
  instrument,
  instructor,
  onProceedToPayment,
  onEditInstrument,
  onRemoveInstructor,
}: BookingCheckoutProps) {
  const { userProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const serviceFee = 150;
  const subtotal = instrument.cost + (instructor?.cost || 0);
  const total = subtotal + serviceFee;

  const handlePayment = async () => {
    if (!userProfile) {
      toast.error("Please sign in to complete booking");
      return;
    }

    setIsProcessing(true);

    try {
      // Create rental in database
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + instrument.duration);

      const rental = await rentalsService.createRental({
        user_id: userProfile.id,
        instrument_id: instrument.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_price: total,
        status: 'pending', // Changed from 'confirmed' to 'pending'
      });

      // Pass rental ID to parent
      onProceedToPayment(rental.id);
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to create rental", {
        description: "Please try again.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header with Progress */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Review Your Booking
          </h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm font-medium text-foreground">Rent Instrument</span>
            </div>
            <div className="h-0.5 w-12 bg-primary"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm font-medium text-foreground">Choose Instructor</span>
            </div>
            <div className="h-0.5 w-12 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-primary text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium text-muted-foreground">Checkout</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instrument Summary */}
            <Card className="p-6 shadow-premium">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Instrument Rental</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditInstrument}
                  className="text-primary hover:text-primary/80"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="flex gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={instrument.imageUrl}
                    alt={instrument.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{instrument.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Duration: {instrument.duration} days</p>
                    <p className="text-lg font-bold text-foreground">KES {instrument.cost}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructor Summary */}
            {instructor && (
              <Card className="p-6 shadow-premium">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Your Instructor</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveInstructor}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-secondary/20">
                    <img
                      src={instructor.imageUrl}
                      alt={instructor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{instructor.instrument} Instructor</p>
                    <p className="text-lg font-bold text-foreground">KES {instructor.cost}/hour</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Methods */}
            <Card className="p-6 shadow-premium">
              <h2 className="text-xl font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-4 p-4 border-2 border-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">M-PESA</p>
                    <p className="text-sm text-muted-foreground">Pay with mobile money</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </button>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-premium sticky top-24">
              <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Instrument Rental</span>
                  <span className="font-medium text-foreground">KES {instrument.cost}</span>
                </div>
                
                {instructor && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Instructor (1 hour)</span>
                    <span className="font-medium text-foreground">KES {instructor.cost}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium text-foreground">KES {serviceFee}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">KES {total}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full gradient-teal text-white border-0 h-12 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By proceeding, you agree to our Terms of Service and Privacy Policy
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}