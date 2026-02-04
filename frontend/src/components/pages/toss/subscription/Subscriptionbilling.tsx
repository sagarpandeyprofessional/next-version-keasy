// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { API_BASE_URL } from "@/lib/apiBase";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Calendar,
  Package,
  Sparkles,
  Briefcase,
  Building2,
  RefreshCw
} from "lucide-react";

const PLAN_ICONS = {
  creator: Sparkles,
  professional: Briefcase,
  business: Building2
};

const PLAN_CONFIG = {
  creator: {
    name: 'Creator',
    monthly: 9999,
    annual: 95988
  },
  professional: {
    name: 'Professional',
    monthly: 19999,
    annual: 191988
  },
  business: {
    name: 'Business',
    monthly: 49999,
    annual: 479988
  }
};

export function SubscriptionBilling() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState('issuing');
  const [billingKeyData, setBillingKeyData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("billing");
  const customerKey = searchParams.get("customerKey");
  const authKey = searchParams.get("authKey");

  const plan = PLAN_CONFIG[planId];
  const amount = plan?.[billingCycle] || 0;

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!customerKey || !authKey || !planId || !billingCycle) {
      setStatus('error');
      setError('Missing billing information');
      return;
    }

    setupSubscription();
  }, [searchParams, user, router]);

  const setupSubscription = async () => {
    try {
      // Step 1: Issue billing key
      setStatus('issuing');
      const billingKey = await issueBillingKey();
      setBillingKeyData(billingKey);

      // Step 2: Make first payment using billing key
      setStatus('charging');
      const payment = await confirmFirstPayment(billingKey.billingKey);
      setPaymentData(payment);

      // Step 3: Record subscription in subscription_history
      await recordSubscription(payment);

      setStatus('success');
    } catch (err) {
      console.error('Subscription setup error:', err);
      setError(err.message || 'An error occurred while setting up your subscription');
      setStatus('error');
    }
  };

  // Issue billing key - NOW INCLUDES userId
  const issueBillingKey = async () => {
    const requestData = {
      customerKey: customerKey,
      authKey: authKey,
      userId: user.id // ✅ ADDED: Send userId to server for database storage
    };

    const response = await fetch(`${API_BASE_URL}/api/issue-billing-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'Failed to issue billing key');
    }

    return json;
  };

  // Make first payment using billing key
  const confirmFirstPayment = async (billingKey) => {
    const orderId = generateOrderId();
    
    const requestData = {
      customerKey: customerKey,
      amount: amount,
      orderId: orderId,
      orderName: `Keasy ${plan.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
      customerEmail: user.email,
      customerName: user.email.split('@')[0] || "Keasy User",
    };

    const response = await fetch(`${API_BASE_URL}/api/confirm-billing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || 'Payment failed');
    }

    return json;
  };

  // Record subscription in subscription_history
  const recordSubscription = async (payment) => {
    const now = new Date();
    const planStartDate = now.toISOString();
    let planEndDate;

    if (billingCycle === 'monthly') {
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      planEndDate = endDate.toISOString();
    } else if (billingCycle === 'annual') {
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);
      planEndDate = endDate.toISOString();
    }

    // Insert into subscription_history
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        user_id: user.id,
        plan: planId,
        billing_cycle: billingCycle,
        amount: amount,
        payment_key: payment.paymentKey || null,
        order_id: payment.orderId,
        status: 'completed',
        metadata: {
          billing_key: billingKeyData?.billingKey ? 'issued' : null,
          payment_method: payment.method,
          card_info: payment.card ? {
            company: payment.card.company,
            number: payment.card.number,
            type: payment.card.cardType
          } : null,
          approved_at: payment.approvedAt,
          is_first_payment: true,
          auto_renewal: true,
          plan_start_date: planStartDate,
          plan_end_date: planEndDate
        }
      });

    if (historyError) {
      console.error('Error recording subscription history:', historyError);
      throw new Error('Failed to record subscription');
    }

    // Fetch the subscription we just created
    const { data: subscriptionData, error: fetchError } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('order_id', payment.orderId)
      .single();

    if (!fetchError && subscriptionData) {
      setSubscriptionDetails({
        plan: subscriptionData.plan,
        plan_start_date: subscriptionData.metadata.plan_start_date,
        plan_end_date: subscriptionData.metadata.plan_end_date
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const PlanIcon = PLAN_ICONS[planId] || Package;

  // Loading State (Issuing or Charging)
  if (status === 'issuing' || status === 'charging') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 blur-xl bg-blue-400 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'issuing' ? 'Setting up billing...' : 'Processing payment...'}
          </h2>
          <p className="text-gray-600">
            {status === 'issuing' 
              ? 'Registering your payment method securely' 
              : 'Charging your subscription'}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Setup Failed</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/subscription/checkout?plan=${planId}&billing=${billingCycle}`)}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Subscription Activated! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to {plan.name} - Your auto-renewal is set up
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Payment Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">First Payment</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₩{amount.toLocaleString()}
                </span>
              </div>

              {paymentData?.orderId && (
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-gray-600">Order ID</span>
                  <span className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                    {paymentData.orderId.slice(0, 20)}...
                  </span>
                </div>
              )}

              {paymentData?.card && (
                <>
                  <div className="flex justify-between items-center py-3 border-t border-gray-100">
                    <span className="text-gray-600">Card</span>
                    <span className="text-gray-900 font-medium">
                      {paymentData.card.company} {paymentData.card.number}
                    </span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Auto-renewal enabled</p>
                      <p className="text-green-700">This card will be charged automatically {billingCycle === 'monthly' ? 'every month' : 'every year'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-blue-200">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <PlanIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Subscription Details</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <span className="text-sm text-gray-600 block mb-1">Plan</span>
                <span className="text-xl font-bold text-gray-900 capitalize">
                  {plan.name}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4">
                <span className="text-sm text-gray-600 block mb-1">Billing Cycle</span>
                <span className="text-xl font-bold text-gray-900 capitalize">
                  {billingCycle}
                </span>
              </div>

              {subscriptionDetails && (
                <>
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Started</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionDetails.plan_start_date)}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Next Billing</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionDetails.plan_end_date)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-charge: ₩{amount.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Features</h3>
              <p className="text-sm text-gray-600">
                Start using your premium features now
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Subscription</h3>
              <p className="text-sm text-gray-600">
                View billing or cancel anytime
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
              <p className="text-sm text-gray-600">
                We're here to help you succeed
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}

function generateOrderId() {
  return `keasy_sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
