import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoAdd } from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";
import UploadAvatar from "../components/patient/UploadAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction, updateUser } from "../redux/authSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { TbXboxXFilled } from "react-icons/tb";

import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import { User } from "lucide-react";

const UserDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Extract user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===============================
  // Load Logged In User / Profile
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get(ENDPOINTS.PROFILE.GET);

        if (profileRes.data.success) {
          // Update Redux state and localStorage simultaneously via slice action
          dispatch(updateUser(profileRes.data.user));
        }

        const memberRes = await api.get(ENDPOINTS.MEMBER.GET_ALL);

        if (memberRes.data.success) {
          setMembers(memberRes.data.members);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [dispatch]);

  // ===============================
  // Filter out the logged-in user from members list
  // ===============================
  const filteredMembers = members.filter((member) => {
    const memberUserId = member.user?._id || member.user?.id;
    const currentUserId = user?._id || user?.id;

    // If IDs match, it's the self-account, so filter it out
    if (memberUserId && currentUserId && memberUserId === currentUserId) {
      return false;
    }

    // Fallback comparison by email if IDs aren't available
    if (member.user?.email && user?.email && member.user.email === user.email) {
      return false;
    }

    return true;
  });

  // ===============================
  // Logout
  // ===============================
  const logout = async () => {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(logoutAction());

      setOpen(false);
      setMembers([]);

      navigate("/signin", { replace: true });
    }
  };

  // ===============================
  // Close Desktop Dropdown
  // ===============================
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative cursor-pointer outline-none"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--card-bg)] shadow-[0_4px_18px_var(--shadow)] transition-all duration-300 ">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <FaUser
              size={18}
              className="text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-[var(--text-main)]"
            />
          )}

          {/* Online Indicator */}
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[var(--card-bg)] bg-[var(--success)]" />
        </div>
      </button>

      {/* Dropdown / Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* ================= Desktop Dropdown ================= */}
            <div className="hidden md:block">
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 z-[9999] mt-3 w-sm max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--card-bg)] text-[var(--text-main)] shadow-[0_20px_60px_var(--shadow)]"
              >
                {/* Header */}
                <div className="px-5 pt-5 pb-4">
                  <p className="text-center text-xs font-medium text-[var(--text-secondary)] truncate">
                    {user?.email || "NO USER FOUND"}
                  </p>

                  {/* Integrated Upload Avatar Component */}
                  <div className="mt-4 flex justify-center">
                    <UploadAvatar size="w-16 h-16" />
                  </div>

                  <h2 className="mt-3 text-center text-xl font-semibold text-[var(--text-main)] truncate px-2">
                    Hi, {(user?.fullName || user?.name || "User").split(" ")[0]}{" "}
                    !
                  </h2>

                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/members");
                      }}
                      className="h-9 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)]/50 px-4 text-xs font-medium transition-all duration-300 hover:bg-[var(--bg-main)] cursor-pointer"
                    >
                      Manage your NeuroCare Account
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 px-4 pb-4">
                  <div className="overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                    <div className="flex items-center justify-between px-4 py-3 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                      <span className="text-sm font-medium">Choose Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                    {filteredMembers.map((member, index) => (
                      <button
                        key={member._id || index}
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-3 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50 cursor-pointer"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border border-[var(--border-light)]/50 bg-[var(--bg-secondary)]">
                          {member.user?.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={member.user?.fullName || "Member Avatar"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User
                              size={16}
                              className="text-[var(--text-secondary)] transition-opacity duration-300 group-hover:opacity-60"
                            />
                          )}
                        </div>

                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                            {member.user?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] truncate">
                            {member.user?.email || "-"}
                          </p>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        <IoAdd size={18} />
                      </div>
                      <span className="text-sm font-medium">
                        Add another member
                      </span>
                    </button>

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--danger)]">
                        <FiLogOut size={16} />
                      </div>
                      <span className="text-sm font-medium text-[var(--danger)]">
                        Sign out
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex justify-center gap-3 text-xs text-[var(--text-secondary)]">
                    <button
                      onClick={() => setOpen(false)}
                      className="transition-colors hover:text-[var(--accent-primary)] cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setOpen(false)}
                      className="transition-colors hover:text-[var(--accent-primary)] cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ================= Mobile Drawer ================= */}
            <div className="md:hidden">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 z-50 h-screen w-[100%] overflow-y-auto bg-[var(--card-bg)] shadow-2xl"
              >
                <button
                  className="absolute top-5 right-5 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  <TbXboxXFilled
                    size={22}
                    className="text-[var(--text-secondary)]"
                  />
                </button>
                <div className="px-4 py-5">
                  <p className="text-center text-xs font-medium text-[var(--text-secondary)] truncate px-6">
                    {user?.email || "user@example.com"}
                  </p>

                  {/* Integrated Upload Avatar Component for Mobile */}
                  <div className="mt-4 flex justify-center">
                    <UploadAvatar size="w-16 h-16" />
                  </div>

                  <h2 className="mt-3 text-center text-2xl font-semibold truncate px-2">
                    Hi, {user?.fullName || user?.name || "User"}!
                  </h2>

                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                      className="h-9 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 text-xs font-medium cursor-pointer"
                    >
                      Manage your NeuroCare Account
                    </button>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    <div className="overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium">
                          Choose Theme
                        </span>
                        <ThemeToggle />
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                      {filteredMembers.map((member, index) => (
                        <button
                          key={member._id || index}
                          onClick={() => setOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-3 cursor-pointer"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border border-[var(--border-light)]/50 bg-[var(--bg-secondary)]">
                            {member.user?.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt={member.user?.fullName || "Member Avatar"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User
                                size={16}
                                className="text-[var(--text-secondary)] transition-opacity duration-300 group-hover:opacity-60"
                              />
                            )}
                          </div>

                          <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {member.user?.fullName || "Unknown User"}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">
                              {member.user?.email || "-"}
                            </p>
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-3 cursor-pointer"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)]">
                          <IoAdd size={18} />
                        </div>
                        <span className="text-sm font-medium">
                          Add another member
                        </span>
                      </button>

                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 cursor-pointer"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--danger)]">
                          <FiLogOut size={16} />
                        </div>
                        <span className="text-sm font-medium text-[var(--danger)]">
                          Sign out
                        </span>
                      </button>
                    </div>

                    <div className="flex justify-center gap-3 pt-3 text-xs text-[var(--text-secondary)]">
                      <button
                        onClick={() => setOpen(false)}
                        className="cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => setOpen(false)}
                        className="cursor-pointer"
                      >
                        Terms of Service
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDetails;
