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
  MoreVertical,
  Pencil,
  Check,
  Loader2,
  AlertCircle,
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
  recommendationReason?: string;
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
    label: "📋 My Medical Profile",
    prompt:
      "Summarize my documented medical history, active conditions, and recent appointments.",
    mode: "profile_summary",
  },
  {
    label: "💊 Prescriptions & Meds",
    prompt:
      "What medications and prescriptions are recorded in my NeuroCare file?",
    mode: "prescription_explainer",
  },
  {
    label: "👨‍⚕️ Find Specialists",
    prompt:
      "Recommend suitable doctors for persistent headaches and neurological symptoms near my location.",
    mode: "doctor_finder",
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

  // Chat management state: Menu, Inline Rename, Modal Rename, and Delete Confirmation
  const [menuOpenSessionId, setMenuOpenSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteModalSession, setDeleteModalSession] = useState<ChatSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHeaderRenameModalOpen, setIsHeaderRenameModalOpen] = useState(false);
  const [headerRenameValue, setHeaderRenameValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-dismiss action feedback toasts after 3 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Handle outside clicks and keyboard shortcuts (Escape key)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-chat-menu]")) {
        setMenuOpenSessionId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenSessionId(null);
        if (!isRenaming) setEditingSessionId(null);
        if (!isDeleting) setDeleteModalSession(null);
        if (!isRenaming) setIsHeaderRenameModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleGlobalClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRenaming, isDeleting]);

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
      if (response.data.success && response.data.conversation?._id) {
        newSession.id = response.data.conversation._id;
      }
    } catch {
      // The initial message can still be used; it will be persisted on first send.
    }
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleStartRename = (session: ChatSession, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMenuOpenSessionId(null);
    setEditingSessionId(session.id);
    setEditTitleValue(session.title);
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditTitleValue("");
  };

  const handleSaveRename = async (sessionId: string, newTitleToSave?: string) => {
    const titleVal = (newTitleToSave !== undefined ? newTitleToSave : editTitleValue).trim();
    if (!titleVal) {
      setFeedback({ type: "error", message: "Chat title cannot be empty." });
      return;
    }

    const currentSession = sessions.find((s) => s.id === sessionId);
    if (currentSession && currentSession.title === titleVal) {
      setEditingSessionId(null);
      setIsHeaderRenameModalOpen(false);
      return;
    }

    setIsRenaming(true);
    try {
      if (!sessionId.startsWith("session-")) {
        await api.patch(ENDPOINTS.AI.CONVERSATION(sessionId), { title: titleVal });
      }

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: titleVal } : s))
      );
      setFeedback({ type: "success", message: "Chat renamed successfully." });
      setEditingSessionId(null);
      setIsHeaderRenameModalOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to rename chat. Please try again.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenDeleteModal = (session: ChatSession, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMenuOpenSessionId(null);
    setDeleteModalSession(session);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalSession) return;
    const targetId = deleteModalSession.id;
    setIsDeleting(true);

    try {
      if (!targetId.startsWith("session-")) {
        await api.delete(ENDPOINTS.AI.CONVERSATION(targetId));
      }

      const filtered = sessions.filter((s) => s.id !== targetId);
      setSessions(filtered);

      if (activeSessionId === targetId) {
        if (filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else {
          await handleNewChat();
        }
      }

      setFeedback({ type: "success", message: "Conversation deleted successfully." });
      setDeleteModalSession(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to delete conversation. Please try again.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsDeleting(false);
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
    const isDefaultTitle = activeSession.title === "New Health Consultation";
    const updatedTitle =
      isDefaultTitle && messages.length <= 1
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
              <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--text-secondary)] space-y-2">
                    <MessageSquare size={24} className="opacity-40" />
                    <p className="text-xs font-medium">No chat history</p>
                    <p className="text-[10px] opacity-70">
                      Start a new consultation to begin
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingSessionId === session.id;
                    const isMenuOpen = menuOpenSessionId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          if (isEditing) return;
                          setActiveSessionId(session.id);
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 border ${
                          isActive
                            ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/30 font-semibold shadow-xs"
                            : "text-[var(--text-main)] border-transparent hover:bg-[var(--surface-hover)] hover:border-[var(--border-light)]/60"
                        }`}
                      >
                        {isEditing ? (
                          <div
                            className="flex items-center gap-1.5 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              autoFocus
                              disabled={isRenaming}
                              value={editTitleValue}
                              maxLength={80}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              onFocus={(e) => e.target.select()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveRename(session.id);
                                } else if (e.key === "Escape") {
                                  e.preventDefault();
                                  handleCancelRename();
                                }
                              }}
                              className="flex-1 min-w-0 px-2.5 py-1 bg-[var(--bg-main)] border border-[var(--accent-primary)] rounded-lg text-xs text-[var(--text-main)] outline-none shadow-xs"
                            />
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={() => handleSaveRename(session.id)}
                              title="Save title (Enter)"
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-emerald-600 dark:text-emerald-400 transition-colors disabled:opacity-50 shrink-0"
                            >
                              {isRenaming ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} />
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isRenaming}
                              onClick={handleCancelRename}
                              title="Cancel (Esc)"
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                              <MessageSquare
                                size={14}
                                className={`shrink-0 transition-opacity ${
                                  isActive
                                    ? "text-[var(--accent-primary)] opacity-100"
                                    : "opacity-60 group-hover:opacity-100 text-[var(--text-secondary)]"
                                }`}
                              />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="truncate" title={session.title}>
                                  {session.title}
                                </span>
                                {session.createdAt && (
                                  <span className="text-[10px] text-[var(--text-secondary)] font-normal opacity-60 truncate">
                                    {session.createdAt}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Three-dot action menu */}
                            <div className="relative shrink-0" data-chat-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenSessionId(isMenuOpen ? null : session.id);
                                }}
                                aria-label="Conversation options"
                                title="More options"
                                className={`p-1.5 rounded-md transition-all ${
                                  isMenuOpen
                                    ? "bg-[var(--bg-main)] text-[var(--text-main)] opacity-100"
                                    : "opacity-80 md:opacity-0 md:group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]"
                                }`}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {isMenuOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1 w-32 bg-[var(--card-bg)] border border-[var(--border-light)] rounded-xl shadow-xl py-1 z-30 overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartRename(session, e)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-main)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                                    >
                                      <Pencil size={13} className="text-[var(--text-secondary)]" />
                                      <span>Rename</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenDeleteModal(session, e)}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                    >
                                      <Trash2 size={13} />
                                      <span>Delete</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[var(--card-bg)] overflow-hidden relative w-full">
        {/* Top Toggle Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]/50 shrink-0 z-10 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-main)] transition-colors shrink-0"
              title="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-xs font-semibold text-[var(--text-main)] truncate"
                title={activeSession.title}
              >
                {activeSession.title}
              </span>
              <button
                onClick={() => {
                  setHeaderRenameValue(activeSession.title);
                  setIsHeaderRenameModalOpen(true);
                }}
                title="Rename conversation"
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors shrink-0"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Database Intelligence
          </div>
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
        <div
          data-lenis-prevent-wheel
          className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 pb-24"
        >
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
                        {doctor.recommendationReason && (
                          <div className="mt-2 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] leading-relaxed">
                            <span className="font-bold">✨ AI Match Reason: </span>
                            {doctor.recommendationReason}
                          </div>
                        )}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalSession && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              if (!isDeleting) setDeleteModalSession(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Delete Conversation?
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--text-main)]">
                  "{deleteModalSession.title}"
                </span>
                ? This conversation and all associated messages will be permanently removed from your database.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteModalSession(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      Delete Chat
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename Modal (Header / Triggered) */}
      <AnimatePresence>
        {isHeaderRenameModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              if (!isRenaming) setIsHeaderRenameModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pencil size={16} className="text-[var(--accent-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Rename Conversation
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isRenaming}
                  onClick={() => setIsHeaderRenameModalOpen(false)}
                  className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveRename(activeSession.id, headerRenameValue);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Conversation Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    maxLength={80}
                    disabled={isRenaming}
                    value={headerRenameValue}
                    onChange={(e) => setHeaderRenameValue(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-light)] focus:border-[var(--accent-primary)] rounded-xl text-xs text-[var(--text-main)] outline-none transition-all shadow-inner"
                    placeholder="Enter conversation title..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isRenaming}
                    onClick={() => setIsHeaderRenameModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRenaming || !headerRenameValue.trim()}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:opacity-90 text-white flex items-center gap-1.5 transition-opacity disabled:opacity-50 shadow-sm"
                  >
                    {isRenaming ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`fixed bottom-20 right-6 md:bottom-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-medium backdrop-blur-md ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <Check size={14} className="shrink-0" />
            ) : (
              <AlertCircle size={14} className="shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiAssistant;
