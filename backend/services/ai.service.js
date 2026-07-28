const { buildMessages } = require("../prompts/healthAssistant.prompt");
const { inferSpecialty, extractLocation, findDoctors } = require("../utils/doctorSearch");

const sessions = new Map();
const disclaimer = "Educational information only — it does not replace an examination, diagnosis, or treatment plan from a qualified clinician.";
const keyFor = (userId, sessionId) => `${userId}:${sessionId || "default"}`;

const askGroq = async ({ prompt, memory, doctors }) => {
  if (!process.env.GROQ_API_KEY) return null;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", messages: buildMessages({ prompt, memory, doctors }), temperature: 0.2, max_tokens: 500 }) });
  if (!response.ok) throw new Error("The AI provider is temporarily unavailable.");
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
};

const chat = async ({ userId, sessionId, prompt, language, city }) => {
  const memory = sessions.get(keyFor(userId, sessionId)) || { questions: [] };
  const specialty = inferSpecialty(prompt);
  const preferredCity = city || extractLocation(prompt) || memory.city;
  const doctors = await findDoctors({ query: prompt, specialty, city: preferredCity });
  const nextMemory = { ...memory, illness: specialty, city: preferredCity || memory.city, language: language || memory.language, questions: [...memory.questions, prompt].slice(-10) };
  sessions.set(keyFor(userId, sessionId), nextMemory);
  let response;
  try { response = await askGroq({ prompt, memory: nextMemory, doctors }); } catch { response = null; }
  if (!response) response = `A ${specialty} consultation may be appropriate. ${doctors.length ? "I found matching NeuroCare doctors below." : "I could not find a matching NeuroCare doctor for this search yet."}\n\nWhile arranging care: stay hydrated, eat regular balanced meals, avoid alcohol and tobacco, use gentle activity only if it does not worsen symptoms, and keep a consistent 7–9 hour sleep routine. Track symptom onset, triggers, severity, and current medicines for your consultation.\n\n${disclaimer}`;
  else response = `${response}\n\n${disclaimer}`;
  return { response, suggestedSpecialty: specialty, doctors, memory: nextMemory, triageLevel: /chest pain|difficulty breathing|stroke|unconscious/i.test(prompt) ? "Emergency" : "Routine" };
};

module.exports = { chat };
