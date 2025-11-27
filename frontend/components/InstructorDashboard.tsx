import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  MapPin,
  Music2
} from 'lucide-react';
import { toast } from 'sonner';

interface InstructorDashboardProps {
  onNavigate: (view: View) => void;
}

interface Lesson {
  id: string;
  learner_id: string;
  instructor_id: string;
  rental_id?: string;
  instrument: string;
  skill_level?: string;
  session_type: 'online' | 'in-person';
  scheduled_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'approved';
  price: number;
  created_at: string;
  learner?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface InstructorProfile {
  id: string;
  user_id: string;
  instrument: string;
  bio: string;
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_students: number;
}

export function InstructorDashboard({ onNavigate }: InstructorDashboardProps) {
  const { userProfile } = useAuth();
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pendingLessons, setPendingLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (userProfile) {
      loadInstructorData();
    }
  }, [userProfile]);

  useEffect(() => {
    if (instructorProfile) {
      loadLessons();
    }
  }, [instructorProfile, activeTab]);

  const loadInstructorData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Fetch instructor profile
      const { data: profile, error } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (error) {
        console.error('Error loading instructor profile:', error);
        setInstructorProfile(null);
        return;
      }

      setInstructorProfile(profile);
    } catch (error: any) {
      console.error('Error loading instructor data:', error);
      setInstructorProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    if (!instructorProfile) return;

    try {
      setLoading(true);

      // Build query based on active tab
      let query = supabase
        .from('lessons')
        .select(`
          *,
          learner:learner_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('instructor_id', instructorProfile.id);

      // Filter by status
      if (activeTab === 'pending') {
        query = query.eq('status', 'scheduled');
      } else if (activeTab === 'upcoming') {
        query = query.eq('status', 'scheduled');
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed');
      }

      query = query.order('scheduled_time', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error loading lessons:', error);
        throw error;
      }

      console.log('📚 Loaded lessons:', data);
      setLessons(data || []);

      // Also load pending count for badge
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', instructorProfile.id)
        .eq('status', 'scheduled');

      if (count && count > 0) {
        console.log(`⏳ ${count} pending lessons`);
      }
    } catch (error: any) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLesson = async (lessonId: string) => {
    try {
      console.log('✅ Approving lesson:', lessonId);

      const { error } = await supabase
        .from('lessons')
        .update({ status: 'approved' })
        .eq('id', lessonId);

      if (error) {
        console.error('❌ Error approving lesson:', error);
        throw error;
      }

      toast.success('Lesson approved!', {
        description: 'The student will be notified.',
      });

      loadLessons();
    } catch (error: any) {
      console.error('❌ Error approving lesson:', error);
      toast.error('Failed to approve lesson', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleRejectLesson = async (lessonId: string) => {
    try {
      console.log('❌ Rejecting lesson:', lessonId);

      const { error } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', lessonId);

      if (error) {
        console.error('❌ Error rejecting lesson:', error);
        throw error;
      }

      toast.success('Lesson cancelled', {
        description: 'The student will be notified.',
      });

      loadLessons();
    } catch (error: any) {
      console.error('❌ Error rejecting lesson:', error);
      toast.error('Failed to cancel lesson', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'completed' })
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Lesson marked as completed!');
      loadLessons();
    } catch (error: any) {
      toast.error('Failed to update lesson');
    }
  };

  const formatDateTime = (scheduledTime: string) => {
    const dateObj = new Date(scheduledTime);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to access instructor dashboard</p>
        <Button onClick={() => onNavigate('signin')}>Sign In</Button>
      </div>
    );
  }

  if (!instructorProfile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Instructor Profile Found</h2>
        <p className="text-muted-foreground mb-6">
          You need to create an instructor profile to access this dashboard
        </p>
        <Button onClick={() => onNavigate('become-instructor')}>
          Become an Instructor
        </Button>
      </div>
    );
  }

  const totalEarnings = lessons
    .filter(l => l.status === 'completed')
    .reduce((sum, l) => sum + l.price, 0);

  const upcomingLessons = lessons.filter(l => l.status === 'scheduled').length;

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your students, lessons, and earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorProfile.total_students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Lessons
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLessons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {instructorProfile.rating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lessons Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>My Lessons</CardTitle>
          <CardDescription>View and manage your lesson bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Lessons</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'pending' && "You don't have any pending lessons"}
                    {activeTab === 'upcoming' && "You don't have any upcoming lessons"}
                    {activeTab === 'completed' && "You haven't completed any lessons yet"}
                    {activeTab === 'all' && "You don't have any lessons booked"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <Card key={lesson.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={lesson.learner?.avatar_url} />
                                <AvatarFallback>
                                  {lesson.learner?.full_name?.[0] || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {lesson.learner?.full_name || 'Unknown Student'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {lesson.learner?.email}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  lesson.status === 'scheduled' ? 'secondary' :
                                    lesson.status === 'approved' ? 'default' :
                                      lesson.status === 'completed' ? 'outline' :
                                        'destructive'
                                }
                              >
                                {lesson.status}
                              </Badge>
                            </div>

                            <Separator className="mb-3" />

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDateTime(lesson.scheduled_time)}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration_minutes} minutes</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Music2 className="h-4 w-4" />
                                <span>{lesson.instrument}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-foreground">
                                  KES {lesson.price.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {lesson.status === 'scheduled' && (
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApproveLesson(lesson.id)}
                                className="gap-2 gradient-primary text-white"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectLesson(lesson.id)}
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          )}

                          {lesson.status === 'approved' && (
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleCompleteLesson(lesson.id)}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Mark Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectLesson(lesson.id)}
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}