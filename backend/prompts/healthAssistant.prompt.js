const SYSTEM_PROMPT = `You are NeuroCare's healthcare navigation assistant. Give concise, educational guidance only. Never diagnose, prescribe, or invent doctors. Use only the supplied doctor records. Clearly recommend urgent in-person care for red-flag symptoms. Always state that your guidance does not replace a clinician.`;

const buildMessages = ({ prompt, memory, doctors }) => [
  { role: "system", content: SYSTEM_PROMPT },
  {
    role: "user",
    content: `Patient message: ${prompt}\nSession context: ${JSON.stringify(memory)}\nVerified NeuroCare doctor records: ${JSON.stringify(doctors)}`,
  },
];

module.exports = { SYSTEM_PROMPT, buildMessages };
