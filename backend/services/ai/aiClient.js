const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const DEFAULT_MODELS = [
  process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

const callGroqWithFallback = async ({ messages, temperature = 0.2, maxTokens = 1200 }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[aiClient] No GROQ_API_KEY configured.");
    return null;
  }

  // Iterate through model candidates in order of quality
  for (const model of DEFAULT_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`[aiClient] Model ${model} returned HTTP ${response.status}: ${errorBody.slice(0, 160)}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && typeof content === "string") {
        return content.trim();
      }
    } catch (err) {
      console.warn(`[aiClient] Model ${model} network error:`, err.message);
    }
  }

  return null;
};

module.exports = {
  callGroqWithFallback,
};
