import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { toggleTheme } from "../redux/themeSlice";
import type { RootState, AppDispatch } from "../redux/store";

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const isDark = mode === "dark";

  const handleToggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Use a robust hypotenuse calculation with an amplified multiplier
    // to prevent the edge rasterizer from lagging behind on corners
    const maxDistanceX = Math.max(x, window.innerWidth - x);
    const maxDistanceY = Math.max(y, window.innerHeight - y);
    const endRadius = Math.hypot(maxDistanceX, maxDistanceY) * 1.15;

    if (!document.startViewTransition) {
      dispatch(toggleTheme());
      return;
    }

    const transition = document.startViewTransition(() => {
      dispatch(toggleTheme());
    });

    try {
      await transition.ready;

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 1000, // Slightly faster duration removes drag feeling on lower-end GPUs
          easing: "cubic-bezier(0.1, 0.9, 0.2, 1)", // Snappy custom deceleration curve
          pseudoElement: "::view-transition-new(root)",
        },
      );
    } catch {
      // Fallback if transition fails
    }
  };

  return (
    <button
      onClick={handleToggleTheme}
      aria-label="Toggle Theme"
      className="group flex h-10 w-10 items-center justify-center rounded-full
                 border border-[var(--border-light)]/50
                 bg-[var(--bg-surface)]
                 shadow-xs
                 hover:shadow-sm
                 transition-all duration-300 cursor-pointer"
    >
      <div>
        {isDark ? (
          <SunMedium
            size={19}
            className="text-[var(--text-primary)] transition-transform duration-300"
            strokeWidth={2}
          />
        ) : (
          <MoonStar
            size={19}
            className="text-[var(--text-primary)] transition-transform duration-300"
            strokeWidth={2}
          />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
