import { useState, useRef, useEffect } from "react";
import { FaUser, FaCode } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoAdd, IoReturnUpBackOutline } from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";
import gsap from "gsap";
import { useLayoutEffect } from "react";

const UserDetails = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.innerWidth >= 768) return;

    if (open) {
      gsap.set(drawerRef.current, { x: "100%" });
      gsap.set(overlayRef.current, { opacity: 0 });

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
          <FaUser
            size={18}
            className="text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-[var(--text-main)]"
          />

          {/* Online Indicator */}
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[var(--card-bg)] bg-[var(--success)]" />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* ================= Desktop Dropdown ================= */}
          <div className="hidden md:block">
            <div className="absolute w-md right-0 mt-3 overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--card-bg)] text-[var(--text-main)] shadow-[0_20px_60px_var(--shadow)] transition-all duration-300">
              {/* Header */}
              <div className="px-8 pt-6 pb-5">
                <p className="text-center text-[15px] font-medium text-[var(--text-secondary)]">
                  joydeeprnp8821@gmail.com
                </p>

                <div className="mt-6 flex justify-center">
                  <img
                    src="https://i.pinimg.com/736x/2e/ae/fd/2eaefd75d164be0b17ef6f09749d0da8.jpg"
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg"
                  />
                </div>

                <h2 className="mt-5 text-center text-4xl font-semibold text-[var(--text-main)]">
                  Hi, Joydeep!
                </h2>

                <div className="mt-6 flex justify-center">
                  <button className="h-12 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)]/50 px-8 text-sm font-medium transition-all duration-300 hover:bg-[var(--bg-main)]">
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
                  <button className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)]/50 bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      <img
                        className="rounded-full h-11 w-11"
                        src="https://i.pinimg.com/1200x/e6/ed/24/e6ed240b2f5367525acf1c9df1489fd6.jpg"
                        alt=""
                      />
                    </div>

                    <div className="text-left">
                      <p className="font-semibold text-[var(--text-main)]">
                        Soumika Maji
                      </p>

                      <p className="text-sm text-[var(--text-secondary)]">
                        soumikamaji2005@gmail.com
                      </p>
                    </div>
                  </button>

                  <button className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      <IoAdd size={22} />
                    </div>

                    <span className="font-medium">Add another member</span>
                  </button>

                  <button className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
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
              className="fixed right-0 top-0 z-50 h-screen w-[100%] overflow-y-auto bg-[var(--card-bg)] shadow-2xl"
            >
              <button className="absolute top-6 left-6" onClick={closeDrawer}>
                <IoReturnUpBackOutline
                  size={20}
                  className="text-[var(--text-main)] "
                />
              </button>
              <div className="px-4 py-6">
                <p className="text-center text-sm font-medium text-[var(--text-secondary)]">
                  joydeeprnp8821@gmail.com
                </p>

                <div className="mt-6 flex justify-center">
                  <img
                    src="https://i.pinimg.com/736x/2e/ae/fd/2eaefd75d164be0b17ef6f09749d0da8.jpg"
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-4 border-[var(--border-light)] object-cover shadow-lg"
                  />
                </div>

                <h2 className="mt-5 text-center text-3xl font-semibold">
                  Hi, Joydeep!
                </h2>

                <div className="mt-6 flex justify-center">
                  <button className="h-12 rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] px-6 text-sm font-medium">
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
                    <button className="flex w-full items-center gap-4 px-5 py-5">
                      <img
                        src="https://i.pinimg.com/1200x/e6/ed/24/e6ed240b2f5367525acf1c9df1489fd6.jpg"
                        className="h-11 w-11 rounded-full"
                        alt=""
                      />

                      <div className="text-left">
                        <p className="font-semibold">Soumika Maji</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          soumikamaji2005@gmail.com
                        </p>
                      </div>
                    </button>

                    <button className="flex w-full items-center gap-4 px-5 py-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)]">
                        <IoAdd size={22} />
                      </div>

                      <span>Add another member</span>
                    </button>

                    <button className="flex w-full items-center gap-4 px-5 py-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--danger)]">
                        <FiLogOut />
                      </div>

                      <span className="text-[var(--danger)]">
                        Sign out
                      </span>
                    </button>
                  </div>

                  <div className="pt-4 flex justify-center gap-4 text-sm text-[var(--text-secondary)]">
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
