import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function SupabaseDiagnostic() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      setDetails('Testing connection...');

      console.log('🔍 Testing Supabase connection...');

      // Test 1: Check if we can reach the API
      setDetails('Step 1/3: Testing API endpoint...');
      const { error: healthError } = await supabase.from('instrument_listings').select('count', { count: 'exact', head: true });

      if (healthError) {
        console.error('❌ API test failed:', healthError);
        
        // Check if table doesn't exist
        if (healthError.code === '42P01') {
          throw new Error(`Table 'instrument_listings' does not exist in database`);
        }
        
        // Check if permission denied
        if (healthError.code === '42501') {
          throw new Error('Permission denied - check RLS policies');
        }
        
        throw new Error(healthError.message);
      }

      // Test 2: Try to fetch a small amount of data
      setDetails('Step 2/3: Fetching sample data...');
      const { data, error: fetchError } = await supabase
        .from('instrument_listings')
        .select('*')
        .limit(1);

      if (fetchError) {
        console.error('❌ Fetch test failed:', fetchError);
        throw fetchError;
      }

      // Test 3: Check users table
      setDetails('Step 3/3: Checking users table...');
      const { error: usersError } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });

      if (usersError) {
        console.warn('⚠️ Users table check failed:', usersError);
        // Don't fail on this, just warn
      }

      console.log('✅ All connection tests passed');
      setStatus('connected');
      setDetails(`Found ${data?.length || 0} instruments`);
    } catch (err: any) {
      console.error('❌ Connection test failed:', err);
      setStatus('error');
      setError(err?.message || 'Unknown error');
      setDetails('Connection failed');
    }
  };

   /* if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Checking Database...</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-300 text-xs">
            {details}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Database Connected</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300 text-xs">
            {details}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">Database Error</AlertTitle>
        <AlertDescription className="text-red-600 dark:text-red-300 text-xs mb-2">
          {error || 'Failed to connect to database'}
        </AlertDescription>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={checkConnection}
          className="mt-2 h-7 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </Alert>
    </div>
  ); */
}