'use client';

import { useState } from 'react';
import { stripeApi } from '../lib/stripe';

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
      // Step 1: Create Stripe account
      const accountResponse = await stripeApi.createAccount(formData);

      // Step 2: Generate onboarding link
      const linkResponse = await stripeApi.generateOnboardingLink({
        accountId: accountResponse.accountId
      });

      // Step 3: Redirect to Stripe onboarding
      window.location.href = linkResponse.onboardingUrl;

    } catch (err: unknown) {
      console.error('Error during signup:', err);
      let errorMessage = 'Failed to create account. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CoachLink</h1>
          <p className="text-gray-600">Connect with corporate clients as a fitness coach</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Start Your Coaching Journey
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
              {loading ? 'Creating Account...' : 'Get Started with Stripe'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              By signing up, you&apos;ll be redirected to Stripe to complete your onboarding
              and set up payment processing.
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Already have an account? Check your onboarding status in the dashboard.</p>
        </div>
      </div>
    </div>
  );
}
