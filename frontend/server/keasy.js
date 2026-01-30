import crypto from "node:crypto";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const KB_SYSTEM_PROMPT = `You are Keasy AI. Use ONLY the information inside KB_REFERENCE to answer.
- If the answer is not in KB_REFERENCE, reply exactly: \`NEED_WEB\`.
- Do NOT reveal personal information. If any personal info appears in KB_REFERENCE, replace it with \`[REDACTED]\`.
- Be concise and accurate. Do not guess.
- Do NOT mention KB_REFERENCE or say "Based on the KB" in the answer.
- Be polite and helpful.
- Provide a short summary (2–4 sentences or bullets) and do NOT include raw URLs.`;

const WEB_SYSTEM_PROMPT = `You are Keasy AI. Use ONLY WEB_SOURCES to answer. Include sources.
- Do NOT reveal personal information. If any appears, redact it.
- If sources are insufficient, say so.
- Provide citations as a bullet list “Sources:” with title + domain (no PII).`;

const GENERAL_SYSTEM_PROMPT = `You are Keasy AI. Answer using your general knowledge.
- Do NOT reveal personal information. If asked for personal info about someone, refuse.
- Do NOT invent sources or citations.
- If you are unsure, say you are not sure.
- Be concise and accurate. Do not guess about sensitive or private data.`;

const DEFAULT_CONFIG = {
  kbMinScore: 0.5,
  kbMinResults: 1,
  maxKbChunks: 5,
  maxWebResults: 3,
  maxWebSnippetChars: 1200,
  webFetchTimeoutMs: 8000,
  maxQueryLength: 200,
};
const WEB_FALLBACK_ENABLED = false;

