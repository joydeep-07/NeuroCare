import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { toggleTheme } from "../redux/themeSlice";
import type { RootState, AppDispatch } from "../redux/store";

const ThemeToggle = () => {
  const dispatch = useDispatch<AppDispatch>();

  const mode = useSelector((state: RootState) => state.theme.mode);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center justify-center
                 text-[var(--text-primary)]
                 
                 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {mode === "light" ? <MdDarkMode size={22} /> : <MdLightMode size={22} />}
    </button>
  );
};

export default ThemeToggle;
