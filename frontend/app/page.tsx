'use client';

import { useState } from 'react';
import { stripeApi } from '../lib/stripe';
import { getErrorMessage } from '../lib/utils';
import { BackgroundBeams } from '../components/ui/background-beams';
import { TextGenerateEffect } from '../components/ui/text-generate-effect';
import { Highlight } from '../components/ui/highlight';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

export default function Home() {
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Check if email is already registered
      const emailCheck = await stripeApi.checkEmailRegistration(formData.email);

      if (emailCheck.isRegistered) {
        // User already exists - check onboarding status
        if (emailCheck.status === 'complete') {
          // Redirect to dashboard if onboarding is complete
          setSuccess(`Welcome back, ${emailCheck.name || 'Coach'}! Redirecting to your dashboard...`);

          // Generate dashboard link and redirect
          const dashboardResponse = await stripeApi.getDashboardLink(emailCheck.accountId!);

          setTimeout(() => {
            window.location.href = dashboardResponse.dashboardUrl;
          }, 2000);

          return;
        } else if (emailCheck.status === 'incomplete') {
          // Continue onboarding if incomplete
          setSuccess(`Welcome back, ${emailCheck.name || 'Coach'}! Continuing your onboarding...`);

          // Generate onboarding link and redirect
          const linkResponse = await stripeApi.generateOnboardingLink({
            accountId: emailCheck.accountId!
          });

          setTimeout(() => {
            window.location.href = linkResponse.onboardingUrl;
          }, 2000);

          return;
        }
      }

      // Step 2: Create new Stripe account for new users
      const accountResponse = await stripeApi.createAccount(formData);

      // Step 3: Generate onboarding link
      const linkResponse = await stripeApi.generateOnboardingLink({
        accountId: accountResponse.accountId
      });

      // Step 4: Redirect to Stripe onboarding
      window.location.href = linkResponse.onboardingUrl;

    } catch (err: unknown) {
      console.error('Error during signup:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
      <BackgroundBeams className="absolute inset-0" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <TextGenerateEffect
            words="CoachLink"
            className="text-6xl font-bold text-white"
          />
          <p className="text-gray-300 text-lg">
            Connect with <Highlight>corporate clients</Highlight> as a fitness coach
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              Stripe Powered
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              Secure
            </Badge>
          </div>
        </div>

        <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-white">
              Start Your Coaching Journey
            </CardTitle>
            <CardDescription className="text-gray-400">
              Join the marketplace and start earning with corporate clients
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                  placeholder="Enter your email address"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-12"
              >
                {loading ? 'Checking Account...' : 'Continue with Stripe'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
              <p>
                By signing up, you&apos;ll be redirected to Stripe to complete your onboarding
                and set up payment processing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
