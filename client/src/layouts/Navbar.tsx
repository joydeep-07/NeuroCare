import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Bot, Stethoscope, Calendar, Users, FileText, LayoutDashboard, UserPlus, ShieldAlert } from "lucide-react";
import { gsap } from "gsap";
import { useSelector } from "react-redux";

import UserDetails from "../components/UserDetails";
import ThemeToggle from "../components/ThemeToggle";
import type { RootState } from "../redux/store";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Compute navigation routes according to role
  const getNavLinks = () => {
    if (!isAuthenticated || !user) {
      return [
        { name: "Home", path: "/" },
        { name: "Find Doctors", path: "/doctors" },
        { name: "AI Assistant", path: "/ai-assistant" },
      ];
    }

    if (user.role === "doctor") {
      return [
        { name: "Doctor Dashboard", path: "/doctor/dashboard" },
        { name: "My Schedule", path: "/doctor/availability" },
        { name: "AI Clinical Assistant", path: "/ai-assistant" },
      ];
    }

    if (user.role === "admin") {
      return [
        { name: "Admin Dashboard", path: "/admin/dashboard" },
        { name: "Appointment Queue", path: "/admin/appointments" },
        { name: "Add Doctor", path: "/admin/add-doctor" },
        { name: "Platform Users", path: "/admin/users" },
      ];
    }

    // Default: Patient role
    return [
      { name: "Home", path: "/" },
      { name: "Find Doctors", path: "/doctors" },
      { name: "My Appointments", path: "/appointments" },
      { name: "Medical Records", path: "/records" },
      { name: "Family Members", path: "/members" },
      { name: "AI Assistant", path: "/ai-assistant" },
    ];
  };

  const navLinks = getNavLinks();

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    if (open) {
      gsap.set(overlayRef.current, { display: "block" });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(drawerRef.current, { x: "-100%" }, { x: 0, duration: 0.35, ease: "power3.out" });
    } else {
      gsap.to(drawerRef.current, {
        x: "-100%",
        duration: 0.3,
        ease: "power3.in",
        onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
      });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [open]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-30 hidden lg:flex h-16 justify-between items-center px-8 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-light)]/60 shadow-xs">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="font-heading text-xl tracking-tight">
            <span className="text-[var(--accent-primary)]  font-heading">
              NEURO
            </span>
            <span className="text-[var(--text-main)]  font-heading">CARE</span>
          </h1>
          {user?.role && user.role !== "patient" && (
            <span
              className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                user.role === "admin"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {user.role}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${
                      isActive
                        ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]"
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 border-l border-[var(--border-light)] pl-6">
            <ThemeToggle />

            {!isAuthenticated ? (
              <NavLink
                to="/signin"
                className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Sign In
              </NavLink>
            ) : (
              <UserDetails />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sticky top-0 z-30 lg:hidden h-16 flex items-center justify-between px-5 bg-[var(--bg-secondary)]/90 backdrop-blur-md border-b border-[var(--border-light)]">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[var(--text-main)]"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center gap-1.5">
          <h1 className="font-heading text-lg">
            <span className="text-[var(--accent-primary)]">NEURO</span>
            <span>CARE</span>
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <UserDetails />
          ) : (
            <NavLink
              to="/signin"
              className="text-sm font-semibold text-[var(--accent-primary)]"
            >
              Sign In
            </NavLink>
          )}
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        ref={overlayRef}
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 hidden z-40 backdrop-blur-xs"
      />

      {/* Mobile Drawer Content */}
      <div
        ref={drawerRef}
        className="fixed left-0 top-0 h-screen w-80 bg-[var(--bg-secondary)] z-50 border-r border-[var(--border-light)] flex flex-col shadow-2xl"
        style={{ transform: "translateX(-100%)" }}
      >
        <div className="flex justify-between items-center h-16 px-6 border-b border-[var(--border-light)]">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-lg">
              <span className="text-[var(--accent-primary)]">NEURO</span>CARE
            </h1>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          {navLinks.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-all ${
                  isActive
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]"
                }`
              }
            >
              {route.name}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
