import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";

const Root = () => {
  const location = useLocation();

  const hideFooter = location.pathname === "/ai-assistant";

  return (
    <div>
      <Navbar />
      <Outlet />
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Root;
