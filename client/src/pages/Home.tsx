import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, Sparkles, Users, Calendar, ArrowRight } from "lucide-react";
import { gsap } from "gsap";

const Home = () => {
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-16">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative rounded-3xl p-8 md:p-16 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> AI-Powered Digital Healthcare Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight leading-tight">
            Advanced Clinical Care & AI Doctor Booking
          </h1>

          <p className="text-cyan-100/80 text-base md:text-lg leading-relaxed max-w-2xl font-sans">
            Connect with top certified medical specialists, manage family health records with live synchronization, and get instant clinical insights with NeuroCare AI.
          </p>

          {/* Search Bar Widget */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 max-w-xl">
            <button
              onClick={() => navigate("/doctors")}
              className="flex-1 py-4 px-6 rounded-2xl bg-[var(--accent-primary)] hover:opacity-90 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope size={18} /> Find Doctors & Book Appointment
            </button>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="py-4 px-6 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} /> AI Health Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-[var(--accent-primary)] block">15,000+</span>
          <span className="text-xs text-[var(--text-secondary)] font-semibold mt-1 block">Patient Consultations</span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400 block">500+</span>
          <span className="text-xs text-[var(--text-secondary)] font-semibold mt-1 block">Certified Specialists</span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-cyan-600 dark:text-cyan-400 block">99.8%</span>
          <span className="text-xs text-[var(--text-secondary)] font-semibold mt-1 block">Satisfaction Rate</span>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-amber-600 dark:text-amber-400 block">24 / 7</span>
          <span className="text-xs text-[var(--text-secondary)] font-semibold mt-1 block">AI Health Support</span>
        </div>
      </div>

      {/* Platform Features Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Integrated Healthcare Architecture</span>
          <h2 className="text-3xl font-bold font-heading text-[var(--text-main)]">Engineered for Complete Patient Well-Being</h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors">
              Admin-Managed Scheduling Workflow
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Submit appointment requests with symptoms and medical files. Hospital Administration reviews doctor availability, assigns date/time slots, consultation mode, and instructions.
            </p>
            <Link to="/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent-primary)] hover:underline pt-2">
              Track Appointments <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--text-main)] group-hover:text-emerald-600 transition-colors">
              Automatic Family Account Sync
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Add family members by email. If the email matches a registered NeuroCare user, a bidirectional link is established with real-time profile synchronization while respecting privacy.
            </p>
            <Link to="/members" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2">
              Manage Family Vault <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-light)] shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-bold font-heading text-[var(--text-main)] group-hover:text-cyan-600 transition-colors">
              Intelligent AI Health Assistant
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Symptom triage, urgency level detection, prescription explanations, blood test summaries, multi-language support in Indian regional languages, and lifestyle recommendations.
            </p>
            <Link to="/ai-assistant" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline pt-2">
              Launch AI Assistant <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">24/7 Clinical Insights</span>
          <h2 className="text-2xl md:text-3xl font-bold font-heading">Have medical questions or symptoms?</h2>
          <p className="text-xs text-cyan-100/80">
            Ask NeuroCare AI for instant specialty recommendations, prescription guidance, or regional language translation.
          </p>
        </div>

        <button
          onClick={() => navigate("/ai-assistant")}
          className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg transition-all shrink-0 cursor-pointer"
        >
          Chat with NeuroCare AI
        </button>
      </div>
    </div>
  );
};

export default Home;