const REFUSAL_MESSAGE =
  "I can't help with sharing personal information. Please use official support channels or account recovery tools for help with your own account.";

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/g;
const CARD_REGEX = /\b\d{13,19}\b/g;
const ADDRESS_REGEX = /\b\d{1,5}\s+(?:[A-Za-z0-9.'-]+\s){0,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Suite|Apt|Apartment)\b/gi;
const ID_CONTEXT_REGEX = /\b(?:passport|ssn|social security|driver'?s license|arc|resident(?:\s+registration)?|id\s*number)\b[\s:#-]*([A-Z0-9-]{4,})/gi;
const ACCOUNT_CONTEXT_REGEX = /\b(?:order|account|customer|user)\s*(?:id|number|no\.?|#)\s*[:#-]?\s*([A-Z0-9-]{4,})/gi;
const ACKNOWLEDGEMENT_REGEX =
  /^(yes|yeah|yep|yup|sure|ok|okay|okey|alright|all right)(\s+please)?[!?.]*$/i;
const ACKNOWLEDGEMENT_PHRASES = new Set([
  "go ahead",
  "please do",
  "do it",
  "sounds good",
  "why not",
  "sure thing",
  "lets do it",
  "let's do it",
]);

export function redactPII(text) {
  if (!text) return { text: "", redactionsApplied: false };
  let redactionsApplied = false;
  const apply = (pattern, replacement) => {
    const next = text.replace(pattern, replacement);
    if (next !== text) {
      redactionsApplied = true;
      text = next;
    }
  };

  apply(EMAIL_REGEX, "[EMAIL]");
  apply(PHONE_REGEX, "[PHONE]");
  apply(ADDRESS_REGEX, "[ADDRESS]");
  apply(ID_CONTEXT_REGEX, "[ID_NUMBER]");
  apply(CARD_REGEX, "[FINANCIAL]");
  apply(ACCOUNT_CONTEXT_REGEX, "[ACCOUNT_ID]");

  return { text, redactionsApplied };
}

export function filterPII(text) {
  if (!text) return { text: "", redactionsApplied: false, refuse: false };
  let redactionsApplied = false;
  const apply = (pattern) => {
    const next = text.replace(pattern, "[REDACTED]");
    if (next !== text) {
      redactionsApplied = true;
      text = next;
    }
  };

  apply(EMAIL_REGEX);
  apply(PHONE_REGEX);
  apply(ADDRESS_REGEX);
  apply(ID_CONTEXT_REGEX);
  apply(CARD_REGEX);
  apply(ACCOUNT_CONTEXT_REGEX);

  const redactionCount = (text.match(/\[REDACTED\]/g) || []).length;
  const stripped = text.replace(/\[REDACTED\]/g, "").trim();
  const onlyRedactions = redactionsApplied && stripped.length === 0;
  const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0;
  const redactionRatio = wordCount ? redactionCount / wordCount : 0;

  return {
    text,
    redactionsApplied,
    refuse: onlyRedactions || redactionRatio > 0.4,
  };
}

export function isPersonalInfoRequest(text) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  const piiKeywords = [
    /\b(phone|cell|mobile|telephone|email|e-mail|address|contact info|contact information)\b/,
    /\b(ssn|social security|passport|driver'?s license|id number|arc|resident registration)\b/,
    /\bpersonal information\b/,
  ];
  const requestVerbs = /\b(find|lookup|get|give me|show me|tell me|share|provide)\b/;
  const thirdPerson = /\b(their|his|her|someone|anyone|person|this person|that person|he|she|they)\b/;
  const possessive = /\b[a-z]+'s\b/;
  const firstPerson = /\b(my|me|mine|i|our|we|us)\b/;
  const locationRequest = /\bwhere does\b.*\blive\b/;
  const doxxingRequest = /\b(doxx|dox|track|locate)\b/;

  const hasPii = piiKeywords.some((pattern) => pattern.test(normalized));
  if (locationRequest.test(normalized) || doxxingRequest.test(normalized)) return true;
  if (!hasPii) return false;

  if (thirdPerson.test(normalized) || possessive.test(normalized)) return true;
  if (requestVerbs.test(normalized) && !firstPerson.test(normalized)) return true;

  return false;
}

export function isAcknowledgement(text) {
  if (!text) return false;
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  const cleaned = normalized.replace(/[!?.]+$/g, "").trim();
  if (ACKNOWLEDGEMENT_REGEX.test(cleaned)) return true;
  if (ACKNOWLEDGEMENT_PHRASES.has(cleaned)) return true;
  return false;
}

function buildFollowUpPrompt() {
  return "Sure — what should I look for in Keasy? You can say a guide, job, community, or a specific topic.";
}

function buildRelatedPrompt(items) {
  if (!items.length) {
    return "I couldn’t find related items for that. Tell me what you want to explore, and I’ll look it up.";
  }
  const lines = ["Here are related items you can explore:"];
  for (const item of items) {
    if (item.title) {
      lines.push(`- ${item.title}`);
    }
    if (item.link) {
      lines.push(`- ${item.label}: ${item.link}`);
    }
  }
  return lines.join("\n");
}

function uniqueStrings(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildRelatedItemList(chunks) {
  const seen = new Set();
  const items = [];
  for (const chunk of chunks || []) {
    if (!chunk?.doc_id) continue;
    if (seen.has(chunk.doc_id)) continue;
    seen.add(chunk.doc_id);
    const title = chunk.chunk_title || chunk.doc_id;
    const link = buildEntityLink(chunk.doc_id, chunk.source_url);
    const label = labelForEntity(chunk.doc_id);
    items.push({
      doc_id: chunk.doc_id,
      title,
      link,
      label,
    });
  }
  return items;
}

export function sanitizeWebQuery(text, config = DEFAULT_CONFIG) {
  if (!text) return "";
  let sanitized = text.replace(/\[[A-Z_]+\]/g, " ");
  sanitized = sanitized.replace(/[^A-Za-z0-9\s'"-]/g, " ");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  if (sanitized.length > config.maxQueryLength) {
    sanitized = sanitized.slice(0, config.maxQueryLength).trim();
  }
  return sanitized;
}

const KB_STOPWORDS = new Set([
    "the",
    "a",
    "an",
    "to",
    "for",
    "of",
    "and",
    "is",
    "are",
    "with",
    "in",
    "on",
    "at",
    "by",
    "from",
    "find",
    "me",
    "please",
    "can",
    "you",
    "your",
    "my",
    "our",
    "us",
    "guide",
    "guides",
    "job",
    "jobs",
    "professional",
    "professionals",
    "connect",
    "join",
  ]);

export function normalizeKbQuery(query) {
  if (!query) return "";
  const tokens = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2 && !KB_STOPWORDS.has(token))
    )
  );
  return tokens.join(" ").trim();
}

export function scoreChunk(query, chunk) {
  if (!query) return 0;
  const tokens = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 2 && !KB_STOPWORDS.has(token))
    )
  );
  if (tokens.length === 0) return 0;
  const title = (chunk?.chunk_title || "").toLowerCase();
  const content = (chunk?.content || "").toLowerCase();
  let titleHits = 0;
  let contentHits = 0;
  for (const token of tokens) {
    if (title.includes(token)) {
      titleHits += 1;
    } else if (content.includes(token)) {
      contentHits += 1;
    }
  }
  const weightedHits = titleHits * 2 + contentHits;
  const maxHits = tokens.length * 2;
  return maxHits ? weightedHits / maxHits : 0;
}

