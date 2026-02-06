"use client";

type TossPaymentsFactory = (clientKey: string) => any;

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

const SDK_URL = "https://js.tosspayments.com/v2/standard";
let loadPromise: Promise<TossPaymentsFactory> | null = null;

export const ANONYMOUS = "ANONYMOUS";

export async function loadTossPayments(clientKey: string) {
  if (typeof window === "undefined") {
    throw new Error("TossPayments SDK can only be loaded in the browser");
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      if (window.TossPayments) {
        resolve(window.TossPayments);
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => {
        if (window.TossPayments) {
          resolve(window.TossPayments);
        } else {
          reject(new Error("TossPayments SDK loaded but global was not found"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load TossPayments SDK"));
      document.head.appendChild(script);
    });
  }

  const factory = await loadPromise;
  return factory(clientKey);
}
