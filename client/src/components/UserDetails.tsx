import { useState, useRef, useEffect } from "react";
import { FaUser, FaCode } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoAdd } from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";

const UserDetails = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setOpen(!open)}
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
        <div className="absolute w-md right-0 mt-2 overflow-hidden rounded-[28px] border border-[var(--border-light)]/50 bg-[var(--card-bg)] text-[var(--text-main)] shadow-[0_20px_60px_var(--shadow)] transition-all duration-300">
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

          {/* Content */}
          <div className="space-y-3 px-5 pb-5">
            {/* Theme */}
            <div className="overflow-hidden rounded-2xl border border-[var(--border-light)]/50 bg-[var(--bg-main)]">
              <div className="flex items-center justify-between px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                <span className="font-medium">Choose Theme</span>
                <ThemeToggle />
              </div>
            </div>

            {/* Accounts */}
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

                <span className="font-medium">Add another account</span>
              </button>

              <button className="flex w-full items-center gap-4 px-6 py-5 transition-colors duration-300 hover:bg-[var(--bg-secondary)]/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--danger)]">
                  <FiLogOut />
                </div>

                <span className="font-medium text-[var(--danger)]">
                  Sign out of all accounts
                </span>
              </button>
            </div>

            {/* Footer */}
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
      )}
    </div>
  );
};

export default UserDetails;
