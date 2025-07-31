'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { stripeApi } from '../../lib/stripe';
import { getErrorMessage } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, UserPlus, CreditCard, ExternalLink } from 'lucide-react';

type OnboardingStep = 'signup' | 'creating' | 'onboarding' | 'complete' | 'dashboard';

interface CoachData {
  id: string;
  accountId: string;
  email: string;
  name: string;
  status: string;
}

export default function CoachOnboarding() {
  const [step, setStep] = useState<OnboardingStep>('signup');
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboardUrl, setDashboardUrl] = useState('');

  const searchParams = useSearchParams();

  // Handle return from Stripe onboarding
  useEffect(() => {
    const returnFromStripe = searchParams.get('return');
    const accountId = searchParams.get('account_id');
    
    if (returnFromStripe === 'true' && accountId) {
      handleOnboardingReturn(accountId);
    }
  }, [searchParams]);

  const handleOnboardingReturn = async (accountId: string) => {
    setLoading(true);
    try {
      // Check account status after return from Stripe
      const statusResponse = await stripeApi.checkAccountStatus(accountId);
      
      if (statusResponse.onboardingComplete) {
        setStep('complete');
        setCoachData(prev => prev ? { ...prev, status: 'complete' } : null);
        
        // Generate dashboard link
        const dashboardResponse = await stripeApi.getDashboardLink(accountId);
        setDashboardUrl(dashboardResponse.dashboardUrl);
        setStep('dashboard');
      } else {
        setError('Onboarding not complete. Please complete all required information.');
        setStep('onboarding');
      }
    } catch (err) {
      setError('Failed to verify onboarding status: ' + getErrorMessage(err));
      setStep('onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Step 1: Check if email is already registered
      const emailCheck = await stripeApi.checkEmailRegistration(formData.email);
      
      if (emailCheck.isRegistered) {
        // Existing coach
        setCoachData({
          id: emailCheck.accountId || '',
          accountId: emailCheck.accountId || '',
          email: formData.email,
          name: emailCheck.name || '',
          status: emailCheck.status || ''
        });

        if (emailCheck.status === 'complete') {
          // Already onboarded - go to dashboard
          const dashboardResponse = await stripeApi.getDashboardLink(emailCheck.accountId!);
          setDashboardUrl(dashboardResponse.dashboardUrl);
          setStep('dashboard');
        } else {
          // Need to complete onboarding
          setStep('onboarding');
        }
      } else {
        // New coach - need name for account creation
        if (!formData.name.trim()) {
          setError('Please enter your name to create a new account');
          return;
        }
        await createNewAccount();
      }
    } catch (err) {
      setError('Failed to check email: ' + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const createNewAccount = async () => {
    setStep('creating');
    
    try {
      // Step 2: Create Stripe Express account
      const accountResponse = await stripeApi.createAccount({
        email: formData.email,
        name: formData.name
      });

      setCoachData({
        id: accountResponse.id || '',
        accountId: accountResponse.accountId || '',
        email: formData.email,
        name: formData.name,
        status: accountResponse.status || 'incomplete'
      });

      setStep('onboarding');
    } catch (err) {
      setError('Failed to create account: ' + getErrorMessage(err));
      setStep('signup');
    }
  };

  const startOnboarding = async () => {
    if (!coachData?.accountId) return;
    
    setLoading(true);
    try {
      // Step 3: Generate onboarding link
      const onboardingResponse = await stripeApi.generateOnboardingLink({
        accountId: coachData.accountId
      });
      
      // Redirect to Stripe onboarding
      window.location.href = onboardingResponse.onboardingUrl;
    } catch (err) {
      setError('Failed to start onboarding: ' + getErrorMessage(err));
      setLoading(false);
    }
  };

  const openDashboard = () => {
    if (dashboardUrl) {
      window.open(dashboardUrl, '_blank');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-4">
      <div className={`flex items-center ${step === 'signup' || step === 'creating' ? 'text-blue-600' : 'text-green-600'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === 'signup' || step === 'creating' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-green-100'
        }`}>
          {step === 'signup' || step === 'creating' ? <UserPlus size={16} /> : <CheckCircle size={16} />}
        </div>
        <span className="ml-2 text-sm font-medium">Sign Up</span>
      </div>
      
      <div className={`w-8 h-1 ${step === 'onboarding' || step === 'complete' || step === 'dashboard' ? 'bg-green-300' : 'bg-gray-300'}`} />
      
      <div className={`flex items-center ${step === 'onboarding' ? 'text-blue-600' : step === 'complete' || step === 'dashboard' ? 'text-green-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === 'onboarding' ? 'bg-blue-100 border-2 border-blue-600' : 
          step === 'complete' || step === 'dashboard' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {step === 'complete' || step === 'dashboard' ? <CheckCircle size={16} /> : <CreditCard size={16} />}
        </div>
        <span className="ml-2 text-sm font-medium">Setup Payments</span>
      </div>
      
      <div className={`w-8 h-1 ${step === 'dashboard' ? 'bg-green-300' : 'bg-gray-300'}`} />
      
      <div className={`flex items-center ${step === 'dashboard' ? 'text-green-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === 'dashboard' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <ExternalLink size={16} />
        </div>
        <span className="ml-2 text-sm font-medium">Dashboard</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CoachLink</h1>
          <p className="text-gray-600">Join our marketplace for fitness coaches</p>
        </div>

        {renderStepIndicator()}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {step === 'signup' && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Enter your details to create your coach account or sign in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="coach@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name (required for new accounts)"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Checking...' : 'Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'creating' && (
          <Card>
            <CardHeader>
              <CardTitle>Creating Your Account</CardTitle>
              <CardDescription>
                Setting up your Stripe Express account for payments...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'onboarding' && coachData && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Setup</CardTitle>
              <CardDescription>
                Set up your payment account with Stripe to start receiving payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Account created for:</strong> {coachData.email}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  You'll be redirected to Stripe to complete your payment setup
                </p>
              </div>
              <Button onClick={startOnboarding} className="w-full" disabled={loading}>
                {loading ? 'Redirecting...' : 'Complete Payment Setup'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Setup Complete!</CardTitle>
              <CardDescription>
                Your payment account has been successfully configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Generating your dashboard access...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'dashboard' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Welcome to CoachLink!</CardTitle>
              <CardDescription>
                Your account is ready. Access your dashboard to manage your coaching business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Payment account configured<br />
                  ✅ Ready to receive payments<br />
                  ✅ Dashboard access available
                </p>
              </div>
              <Button onClick={openDashboard} className="w-full bg-green-600 hover:bg-green-700">
                Open Stripe Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
