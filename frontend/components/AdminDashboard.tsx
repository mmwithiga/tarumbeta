import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  Users, 
  Guitar, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Music2,
  Shield,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

interface PlatformStats {
  totalUsers: number;
  totalInstructors: number;
  totalInstruments: number;
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  pendingInstructorApps: number;
  pendingInstrumentListings: number;
}

interface InstructorApplication {
  id: string;
  user_id: string;
  instrument: string;
  experience_years: number;
  hourly_rate: number;
  bio: string;
  genre: string;
  certifications: string;
  status: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

interface InstrumentListing {
  id: string;
  name: string;
  instrument_type: string;
  condition: string;
  price_per_day: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalInstructors: 0,
    totalInstruments: 0,
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    pendingInstructorApps: 0,
    pendingInstrumentListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [instructorApplications, setInstructorApplications] = useState<InstructorApplication[]>([]);
  const [instrumentListings, setInstrumentListings] = useState<InstrumentListing[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadPendingInstructorApplications(),
        loadInstrumentListings(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total instructors
      const { count: totalInstructors } = await supabase
        .from('instructor_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total instruments
      const { count: totalInstruments } = await supabase
        .from('instrument_listings')
        .select('*', { count: 'exact', head: true });

      // Get total rentals
      const { count: totalRentals } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true });

      // Get active rentals
      const { count: activeRentals } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue
      const { data: rentalsData } = await supabase
        .from('rentals')
        .select('total_price');
      
      const totalRevenue = rentalsData?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;

      // Get pending instructor applications
      const { count: pendingInstructorApps } = await supabase
        .from('instructor_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Pending instrument listings (approximation - not approved yet)
      const { count: pendingInstrumentListings } = await supabase
        .from('instrument_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', false);

      setStats({
        totalUsers: totalUsers || 0,
        totalInstructors: totalInstructors || 0,
        totalInstruments: totalInstruments || 0,
        totalRentals: totalRentals || 0,
        activeRentals: activeRentals || 0,
        totalRevenue,
        pendingInstructorApps: pendingInstructorApps || 0,
        pendingInstrumentListings: pendingInstrumentListings || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPendingInstructorApplications = async () => {
    try {
      // Simplified query without join to avoid timeout
      const { data, error } = await supabase
        .from('instructor_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstructorApplications(data || []);
    } catch (error) {
      console.error('Error loading instructor applications:', error);
      // Don't throw - just log and continue
      setInstructorApplications([]);
    }
  };

  const loadInstrumentListings = async () => {
    try {
      // Simplified query without join to avoid timeout
      const { data, error } = await supabase
        .from('instrument_listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInstrumentListings(data || []);
    } catch (error) {
      console.error('Error loading instrument listings:', error);
      // Don't throw - just log and continue
      setInstrumentListings([]);
    }
  };

  const handleApproveInstructor = async (applicationId: string, userId: string) => {
    try {
      console.log("🎯 Approving instructor application:", applicationId);
      
      // Get application details first
      const application = instructorApplications.find(app => app.id === applicationId);
      if (!application) {
        toast.error("Application not found");
        return;
      }

      console.log("📋 Application details:", application);

      // 1. Update application status to approved
      const { error: appError } = await supabase
        .from('instructor_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userProfile?.id,
        })
        .eq('id', applicationId);

      if (appError) {
        console.error("❌ Error updating application:", appError);
        throw appError;
      }

      console.log("✅ Application marked as approved");

      // 2. Create instructor profile in instructor_profiles table
      const { error: instructorError } = await supabase
        .from('instructor_profiles')
        .insert({
          user_id: userId,
          instrument: application.instrument,
          bio: application.bio,
          experience_years: application.experience_years,
          hourly_rate: application.hourly_rate,
          genre: application.genre,
          certifications: application.certifications,
          rating: 5.0,
          total_students: 0,
          is_verified: true,
          profile_image_url: null, // Will be updated by user later
        });

      if (instructorError) {
        console.error("❌ Error creating instructor profile:", instructorError);
        throw instructorError;
      }

      console.log("✅ Instructor profile created");

      // 3. Update user role to instructor
      const { error: userError } = await supabase
        .from('users')
        .update({ role: 'instructor' })
        .eq('id', userId);

      if (userError) {
        console.error("❌ Error updating user role:", userError);
        throw userError;
      }

      console.log("✅ User role updated to instructor");

      toast.success('Instructor approved!', {
        description: 'The instructor profile has been created and they can now access the instructor dashboard.',
      });

      // Reload data
      loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error approving instructor:', error);
      toast.error('Failed to approve instructor', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleRejectInstructor = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('instructor_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: userProfile?.id,
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application rejected');
      loadDashboardData();
    } catch (error: any) {
      console.error('Error rejecting instructor:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleApproveInstrument = async (instrumentId: string) => {
    try {
      console.log("🎸 Approving instrument:", instrumentId);
      
      const { error } = await supabase
        .from('instrument_listings')
        .update({ is_available: true })
        .eq('id', instrumentId);

      if (error) {
        console.error("❌ Error approving instrument:", error);
        throw error;
      }

      console.log("✅ Instrument approved and made available");
      
      toast.success('Instrument approved!', {
        description: 'The instrument is now available for rent.',
      });

      // Reload data
      loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error approving instrument:', error);
      toast.error('Failed to approve instrument', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleRejectInstrument = async (instrumentId: string) => {
    try {
      console.log("❌ Rejecting instrument:", instrumentId);
      
      // Delete the instrument listing
      const { error } = await supabase
        .from('instrument_listings')
        .delete()
        .eq('id', instrumentId);

      if (error) {
        console.error("❌ Error rejecting instrument:", error);
        throw error;
      }

      console.log("✅ Instrument rejected and removed");
      
      toast.success('Instrument rejected', {
        description: 'The listing has been removed from the platform.',
      });

      // Reload data
      loadDashboardData();
    } catch (error: any) {
      console.error('❌ Error rejecting instrument:', error);
      toast.error('Failed to reject instrument', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleDeleteInstrument = async (instrumentId: string) => {
    try {
      const { error } = await supabase
        .from('instrument_listings')
        .delete()
        .eq('id', instrumentId);

      if (error) throw error;

      toast.success('Instrument listing deleted');
      loadInstrumentListings();
    } catch (error: any) {
      console.error('Error deleting instrument:', error);
      toast.error('Failed to delete listing');
    }
  };

  // Check admin access
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-premium">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            You need administrator privileges to access this dashboard.
          </p>
          <Button onClick={() => onNavigate('landing')}>
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {userProfile?.full_name}
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your platform, approve instructors, and monitor activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform registered users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Instructors
              </CardTitle>
              <Music2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalInstructors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingInstructorApps} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Instruments
              </CardTitle>
              <Guitar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalInstruments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total listings available
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                KES {stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeRentals} active rentals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructors">
              Instructors
              {stats.pendingInstructorApps > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {stats.pendingInstructorApps}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="instruments">Instruments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Platform Activity
                  </CardTitle>
                  <CardDescription>Recent platform statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Rentals</span>
                    <span className="font-semibold text-foreground">{stats.totalRentals}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Rentals</span>
                    <span className="font-semibold text-foreground">{stats.activeRentals}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Approvals</span>
                    <Badge variant={stats.pendingInstructorApps > 0 ? "destructive" : "secondary"}>
                      {stats.pendingInstructorApps}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Manage your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setSelectedTab('instructors')}
                  >
                    <Music2 className="mr-2 h-4 w-4" />
                    Review Instructor Applications
                    {stats.pendingInstructorApps > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stats.pendingInstructorApps}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setSelectedTab('instruments')}
                  >
                    <Guitar className="mr-2 h-4 w-4" />
                    Manage Instrument Listings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    View All Users
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Pending Instructor Applications
                </CardTitle>
                <CardDescription>
                  Review and approve new instructor applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instructorApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instructorApplications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Instructor Application
                            </h3>
                            <p className="text-sm text-muted-foreground">User ID: {app.user_id.slice(0, 8)}...</p>
                          </div>
                          <Badge>{app.instrument}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Experience:</span>
                            <span className="ml-2 font-medium">{app.experience_years} years</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="ml-2 font-medium">KES {app.hourly_rate}/hr</span>
                          </div>
                        </div>

                        {app.genre && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Genres:</span>
                            <span className="ml-2">{app.genre}</span>
                          </div>
                        )}

                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Bio:</p>
                          <p className="text-foreground/80 line-clamp-2">{app.bio}</p>
                        </div>

                        {app.certifications && (
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Certifications:</p>
                            <p className="text-foreground/80 line-clamp-2">{app.certifications}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleApproveInstructor(app.id, app.user_id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleRejectInstructor(app.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instruments Tab */}
          <TabsContent value="instruments" className="space-y-6">
            {/* Pending Approvals */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Pending Instrument Approvals
                </CardTitle>
                <CardDescription>
                  Review and approve new instrument listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instrumentListings.filter(i => !i.is_available).length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending instrument approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instrumentListings
                      .filter(instrument => !instrument.is_available)
                      .map((instrument) => (
                        <div key={instrument.id} className="border rounded-lg p-4 flex gap-4 bg-amber-50 dark:bg-amber-950/20">
                          <img
                            src={instrument.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                            alt={instrument.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{instrument.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {instrument.instrument_type} • {instrument.condition}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Owner: {instrument.users?.full_name || 'Unknown'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  KES {instrument.price_per_day}/day
                                </p>
                                <Badge variant="outline" className="border-amber-500 text-amber-600">
                                  Pending Approval
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleApproveInstrument(instrument.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectInstrument(instrument.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approved Instruments */}
            <Card className="shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Guitar className="h-5 w-5 text-primary" />
                  Approved Instrument Listings
                </CardTitle>
                <CardDescription>
                  Manage approved and active instrument listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instrumentListings.filter(i => i.is_available).length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No approved instrument listings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instrumentListings
                      .filter(instrument => instrument.is_available)
                      .map((instrument) => (
                        <div key={instrument.id} className="border rounded-lg p-4 flex gap-4">
                          <img
                            src={instrument.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                            alt={instrument.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{instrument.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {instrument.instrument_type} • {instrument.condition}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Owner: {instrument.users?.full_name || 'Unknown'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  KES {instrument.price_per_day}/day
                                </p>
                                <Badge className="bg-green-500">
                                  Available
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteInstrument(instrument.id)}
                              >
                                Delete Listing
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}