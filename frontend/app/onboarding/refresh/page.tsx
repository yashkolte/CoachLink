'use client';

import { useState } from 'react';
import { stripeApi } from '../../../lib/stripe';
import Link from 'next/link';

export default function OnboardingRefresh() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRetryOnboarding = async () => {
        setLoading(true);
        setError('');

        try {
            const accountId = localStorage.getItem('stripeAccountId');

            if (!accountId) {
                setError('No account ID found. Please start the sign-up process again.');
                setLoading(false);
                return;
            }

            // Generate new onboarding link
            const response = await stripeApi.generateOnboardingLink({ accountId });

            // Redirect to new onboarding URL
            window.location.href = response.onboardingUrl;

        } catch (err: unknown) {
            console.error('Error generating onboarding link:', err);
            let errorMessage = 'Failed to generate onboarding link. Please try again.';
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
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h1>
                <p className="text-gray-600 mb-6">
                    Your onboarding session has expired. Don&apos;t worry - your progress has been saved.
                    Click the button below to continue where you left off.
                </p>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleRetryOnboarding}
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md text-white font-medium ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                    >
                        {loading ? 'Generating Link...' : 'Continue Onboarding'}
                    </button>

                    <Link
                        href="/"
                        className="block w-full py-3 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Start Over
                    </Link>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    <p>
                        If you continue to experience issues, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}
