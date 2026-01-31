const buildCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const parsed = parseBody(event);
  if (!parsed.ok) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  try {
    const { processKeasyMessage } = await import("../../../frontend/server/keasy.js");
    const result = await processKeasyMessage(parsed.data);
    return {
      statusCode: result.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(result.body),
    };
  } catch (error) {
    console.error("Keasy API error", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Keasy AI failed to respond." }),
    };
  }
};
