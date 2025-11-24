import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { View } from '../types';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent } from './ui/dialog';
import {
    Music,
    Star,
    Award,
    Calendar,
    MessageSquare,
    CheckCircle,
    Clock,
    Sparkles,
    TrendingUp,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleLesson } from './ScheduleLesson';

interface MyMatchesProps {
    onNavigate: (view: View) => void;
}

interface InstructorMatch {
    id: string;
    learner_id: string;
    instructor_id: string;
    match_score: number;
    status: string;
    created_at: string;
    instructor_profiles: {
        id: string;
        instrument: string;
        experience_years: number;
        hourly_rate: number;
        genre: string;
        bio: string;
        rating: number;
        total_reviews: number;
        total_students: number;
        is_verified: boolean;
        profile_image_url: string;
        users: {
            full_name: string;
            email: string;
            avatar_url: string;
        };
    };
}

export function MyMatches({ onNavigate }: MyMatchesProps) {
    const { userProfile } = useAuth();
    const [matches, setMatches] = useState<InstructorMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

    useEffect(() => {
        if (userProfile?.id) {
            loadMatches();
        }
    }, [userProfile]);

    const loadMatches = async () => {
        setLoading(true);
        console.log('🔍 MyMatches: Starting to load matches for user:', userProfile?.id);
        try {
            // Query 1: Get instructors from lessons (like LearnerDashboard does)
            console.log('📚 MyMatches: Querying lessons table...');
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select(`
          id,
          instructor_id,
          instrument,
          skill_level,
          scheduled_time,
          status,
          price,
          instructor_profiles!inner (
            id,
            instrument,
            skill_level,
            experience_years,
            hourly_rate,
            is_verified,
            profile_image_url,
            genre,
            bio,
            rating,
            total_reviews,
            total_students,
            users:user_id (
              full_name,
              email,
              avatar_url
            )
          )
        `)
                .eq('learner_id', userProfile?.id)
                .order('scheduled_time', { ascending: false });

            if (lessonsError) {
                console.error('❌ MyMatches: Lessons query error:', lessonsError);
                throw lessonsError;
            }
            console.log('✅ MyMatches: Lessons data:', lessonsData);

            // Query 2: Get instructors from instructor_matches
            console.log('🎯 MyMatches: Querying instructor_matches table...');
            const { data: matchesData, error: matchesError } = await supabase
                .from('instructor_matches')
                .select(`
          *,
          instructor_profiles(
            *,
            users!instructor_profiles_user_id_fkey(full_name, email, avatar_url)
          )
        `)
                .eq('learner_id', userProfile?.id)
                .order('created_at', { ascending: false });

            if (matchesError) {
                console.error('⚠️ MyMatches: Matches query error:', matchesError);
            }
            console.log('✅ MyMatches: Matches data:', matchesData);

            // Combine and deduplicate instructors
            const instructorMap = new Map<string, InstructorMatch>();

            // Add instructors from lessons
            if (lessonsData && lessonsData.length > 0) {
                console.log(`📝 MyMatches: Processing ${lessonsData.length} lessons...`);
                lessonsData.forEach((lesson: any) => {
                    const profile = lesson.instructor_profiles;
                    if (!profile) {
                        console.warn('⚠️ MyMatches: Lesson missing instructor_profiles:', lesson.id);
                        return;
                    }

                    const instructorId = lesson.instructor_id;

                    // If instructor already exists, update status if lesson is more recent
                    if (!instructorMap.has(instructorId)) {
                        instructorMap.set(instructorId, {
                            id: lesson.id,
                            learner_id: userProfile?.id || '',
                            instructor_id: instructorId,
                            match_score: 95, // Default high score for instructors with lessons
                            status: lesson.status === 'completed' ? 'contacted' : lesson.status === 'approved' ? 'accepted' : lesson.status === 'cancelled' ? 'cancelled' : 'scheduled',
                            created_at: lesson.scheduled_time,
                            instructor_profiles: {
                                id: profile.id,
                                instrument: profile.instrument || lesson.instrument,
                                experience_years: profile.experience_years || 0,
                                hourly_rate: profile.hourly_rate || 0,
                                genre: profile.genre || '',
                                bio: profile.bio || '',
                                rating: profile.rating || 0,
                                total_reviews: profile.total_reviews || 0,
                                total_students: profile.total_students || 0,
                                is_verified: profile.is_verified || false,
                                profile_image_url: profile.profile_image_url || '',
                                users: {
                                    full_name: profile.users?.full_name || 'Unknown',
                                    email: profile.users?.email || '',
                                    avatar_url: profile.users?.avatar_url || '',
                                },
                            },
                        });
                        console.log(`✅ MyMatches: Added instructor from lesson:`, profile.users?.full_name);
                    }
                });
            } else {
                console.log('ℹ️ MyMatches: No lessons found');
            }

            // Add instructors from matches (if not already added from lessons)
            if (matchesData && matchesData.length > 0) {
                console.log(`📝 MyMatches: Processing ${matchesData.length} matches...`);
                matchesData.forEach((match: any) => {
                    if (!instructorMap.has(match.instructor_id)) {
                        instructorMap.set(match.instructor_id, match);
                        console.log(`✅ MyMatches: Added instructor from matches:`, match.instructor_profiles?.users?.full_name);
                    }
                });
            } else {
                console.log('ℹ️ MyMatches: No instructor matches found');
            }

            // Convert map to array
            const combinedMatches = Array.from(instructorMap.values());
            console.log(`🎉 MyMatches: Total combined matches: ${combinedMatches.length}`);
            setMatches(combinedMatches);
        } catch (error) {
            console.error('❌ MyMatches: Error loading matches:', error);
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleLesson = (match: InstructorMatch) => {
        const instructor = match.instructor_profiles;
        const user = instructor.users;

        setSelectedInstructor({
            id: match.instructor_id,
            name: user.full_name,
            imageUrl: instructor.profile_image_url || user.avatar_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200',
            instrument: instructor.instrument,
            cost: instructor.hourly_rate,
        });
        setShowScheduleModal(true);
    };

    // Filter matches by status
    const suggestedMatches = matches.filter(m => m.status === 'suggested');
    const acceptedMatches = matches.filter(m => m.status === 'accepted');
    const contactedMatches = matches.filter(m => m.status === 'contacted');
    const pendingMatches = matches.filter(m => m.status === 'scheduled'); // Pending instructor approval
    const canceledMatches = matches.filter(m => m.status === 'cancelled');

    const renderMatchCard = (match: InstructorMatch) => {
        const instructor = match.instructor_profiles;
        const user = instructor.users;

        return (
            <Card key={match.id} className="shadow-premium hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                    <div className="flex gap-6">
                        {/* Instructor Image */}
                        <div className="relative">
                            <img
                                src={instructor.profile_image_url || user.avatar_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200'}
                                alt={user.full_name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                            />
                            {instructor.is_verified && (
                                <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Instructor Details */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        {user.full_name}
                                        {instructor.is_verified && (
                                            <CheckCircle className="h-5 w-5 text-secondary" />
                                        )}
                                    </h3>
                                    <p className="text-muted-foreground">{instructor.instrument} Instructor</p>
                                </div>
                                <Badge className="bg-secondary text-white">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {match.match_score}% Match
                                </Badge>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    <span>{instructor.experience_years} years</span>
                                </div>
                                {instructor.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{instructor.rating.toFixed(1)} ({instructor.total_reviews})</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>{instructor.total_students} students</span>
                                </div>
                            </div>

                            {/* Genres */}
                            {instructor.genre && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {instructor.genre.split(',').map((genre, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {genre.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Bio */}
                            {instructor.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {instructor.bio}
                                </p>
                            )}

                            {/* Price and Actions */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Starting from</p>
                                    <p className="text-2xl font-bold text-primary dark:text-primary dark:brightness-165">
                                        KES {instructor.hourly_rate.toLocaleString()}
                                        <span className="text-sm font-normal text-muted-foreground">/hour</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleScheduleLesson(match)}
                                        className="gradient-teal text-white"
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Schedule Lesson
                                    </Button>
                                    {instructor.total_reviews > 0 && (
                                        <Button variant="outline">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen py-8 md:py-12 bg-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <Music className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">Loading your matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        My Instructor Matches
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Instructors matched to your learning preferences
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-premium border-l-4 border-l-secondary">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Matches
                            </CardTitle>
                            <Sparkles className="h-5 w-5 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">{matches.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Instructors matched for you
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-premium border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Accepted
                            </CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">{acceptedMatches.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Matches you've accepted
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-premium border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Suggested
                            </CardTitle>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">{suggestedMatches.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                New suggestions for you
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Matches Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-[900px] h-auto gap-2">
                        <TabsTrigger value="all">
                            All ({matches.length})
                        </TabsTrigger>
                        <TabsTrigger value="suggested">
                            Suggested ({suggestedMatches.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending">
                            <Clock className="h-4 w-4 mr-1" />
                            Pending ({pendingMatches.length})
                        </TabsTrigger>
                        <TabsTrigger value="accepted">
                            Accepted ({acceptedMatches.length})
                        </TabsTrigger>
                        <TabsTrigger value="contacted">
                            Contacted ({contactedMatches.length})
                        </TabsTrigger>
                        <TabsTrigger value="canceled">
                            <XCircle className="h-4 w-4 mr-1" />
                            Canceled ({canceledMatches.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* All Matches */}
                    <TabsContent value="all" className="space-y-4">
                        {matches.length > 0 ? (
                            matches.map(renderMatchCard)
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No matches yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Find your perfect instructor match
                                    </p>
                                    <Button onClick={() => onNavigate('dashboard')}>
                                        Find Instructors
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Suggested Matches */}
                    <TabsContent value="suggested" className="space-y-4">
                        {suggestedMatches.length > 0 ? (
                            suggestedMatches.map(renderMatchCard)
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No suggested matches
                                    </h3>
                                    <p className="text-muted-foreground">
                                        All suggestions have been reviewed
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Pending Matches */}
                    <TabsContent value="pending" className="space-y-4">
                        {pendingMatches.length > 0 ? (
                            <>
                                <Card className="shadow-premium border-l-4 border-l-yellow-500 mb-4">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                                            <p className="text-sm text-muted-foreground">
                                                These lessons are waiting for instructor approval. You'll be notified once they respond.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {pendingMatches.map(renderMatchCard)}
                            </>
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No pending requests
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Schedule lessons to see pending requests here
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Accepted Matches */}
                    <TabsContent value="accepted" className="space-y-4">
                        {acceptedMatches.length > 0 ? (
                            acceptedMatches.map(renderMatchCard)
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No accepted matches
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Accept instructor suggestions to see them here
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Contacted Matches */}
                    <TabsContent value="contacted" className="space-y-4">
                        {contactedMatches.length > 0 ? (
                            contactedMatches.map(renderMatchCard)
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No contacted instructors
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Schedule lessons with your matches
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Canceled Matches */}
                    <TabsContent value="canceled" className="space-y-4">
                        {canceledMatches.length > 0 ? (
                            <>
                                <Card className="shadow-premium border-l-4 border-l-red-500 mb-4">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <p className="text-sm text-muted-foreground">
                                                These lessons were canceled. You can reschedule with the instructor.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {canceledMatches.map(renderMatchCard)}
                            </>
                        ) : (
                            <Card className="shadow-premium">
                                <CardContent className="text-center py-12">
                                    <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No canceled lessons
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Canceled lessons will appear here
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Schedule Lesson Modal - Fullscreen */}
                <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                    <DialogContent className="max-w-[98vw] w-full h-[98vh] p-0 gap-0 overflow-hidden">
                        {selectedInstructor && (
                            <div className="h-full overflow-y-auto">
                                <ScheduleLesson
                                    instructor={selectedInstructor}
                                    onBack={() => setShowScheduleModal(false)}
                                    onSuccess={() => {
                                        setShowScheduleModal(false);
                                        loadMatches(); // Reload matches to show new pending lesson
                                        toast.success('Lesson scheduled successfully!');
                                    }}
                                />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
