import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rentalsService, Rental } from '../services/rentalsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MapPin, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface MyRentalsProps {
  onNavigate: (view: string) => void;
}

export function MyRentals({ onNavigate }: MyRentalsProps) {
  const { userProfile } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (userProfile) {
      loadRentals();
    }
  }, [userProfile, activeTab]);

  const loadRentals = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await rentalsService.getUserRentals(userProfile.id, status);
      setRentals(data);
    } catch (error: any) {
      console.error('Error loading rentals:', error);
      toast.error('Failed to load rentals', {
        description: error.response?.data?.error || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRental = async (rentalId: string) => {
    try {
      await rentalsService.updateStatus(rentalId, 'cancelled');
      toast.success('Rental cancelled successfully');
      loadRentals();
    } catch (error: any) {
      toast.error('Failed to cancel rental', {
        description: error.response?.data?.error || 'Please try again'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to view your rentals</p>
        <Button onClick={() => onNavigate('signin')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Rentals</h1>
        <p className="text-muted-foreground">
          Manage your instrument rentals and bookings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Rentals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Rentals List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rentals found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'all' 
                ? "You haven't rented any instruments yet" 
                : `No ${activeTab} rentals`}
            </p>
            <Button onClick={() => onNavigate('browse')}>
              Browse Instruments
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((rental) => (
            <Card key={rental.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {rental.instrument_listings?.name || 'Instrument'}
                    </CardTitle>
                    <CardDescription>
                      {rental.instrument_listings?.instrument_type}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(rental.status)}>
                    {rental.status}
                  </Badge>
                </div>
              </CardHeader>

              {rental.instrument_listings?.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={rental.instrument_listings.image_url}
                    alt={rental.instrument_listings.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-foreground">
                      KES {rental.total_price.toLocaleString()}
                    </span>
                    <span className="text-xs">({rental.rental_period})</span>
                  </div>

                  {rental.instrument_listings?.users?.full_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Owner: {rental.instrument_listings.users.full_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                {rental.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRental(rental.id)}
                    className="w-full"
                  >
                    Cancel Rental
                  </Button>
                )}
                {rental.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('dashboard')}
                    className="w-full"
                  >
                    Find Instructor
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
