'use client';

import { useEffect, useState } from 'react';
import { stripeApi, AccountStatusResponse } from '../../lib/stripe';
import Link from 'next/link';

export default function Dashboard() {
    const [status, setStatus] = useState<AccountStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loadingDashboard, setLoadingDashboard] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const accountId = localStorage.getItem('stripeAccountId');

                if (!accountId) {
                    setError('No account found. Please complete the onboarding process first.');
                    setLoading(false);
                    return;
                }

                const statusResponse = await stripeApi.checkAccountStatus(accountId);
                setStatus(statusResponse);

            } catch (err) {
                console.error('Error checking status:', err);
                setError('Failed to load account status. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    const handleOpenDashboard = async () => {
        if (!status?.accountId) return;

        setLoadingDashboard(true);
        try {
            const response = await stripeApi.getDashboardLink(status.accountId);
            // Open in new tab
            window.open(response.dashboardUrl, '_blank');
        } catch (err) {
            console.error('Error getting dashboard link:', err);
            setError('Failed to open Stripe dashboard. Please try again.');
        } finally {
            setLoadingDashboard(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error && !status) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Found</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            href="/"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
                        <p className="text-gray-600">Manage your CoachLink account and payments</p>
                    </div>

                    {/* Account Status Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Status</h2>

                        {status && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className={`text-2xl mb-2 ${status.detailsSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                                        {status.detailsSubmitted ? '✅' : '❌'}
                                    </div>
                                    <h3 className="font-medium text-gray-900">Details Submitted</h3>
                                    <p className="text-sm text-gray-600">
                                        {status.detailsSubmitted ? 'Complete' : 'Incomplete'}
                                    </p>
                                </div>

                                <div className="text-center p-4 border rounded-lg">
                                    <div className={`text-2xl mb-2 ${status.payoutsEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {status.payoutsEnabled ? '✅' : '⏳'}
                                    </div>
                                    <h3 className="font-medium text-gray-900">Payouts Enabled</h3>
                                    <p className="text-sm text-gray-600">
                                        {status.payoutsEnabled ? 'Active' : 'Pending'}
                                    </p>
                                </div>

                                <div className="text-center p-4 border rounded-lg">
                                    <div className={`text-2xl mb-2 ${status.onboardingComplete ? 'text-green-600' : 'text-orange-600'}`}>
                                        {status.onboardingComplete ? '✅' : '⚠️'}
                                    </div>
                                    <h3 className="font-medium text-gray-900">Onboarding</h3>
                                    <p className="text-sm text-gray-600">
                                        {status.onboardingComplete ? 'Complete' : 'In Progress'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {status?.onboardingComplete ? (
                                <button
                                    onClick={handleOpenDashboard}
                                    disabled={loadingDashboard}
                                    className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${loadingDashboard
                                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                            : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">💳</div>
                                    <h3 className="font-medium text-gray-900 mb-1">
                                        {loadingDashboard ? 'Opening...' : 'Open Stripe Dashboard'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Manage your payments, view transactions, and update banking details
                                    </p>
                                </button>
                            ) : (
                                <Link
                                    href="/onboarding/refresh"
                                    className="p-4 border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 rounded-lg text-center transition-colors"
                                >
                                    <div className="text-2xl mb-2">🚀</div>
                                    <h3 className="font-medium text-gray-900 mb-1">Complete Onboarding</h3>
                                    <p className="text-sm text-gray-600">
                                        Finish setting up your account to start receiving payments
                                    </p>
                                </Link>
                            )}

                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                <div className="text-2xl mb-2">🎯</div>
                                <h3 className="font-medium text-gray-900 mb-1">Find Clients</h3>
                                <p className="text-sm text-gray-600">
                                    Browse available corporate wellness programs (Coming Soon)
                                </p>
                            </div>
                        </div>

                        {/* Account Info */}
                        {status && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Account Information</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Account ID:</span>
                                            <span className="ml-2 text-gray-600 font-mono">{status.accountId}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Status:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${status.onboardingComplete
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {status.onboardingComplete ? 'Active' : 'Setup Required'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}