import { rentalsService } from '../services/rentalsService';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  Calendar,
  Guitar,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Music2,
  Award,
  Target,
  Zap,
  DollarSign,
  Package,
  CalendarClock,
  User,
  MessageSquare,
  Star,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  Users,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format, differenceInDays, isPast, isFuture, isToday } from 'date-fns';
import { MyInstructors } from './MyInstructors';

interface LearnerDashboardProps {
  onNavigate: (view: string) => void;
}

interface LearnerStats {
  totalLessons: number;
  upcomingLessons: number;
  completedLessons: number;
  pendingLessons: number;
  totalHoursLearned: number;
  activeRentals: number;
  totalSpent: number;
  instrumentsRented: number;
}

interface Lesson {
  id: string;
  instructor_id: string;
  learner_id: string;
  rental_id: string | null;
  instrument: string;
  skill_level: string | null;
  session_type: string;
  scheduled_time: string;
  duration_minutes: number;
  price: number;
  status: 'scheduled' | 'approved' | 'completed' | 'cancelled';
  created_at: string;
  instructor_profiles?: {
    user_id: string;
    bio: string;
    experience_years: number;
    rating: number;
    users?: {
      full_name: string;
      email: string;
    };
  };
}

interface Rental {
  id: string;
  instrument_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  instrument_listings?: {
    name: string;
    instrument_type: string;
    image_url: string;
    price_per_day: number;
  };
}

