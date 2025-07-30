'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { stripeApi, AccountStatusResponse } from '../../../lib/stripe';
import Link from 'next/link';
import { BackgroundBeams } from '../../../components/ui/background-beams';
import { TextGenerateEffect } from '../../../components/ui/text-generate-effect';
import { SparklesCore } from '../../../components/ui/sparkles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function OnboardingComplete() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<AccountStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                // Try to get account ID from URL params first, then localStorage
                let accountId = searchParams.get('accountId');

                if (!accountId) {
                    accountId = localStorage.getItem('stripeAccountId');
                }

                if (!accountId) {
                    setError('No account ID found. Please start the onboarding process again.');
                    setLoading(false);
                    return;
                }

                console.log('Checking status for account:', accountId);

                const statusResponse = await stripeApi.checkAccountStatus(accountId);
                setStatus(statusResponse);

                // Store account ID for future reference
                localStorage.setItem('stripeAccountId', accountId);

                // If onboarding is complete, you might want to clear the stored account ID
                // or redirect to dashboard
                if (statusResponse.onboardingComplete) {
                    console.log('Onboarding completed successfully!');
                }

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
            <div className="min-h-screen bg-black relative flex items-center justify-center">
                <BackgroundBeams className="absolute inset-0" />
                <div className="text-center relative z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <TextGenerateEffect
                        words="Checking your onboarding status..."
                        className="text-xl text-gray-300"
                    />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black relative flex items-center justify-center p-4">
                <BackgroundBeams className="absolute inset-0" />
                <Card className="max-w-md w-full bg-black/50 border-gray-800 backdrop-blur-sm relative z-10">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            Oops! Something went wrong
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                            <Link href="/">
                                Start Over
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative flex items-center justify-center p-4">
            <BackgroundBeams className="absolute inset-0" />

            {/* Sparkle effect for celebration */}
            {status?.onboardingComplete && (
                <div className="absolute inset-0 w-full h-full">
                    <SparklesCore
                        background="transparent"
                        minSize={0.6}
                        maxSize={1.4}
                        particleDensity={100}
                        className="w-full h-full"
                        particleColor="#FFFFFF"
                    />
                </div>
            )}

            <Card className="max-w-md w-full bg-black/50 border-gray-800 backdrop-blur-sm relative z-10">
                {status?.onboardingComplete ? (
                    <>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <TextGenerateEffect
                                words="Welcome to CoachLink!"
                                className="text-2xl font-bold text-white"
                            />
                            <CardDescription className="text-gray-400 mt-4">
                                Your Stripe account has been successfully set up. You can now start receiving payments from corporate clients.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Button asChild className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                                <Link href="/dashboard">
                                    Go to Dashboard
                                </Link>
                            </Button>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Account ID:</span>
                                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                        {status.accountId}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Details Submitted:</span>
                                    <Badge className="bg-green-500/20 text-green-400">
                                        ✅ Complete
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Payouts Enabled:</span>
                                    <Badge className={status.payoutsEnabled ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                                        {status.payoutsEnabled ? '✅ Enabled' : '⏳ Pending'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-yellow-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Onboarding Incomplete
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                It looks like your Stripe onboarding isn&apos;t complete yet. You may need to provide additional information.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <Button asChild className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                                <Link href="/onboarding/refresh">
                                    Complete Onboarding
                                </Link>
                            </Button>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Account ID:</span>
                                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                        {status?.accountId}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Details Submitted:</span>
                                    <Badge className={status?.detailsSubmitted ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                                        {status?.detailsSubmitted ? '✅ Complete' : '❌ Incomplete'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Payouts Enabled:</span>
                                    <Badge className={status?.payoutsEnabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                                        {status?.payoutsEnabled ? '✅ Enabled' : '❌ Disabled'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
