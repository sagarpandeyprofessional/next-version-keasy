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
  Download,
  Calendar,
  CreditCard,
  Package,
  Sparkles,
  Briefcase,
  Building2
} from "lucide-react";

const PLAN_ICONS = {
  creator: Sparkles,
  professional: Briefcase,
  business: Building2
};

export function SubscriptionSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState('processing');
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("billing");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const paymentKey = searchParams.get("paymentKey");

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!orderId || !amount || !paymentKey) {
      setStatus('error');
      setError('Missing payment information');
      return;
    }

    confirmPayment();
  }, [searchParams, user, router]);

  const confirmPayment = async () => {
    try {
      setStatus('processing');

      // Step 1: Confirm payment with Toss Payments
      const requestData = {
        orderId: orderId,
        amount: parseInt(amount),
        paymentKey: paymentKey,
      };

      const response = await fetch(`${API_BASE_URL}/api/confirm/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const paymentResult = await response.json();

      if (!response.ok) {
        throw new Error(paymentResult.message || 'Payment confirmation failed');
      }

      setResponseData(paymentResult);

      // Step 2: Calculate subscription dates
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

      // Step 3: Record payment ONLY in subscription_history (NOT profiles)
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert({
          user_id: user.id,
          plan: planId,
          billing_cycle: billingCycle,
          amount: parseInt(amount),
          payment_key: paymentKey,
          order_id: orderId,
          status: 'completed',
          metadata: {
            payment_method: paymentResult.method,
            card_info: paymentResult.card ? {
              company: paymentResult.card.company,
              number: paymentResult.card.number,
              type: paymentResult.card.cardType
            } : null,
            approved_at: paymentResult.approvedAt,
            receipt_url: paymentResult.receipt?.url,
            plan_start_date: planStartDate,
            plan_end_date: planEndDate
          }
        });

      if (historyError) {
        console.error('Error recording subscription history:', historyError);
        throw new Error('Failed to record subscription');
      }

      // Step 4: Fetch the subscription we just created
      const { data: subscriptionData, error: fetchError } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (!fetchError && subscriptionData) {
        setSubscriptionDetails({
          plan: subscriptionData.plan,
          plan_start_date: subscriptionData.metadata.plan_start_date,
          plan_end_date: subscriptionData.metadata.plan_end_date
        });
      }

      setStatus('success');
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setError(err.message || 'An error occurred while processing your payment');
      setStatus('error');
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

  // Processing State
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 blur-xl bg-blue-400 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing your subscription</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/pricing')}
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
            Welcome to {planId.charAt(0).toUpperCase() + planId.slice(1)}!
          </h1>
          <p className="text-xl text-gray-600">
            Your subscription is now active 🎉
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Payment Summary Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-2xl font-bold text-gray-900">
                  ₩{Number(amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-gray-600">Order ID</span>
                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                  {orderId.slice(0, 20)}...
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-900 font-medium">
                  {responseData?.method === 'CARD' ? 'Credit Card' : responseData?.method}
                </span>
              </div>

              {responseData?.card && (
                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-gray-600">Card</span>
                  <span className="text-gray-900 font-medium">
                    {responseData.card.company} {responseData.card.number}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-t border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              </div>
            </div>

            {responseData?.receipt?.url && (
              <a
                href={responseData.receipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </a>
            )}
          </div>

          {/* Subscription Details Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-blue-200">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <PlanIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Subscription Info</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <span className="text-sm text-gray-600 block mb-1">Plan</span>
                <span className="text-xl font-bold text-gray-900 capitalize">
                  {planId} Plan
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
                      <span className="text-sm text-gray-600">Start Date</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionDetails.plan_start_date)}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Next Billing Date</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatDate(subscriptionDetails.plan_end_date)}
                    </span>
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
                Start using your new premium features
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Profile</h3>
              <p className="text-sm text-gray-600">
                Make the most of your subscription
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
            to={`/profile/${user?.username || user?.id}`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            View Profile
          </Link>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && responseData && (
          <div className="mt-8 bg-gray-900 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">Response Data (Dev Only)</h3>
            <pre className="text-green-400 text-xs overflow-auto">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
