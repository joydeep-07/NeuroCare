import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoAdd } from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";
import gsap from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction, updateUser } from "../redux/authSlice";
import type { AppDispatch, RootState } from "../redux/store";
import { TbXboxXFilled } from "react-icons/tb";
import { Link } from "react-router-dom";

import api from "../api/axios";
import ENDPOINTS from "../api/endPoints";
import { Cross, User } from "lucide-react";

const UserDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Extract user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
  // Avatar
  // ===============================
  const userAvatar =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.fullName || user?.name || user?.email || "User",
    )}&background=1a73e8&color=ffffff&size=256`;

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
  // Mobile Drawer Animation
  // ===============================
  useLayoutEffect(() => {
    if (window.innerWidth >= 768) return;

    if (open) {
      gsap.set(drawerRef.current, {
        x: "100%",
      });

      gsap.set(overlayRef.current, {
        opacity: 0,
      });

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });

      gsap.to(drawerRef.current, {
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  }, [open]);

  // ===============================
  // Close Drawer
  // ===============================
  const closeDrawer = () => {
    if (window.innerWidth >= 768) {
      setOpen(false);
      return;
    }

    gsap.to(drawerRef.current, {
      x: "100%",
      duration: 0.35,
      ease: "power3.in",
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      onComplete: () => setOpen(false),
    });
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
      {/* Avatar */}
      <button
        onClick={() => {
          if (open) closeDrawer();
          else setOpen(true);
        }}
        className="group relative cursor-pointer outline-none"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--card-bg)] shadow-[0_4px_18px_var(--shadow)] transition-all duration-300 ">
          {user?.avatar ? (
            <img
              src={userAvatar}
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

      {/* Dropdown */}
      {open && (
        <>
          {/* ================= Desktop Dropdown ================= */}
          <div className="hidden md:block">
            <div className="absolute right-0 mt-3 w-md overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--card-bg)] text-[var(--text-main)] shadow-[0_20px_60px_var(--shadow)] transition-all duration-300">
              {/* Header */}
              <div className="px-8 pt-6 pb-5">
                <p className="text-center text-[15px] font-medium text-[var(--text-secondary)]">
                  {user?.email || "NO USER FOUND"}
                </p>

                <div className="mt-6 flex justify-center">
                  {user?.avatar ? (
                    <>
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="h-24 w-24 rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg"
                      />
                    </>
                  ) : (
                    <>
                      <div className="h-24 w-24 flex justify-center items-center rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg">
                        <FaUserCircle
                          size={76}
                          className="text-[var(--text-secondary)] "
                        />
                      </div>
                    </>
                  )}
                </div>

                <h2 className="mt-5 text-center text-4xl font-semibold text-[var(--text-main)]">
                  Hi, {user?.fullName || user?.name || "User"}!
                </h2>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => navigate("/profile")}
                    className="h-12 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)]/50 px-8 text-sm font-medium transition-all duration-300 hover:bg-[var(--bg-main)]"
                  >
                    Manage your NeuroCare Account
                  </button>
                </div>
              </div>

              <div className="space-y-3 px-5 pb-5">
                <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                  <div className="flex items-center justify-between px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                    <span className="font-medium">Choose Theme</span>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                  {members.map((member, index) => (
                    <button
                      key={member._id || index}
                      className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)]/50 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        <img
                          className="h-11 w-11 rounded-full object-cover"
                          src={
                            member.avatar ||
                            "https://i.pinimg.com/1200x/e6/ed/24/e6ed240b2f5367525acf1c9df1489fd6.jpg"
                          }
                          alt={member.fullName || "Member"}
                        />
                      </div>

                      <div className="text-left">
                        <p className="font-semibold text-[var(--text-main)]">
                          {member.fullName || member.name}
                        </p>

                        <p className="text-sm text-[var(--text-secondary)]">
                          {member.email}
                        </p>
                      </div>
                    </button>
                  ))}

                  <button className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      <IoAdd size={22} />
                    </div>

                    <span className="font-medium">Add another member</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--danger)]">
                      <FiLogOut />
                    </div>

                    <span className="font-medium text-[var(--danger)]">
                      Sign out
                    </span>
                  </button>
                </div>

                <div className="mt-6 flex justify-center gap-4 text-sm text-[var(--text-secondary)]">
                  <button className="transition-colors hover:text-[var(--accent-primary)]">
                    Privacy Policy
                  </button>

                  <span>•</span>

                  <button className="transition-colors hover:text-[var(--accent-primary)]">
                    Terms of Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Mobile Drawer ================= */}
          <div className="md:hidden">
            <div
              ref={drawerRef}
              className="fixed top-0 right-0 z-50 h-screen w-[100%] overflow-y-auto bg-[var(--card-bg)] shadow-2xl"
            >
              <button className="absolute top-6 right-6" onClick={closeDrawer}>
                <TbXboxXFilled
                  size={20}
                  className="text-[var(--text-secondary)] "
                />
              </button>
              <div className="px-4 py-6">
                <p className="text-center text-sm font-medium text-[var(--text-secondary)]">
                  {user?.email || "user@example.com"}
                </p>

                <div className="mt-6 flex justify-center">
                  {user?.avatar ? (
                    <>
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="h-24 w-24 rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg"
                      />
                    </>
                  ) : (
                    <>
                      <div className="h-24 w-24 flex justify-center items-center rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg">
                        <FaUserCircle
                          size={74}
                          className="text-[var(--text-secondary)] "
                        />
                      </div>
                    </>
                  )}
                </div>

                <h2 className="mt-5 text-center text-3xl font-semibold">
                  Hi, {user?.fullName || user?.name || "User"}!
                </h2>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate("/profile");
                    }}
                    className="h-12 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] px-6 text-sm font-medium"
                  >
                    Manage your NeuroCare Account
                  </button>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                    <div className="flex items-center justify-between px-5 py-5">
                      <span className="font-medium">Choose Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
                    {members.map((member, index) => (
                      <button
                        key={member._id || index}
                        className="flex w-full items-center gap-4 px-5 py-5"
                      >
                        <img
                          src={
                            member.avatar ||
                            "https://i.pinimg.com/1200x/e6/ed/24/e6ed240b2f5367525acf1c9df1489fd6.jpg"
                          }
                          className="h-11 w-11 rounded-full object-cover"
                          alt={member.fullName || "Member"}
                        />

                        <div className="text-left">
                          <p className="font-semibold">
                            {member.fullName || member.name}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {member.email}
                          </p>
                        </div>
                      </button>
                    ))}

                    <button className="flex w-full items-center gap-4 px-5 py-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)]">
                        <IoAdd size={22} />
                      </div>

                      <span>Add another member</span>
                    </button>

                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-4 px-5 py-5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--danger)]">
                        <FiLogOut />
                      </div>

                      <span className="text-[var(--danger)]">Sign out</span>
                    </button>
                  </div>

                  <div className="flex justify-center gap-4 pt-4 text-sm text-[var(--text-secondary)]">
                    <button>Privacy Policy</button>
                    <span>•</span>
                    <button>Terms of Service</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;
