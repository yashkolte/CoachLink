'use client';

import { useEffect, useState } from 'react';
import { stripeApi, AccountStatusResponse } from '../../lib/stripe';
import Link from 'next/link';
import { BackgroundBeams } from '../../components/ui/background-beams';
import { TextGenerateEffect } from '../../components/ui/text-generate-effect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, CreditCard, Target, Loader2, ExternalLink } from 'lucide-react';

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
            <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
                <BackgroundBeams className="absolute inset-0" />
                <div className="text-center relative z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <TextGenerateEffect
                        words="Loading your dashboard..."
                        className="text-xl text-gray-300"
                    />
                </div>
            </div>
        );
    }

    if (error && !status) {
        return (
            <div className="min-h-screen bg-black relative flex items-center justify-center p-4">
                <BackgroundBeams className="absolute inset-0" />
                <Card className="max-w-md w-full bg-black/50 border-gray-800 backdrop-blur-sm relative z-10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            Account Not Found
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                            <Link href="/">
                                Get Started
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative pt-16">
            <BackgroundBeams className="absolute inset-0" />

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <Card className="bg-black/50 text-white border-gray-800 backdrop-blur-sm mb-6">
                        <CardHeader>
                            <TextGenerateEffect
                                words="Coach Dashboard"
                                className="text-3xl font-bold text-white"
                            />
                            <CardDescription className="text-gray-400">
                                Manage your CoachLink account and payments
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Account Status Card */}
                    <Card className="bg-black/50 border-gray-800 backdrop-blur-sm mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">
                                Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {status && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                                        <div className="mb-3">
                                            {status.detailsSubmitted ? (
                                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                                            ) : (
                                                <XCircle className="w-8 h-8 text-red-400 mx-auto" />
                                            )}
                                        </div>
                                        <h3 className="font-medium text-white mb-2">Details Submitted</h3>
                                        <Badge
                                            className={status.detailsSubmitted
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }
                                        >
                                            {status.detailsSubmitted ? 'Complete' : 'Incomplete'}
                                        </Badge>
                                    </div>

                                    <div className="text-center p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                                        <div className="mb-3">
                                            {status.payoutsEnabled ? (
                                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                                            ) : (
                                                <Clock className="w-8 h-8 text-yellow-400 mx-auto" />
                                            )}
                                        </div>
                                        <h3 className="font-medium text-white mb-2">Payouts Enabled</h3>
                                        <Badge
                                            className={status.payoutsEnabled
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }
                                        >
                                            {status.payoutsEnabled ? 'Active' : 'Pending'}
                                        </Badge>
                                    </div>

                                    <div className="text-center p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                                        <div className="mb-3">
                                            {status.onboardingComplete ? (
                                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                                            ) : (
                                                <Clock className="w-8 h-8 text-orange-400 mx-auto" />
                                            )}
                                        </div>
                                        <h3 className="font-medium text-white mb-2">Onboarding</h3>
                                        <Badge
                                            className={status.onboardingComplete
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-orange-500/20 text-orange-400"
                                            }
                                        >
                                            {status.onboardingComplete ? 'Complete' : 'In Progress'}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <Alert className="mt-4 border-red-500/20 bg-red-500/10">
                                    <AlertDescription className="text-red-300">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card className="bg-black/50 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {status?.onboardingComplete ? (
                                    <div className="p-6 border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 rounded-lg text-center transition-colors bg-blue-500/5 hover:bg-blue-500/10">
                                        <CreditCard className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                        <h3 className="font-medium text-white mb-2">
                                            Open Stripe Dashboard
                                        </h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Manage your payments, view transactions, and update banking details
                                        </p>
                                        <Button
                                            onClick={handleOpenDashboard}
                                            disabled={loadingDashboard}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            {loadingDashboard ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    Opening...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Open Dashboard
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-6 border-2 border-dashed border-orange-500/30 hover:border-orange-500/60 rounded-lg text-center transition-colors bg-orange-500/5 hover:bg-orange-500/10">
                                        <CreditCard className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                                        <h3 className="font-medium text-white mb-2">Complete Onboarding</h3>
                                        <p className="text-sm text-gray-400 mb-4">
                                            Finish setting up your account to start receiving payments
                                        </p>
                                        <Button asChild className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                                            <Link href="/onboarding/refresh">
                                                Complete Setup
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                <div className="p-6 border-2 border-dashed border-gray-500/30 rounded-lg text-center bg-gray-500/5">
                                    <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <h3 className="font-medium text-white mb-2">Find Clients</h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Browse available corporate wellness programs
                                    </p>
                                    <Badge className="bg-gray-600/20 text-gray-400">
                                        Coming Soon
                                    </Badge>
                                </div>
                            </div>

                            {/* Account Info */}
                            {status && (
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <h3 className="text-lg font-medium text-white mb-3">Account Information</h3>
                                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-300">Account ID:</span>
                                                <div className="mt-1">
                                                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 font-mono text-xs">
                                                        {status.accountId}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-300">Status:</span>
                                                <div className="mt-1">
                                                    <Badge className={status.onboardingComplete
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                    }>
                                                        {status.onboardingComplete ? 'Active' : 'Setup Required'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}