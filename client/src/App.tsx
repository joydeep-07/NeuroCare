import { useEffect } from "react";
import { useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./layouts/Root";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddMember from "./pages/AddMember";
import SignIn from "./pages/SignIn";

import type { RootState } from "./redux/store";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "add/member",
        element: <AddMember />,
      },
      {
        path: "signin",
        element: <SignIn />,
      },
    ],
  },
]);

const App = () => {
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return <RouterProvider router={router} />;
};

export default App;
