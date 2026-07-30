import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import useLenis from "../hooks/useLenis";

const Root = () => {
  const location = useLocation();

  const hideFooter = location.pathname === "/ai-assistant";
  useLenis();
  return (
    <div>
      <Navbar />
      <Outlet />
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Root;