export function LearnerDashboard({ onNavigate }: LearnerDashboardProps) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<LearnerStats>({
    totalLessons: 0,
    upcomingLessons: 0,
    completedLessons: 0,
    pendingLessons: 0,
    totalHoursLearned: 0,
    activeRentals: 0,
    totalSpent: 0,
    instrumentsRented: 0,
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (userProfile?.id) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLessons(),
        loadRentals(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          instructor_profiles:instructor_id (
            user_id,
            bio,
            experience_years,
            rating,
            users:user_id (
              full_name,
              email
            )
          )
        `)
        .eq('learner_id', userProfile?.id)
        .order('scheduled_time', { ascending: false });

      if (error) throw error;

      setLessons(data || []);
      calculateLessonStats(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const loadRentals = async () => {
    try {
      const data = await rentalsService.getUserRentals(userProfile?.id || '');

      setRentals(data || []);
      calculateRentalStats(data || []);
    } catch (error) {
      console.error('Error loading rentals:', error);
      setRentals([]);
    }
  };

  const calculateLessonStats = (lessonsData: Lesson[]) => {
    const now = new Date();
    const totalLessons = lessonsData.length;
    const completedLessons = lessonsData.filter(l => l.status === 'completed').length;
    const pendingLessons = lessonsData.filter(l => l.status === 'scheduled').length;
    const upcomingLessons = lessonsData.filter(l => 
      (l.status === 'approved' || l.status === 'scheduled') && 
      isFuture(new Date(l.scheduled_time))
    ).length;
    
    const totalHoursLearned = lessonsData
      .filter(l => l.status === 'completed')
      .reduce((sum, l) => sum + (l.duration_minutes / 60), 0);

    setStats(prev => ({
      ...prev,
      totalLessons,
      upcomingLessons,
      completedLessons,
      pendingLessons,
      totalHoursLearned,
    }));
  };

  const calculateRentalStats = (rentalsData: Rental[]) => {
    const activeRentals = rentalsData.filter(r => r.status === 'active').length;
    const totalSpent = rentalsData.reduce((sum, r) => sum + (r.total_price || 0), 0);
    const instrumentsRented = new Set(rentalsData.map(r => r.instrument_id)).size;

    setStats(prev => ({
      ...prev,
      activeRentals,
      totalSpent,
      instrumentsRented,
    }));
  };

  const handleCancelLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Lesson cancelled successfully');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error cancelling lesson:', error);
      toast.error('Failed to cancel lesson');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENTAL STATE TRANSITION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleCancelRental = async (rentalId: string) => {
    try {
      await rentalsService.cancelRental(rentalId);
      toast.success('Rental cancelled successfully');
      loadRentals();
    } catch (error: any) {
      console.error('Error cancelling rental:', error);
      toast.error(error.message || 'Failed to cancel rental');
    }
  };

  const handleMarkReturned = async (rentalId: string) => {
    try {
      await rentalsService.markReturned(rentalId);
      toast.success('Rental marked as returned. Waiting for owner confirmation.');
      loadRentals();
    } catch (error: any) {
      console.error('Error marking rental as returned:', error);
      toast.error(error.message || 'Failed to mark rental as returned');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'scheduled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Group lessons by status
  const pendingLessons = lessons.filter(l => l.status === 'scheduled');
  const approvedLessons = lessons.filter(l => l.status === 'approved' && isFuture(new Date(l.scheduled_time)));
  const completedLessons = lessons.filter(l => l.status === 'completed');
  const cancelledLessons = lessons.filter(l => l.status === 'cancelled');

  // Group rentals by status
  const activeRentalsData = rentals.filter(r => r.status === 'active');
  const completedRentals = rentals.filter(r => r.status === 'completed');

  // Get instruments being learned
  const instrumentsBeingLearned = Array.from(new Set(lessons.map(l => l.instrument)));

  return (
    <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                My Learning Journey
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {userProfile?.full_name}! 👋
              </p>
            </div>
            <div className="hidden md:flex gap-3">
              <Button onClick={() => onNavigate('browse')} variant="outline">
                <Guitar className="mr-2 h-4 w-4" />
                Browse Instruments
              </Button>
              <Button onClick={() => onNavigate('instructors')} className="bg-gradient-to-r from-primary to-secondary">
                <User className="mr-2 h-4 w-4" />
                Find Instructors
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Lessons */}
          <Card className="shadow-premium hover:shadow-premium-hover transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Lessons
              </CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedLessons} completed
              </p>
              <Progress value={(stats.completedLessons / Math.max(stats.totalLessons, 1)) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          {/* Upcoming Lessons */}
          <Card className="shadow-premium hover:shadow-premium-hover transition-all duration-300 border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Lessons
              </CardTitle>
              <Calendar className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.upcomingLessons}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingLessons} pending approval
              </p>
              {stats.upcomingLessons > 0 && (
                <Badge className="mt-3 bg-green-500">Ready to learn!</Badge>
              )}
            </CardContent>
          </Card>

          {/* Learning Hours */}
          <Card className="shadow-premium hover:shadow-premium-hover transition-all duration-300 border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Learning Hours
              </CardTitle>
              <Clock className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalHoursLearned.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Practice makes perfect
              </p>
              {stats.totalHoursLearned >= 10 && (
                <Badge className="mt-3 bg-accent">Great progress! 🎉</Badge>
              )}
            </CardContent>
          </Card>

          {/* Active Rentals */}
          <Card className="shadow-premium hover:shadow-premium-hover transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Rentals
              </CardTitle>
              <Guitar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeRentals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.instrumentsRented} different instruments
              </p>
              {stats.activeRentals > 0 && (
                <Badge className="mt-3 bg-blue-500">Keep practicing! 🎸</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instruments Being Learned */}
        {instrumentsBeingLearned.length > 0 && (
          <Card className="shadow-premium mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5 text-primary" />
                Your Musical Journey
              </CardTitle>
              <CardDescription>Instruments you're currently learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {instrumentsBeingLearned.map((instrument) => {
                  const instrumentLessons = lessons.filter(l => l.instrument === instrument);
                  const completedCount = instrumentLessons.filter(l => l.status === 'completed').length;
                  const totalCount = instrumentLessons.length;
                  
                  return (
                    <div key={instrument} className="flex items-center gap-3 bg-muted/50 rounded-lg p-4 min-w-[200px]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                        <Music2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{instrument}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={(completedCount / Math.max(totalCount, 1)) * 100} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{completedCount}/{totalCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[650px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">
              My Lessons
              {stats.pendingLessons > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {stats.pendingLessons}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="instructors">
              <Users className="h-4 w-4 mr-1" />
              My Instructors
            </TabsTrigger>
            <TabsTrigger value="rentals">My Rentals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Approvals Alert */}
              {pendingLessons.length > 0 && (
                <Card className="shadow-premium border-l-4 border-l-yellow-500 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-5 w-5" />
                      Pending Instructor Approval
                    </CardTitle>
                    <CardDescription>
                      You have {pendingLessons.length} lesson{pendingLessons.length !== 1 ? 's' : ''} waiting for instructor approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingLessons.slice(0, 3).map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="font-medium text-foreground">{lesson.instrument}</p>
                              <p className="text-sm text-muted-foreground">
                                with {lesson.instructor_profiles?.users?.full_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {format(new Date(lesson.scheduled_time), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(lesson.scheduled_time), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Upcoming Lesson */}
              {approvedLessons.length > 0 && (
                <Card className="shadow-premium border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CalendarClock className="h-5 w-5" />
                      Next Lesson
                    </CardTitle>
                    <CardDescription>Your upcoming approved lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const nextLesson = approvedLessons.sort((a, b) => 
                        new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
                      )[0];
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                              <Music2 className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground">{nextLesson.instrument}</h3>
                              <p className="text-sm text-muted-foreground">
                                with {nextLesson.instructor_profiles?.users?.full_name}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {nextLesson.duration_minutes} minutes • {nextLesson.session_type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Date & Time</p>
                              <p className="font-semibold text-foreground">
                                {format(new Date(nextLesson.scheduled_time), 'EEEE, MMM dd')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(nextLesson.scheduled_time), 'h:mm a')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Price</p>
                              <p className="text-xl font-bold text-primary">
                                KES {nextLesson.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Learning Progress */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Learning Progress
                  </CardTitle>
                  <CardDescription>Your achievements and milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Lessons Completed</p>
                        <p className="text-sm text-muted-foreground">Keep it up!</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.completedLessons}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                        <Music2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Instruments Learning</p>
                        <p className="text-sm text-muted-foreground">Diversifying skills</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{instrumentsBeingLearned.length}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Practice Hours</p>
                        <p className="text-sm text-muted-foreground">Time invested</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalHoursLearned.toFixed(1)}h</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>What would you like to do?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => onNavigate('browse')}
                  >
                    <span className="flex items-center">
                      <Guitar className="mr-2 h-4 w-4" />
                      Rent an Instrument
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => onNavigate('instructors')}
                  >
                    <span className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Find Instructors
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    className="w-full justify-between" 
                    variant="outline"
                    onClick={() => setSelectedTab('lessons')}
                  >
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Lessons
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Pending Lessons */}
            {pendingLessons.length > 0 && (
              <Card className="shadow-premium border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending Approval ({pendingLessons.length})
                  </CardTitle>
                  <CardDescription>
                    Waiting for instructor to approve your lesson requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingLessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4 space-y-3 bg-yellow-50 dark:bg-yellow-950/20">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                              <Music2 className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{lesson.instrument}</h3>
                              <p className="text-sm text-muted-foreground">
                                Instructor: {lesson.instructor_profiles?.users?.full_name}
                              </p>
                              {lesson.skill_level && (
                                <Badge variant="outline" className="mt-1">
                                  {lesson.skill_level}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge className="bg-yellow-500">
                            {getStatusIcon('scheduled')}
                            <span className="ml-1">Pending</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{format(new Date(lesson.scheduled_time), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-medium">{format(new Date(lesson.scheduled_time), 'h:mm a')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{lesson.duration_minutes} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">KES {lesson.price}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelLesson(lesson.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Request
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approved/Upcoming Lessons */}
            {approvedLessons.length > 0 && (
              <Card className="shadow-premium border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Upcoming Lessons ({approvedLessons.length})
                  </CardTitle>
                  <CardDescription>
                    Your confirmed lessons with instructors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvedLessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4 space-y-3 bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                              <Music2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{lesson.instrument}</h3>
                              <p className="text-sm text-muted-foreground">
                                Instructor: {lesson.instructor_profiles?.users?.full_name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {lesson.skill_level && (
                                  <Badge variant="outline">
                                    {lesson.skill_level}
                                  </Badge>
                                )}
                                <Badge variant="secondary">
                                  {lesson.session_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-500">
                            {getStatusIcon('approved')}
                            <span className="ml-1">Approved</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{format(new Date(lesson.scheduled_time), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-medium">{format(new Date(lesson.scheduled_time), 'h:mm a')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{lesson.duration_minutes} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">KES {lesson.price}</p>
                          </div>
                        </div>

                        {lesson.instructor_profiles?.bio && (
                          <div className="text-sm pt-2 border-t">
                            <p className="text-muted-foreground mb-1">About your instructor:</p>
                            <p className="text-foreground/80 line-clamp-2">{lesson.instructor_profiles.bio}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Lessons */}
            {completedLessons.length > 0 && (
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Completed Lessons ({completedLessons.length})
                  </CardTitle>
                  <CardDescription>
                    Your learning history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedLessons.slice(0, 5).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-foreground">{lesson.instrument}</p>
                            <p className="text-sm text-muted-foreground">
                              with {lesson.instructor_profiles?.users?.full_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(lesson.scheduled_time), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Lessons State */}
            {lessons.length === 0 && (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No lessons yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start your musical journey by booking a lesson with an instructor
                  </p>
                  <Button onClick={() => onNavigate('instructors')}>
                    <User className="mr-2 h-4 w-4" />
                    Find Instructors
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors">
            <MyInstructors />
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals" className="space-y-6">
            {/* Active Rentals */}
            {activeRentalsData.length > 0 && (
              <Card className="shadow-premium border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    Active Rentals ({activeRentalsData.length})
                  </CardTitle>
                  <CardDescription>
                    Instruments you're currently renting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRentalsData.map((rental) => {
                      const daysRemaining = differenceInDays(new Date(rental.end_date), new Date());
                      
                      return (
                        <div key={rental.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-4">
                            <img
                              src={rental.instrument_listings?.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                              alt={rental.instrument_listings?.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-foreground">
                                    {rental.instrument_listings?.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {rental.instrument_listings?.instrument_type}
                                  </p>
                                </div>
                                <Badge className="bg-blue-500">Active</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Start Date</p>
                                  <p className="font-medium">{format(new Date(rental.start_date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Return Date</p>
                                  <p className="font-medium">{format(new Date(rental.end_date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total Paid</p>
                                  <p className="font-medium">KES {rental.total_price}</p>
                                </div>
                              </div>

                              {daysRemaining <= 3 && daysRemaining > 0 && (
                                <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    Return in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              )}

                              {daysRemaining <= 0 && (
                                <div className="flex items-center gap-2 mt-3 p-2 bg-red-100 dark:bg-red-900/20 rounded">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  <p className="text-sm text-red-700 dark:text-red-400">
                                    Overdue! Please return as soon as possible
                                  </p>
                                </div>
                              )}

                              {/* Mark as Returned Button */}
                              <div className="flex gap-2 pt-3 border-t mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkReturned(rental.id)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Mark as Returned
                                </Button>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  Click when you've physically returned the instrument to the owner
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rental History */}
            {completedRentals.length > 0 && (
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Rental History ({completedRentals.length})
                  </CardTitle>
                  <CardDescription>
                    Instruments you've rented before
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedRentals.slice(0, 5).map((rental) => (
                      <div key={rental.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={rental.instrument_listings?.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                            alt={rental.instrument_listings?.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {rental.instrument_listings?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {rental.instrument_listings?.instrument_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            KES {rental.total_price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(rental.start_date), 'MMM dd')} - {format(new Date(rental.end_date), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Rentals State */}
            {rentals.length === 0 && (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <Guitar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No rentals yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Browse our collection and rent an instrument to start practicing
                  </p>
                  <Button onClick={() => onNavigate('browse')}>
                    <Guitar className="mr-2 h-4 w-4" />
                    Browse Instruments
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}