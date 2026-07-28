import { useState, useRef, useEffect } from "react";
import { Bot, User, Plus, MessageSquare, Menu, X, Trash2, MessageSquarePlus } from "lucide-react";
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

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

const PRESET_PILLS = [
  {
    label: "🩺 Symptom Checker",
    prompt:
      "I have had a throbbing headache, dizziness, and mild nausea for the past 2 days.",
    mode: "symptom_checker",
  },
  {
    label: "💊 Prescription Explainer",
    prompt:
      "Explain how to safely take Amoxicillin 500mg tablets and common side effects.",
    mode: "prescription_explainer",
  },
  {
    label: "📊 Lab Report Summarizer",
    prompt:
      "Summarize a Blood Report showing Hemoglobin 11.2 g/dL and Fasting Glucose 110 mg/dL.",
    mode: "report_summarizer",
  },
  {
    label: "🌿 Lifestyle & Wellness",
    prompt:
      "Suggest daily habits to improve sleep quality and reduce work stress.",
    mode: "lifestyle",
  },
];

const AiAssistant = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-1",
      title: "New Health Consultation",
      messages: [
        {
          id: "welcome-1",
          sender: "ai",
          text: "### 👋 Welcome to NeuroCare AI Health Assistant\n\nI can help you evaluate symptoms, suggest appropriate medical specialties, explain prescriptions, summarize lab reports, and provide preventive health guidance.\n\n*Select a quick action pill below or type your medical question to begin.*",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      createdAt: new Date().toLocaleDateString(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedLanguage] = useState("english");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New Health Consultation",
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: "ai",
          text: "### 👋 Welcome to NeuroCare AI Health Assistant\n\nHow can I help you with your health inquiries today?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      createdAt: new Date().toLocaleDateString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      handleNewChat();
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id && filtered.length > 0) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const handleSendMessage = async (customPrompt?: string, mode?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...messages, userMessage];
    const updatedTitle =
      messages.length <= 1
        ? textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : "")
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: updatedMessages, title: updatedTitle }
          : s,
      ),
    );

    if (!customPrompt) setInputPrompt("");
    setLoading(true);

    try {
      const res = await api.post(
        `${ENDPOINTS.AUTH.SEND_OTP.replace("/auth/send-otp", "")}/ai/chat`,
        {
          prompt: textToSend,
          mode: mode || "general",
          language: selectedLanguage !== "english" ? selectedLanguage : null,
        },
      );

      if (res.data.success) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: res.data.response,
          mode: res.data.mode,
          specialty: res.data.suggestedSpecialty,
          triageLevel: res.data.triageLevel,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, aiMessage] }
              : s,
          ),
        );
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "⚠️ Sorry, an error occurred while connecting to NeuroCare AI engine. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-[1600px] mx-auto overflow-hidden  bg-[var(--card-bg)] shadow-xl">
      {/* Sidebar - Chat History (Fixed, non-scrolling except inner list) */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 overflow-hidden bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col shrink-0 h-full`}
      >
        
        <div className="flex-1 overflow-y-auto p-3 ">
          <div className="flex mb-10 justify-between">
            <div className="text-sm uppercase tracking-wider text-[var(--text-secondary)] font-bold px-2 py-1">
              Recent Chats
            </div>
            <button
              className="text-[var(--text-secondary)]"
              onClick={handleNewChat}
            >
              <MessageSquarePlus size={14} />
            </button>
          </div>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                session.id === activeSessionId
                  ? " text-[var(--text-secondary)]"
                  : "text-[var(--text-main)] hover:bg-[var(--bg-main)]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MessageSquare size={14} className="shrink-0 opacity-70" />
                <span className="truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[var(--card-bg)] overflow-hidden relative">
        {/* Top Navbar Bar (Fixed) */}

        {/* Preset Pills Header Bar (Fixed) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 grid grid-cols-2 md:grid-cols-4 gap-2.5 border-b border-[var(--border-light)]/50 bg-[var(--bg-main)]/30 shrink-0 z-10">
            {PRESET_PILLS.map((pill) => (
              <button
                key={pill.label}
                // onClick={() => handleSendMessage(pill.prompt, pill.mode)}
                className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-light)] text-left transition-all shadow-xs group"
              >
                <span className="text-[11px] font-semibold tracking-wider text-[var(--text-main)]/90 block">
                  {pill.label}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                  {pill.prompt}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages Body (ONLY THIS AREA SCROLLS) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 pb-24">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-9 h-9 rounded-full border border-[var(--border-light)]/50 text-[var(--text-secondary)] bg-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-bold tracking-wider">
                    AI
                  </span>
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs md:text-sm leading-relaxed space-y-3 ${
                  msg.sender === "user"
                    ? "bg-[var(--accent-primary)] text-white font-medium rounded-tr-none shadow-sm"
                    : "bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-light)]/50 rounded-tl-xs shadow-xs"
                }`}
              >
                {msg.specialty && (
                  <div className="flex flex-wrap gap-2 pb-2.5 border-b border-[var(--border-light)]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[11px] font-bold">
                      Specialty: {msg.specialty}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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

                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                <div className="text-[10px] opacity-60 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-9 h-9 rounded-full bg-[var(--bg-main)] border border-[var(--border-light)]/50 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-[var(--text-secondary)]">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-xs animate-pulse">
                <Bot size={16} />
              </div>
              <span className="animate-pulse">
                NeuroCare AI is analyzing clinical rules...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Fixed at bottom 0) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] flex items-center gap-3 z-20 shadow-lg"
        >
          <input
            type="text"
            placeholder="Ask about symptoms, medicines, lab reports, or health habits..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-xs outline-none focus:border-[var(--accent-primary)] transition-all"
          />

          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-3 rounded-full bg-[var(--accent-primary)] text-white shadow-md hover:opacity-90 transition-all disabled:opacity-50"
          >
            <BiSolidSend size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
