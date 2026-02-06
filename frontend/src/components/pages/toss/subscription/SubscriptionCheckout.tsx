// @ts-nocheck
"use client";

import { loadTossPayments } from "@/lib/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { 
  Check, 
  Sparkles, 
  Briefcase, 
  Building2,
  Shield,
  ArrowLeft,
  Loader2,
  CreditCard,
  RefreshCw
} from 'lucide-react';

// Toss Payments configuration
const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

// Plan configurations matching Pricing.jsx
const PLAN_CONFIG = {
  creator: {
    name: 'Creator',
    icon: Sparkles,
    color: 'purple',
    monthly: 9999,
    annual: 95988, // 7999 * 12
    features: [
      'More Marketplace listings',
      'Create unlimited events',
      'Create & manage communities',
      'Better visibility on listings',
      'Extended Keasy AI'
    ]
  },
  professional: {
    name: 'Professional',
    icon: Briefcase,
    color: 'indigo',
    monthly: 19999,
    annual: 191988, // 15999 * 12
    features: [
      'Professional profile',
      'List services',
      'Accept bookings',
      'Portfolio showcase',
      'Reviews & ratings',
      'Professional-level Keasy AI'
    ]
  },
  business: {
    name: 'Business',
    icon: Building2,
    color: 'amber',
    monthly: 49999,
    annual: 479988, // 39999 * 12
    features: [
      'Business profile',
      'Fully managed Keasy website',
      'Admin dashboard',
      'Job posting & tracking',
      'Service listings & bookings',
      'Business-level Keasy AI'
    ]
  }
};

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700',
    gradient: 'from-purple-500 to-indigo-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    gradient: 'from-indigo-500 to-blue-600'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700',
    gradient: 'from-amber-500 to-orange-600'
  }
};

export function SubscriptionCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get plan and billing cycle from URL params or location state
  const planId = searchParams.get('plan') || 'creator';
  const initialBilling = searchParams.get('billing') || 'monthly';
  
  const [payment, setPayment] = useState(null);
  const [billingCycle, setBillingCycle] = useState(initialBilling);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const plan = PLAN_CONFIG[planId];
  const colors = colorClasses[plan?.color || 'purple'];

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/signin?redirect=/subscription/checkout?plan=' + planId);
    }
  }, [user, router, planId]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  // Initialize Toss Payments
  useEffect(() => {
    async function fetchPayment() {
      if (!user) return;
      
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const paymentInstance = tossPayments.payment({
          customerKey: user.id, // Use user ID as customer key for billing
        });
        setPayment(paymentInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading payment:", error);
        setIsLoading(false);
      }
    }

    fetchPayment();
  }, [user]);

  // Calculate pricing
  const amount = plan[billingCycle];
  const savingsPercent = billingCycle === 'annual' 
    ? Math.round((1 - (plan.annual / 12) / plan.monthly) * 100)
    : 0;
  const monthlyEquivalent = billingCycle === 'annual' 
    ? Math.round(plan.annual / 12)
    : plan.monthly;

  // Request billing authorization (billing key)
  const handleRequestBillingAuth = async () => {
    if (!payment || !user) return;
    
    setIsProcessing(true);
    
    try {
      await payment.requestBillingAuth({
        method: "CARD", // Billing key only supports card payments
        successUrl: window.location.origin + `/subscription/billing?plan=${planId}&billing=${billingCycle}`,
        failUrl: window.location.origin + "/toss/fail",
        customerEmail: userProfile?.email || user.email,
        customerName: userProfile?.full_name || userProfile?.username || "Keasy User",
      });
    } catch (error) {
      console.error("Billing auth request failed:", error);
      setIsProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h2>
          <button
            onClick={() => router.push('/pricing')}
            className="text-blue-600 hover:text-blue-700"
          >
            Return to pricing
          </button>
        </div>
      </div>
    );
  }

  const PlanIcon = plan.icon;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 px-3">
      <div className="max-w-4xl mx-auto text-[0.85rem]">
        {/* Back Button */}
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to pricing</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          {/* Left Column - Plan Summary */}
          <div className={`${colors.bg} ${colors.border} border-2 rounded-3xl p-4 h-full min-h-[720px] flex flex-col`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-2 ${colors.button} rounded-2xl`}>
                <PlanIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-600">Recurring Subscription</p>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? `${colors.button} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all relative ${
                    billingCycle === 'annual'
                      ? `${colors.button} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annual
                  {savingsPercent > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      -{savingsPercent}%
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Pricing Display */}
            <div className="bg-white rounded-xl p-3 mb-4">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {billingCycle === 'monthly' ? 'Monthly price' : 'Annual price'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₩{amount.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>
              </div>
              
              {billingCycle === 'annual' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Equivalent monthly</span>
                    <span className="font-semibold text-gray-900">
                      ₩{monthlyEquivalent.toLocaleString()}/month
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-green-600 font-medium">You save</span>
                    <span className="font-semibold text-green-600">
                      ₩{((plan.monthly * 12) - plan.annual).toLocaleString()}/year
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 mb-1.5">What's included:</h3>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className={`w-3.5 h-3.5 ${colors.text} flex-shrink-0 mt-0.5`} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Auto-renewal Notice */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                <RefreshCw className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">Auto-renewal subscription</p>
                  <p className="text-blue-700">
                    Your card will be charged automatically {billingCycle === 'monthly' ? 'every month' : 'every year'}. 
                    Cancel anytime from your account settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Secure payment powered by Toss Payments</span>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Setup */}
          <div className="bg-white rounded-3xl shadow-xl p-4 h-full min-h-[720px] flex flex-col">
            <h2 className="text-base font-bold text-gray-900 mb-3">Set up your subscription</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading payment system...</p>
              </div>
            ) : (
              <>
                {/* User Info Summary */}
                {userProfile && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">
                          {userProfile.full_name || userProfile.username || 'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">
                          {userProfile.email || user.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Plan:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {userProfile.plan || 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">How billing works</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>1. Register your card for automatic payments</p>
                        <p>2. First payment charges immediately</p>
                        <p>3. Future payments auto-charge {billingCycle === 'monthly' ? 'monthly' : 'annually'}</p>
                        <p>4. Cancel anytime - no commitments</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Summary */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Subscription Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Plan:</span>
                      <span className="font-semibold text-gray-900">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Billing:</span>
                      <span className="font-semibold text-gray-900 capitalize">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">First payment:</span>
                      <span className="font-semibold text-gray-900">Today</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-blue-200">
                      <span className="text-gray-700 font-medium">Amount Due Today:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        ₩{amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Setup Billing Button */}
                <button
                  onClick={handleRequestBillingAuth}
                  disabled={isProcessing || !payment}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-white text-xs shadow-lg transition-all ${
                    isProcessing || !payment
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${colors.button} hover:shadow-xl transform hover:scale-[1.02]`
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Set up subscription & Pay ₩${amount.toLocaleString()}`
                  )}
                </button>

                <div className="mt-auto pt-3">
                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our{' '}
                  <a href="/legal/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{', '}
                  <a href="/legal/membership" className="text-blue-600 hover:underline">
                    Membership Terms of Service
                  </a>{', '}
                  and{' '}
                  <a href="/legal/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  . Your subscription will auto-renew {billingCycle === 'monthly' ? 'monthly' : 'annually'}. 
                  You can cancel anytime from your account settings.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
