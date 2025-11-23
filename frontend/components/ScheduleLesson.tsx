import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
    <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Schedule Your Lesson
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a date and time that works for you
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Main Form - Takes 3 columns */}
          <div className="md:col-span-3 space-y-6">
            {/* Date Selection */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Select Time
                </CardTitle>
                <CardDescription>Pick your preferred time slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="h-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duration Selection */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Lesson Duration
                </CardTitle>
                <CardDescription>How long would you like the lesson?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={duration.toString()} onValueChange={(val) => setDuration(Number(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label} - KES {(instructor.cost * d.price).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
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
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Instructor Card */}
            <Card className="shadow-premium sticky top-6">
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Instructor Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={instructor.imageUrl} alt={instructor.name} />
                    <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{instructor.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Music2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{instructor.instrument}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Booking Summary */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Booking Summary</h4>
                  
                  {selectedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {DURATIONS.find(d => d.value === duration)?.label}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Price:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
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
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Pending Approval</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your instructor will review and confirm this lesson request. You'll be notified once approved.
                  </p>
                </div>

                {/* Schedule Button */}
                <Button
                  className="w-full gradient-primary text-white"
                  size="lg"
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || loading}
                >
                  <Send className="h-4 w-4 mr-2" />
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