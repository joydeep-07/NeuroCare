const { buildMessages } = require("../prompts/healthAssistant.prompt");
const { inferSpecialty, extractLocation, findDoctors } = require("../utils/doctorSearch");
const AIConversation = require("../models/aiConversation.model");

const disclaimer = "Educational information only. It does not replace an examination, diagnosis, or treatment plan from a qualified clinician.";

const askGroq = async ({ prompt, memory, doctors }) => {
  if (!process.env.GROQ_API_KEY) return null;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.1-8b-instant", messages: buildMessages({ prompt, memory, doctors }), temperature: 0.2, max_tokens: 500 }) });
  if (!response.ok) throw new Error("The AI provider is temporarily unavailable.");
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
};

const chat = async ({ userId, sessionId, prompt, language, city }) => {
  const requestedStoredConversation = sessionId && !String(sessionId).startsWith("session-");
  let conversation = requestedStoredConversation ? await AIConversation.findOne({ _id: sessionId, user: userId }) : null;
  if (requestedStoredConversation && !conversation) throw Object.assign(new Error("Conversation not found."), { statusCode: 404 });
  if (!conversation) conversation = await AIConversation.create({ user: userId, title: `${prompt.slice(0, 57)}${prompt.length > 57 ? "..." : ""}` });

  const specialty = inferSpecialty(prompt);
  const preferredCity = city || extractLocation(prompt);
  const doctors = await findDoctors({ query: prompt, specialty, city: preferredCity });
  const memory = { language, city: preferredCity, history: conversation.messages.slice(-12).map((message) => ({ role: message.role, content: message.content })) };
  conversation.messages.push({ role: "user", content: prompt });

  let response;
  try { response = await askGroq({ prompt, memory, doctors }); } catch { response = null; }
  if (!response) response = `A ${specialty} consultation may be appropriate. ${doctors.length ? "I found matching NeuroCare doctors below." : "I could not find a matching NeuroCare doctor for this search yet."}\n\nStay hydrated, eat regular balanced meals, avoid alcohol and tobacco, use gentle activity only if it does not worsen symptoms, and keep a consistent 7–9 hour sleep routine. Track symptom onset, triggers, severity, and current medicines for your consultation.\n\n${disclaimer}`;
  else response = `${response}\n\n${disclaimer}`;

  const triageLevel = /chest pain|difficulty breathing|stroke|unconscious/i.test(prompt) ? "Emergency" : "Routine";
  conversation.messages.push({ role: "assistant", content: response, specialty, triageLevel, doctors });
  await conversation.save();
  return { response, suggestedSpecialty: specialty, doctors, triageLevel, conversationId: String(conversation._id), conversation };
};

module.exports = { chat };
