import { useEffect } from "react";
import { useSelector } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./layouts/Root";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import DoctorSearch from "./pages/patient/DoctorSearch";
import MyAppointments from "./pages/patient/MyAppointments";
import FamilyMembers from "./pages/patient/FamilyMembers";
import MedicalRecords from "./pages/patient/MedicalRecords";
import AiAssistant from "./pages/patient/AiAssistant";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddDoctor from "./pages/admin/AddDoctor";
import AdminAppointments from "./pages/admin/AdminAppointments";

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
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "doctors",
        element: <DoctorSearch />,
      },
      {
        path: "appointments",
        element: <MyAppointments />,
      },
      {
        path: "members",
        element: <FamilyMembers />,
      },
      {
        path: "add/member",
        element: <FamilyMembers />,
      },
      {
        path: "records",
        element: <MedicalRecords />,
      },
      {
        path: "ai-assistant",
        element: <AiAssistant />,
      },
      {
        path: "doctor/dashboard",
        element: <DoctorDashboard />,
      },
      {
        path: "doctor/availability",
        element: <DoctorDashboard />,
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "admin/add-doctor",
        element: <AddDoctor />,
      },
      {
        path: "admin/appointments",
        element: <AdminAppointments />,
      },
      {
        path: "admin/users",
        element: <AdminDashboard />,
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
