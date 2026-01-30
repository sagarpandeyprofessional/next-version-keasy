import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { processKeasyMessage } from "../server/keasy.js";
import { createApp } from "../server.js";

const sampleKbChunk = {
  id: "chunk-1",
  doc_id: "doc-1",
  chunk_title: "FAQ > Pricing",
  content: "Keasy pricing starts at 9,900 KRW per month for basic plans.",
  score: 0.9,
};

const sampleSources = {
  sources: [
    {
      title: "Keasy Help",
      url: "https://example.com/help",
      domain: "example.com",
    },
  ],
  sourceTexts: [
    {
      title: "Keasy Help",
      domain: "example.com",
      text: "Keasy provides community guides and support resources.",
    },
  ],
};

const buildServices = ({
  kbResults = [sampleKbChunk],
  deepseekAnswer = "KB answer",
  webSources = sampleSources,
  onWebQuery,
  onKbQuery,
  onCall,
} = {}) => ({
  getKbResults: async (query) => {
    onKbQuery?.(query);
    return kbResults;
  },
  callDeepSeek: async (payload) => {
    onCall?.(payload);
    return deepseekAnswer;
  },
  getWebSources: async (query) => {
    onWebQuery?.(query);
    return webSources;
  },
});

const assertNoPII = (value) => {
  assert.ok(!/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(value), "email leaked");
  assert.ok(!/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}/.test(value), "phone leaked");
};

const kbHitQuestions = [
  "What is Keasy pricing?",
  "How much does Keasy cost?",
  "Tell me about Keasy plans.",
  "Explain Keasy subscriptions.",
  "Keasy pricing details?",
  "Is there a monthly fee?",
  "What is the basic plan price?",
  "How do I pay for Keasy?",
];

const webFallbackQuestions = [
  "Latest Seoul weather this week",
  "Current events in Korea",
  "Best cafes in Busan",
  "News about visa updates",
  "Current exchange rate KRW to USD",
  "Recent transport strikes in Seoul",
  "Today's subway delays",
  "Popular festivals this month",
];

const piiQuestions = [
  "My email is user@example.com, can you help?",
  "Call me at +1 415-555-1234 for details.",
  "Here is my address 123 Main Street, Seoul.",
  "Order ID #ABCD-1234 needs help.",
  "My passport number is A12345678",
  "Bank card 4242424242424242 is on file",
];

const refusalQuestions = [
  "What is Jane Doe's phone number?",
  "Find John's email address.",
  "Where does Alex live?",
  "Give me their social security number.",
  "Can you dox this person?",
];

for (const question of kbHitQuestions) {
  test(`KB hit returns mode=kb: ${question}`, async () => {
    const services = buildServices();
    const result = await processKeasyMessage({ message: question }, services);
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "kb");
    assert.ok(result.body.answer.startsWith("KB answer"));
  });
}

for (const question of webFallbackQuestions) {
  test(`KB miss returns general answer: ${question}`, async () => {
    const services = buildServices({
      kbResults: [],
      deepseekAnswer: "General answer",
    });
    const result = await processKeasyMessage({ message: question }, services);
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "general");
    assert.equal(result.body.answer, "General answer");
    assert.equal(result.body.sources, undefined);
  });
}

for (const question of piiQuestions) {
  test(`PII redaction before general response: ${question}`, async () => {
    const services = buildServices({
      kbResults: [],
      deepseekAnswer: "General answer",
    });
    const result = await processKeasyMessage({ message: question }, services);
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "general");
    assert.equal(result.body.answer, "General answer");
    assert.equal(result.body.redactions_applied, true);
  });
}

for (const question of refusalQuestions) {
  test(`Personal info request is refused: ${question}`, async () => {
    let kbCalled = false;
    let webCalled = false;
    let modelCalled = false;
    const services = buildServices({
      onKbQuery: () => {
        kbCalled = true;
      },
      onWebQuery: () => {
        webCalled = true;
      },
      onCall: () => {
        modelCalled = true;
      },
    });
    const result = await processKeasyMessage({ message: question }, services);
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "refuse");
    assert.equal(kbCalled, false);
    assert.equal(webCalled, false);
    assert.equal(modelCalled, false);
  });
}

test("PII is filtered from output", async () => {
  const services = buildServices({
    deepseekAnswer: "Contact us at help@keasy.ai or +1 415-555-1234.",
  });
  const result = await processKeasyMessage({ message: "How do I contact support?" }, services);
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "kb");
  assert.ok(result.body.answer.includes("[REDACTED]"));
  assertNoPII(result.body.answer);
});

test("Acknowledgement responses ask for clarification", async () => {
  let kbCalled = false;
  let webCalled = false;
  let modelCalled = false;
  const services = buildServices({
    onKbQuery: () => {
      kbCalled = true;
    },
    onWebQuery: () => {
      webCalled = true;
    },
    onCall: () => {
      modelCalled = true;
    },
  });
  const result = await processKeasyMessage({ message: "yes" }, services);
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "general");
  assert.ok(result.body.answer.toLowerCase().includes("what should i look for"));
  assert.equal(kbCalled, false);
  assert.equal(webCalled, false);
  assert.equal(modelCalled, false);
});

test("Acknowledgement with followup_for returns related list", async () => {
  const related = [
    { doc_id: "guide:2", title: "Visa Guide", link: "/guides/guide/2", label: "Click to view full guide" },
    { doc_id: "community:9", title: "International Students Help", link: "/community", label: "Click to join community" },
  ];
  const services = buildServices({
    kbResults: [],
    deepseekAnswer: "Should not call",
    getKbResults: async () => [],
  });
  const result = await processKeasyMessage(
    { message: "yes", followup_for: "guide:1" },
    {
      ...services,
      supabaseClient: {
        from: () => ({
          select: () => ({
            eq: () => ({
              limit: async () => ({ data: [{ doc_id: "guide:1", chunk_title: "Seed", tags: ["travel"], source_url: null }], error: null }),
            }),
            overlaps: () => ({
              neq: () => ({
                limit: async () => ({ data: related.map((item) => ({ doc_id: item.doc_id, chunk_title: item.title, source_url: item.link })), error: null }),
              }),
            }),
            like: () => ({
              neq: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        }),
      },
    }
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "kb");
  assert.ok(result.body.answer.includes("Here are related items"));
  assert.ok(result.body.answer.includes("Click to view full guide"));
  assert.equal(result.body.kb_doc_id, "guide:1");
});

test("Gemini is not referenced in runtime code", async () => {
  const root = process.cwd();
  const targets = [path.join(root, "src"), path.join(root, "server"), path.join(root, "server.js")];

  const files = [];
  const walk = async (entry) => {
    try {
      const info = await stat(entry);
      if (info.isDirectory()) {
        const entries = await readdir(entry);
        await Promise.all(entries.map((name) => walk(path.join(entry, name))));
      } else if (/[.](js|jsx|ts|tsx)$/.test(entry)) {
        files.push(entry);
      }
    } catch {
      // ignore
    }
  };

  await Promise.all(targets.map((entry) => walk(entry)));

  const matcher = /gemini|generativelanguage|@google\/generative-ai|GoogleGenerativeAI/i;
  for (const file of files) {
    const contents = await readFile(file, "utf8");
    assert.ok(!matcher.test(contents), `Gemini reference found in ${file}`);
  }
});

test("/api/keasy/chat responds", async () => {
  const services = buildServices();
  const app = createApp(services);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/keasy/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is Keasy pricing?" }),
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.mode, "kb");
    assert.ok(data.answer.startsWith("KB answer"));
  } finally {
    server.close();
  }
});
