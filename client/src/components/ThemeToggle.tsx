import { useEffect, useRef } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { gsap } from "gsap";
import { useDispatch, useSelector } from "react-redux";

import { toggleTheme } from "../redux/themeSlice";
import type { RootState, AppDispatch } from "../redux/store";

const ThemeToggle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;

    gsap.fromTo(
      iconRef.current,
      {
        rotate: mode === "light" ? -180 : 180,
        scale: 0.4,
        opacity: 0,
      },
      {
        rotate: 0,
        scale: 1,
        opacity: 1,
        duration: 0.7,
        ease: "back.out(2)",
      },
    );
  }, [mode]);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle Theme"
      className="group flex h-10 w-10 items-center justify-center rounded-full
                 border border-[var(--border-light)]/50
                 bg-[var(--bg-surface)]
                 shadow-xs
                 hover:shadow-sm
                 transition-all duration-300 cursor-pointer"
    >
      <div ref={iconRef}>
        {mode === "light" ? (
          <MoonStar
            size={19}
            className="text-[var(--text-primary)]"
            strokeWidth={2}
          />
        ) : (
          <SunMedium
            size={19}
            className="text-[var(--text-primary)]"
            strokeWidth={2}
          />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
