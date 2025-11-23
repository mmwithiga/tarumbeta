import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Calendar as CalendarIcon, Clock, DollarSign, Music2, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleLessonProps {
  instructor: {
    id: string;
    name: string;
    imageUrl: string;
    instrument: string;
    cost: number; // hourly rate
  };
  rentalId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const DURATIONS = [
  { value: 30, label: '30 minutes', price: 0.5 },
  { value: 60, label: '1 hour', price: 1 },
  { value: 90, label: '1.5 hours', price: 1.5 },
  { value: 120, label: '2 hours', price: 2 },
];

export function ScheduleLesson({ instructor, rentalId, onBack, onSuccess }: ScheduleLessonProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate total price
  const durationMultiplier = DURATIONS.find(d => d.value === duration)?.price || 1;
  const totalPrice = instructor.cost * durationMultiplier;

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to schedule a lesson');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time into a timestamp
      const scheduledTimestamp = new Date(
        `${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`
      ).toISOString();

      console.log('📅 Scheduling lesson...', {
        instructor_id: instructor.id,
        learner_id: user.id,
        scheduled_time: scheduledTimestamp,
        duration: duration,
      });

      // Insert into lessons table
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          learner_id: user.id,
          instructor_id: instructor.id,
          rental_id: rentalId || null,
          instrument: instructor.instrument,
          skill_level: null, // Can be added later
          session_type: 'online', // Default to online, can be made selectable
          scheduled_time: scheduledTimestamp,
          duration_minutes: duration,
          status: 'scheduled', // Using 'scheduled' instead of 'pending'
          price: totalPrice,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error scheduling lesson:', error);
        throw error;
      }

      console.log('✅ Lesson scheduled successfully:', data);

      toast.success('Lesson request sent!', {
        description: `Your instructor ${instructor.name} will review and confirm your booking.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('❌ Error scheduling lesson:', error);
      toast.error('Failed to schedule lesson', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Disable past dates
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="min-h-full py-6 md:py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Schedule Your Lesson
          </h1>
          <p className="text-base text-muted-foreground">
            Choose a date and time that works for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date Selection */}
            <Card className="shadow-premium border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </CardTitle>
                <CardDescription>Choose your preferred lesson date</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDates}
                  className="rounded-md border shadow-sm"
                />
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="shadow-premium border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-secondary" />
                  Select Time
                </CardTitle>
                <CardDescription>Pick your preferred time slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className={`h-14 text-base font-semibold transition-all ${selectedTime === time
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105'
                        : 'hover:border-primary hover:text-primary'
                        }`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duration Selection */}
            <Card className="shadow-premium border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-accent" />
                  Lesson Duration
                </CardTitle>
                <CardDescription>How long would you like the lesson?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {DURATIONS.map((d) => (
                    <Button
                      key={d.value}
                      variant={duration === d.value ? 'default' : 'outline'}
                      onClick={() => setDuration(d.value)}
                      className={`h-20 flex flex-col items-center justify-center gap-1 transition-all ${duration === d.value
                        ? 'bg-gradient-to-r from-accent to-primary text-white shadow-lg scale-105'
                        : 'hover:border-accent hover:text-accent'
                        }`}
                    >
                      <span className="text-lg font-bold">{d.label}</span>
                      <span className="text-sm opacity-90">
                        KES {(instructor.cost * d.price).toLocaleString()}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="text-xl">Additional Notes</CardTitle>
                <CardDescription>
                  Any specific topics or goals for this lesson? (Optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., I'd like to focus on learning basic chords..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="lg:col-span-1">
            {/* Instructor Card - Sticky */}
            <Card className="shadow-premium sticky top-6 border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardTitle className="text-xl">Your Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Instructor Info */}
                <div className="flex flex-col items-center text-center gap-4">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={instructor.imageUrl} alt={instructor.name} />
                    <AvatarFallback className="text-2xl">{instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{instructor.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Music2 className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">{instructor.instrument}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Booking Summary */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-base text-foreground">Booking Summary</h4>

                  {selectedDate && (
                    <div className="flex justify-between items-center text-sm bg-muted/50 rounded-lg p-3">
                      <span className="text-muted-foreground font-medium">Date:</span>
                      <span className="font-semibold text-foreground">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex justify-between items-center text-sm bg-muted/50 rounded-lg p-3">
                      <span className="text-muted-foreground font-medium">Time:</span>
                      <span className="font-semibold text-foreground">{selectedTime}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm bg-muted/50 rounded-lg p-3">
                    <span className="text-muted-foreground font-medium">Duration:</span>
                    <span className="font-semibold text-foreground">
                      {DURATIONS.find(d => d.value === duration)?.label}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
                    <span className="font-bold text-foreground">Total Price:</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        KES {totalPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        KES {instructor.cost}/hour
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status Badge */}
                <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 space-y-2 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-500 text-white">Pending Approval</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your instructor will review and confirm this lesson request. You'll be notified once approved.
                  </p>
                </div>

                {/* Schedule Button */}
                <Button
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || loading}
                >
                  <Send className="h-5 w-5 mr-2" />
                  {loading ? 'Sending Request...' : 'Request Lesson'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}