const buildCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const jsonResponse = (statusCode, body, corsHeaders) => ({
  statusCode,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const parseBody = (event) => {
  if (!event?.body) return { ok: true, data: {} };
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf-8")
      : event.body;
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
};

const normalizePath = (event) => {
  const rawPath = event?.requestContext?.http?.path || event?.path || "";
  if (rawPath.length > 1 && rawPath.endsWith("/")) {
    return rawPath.slice(0, -1);
  }
  return rawPath;
};

const getMissingFields = (payload, fields) =>
  fields.filter((field) => payload?.[field] === undefined || payload?.[field] === null || payload?.[field] === "");

const normalizeAmount = (amount) => {
  if (amount === undefined || amount === null || amount === "") return amount;
  if (typeof amount === "number") return amount;
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? parsed : amount;
};

const tossRequest = async ({ path, body }) => {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return {
      ok: false,
      status: 500,
      data: { error: "Missing TOSS_SECRET_KEY environment variable." },
    };
  }

  const baseUrl = process.env.TOSS_API_BASE_URL || "https://api.tosspayments.com";
  const authorization = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

const handleConfirmPayment = async (payload, corsHeaders) => {
  const missing = getMissingFields(payload, ["paymentKey", "orderId", "amount"]);
  if (missing.length) {
    return jsonResponse(400, { error: "Missing required fields", fields: missing }, corsHeaders);
  }

  const body = {
    paymentKey: payload.paymentKey,
    orderId: payload.orderId,
    amount: normalizeAmount(payload.amount),
  };

  const result = await tossRequest({ path: "/v1/payments/confirm", body });
  return jsonResponse(result.status, result.data, corsHeaders);
};

const handleConfirmBrandpay = async (payload, corsHeaders) => {
  const missing = getMissingFields(payload, ["paymentKey", "orderId", "amount", "customerKey"]);
  if (missing.length) {
    return jsonResponse(400, { error: "Missing required fields", fields: missing }, corsHeaders);
  }

  const body = {
    paymentKey: payload.paymentKey,
    orderId: payload.orderId,
    amount: normalizeAmount(payload.amount),
    customerKey: payload.customerKey,
  };

  const result = await tossRequest({ path: "/v1/brandpay/payments/confirm", body });
  return jsonResponse(result.status, result.data, corsHeaders);
};

const handleIssueBillingKey = async (payload, corsHeaders) => {
  const missing = getMissingFields(payload, ["customerKey", "authKey"]);
  if (missing.length) {
    return jsonResponse(400, { error: "Missing required fields", fields: missing }, corsHeaders);
  }

  const body = {
    customerKey: payload.customerKey,
    authKey: payload.authKey,
  };

  const result = await tossRequest({ path: "/v1/billing/authorizations/issue", body });
  return jsonResponse(result.status, result.data, corsHeaders);
};

const handleConfirmBilling = async (payload, corsHeaders) => {
  const missing = getMissingFields(payload, ["billingKey", "customerKey", "amount", "orderId", "orderName"]);
  if (missing.length) {
    return jsonResponse(400, { error: "Missing required fields", fields: missing }, corsHeaders);
  }

  const { billingKey, ...rest } = payload;
  const body = {
    ...rest,
    amount: normalizeAmount(rest.amount),
  };

  const result = await tossRequest({ path: `/v1/billing/${billingKey}`, body });
  return jsonResponse(result.status, result.data, corsHeaders);
};

const handleKeasyChat = async (corsHeaders) =>
  jsonResponse(
    501,
    { error: "Keasy chat endpoint is not configured. Configure a server-side provider first." },
    corsHeaders
  );

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || event?.httpMethod;
  const origin = event?.headers?.origin || event?.headers?.Origin;
  const corsHeaders = buildCorsHeaders(origin);

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  if (method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, corsHeaders);
  }

  const parsed = parseBody(event);
  if (!parsed.ok) {
    return jsonResponse(400, { error: "Invalid JSON body" }, corsHeaders);
  }

  const path = normalizePath(event);
  const payload = parsed.data || {};

  try {
    switch (path) {
      case "/api/confirm/payment":
      case "/api/confirm/widget":
        return await handleConfirmPayment(payload, corsHeaders);
      case "/api/confirm/brandpay":
        return await handleConfirmBrandpay(payload, corsHeaders);
      case "/api/issue-billing-key":
        return await handleIssueBillingKey(payload, corsHeaders);
      case "/api/confirm-billing":
        return await handleConfirmBilling(payload, corsHeaders);
      case "/api/keasy/chat":
        return await handleKeasyChat(corsHeaders);
      default:
        return jsonResponse(404, { error: "Not found" }, corsHeaders);
    }
  } catch (error) {
    console.error("Keasy API error", error);
    return jsonResponse(500, { error: "Internal server error" }, corsHeaders);
  }
};