function kbConfident(results, query, config) {
  if (!results || results.length < config.kbMinResults) return { confident: false, scored: [] };
  const scored = results.map((item) => ({
    ...item,
    score: typeof item.score === "number" ? item.score : scoreChunk(query, item),
  }))
  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const bestScore = scored[0]?.score ?? 0;
  return { confident: bestScore >= config.kbMinScore, scored };
}

function buildKbReference(chunks) {
  return chunks
    .map((chunk, index) => {
      const title = chunk.chunk_title || chunk.doc_id || `Chunk ${index + 1}`;
      const redacted = redactPII(chunk.content || "").text;
      return `### ${title}\n${redacted}`.trim();
    })
    .join("\n\n");
}

function buildWebSourcesText(sourceTexts) {
  return sourceTexts
    .map((source, index) => {
      const label = `[${index + 1}] ${source.title} (${source.domain})`;
      return `${label}\n${source.text}`.trim();
    })
    .join("\n\n");
}

function buildUserPrompt(referenceLabel, referenceContent, question) {
  return `${referenceLabel}:\n${referenceContent}\n\nQUESTION:\n${question}`.trim();
}

function buildSourcesList(sources) {
  return sources.map((source) => ({
    title: source.title,
    url: source.url,
    domain: source.domain,
  }));
}

function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(/https?:\/\/[^\s)>\]]+/gi) || [];
  return matches
    .map((url) => url.replace(/[),"'”]+$/g, ""))
    .map((url) => url.replace(/\\$/g, ""))
    .filter(Boolean);
}

function isImageUrl(url) {
  return /\.(png|jpg|jpeg|gif|webp)(\?|$)/i.test(url);
}

function collectKbLinks(chunks, limit = 5, docId = null) {
  const urls = new Set();
  for (const chunk of chunks || []) {
    if (docId && chunk?.doc_id !== docId) continue;
    if (chunk?.source_url && chunk.source_url.startsWith("http")) {
      if (!isImageUrl(chunk.source_url)) {
        urls.add(chunk.source_url);
      }
    }
    for (const url of extractUrls(chunk?.content || "")) {
      if (!isImageUrl(url)) {
        urls.add(url);
      }
    }
  }
  return Array.from(urls).slice(0, limit);
}

function classifyUrl(url) {
  const lower = url.toLowerCase();
  if (lower.includes("play.google.com/store")) {
    return { type: "app_android", label: "Click to download (Android)" };
  }
  if (lower.includes("apps.apple.com")) {
    return { type: "app_ios", label: "Click to download (iOS)" };
  }
  if (
    lower.includes("google.com/maps") ||
    lower.includes("maps.google") ||
    lower.includes("naver.me") ||
    lower.includes("map.naver") ||
    lower.includes("kakao.com") ||
    lower.includes("map.kakao")
  ) {
    return { type: "map", label: "Click to open map" };
  }
  if (
    lower.includes("open.kakao") ||
    lower.includes("discord.gg") ||
    lower.includes("whatsapp.com") ||
    lower.includes("line.me") ||
    lower.includes("t.me")
  ) {
    return { type: "community", label: "Click to join community" };
  }
  if (lower.includes("koreaeasy.org")) {
    return { type: "site", label: "Click to view" };
  }
  return null;
}

function labelForEntity(docId) {
  if (!docId || !docId.includes(":")) return "Click to view";
  const prefix = docId.split(":")[0];
  if (prefix === "guide") return "Click to view full guide";
  if (prefix === "job") return "Click to view job";
  if (prefix === "community") return "Click to join community";
  if (prefix === "professional") return "Click to view professionals";
  return "Click to view";
}

function stripLinkLines(text) {
  if (!text) return "";
  const lines = text.split("\n");
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/^links?:/i.test(trimmed)) return false;
    if (/^play store:/i.test(trimmed)) return false;
    if (/^app store:/i.test(trimmed)) return false;
    if (/https?:\/\/\S+/i.test(trimmed)) return false;
    if (/^click to/i.test(trimmed)) return false;
    return true;
  });
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildSuggestionLine() {
  return "If you want, I can also look for related guides, jobs, or communities in Keasy.";
}

