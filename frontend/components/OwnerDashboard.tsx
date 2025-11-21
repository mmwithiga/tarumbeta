import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rentalsService } from '../services/rentalsService';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  PlayCircle,
  RotateCcw,
  Award,
  DollarSign,
  TrendingUp,
  Guitar
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format, differenceInDays } from 'date-fns';

interface OwnerDashboardProps {
  onNavigate: (view: string) => void;
}

interface RentalWithInstrument {
  id: string;
  instrument_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface InstrumentDetails {
  id: string;
  name: string;
  instrument_type: string;
  image_url: string;
  price_per_day: number;
}

interface RenterDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

export function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const { userProfile } = useAuth();
  const [rentals, setRentals] = useState<RentalWithInstrument[]>([]);
  const [instruments, setInstruments] = useState<Map<string, InstrumentDetails>>(new Map());
  const [renters, setRenters] = useState<Map<string, RenterDetails>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    if (userProfile?.id) {
      loadOwnerData();
    }
  }, [userProfile]);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      // Load all rentals for instruments owned by this user
      const rentalsData = await rentalsService.getOwnerRentals(userProfile?.id || '');
      setRentals(rentalsData);

      // Load instrument details
      const instrumentIds = [...new Set(rentalsData.map(r => r.instrument_id))];
      if (instrumentIds.length > 0) {
        const { data: instrumentsData } = await supabase
          .from('instrument_listings')
          .select('id, name, instrument_type, image_url, price_per_day')
          .in('id', instrumentIds);

        const instrumentsMap = new Map();
        instrumentsData?.forEach(inst => {
          instrumentsMap.set(inst.id, inst);
        });
        setInstruments(instrumentsMap);
      }

      // Load renter details
      const renterIds = [...new Set(rentalsData.map(r => r.renter_id))];
      if (renterIds.length > 0) {
        const { data: rentersData } = await supabase
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', renterIds);

        const rentersMap = new Map();
        rentersData?.forEach(renter => {
          rentersMap.set(renter.id, renter);
        });
        setRenters(rentersMap);
      }
    } catch (error) {
      console.error('Error loading owner data:', error);
      toast.error('Failed to load rental data');
    } finally {
      setLoading(false);
    }
  };

  // Rental action handlers
  const handleApproveRental = async (rentalId: string) => {
    try {
      await rentalsService.approveRental(rentalId);
      toast.success('Rental approved! Waiting for pickup.');
      loadOwnerData();
    } catch (error: any) {
      console.error('Error approving rental:', error);
      toast.error(error.message || 'Failed to approve rental');
    }
  };

  const handleRejectRental = async (rentalId: string) => {
    try {
      await rentalsService.rejectRental(rentalId);
      toast.success('Rental request rejected');
      loadOwnerData();
    } catch (error: any) {
      console.error('Error rejecting rental:', error);
      toast.error(error.message || 'Failed to reject rental');
    }
  };

  const handleMarkPickedUp = async (rentalId: string) => {
    try {
      await rentalsService.markPickedUp(rentalId);
      toast.success('Instrument marked as picked up');
      loadOwnerData();
    } catch (error: any) {
      console.error('Error marking as picked up:', error);
      toast.error(error.message || 'Failed to mark as picked up');
    }
  };

  const handleConfirmReturn = async (rentalId: string) => {
    try {
      await rentalsService.confirmReturn(rentalId);
      toast.success('Return confirmed! Rental completed.');
      loadOwnerData();
    } catch (error: any) {
      console.error('Error confirming return:', error);
      toast.error(error.message || 'Failed to confirm return');
    }
  };

  // Filter rentals by status
  const pendingRentals = rentals.filter(r => r.status === 'pending');
  const confirmedRentals = rentals.filter(r => r.status === 'confirmed');
  const activeRentals = rentals.filter(r => r.status === 'active');
  const pendingReturnRentals = rentals.filter(r => r.status === 'pending_return');
  const completedRentals = rentals.filter(r => r.status === 'completed');

  // Calculate stats
  const totalEarnings = completedRentals.reduce((sum, r) => sum + r.total_price, 0);
  const activeCount = activeRentals.length;
  const pendingCount = pendingRentals.length;

  const renderRentalCard = (rental: RentalWithInstrument, actionButtons: React.ReactNode, statusBadge: React.ReactNode) => {
    const instrument = instruments.get(rental.instrument_id);
    const renter = renters.get(rental.renter_id);

    return (
      <div key={rental.id} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-4">
          {instrument?.image_url && (
            <img
              src={instrument.image_url}
              alt={instrument.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {instrument?.name || 'Loading...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {instrument?.instrument_type}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Renter: {renter?.full_name || 'Loading...'}
                </p>
                {renter?.email && (
                  <p className="text-xs text-muted-foreground">{renter.email}</p>
                )}
              </div>
              {statusBadge}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(new Date(rental.start_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">End Date</p>
                <p className="font-medium">{format(new Date(rental.end_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Price</p>
                <p className="font-medium">KES {rental.total_price}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              {actionButtons}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 md:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Owner Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your instrument rentals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-premium border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Waiting for your approval
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Rentals
              </CardTitle>
              <PlayCircle className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently rented out
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">KES {totalEarnings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From completed rentals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rental Management Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-6">
            {pendingRentals.length > 0 ? (
              <Card className="shadow-premium border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending Approval ({pendingRentals.length})
                  </CardTitle>
                  <CardDescription>
                    New rental requests waiting for your approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRentals.map((rental) =>
                      renderRentalCard(
                        rental,
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveRental(rental.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRental(rental.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>,
                        <Badge className="bg-yellow-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No pending requests
                  </h3>
                  <p className="text-muted-foreground">
                    All rental requests have been processed
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Confirmed Rentals Tab */}
          <TabsContent value="confirmed" className="space-y-6">
            {confirmedRentals.length > 0 ? (
              <Card className="shadow-premium border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Confirmed Rentals ({confirmedRentals.length})
                  </CardTitle>
                  <CardDescription>
                    Approved rentals waiting for pickup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {confirmedRentals.map((rental) =>
                      renderRentalCard(
                        rental,
                        <Button
                          size="sm"
                          onClick={() => handleMarkPickedUp(rental.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Mark as Picked Up
                        </Button>,
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmed
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No confirmed rentals
                  </h3>
                  <p className="text-muted-foreground">
                    No rentals waiting for pickup
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Rentals Tab */}
          <TabsContent value="active" className="space-y-6">
            {activeRentals.length > 0 ? (
              <Card className="shadow-premium border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    Active Rentals ({activeRentals.length})
                  </CardTitle>
                  <CardDescription>
                    Currently rented out instruments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRentals.map((rental) => {
                      const daysRemaining = differenceInDays(new Date(rental.end_date), new Date());
                      return (
                        <div key={rental.id}>
                          {renderRentalCard(
                            rental,
                            daysRemaining <= 0 ? (
                              <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <p className="text-sm text-red-700 dark:text-red-400">
                                  Return date passed! Contact renter.
                                </p>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until return date
                              </div>
                            ),
                            <Badge className="bg-blue-500">
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No active rentals
                  </h3>
                  <p className="text-muted-foreground">
                    No instruments currently rented out
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            {pendingReturnRentals.length > 0 ? (
              <Card className="shadow-premium border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                    Pending Returns ({pendingReturnRentals.length})
                  </CardTitle>
                  <CardDescription>
                    Instruments returned, waiting for your confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingReturnRentals.map((rental) =>
                      renderRentalCard(
                        rental,
                        <Button
                          size="sm"
                          onClick={() => handleConfirmReturn(rental.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Return
                        </Button>,
                        <Badge className="bg-purple-500">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Pending Return
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No pending returns
                  </h3>
                  <p className="text-muted-foreground">
                    No returned instruments waiting for confirmation
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rental History Tab */}
          <TabsContent value="history" className="space-y-6">
            {completedRentals.length > 0 ? (
              <Card className="shadow-premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Rental History ({completedRentals.length})
                  </CardTitle>
                  <CardDescription>
                    Completed rentals - Total earned: KES {totalEarnings}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedRentals.slice(0, 10).map((rental) => {
                      const instrument = instruments.get(rental.instrument_id);
                      const renter = renters.get(rental.renter_id);

                      return (
                        <div key={rental.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {instrument?.image_url && (
                              <img
                                src={instrument.image_url}
                                alt={instrument.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">
                                {instrument?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Renter: {renter?.full_name}
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
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-premium">
                <CardContent className="text-center py-12">
                  <Guitar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No rental history
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't completed any rentals yet
                  </p>
                  <Button onClick={() => onNavigate('my-listings')}>
                    View My Listings
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
