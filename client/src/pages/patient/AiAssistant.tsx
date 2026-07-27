import { useState, useRef, useEffect } from "react";
import { Bot, User } from "lucide-react";
import api from "../../api/axios";
import ENDPOINTS from "../../api/endPoints";
import { BiSolidSend } from "react-icons/bi";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  mode?: string;
  specialty?: string;
  triageLevel?: string;
  timestamp: string;
}

const PRESET_PILLS = [
  { label: "🩺 Symptom Checker", prompt: "I have had a throbbing headache, dizziness, and mild nausea for the past 2 days.", mode: "symptom_checker" },
  { label: "💊 Prescription Explainer", prompt: "Explain how to safely take Amoxicillin 500mg tablets and common side effects.", mode: "prescription_explainer" },
  { label: "📊 Lab Report Summarizer", prompt: "Summarize a Blood Report showing Hemoglobin 11.2 g/dL and Fasting Glucose 110 mg/dL.", mode: "report_summarizer" },
  { label: "🌿 Lifestyle & Wellness", prompt: "Suggest daily habits to improve sleep quality and reduce work stress.", mode: "lifestyle" },
];

// const LANGUAGES = [
//   { id: "english", label: "English" },
//   { id: "hindi", label: "हिंदी (Hindi)" },
//   { id: "tamil", label: "தமிழ் (Tamil)" },
//   { id: "telugu", label: "తెలుగు (Telugu)" },
//   { id: "bengali", label: "বাংলা (Bengali)" },
//   { id: "marathi", label: "मराठी (Marathi)" },
//   { id: "gujarati", label: "ગુજરાતી (Gujarati)" },
// ];

const AiAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "### 👋 Welcome to NeuroCare AI Health Assistant\n\nI can help you evaluate symptoms, suggest appropriate medical specialties, explain prescriptions, summarize lab reports, and provide preventive health guidance.\n\n*Select a quick action pill below or type your medical question to begin.*",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt?: string, mode?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt("");
    setLoading(true);

    try {
      const res = await api.post(`${ENDPOINTS.AUTH.SEND_OTP.replace('/auth/send-otp', '')}/ai/chat`, {
        prompt: textToSend,
        mode: mode || "general",
        language: selectedLanguage !== "english" ? selectedLanguage : null,
      });

      if (res.data.success) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: res.data.response,
          mode: res.data.mode,
          specialty: res.data.suggestedSpecialty,
          triageLevel: res.data.triageLevel,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "⚠️ Sorry, an error occurred while connecting to NeuroCare AI engine. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 py-8 md:py-8 space-y-4">
      {/* Header */}
      {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-cyan-950 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={16} /> Clinical AI Decision Support
          </div>
          <h1 className="text-3xl font-bold font-heading">NeuroCare AI Assistant</h1>
          <p className="text-xs text-cyan-100/80 mt-1 max-w-xl">
            Intelligent symptom triage, specialty recommendations, report summaries, prescription explainers, and multi-language support.
          </p>
        </div>

       
        <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
          <Globe size={16} className="text-cyan-300 ml-2" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer pr-2"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div> */}

      {/* Preset Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_PILLS.map((pill) => (
          <button
            key={pill.label}
            onClick={() => handleSendMessage(pill.prompt, pill.mode)}
            className="p-3.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-light)] hover:border-[var(--accent-primary)] text-left transition-all shadow-xs hover:shadow-md group"
          >
            <span className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] block">
              {pill.label}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-1">
              {pill.prompt}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="left border border-[var(--border-light)]/50 rounded-lg flex justify-center items-center w-3/5">
          <h1 className="uppercase">Some Advertisement</h1>
        </div>

        {/* Chat Window */}
        <div className="rounded-lg bg-[var(--card-bg)]/50 border border-[var(--border-light)]/50 shadow-xl flex flex-col w-2/5 h-[600px] overflow-hidden">
          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-10 h-10 rounded-full border border-[var(--border-light)]/50 text-[var(--text-secondary)] bg-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-md">
                    <h1 className="text-xs font-semibold tracking-widest">
                      AI
                    </h1>
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-5 text-xs md:text-sm leading-relaxed space-y-3 ${
                    msg.sender === "user"
                      ? "bg-[var(--accent-primary)] text-white font-medium rounded-tr-none shadow-md"
                      : "bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-light)]/50 rounded-tl-xs shadow-xs"
                  }`}
                >
                  {/* Triage / Specialty Tag Header if available */}
                  {msg.specialty && (
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-[var(--border-light)]">
                      <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold">
                        Specialty: {msg.specialty}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          msg.triageLevel === "Emergency"
                            ? "bg-red-500/10 text-red-500"
                            : msg.triageLevel === "Urgent"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        Priority: {msg.triageLevel}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  <div className="text-[10px] opacity-60 text-right">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-main)] border border-[var(--border-light)]/50 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-[var(--text-secondary)]">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md animate-pulse">
                  <Bot size={20} />
                </div>
                <span className="animate-pulse">
                  NeuroCare AI is analyzing clinical rules...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask about symptoms, medicines, lab reports, or health habits..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-sm outline-none focus:border-[var(--text-secondary)]/30 transition-all"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-3 rounded-full bg-[var(--accent-primary)] text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
            >
              <BiSolidSend size={16}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
