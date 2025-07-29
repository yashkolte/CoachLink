'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { stripeApi, AccountStatusResponse } from '../../../lib/stripe';
import Link from 'next/link';

export default function OnboardingComplete() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<AccountStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                // Get account ID from URL params (you might need to store this in localStorage or session)
                const accountId = searchParams.get('accountId') || localStorage.getItem('stripeAccountId');

                if (!accountId) {
                    setError('No account ID found. Please start the onboarding process again.');
                    setLoading(false);
                    return;
                }

                const statusResponse = await stripeApi.checkAccountStatus(accountId);
                setStatus(statusResponse);

                // Store account ID for future reference
                localStorage.setItem('stripeAccountId', accountId);

            } catch (err) {
                console.error('Error checking status:', err);
                setError('Failed to check onboarding status. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        checkOnboardingStatus();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking your onboarding status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            href="/"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Start Over
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status?.onboardingComplete ? (
                    <>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CoachLink!</h1>
                        <p className="text-gray-600 mb-6">
                            Your Stripe account has been successfully set up. You can now start receiving payments from corporate clients.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                            <div className="text-sm text-gray-500">
                                <p>Account ID: {status.accountId}</p>
                                <p>Details Submitted: ✅</p>
                                <p>Payouts Enabled: {status.payoutsEnabled ? '✅' : '⏳ Pending'}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Incomplete</h1>
                        <p className="text-gray-600 mb-6">
                            It looks like your Stripe onboarding isn&apos;t complete yet. You may need to provide additional information.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/onboarding/refresh"
                                className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Complete Onboarding
                            </Link>
                            <div className="text-sm text-gray-500">
                                <p>Account ID: {status?.accountId}</p>
                                <p>Details Submitted: {status?.detailsSubmitted ? '✅' : '❌'}</p>
                                <p>Payouts Enabled: {status?.payoutsEnabled ? '✅' : '❌'}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