function fallbackSummaryFromChunks(chunks) {
  const first = chunks?.[0];
  if (!first?.content) return "Here is a quick summary from the guide.";
  const redacted = redactPII(first.content).text;
  const sentences = redacted.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(" ").trim();
  return summary || "Here is a quick summary from the guide.";
}

function buildEntityLink(docId, sourceUrl) {
  if (sourceUrl) return sourceUrl;
  if (!docId || !docId.includes(":")) return null;
  const [prefix, rawId] = docId.split(":");
  if (!rawId) return null;
  if (prefix === "guide") {
    return `/guides/guide/${rawId}`;
  }
  if (prefix === "job") {
    return `/jobs/job/${rawId}`;
  }
  if (prefix === "professional") {
    return `/connect`;
  }
  if (prefix === "community") {
    return `/community`;
  }
  return null;
}

function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

async function searchKbWithSupabase(query, supabase, config, logger) {
  if (!supabase) {
    logger?.warn?.("Supabase client not configured. Skipping KB search.");
    return [];
  }
  if (!query) return [];
  const normalized = normalizeKbQuery(query);
  const searchQuery = normalized || query;
  const { data, error } = await supabase
    .from("kb_chunks")
    .select("id, doc_id, chunk_title, content, tags, updated_at, source_url")
    .textSearch("content", searchQuery, { type: "websearch" })
    .limit(config.maxKbChunks);

  if (error) {
    logger?.error?.("KB search error", { message: error.message });
    return [];
  }
  const results = (data || []).map((chunk) => ({
    ...chunk,
    score: scoreChunk(query, chunk),
  }));

  if (results.length > 0) {
    return results;
  }

  // Fallback: try a title match for exact-ish queries (e.g., community names)
  const titleQuery = normalized || query;
  if (!titleQuery) return [];
  const { data: titleData, error: titleError } = await supabase
    .from("kb_chunks")
    .select("id, doc_id, chunk_title, content, tags, updated_at, source_url")
    .ilike("chunk_title", `%${titleQuery}%`)
    .limit(config.maxKbChunks);

  if (titleError) {
    logger?.error?.("KB title search error", { message: titleError.message });
    return [];
  }

  return (titleData || []).map((chunk) => ({
    ...chunk,
    score: scoreChunk(query, chunk),
  }));
}

async function getRelatedForDoc(docId, supabase, config, logger) {
  if (!supabase || !docId) return [];
  const { data: seedChunks, error: seedError } = await supabase
    .from("kb_chunks")
    .select("doc_id, chunk_title, tags, source_url, updated_at")
    .eq("doc_id", docId)
    .limit(3);

  if (seedError) {
    logger?.error?.("KB seed fetch error", { message: seedError.message });
    return [];
  }

  const tags = uniqueStrings(
    (seedChunks || []).flatMap((chunk) => Array.isArray(chunk.tags) ? chunk.tags : [])
  );
  const prefix = docId.includes(":") ? docId.split(":")[0] : null;

  let related = [];
  if (tags.length > 0) {
    const { data: tagMatches, error: tagError } = await supabase
      .from("kb_chunks")
      .select("doc_id, chunk_title, tags, source_url, updated_at")
      .overlaps("tags", tags)
      .neq("doc_id", docId)
      .limit(config.maxKbChunks * 2);

    if (tagError) {
      logger?.error?.("KB related tags error", { message: tagError.message });
    } else {
      related = tagMatches || [];
    }
  }

  if (related.length < config.maxKbChunks && prefix) {
    const { data: typeMatches, error: typeError } = await supabase
      .from("kb_chunks")
      .select("doc_id, chunk_title, tags, source_url, updated_at")
      .like("doc_id", `${prefix}:%`)
      .neq("doc_id", docId)
      .limit(config.maxKbChunks * 2);

    if (typeError) {
      logger?.error?.("KB related type error", { message: typeError.message });
    } else {
      related = related.concat(typeMatches || []);
    }
  }

  const relatedItems = buildRelatedItemList(related)
    .slice(0, config.maxKbChunks);
  return relatedItems;
}

async function callDeepSeek({ systemPrompt, userPrompt }, fetchImpl, logger) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is missing");
  }

  const response = await fetchImpl("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    logger?.error?.("DeepSeek error", { status: response.status });
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }

  const data = await response.json();
  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    "";

  return content.trim();
}

