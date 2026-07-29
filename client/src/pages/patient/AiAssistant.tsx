import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  User,
  MessageSquare,
  Trash2,
  MessageSquarePlus,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  doctors?: DoctorRecommendation[];
}

interface DoctorRecommendation {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  rating: number;
  yearsOfExperience: number;
  consultationFee: number;
  location: string;
  availability: { day: string; slots: string[] }[];
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
  const navigate = useNavigate();
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
  // Open by default on desktop (innerWidth >= 768), closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    () => window.innerWidth >= 768,
  );
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

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get(ENDPOINTS.AI.CONVERSATIONS);
        if (!response.data.success || response.data.conversations.length === 0)
          return;
        const stored = response.data.conversations.map((conversation: any) => ({
          id: conversation._id,
          title: conversation.title,
          createdAt: new Date(conversation.createdAt).toLocaleDateString(),
          messages: conversation.messages.map((message: any) => ({
            id: message._id,
            sender: message.role === "assistant" ? "ai" : "user",
            text: message.content,
            specialty: message.specialty,
            triageLevel: message.triageLevel,
            doctors: message.doctors,
            timestamp: new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        }));
        setSessions(stored);
        setActiveSessionId(stored[0].id);
      } catch {
        // Keep the local welcome state when the user has no stored conversations yet.
      }
    };
    loadConversations();
  }, []);

  const handleNewChat = async () => {
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
    try {
      const response = await api.post(ENDPOINTS.AI.CONVERSATIONS);
      if (response.data.success) {
        newSession.id = response.data.conversation._id;
      }
    } catch {
      // The initial message can still be used; it will be persisted on first send.
    }
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
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
      const res = await api.post(ENDPOINTS.AI.CHAT, {
        prompt: textToSend,
        mode: mode || "general",
        sessionId: activeSessionId,
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
          doctors: res.data.doctors || [],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  id: res.data.conversationId || s.id,
                  messages: [...s.messages, aiMessage],
                }
              : s,
          ),
        );
        if (
          res.data.conversationId &&
          res.data.conversationId !== activeSessionId
        )
          setActiveSessionId(res.data.conversationId);
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
    <div className="flex h-[calc(100vh-4rem)] max-w-[1600px] mx-auto overflow-hidden bg-[var(--card-bg)] shadow-xl relative">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Chat History with Framer Motion Animation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: -50 }}
            animate={{ width: "18rem", opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative z-40 inset-y-0 left-0 overflow-hidden bg-[var(--bg-secondary)] border-r border-[var(--border-light)] flex flex-col shrink-0 h-full"
          >
            <div className="w-72 flex-1 overflow-y-auto p-3 flex flex-col h-full">
              <div className="flex mb-6 justify-between items-center pt-2 px-1">
                <div className="text-sm uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                  Recent Chats
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors"
                    onClick={handleNewChat}
                    title="New Chat"
                  >
                    <MessageSquarePlus size={16} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] md:hidden transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                    title="Close Sidebar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1 overflow-y-auto flex-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                      session.id === activeSessionId
                        ? "bg-[var(--bg-main)] text-[var(--text-main)] font-semibold shadow-xs"
                        : "text-[var(--text-main)] hover:bg-[var(--bg-main)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <MessageSquare
                        size={14}
                        className="shrink-0 opacity-70"
                      />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[var(--card-bg)] overflow-hidden relative w-full">
        {/* Top Toggle Bar */}
        <div className="flex items-center px-4 py-2.5 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]/50 shrink-0 z-10 gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-main)] transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          <span className="text-xs font-semibold text-[var(--text-main)] truncate">
            {activeSession.title}
          </span>
        </div>

        {/* Preset Pills Header Bar */}
        {messages.length <= 2 && (
          <div className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 border-b border-[var(--border-light)]/50 bg-[var(--bg-main)]/30 shrink-0 z-10">
            {PRESET_PILLS.map((pill) => (
              <button
                key={pill.label}
                onClick={() => handleSendMessage(pill.prompt, pill.mode)}
                className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-light)] text-left transition-all shadow-xs hover:border-[var(--accent-primary)] group"
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

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 pb-24">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-[var(--border-light)]/50 text-[var(--text-secondary)] bg-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-bold tracking-wider">
                    AI
                  </span>
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-2xl rounded-xl p-3.5 md:p-4 text-xs md:text-sm leading-relaxed space-y-3 ${
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

                {msg.doctors && msg.doctors.length > 0 && (
                  <div className="grid gap-2 pt-2">
                    {msg.doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-3 text-[11px] shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[var(--text-main)]">
                              {doctor.name}
                            </p>
                            <p className="text-[var(--accent-primary)]">
                              {doctor.specialization}
                            </p>
                            <p className="text-[var(--text-secondary)]">
                              {doctor.hospital} · {doctor.location}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/doctors?doctor=${doctor.id}`)
                            }
                            className="shrink-0 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-white font-semibold"
                          >
                            Book
                          </button>
                        </div>
                        <p className="mt-2 text-[var(--text-secondary)]">
                          ★ {doctor.rating} · {doctor.yearsOfExperience} yrs · ₹
                          {doctor.consultationFee} ·{" "}
                          {doctor.availability?.[0]
                            ? `${doctor.availability[0].day}: ${doctor.availability[0].slots.join(", ")}`
                            : "Availability on request"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] opacity-60 text-right">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--bg-main)] border border-[var(--border-light)]/50 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
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

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] flex items-center gap-3 z-20 shadow-lg"
        >
          <input
            type="text"
            placeholder="Ask about symptoms, medicines, lab reports, or health habits..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 md:py-3 rounded-full border border-[var(--border-light)] bg-[var(--bg-main)] text-[var(--text-main)] text-xs outline-none focus:border-[var(--accent-primary)] transition-all"
          />

          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2.5 md:p-3 rounded-full bg-[var(--accent-primary)] text-white shadow-md hover:opacity-95 transition-all disabled:opacity-50 shrink-0"
          >
            <BiSolidSend size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
