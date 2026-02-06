// @ts-nocheck
"use client";

import { loadTossPayments, ANONYMOUS } from "@/lib/tosspayments-sdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// TODO: Replace clientKey with the Client Key from the Developer Center’s Payment Widget Integration section.
// TODO: Also replace secretKey in server.js with the Secret Key from the individual API integration section, not the widget integration key.
// TODO: Load the buyer's unique ID and set it as customerKey. Values that can be inferred like email or phone numbers are unsafe.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = generateRandomString();

export function WidgetCheckoutPage() {
  const router = useRouter();

  const [amount, setAmount] = useState({
    currency: "KRW",
    value: 1000,
  });
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // Member payment
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentswidgets
        const widgets = tossPayments.widgets({
          customerKey,
        });

        // Non-member payment
        // const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });

        setWidgets(widgets);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    }

    fetchPaymentWidgets();
  }, [clientKey, customerKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }

      // ------ Set the payment amount for the order sheet ------
      // TODO: Initialize the widget's payment amount with the actual amount to charge.
      // TODO: This must be executed before renderPaymentMethods, renderAgreement, and requestPayment.
      // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
      await widgets.setAmount(amount);

      await Promise.all([
        // ------ Render the payment UI ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          // variantKey for the payment UI you want to render
          // If you want to create a customized multi-UI setup with different payment methods or styles, a contract is required.
          // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
          variantKey: "DEFAULT",
        }),

        // ------ Render the terms of service UI ------
        // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderagreement
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div className="wrapper pb-20">
      <div className="flex justify-center items-center pt-10">
        <h1 className="text-red-600 text-center">
          This Page is for Testing Only, not Available for Production, yet!
        </h1>
      </div>
      <div className="box_section">
        {/* Payment UI */}
        <div id="payment-method" />
        {/* Terms of service UI */}
        <div id="agreement" />
        {/* Coupon checkbox */}
        <div style={{ paddingLeft: "30px" }}>
          <div className="checkable typography--p">
            <label htmlFor="coupon-box" className="checkable__label typography--regular">
              <input
                id="coupon-box"
                className="checkable__input"
                type="checkbox"
                aria-checked="true"
                disabled={!ready}
                // ------ Update payment amount when the order amount changes ------
                // @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
                onChange={async (event) => {
                  if (event.target.checked) {
                    await widgets.setAmount({
                      currency: amount.currency,
                      value: amount.value - 5000,
                    });
                    return;
                  }

                  await widgets.setAmount({
                    currency: amount.currency,
                    value: amount.value,
                  });
                }}
              />
              <span className="checkable__label-text">Apply 5,000 KRW coupon</span>
            </label>
          </div>
        </div>

        {/* Pay button */}
        <button
          className="button"
          style={{ marginTop: "30px" }}
          disabled={!ready}
          // ------ Open payment window when clicking 'Pay' ------
          // @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
          onClick={async () => {
            try {
              // Before requesting payment, store orderId and amount on the server.
              // This helps verify if the payment amount was maliciously altered during the payment process.
              await widgets.requestPayment({
                orderId: generateRandomString(), // Unique order number
                orderName: "Toss T-shirt and 2 other items",
                successUrl: window.location.origin + "/toss/widget/success", // Redirect URL on success
                failUrl: window.location.origin + "/toss/fail", // Redirect URL on failure
                customerEmail: "customer123@gmail.com",
                customerName: "Kim Toss",
                // Used for virtual account notifications or auto-filling phone number for quick bank transfer.
                // Uncomment if needed:
                // customerMobilePhone: "01012341234",
              });
            } catch (error) {
              // Handle errors
              console.error(error);
            }
          }}
        >
          Pay Now
        </button>
      </div>

      <div
        className="box_section"
        style={{
          padding: "40px 30px 50px 30px",
          marginTop: "30px",
          marginBottom: "50px",
        }}
      >
        <button
          className="button"
          style={{ marginTop: "30px" }}
          onClick={() => {
            router.push("/toss/brandpay/checkout");
          }}
        >
          Integrate BrandPay only (without widget)
        </button>

        <button
          className="button"
          style={{ marginTop: "30px" }}
          onClick={() => {
            router.push("/toss/payment/checkout");
          }}
        >
          Integrate payment page only (without widget)
        </button>
      </div>
    </div>
  );
}

function generateRandomString() {
  return window.btoa(Math.random().toString()).slice(0, 20);
}