async function searchWeb(query, fetchImpl, config, logger) {
  const apiKey = process.env.SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("SEARCH_API_KEY is missing");
  }

  const url = new URL("https://api.bing.microsoft.com/v7.0/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(config.maxWebResults));
  url.searchParams.set("textFormat", "Raw");
  url.searchParams.set("safeSearch", "Strict");

  const response = await fetchImpl(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
    },
  });

  if (!response.ok) {
    logger?.error?.("Web search error", { status: response.status });
    throw new Error(`Web search failed: ${response.status}`);
  }

  const data = await response.json();
  const results = data?.webPages?.value || [];

  return results.slice(0, config.maxWebResults).map((item) => ({
    title: item.name,
    url: item.url,
    snippet: item.snippet || "",
    domain: (() => {
      try {
        return new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })(),
  }));
}

function extractTextFromHtml(html) {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url, fetchImpl, config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.webFetchTimeoutMs);
  try {
    const response = await fetchImpl(url, {
      headers: { "User-Agent": "keasy-ai/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) return "";
    const html = await response.text();
    const text = extractTextFromHtml(html);
    if (!text) return "";
    return text.slice(0, config.maxWebSnippetChars);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function getWebSources(query, fetchImpl, config, logger) {
  const results = await searchWeb(query, fetchImpl, config, logger);
  const sources = [];
  for (const result of results) {
    const pageText = await fetchPageText(result.url, fetchImpl, config);
    const combined = [result.snippet, pageText].filter(Boolean).join("\n");
    const redacted = redactPII(combined).text;
    sources.push({
      title: result.title,
      url: result.url,
      domain: result.domain,
      text: redacted,
    });
  }

  return {
    sources: buildSourcesList(sources),
    sourceTexts: sources.map((source) => ({
      title: source.title,
      domain: source.domain,
      text: source.text,
    })),
  };
}

function hashQuery(query) {
  if (!query) return "";
  return crypto.createHash("sha256").update(query).digest("hex");
}

export async function processKeasyMessage(payload, deps = {}) {
  const config = { ...DEFAULT_CONFIG, ...(deps.config || {}) };
  const logger = deps.logger || console;
  const fetchImpl = deps.fetchImpl || fetch;

  const supabase = deps.supabaseClient || createSupabaseClient();
  const getKbResults =
    deps.getKbResults ||
    ((query) => searchKbWithSupabase(query, supabase, config, logger));
  const callModel =
    deps.callDeepSeek ||
    ((args) => callDeepSeek(args, fetchImpl, logger));
  const getWeb =
    deps.getWebSources ||
    ((query) => getWebSources(query, fetchImpl, config, logger));

  if (!payload || typeof payload.message !== "string" || !payload.message.trim()) {
    return {
      status: 400,
      body: { error: "message is required" },
    };
  }

  const originalMessage = payload.message.trim();
  const followupFor =
    typeof payload.followup_for === "string" ? payload.followup_for.trim() : "";
  if (followupFor && isAcknowledgement(originalMessage)) {
    const related = await getRelatedForDoc(followupFor, supabase, config, logger);
    return {
      status: 200,
      body: {
        answer: buildRelatedPrompt(related),
        mode: "kb",
        redactions_applied: false,
        kb_doc_id: followupFor,
      },
    };
  }
  if (!followupFor && isAcknowledgement(originalMessage)) {
    return {
      status: 200,
      body: {
        answer: buildFollowUpPrompt(),
        mode: "general",
        redactions_applied: false,
      },
    };
  }
  const isPersonalRequest = isPersonalInfoRequest(originalMessage);
  const { text: sanitized, redactionsApplied: inputRedacted } = redactPII(originalMessage);

  if (!sanitized) {
    return {
      status: 200,
      body: {
        answer: REFUSAL_MESSAGE,
        mode: "refuse",
        redactions_applied: true,
      },
    };
  }

  if (isPersonalRequest) {
    return {
      status: 200,
      body: {
        answer: REFUSAL_MESSAGE,
        mode: "refuse",
        redactions_applied: inputRedacted,
      },
    };
  }

  const kbResults = await getKbResults(sanitized);
  const { confident, scored } = kbConfident(kbResults, sanitized, config);
  let mode = "kb";
  let answer = "";
  let sources = [];
  let redactionsApplied = inputRedacted;
  let usedWeb = false;
  let usedGeneral = false;

  if (confident) {
    const reference = buildKbReference(scored.slice(0, config.maxKbChunks));
    const userPrompt = buildUserPrompt("KB_REFERENCE", reference, sanitized);
    const kbResponse = await callModel({
      systemPrompt: KB_SYSTEM_PROMPT,
      userPrompt,
    });

    const normalized = kbResponse.replace(/`/g, "").trim();
    if (normalized === "NEED_WEB") {
      usedWeb = true;
    } else {
      answer = kbResponse;
    }
  } else {
    usedWeb = true;
  }

  if (usedWeb) {
    if (!WEB_FALLBACK_ENABLED) {
      mode = "general";
      usedGeneral = true;
      answer = await callModel({
        systemPrompt: GENERAL_SYSTEM_PROMPT,
        userPrompt: sanitized,
      });
    } else {
    mode = "web";
    const sanitizedQuery = sanitizeWebQuery(sanitized, config);
    if (!sanitizedQuery) {
      return {
        status: 200,
        body: {
          answer: REFUSAL_MESSAGE,
          mode: "refuse",
          redactions_applied: true,
        },
      };
    }
    const webSources = await getWeb(sanitizedQuery);
    sources = webSources.sources;
    const webReference = buildWebSourcesText(webSources.sourceTexts);
    const userPrompt = buildUserPrompt("WEB_SOURCES", webReference, sanitized);
    answer = await callModel({
      systemPrompt: WEB_SYSTEM_PROMPT,
      userPrompt,
    });
    }
  }

  const filtered = filterPII(answer);
  redactionsApplied = redactionsApplied || filtered.redactionsApplied;

  if (filtered.refuse) {
    return {
      status: 200,
      body: {
        answer: REFUSAL_MESSAGE,
        mode: "refuse",
        sources: mode === "web" ? sources : undefined,
        redactions_applied: true,
      },
    };
  }

  const entityLink = mode === "kb" ? buildEntityLink(scored[0]?.doc_id, scored[0]?.source_url) : null;
  const topDocId = scored[0]?.doc_id || null;
  const kbLinks = mode === "kb" ? collectKbLinks(scored.slice(0, config.maxKbChunks), 5, topDocId) : [];
  const extraLinks = kbLinks.filter((url) => url !== entityLink);
  let baseText =
    entityLink || extraLinks.length ? stripLinkLines(filtered.text) : filtered.text;
  if (mode === "kb" && (!baseText || baseText.trim().length === 0)) {
    baseText = fallbackSummaryFromChunks(scored);
  }
  const linkLines = [];
  if (entityLink) {
    linkLines.push({ type: "entity", label: labelForEntity(scored[0]?.doc_id), url: entityLink });
  }
  const seenTypes = new Set(linkLines.map((item) => item.type));
  for (const url of extraLinks) {
    const classified = classifyUrl(url);
    if (!classified) continue;
    if (seenTypes.has(classified.type)) continue;
    seenTypes.add(classified.type);
    linkLines.push({ ...classified, url });
  }

  const linksBlock = linkLines.length
    ? `\n\nHere are the links:\n${linkLines.map((item) => `- ${item.label}: ${item.url}`).join("\n")}`
    : "";
  const suggestionLine = mode === "kb" ? `\n\n${buildSuggestionLine()}` : "";
  const finalAnswer = linksBlock
    ? `${baseText}${linksBlock}${suggestionLine}`
    : `${baseText}${suggestionLine}`;

  const kbDocId = mode === "kb" ? scored[0]?.doc_id : undefined;
  const debug =
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          kb: {
            confident,
            best_score: scored[0]?.score ?? 0,
            chunk_ids: scored.map((chunk) => chunk.id).filter(Boolean),
          },
          web: usedWeb && mode === "web"
            ? {
                query_hash: hashQuery(sanitized),
                domains: sources.map((source) => source.domain).filter(Boolean),
              }
            : undefined,
          general: usedGeneral ? { enabled: true } : undefined,
        };

  return {
    status: 200,
    body: {
      answer: finalAnswer,
      mode,
      sources: mode === "web" ? sources : undefined,
      redactions_applied: redactionsApplied,
      kb_doc_id: kbDocId,
      debug,
    },
  };
}

export function createKeasyRouter(options = {}) {
  const router = express.Router();
  router.post("/api/keasy/chat", async (req, res) => {
    try {
      const result = await processKeasyMessage(req.body, options);
      res.status(result.status).json(result.body);
    } catch {
      res.status(500).json({ error: "Keasy AI failed to respond." });
    }
  });

  router.post("/keasy/chat", async (req, res) => {
    try {
      const result = await processKeasyMessage(req.body, options);
      res.status(result.status).json(result.body);
    } catch {
      res.status(500).json({ error: "Keasy AI failed to respond." });
    }
  });

  return router;
}
