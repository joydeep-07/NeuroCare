import { useEffect } from "react";
import { useSelector } from "react-redux";

import Root from "./layouts/Root";
import type { RootState } from "./redux/store";

const App = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);

 useEffect(() => {
   if (mode === "dark") {
     document.documentElement.classList.add("dark");
   } else {
     document.documentElement.classList.remove("dark");
   }
 }, [mode]);

  return (
    <div className="font-heading">
      <Root />
    </div>
  );
};

export default App;
