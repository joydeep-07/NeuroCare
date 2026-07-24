import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { useSelector } from "react-redux";

import UserDetails from "../components/UserDetails";
import type { RootState } from "../redux/store";

const navLinks = [{ name: "Home", path: "/" }];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    if (open) {
      gsap.set(overlayRef.current, {
        display: "block",
      });

      const tl = gsap.timeline();

      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.25,
        },
      );

      tl.fromTo(
        drawerRef.current,
        {
          x: "-100%",
        },
        {
          x: 0,
          duration: 0.45,
          ease: "power3.out",
        },
        "-=0.1",
      );

      tl.fromTo(
        itemsRef.current,
        {
          opacity: 0,
          x: -20,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.35,
        },
        "-=0.2",
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () =>
          gsap.set(overlayRef.current, {
            display: "none",
          }),
      });

      tl.to(drawerRef.current, {
        x: "-100%",
        duration: 0.35,
        ease: "power3.in",
      });

      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.25,
        },
        "-=0.2",
      );
    }
  }, [open]);

 return (
   <>
     {/* Desktop */}
     <nav className="hidden lg:flex h-16 justify-between items-center border-b border-[var(--border-light)]/30 shadow-xs px-16">
       <Link to="/">
         <h1 className="font-heading text-2xl font-medium">
           <span className="text-[var(--accent-primary)] font-medium font-heading">
             NEURO
           </span>
           CARE
         </h1>
       </Link>

       <div className="flex items-center gap-20">
         <ul className="flex items-center gap-10">
           {navLinks.map((route) => (
             <li key={route.path}>
               <NavLink
                 to={route.path}
                 className={({ isActive }) =>
                   `font-medium transition-colors duration-200 ${
                     isActive
                       ? "text-[var(--accent-primary)]"
                       : "hover:text-[var(--accent-primary)]"
                   }`
                 }
               >
                 {route.name}
               </NavLink>
             </li>
           ))}

           {isAuthenticated && (
             <>
               <li>
                 <NavLink
                   to="/profile"
                   className={({ isActive }) =>
                     `font-medium transition-colors duration-200 ${
                       isActive
                         ? "text-[var(--accent-primary)]"
                         : "hover:text-[var(--accent-primary)]"
                     }`
                   }
                 >
                   Profile
                 </NavLink>
               </li>

               <li>
                 <NavLink
                   to="/add/member"
                   className={({ isActive }) =>
                     `font-medium transition-colors duration-200 ${
                       isActive
                         ? "text-[var(--accent-primary)]"
                         : "hover:text-[var(--accent-primary)]"
                     }`
                   }
                 >
                   Add Member
                 </NavLink>
               </li>
             </>
           )}
         </ul>

         <div className="flex items-center gap-6">
           {!isAuthenticated ? (
             <NavLink
               to="/signin"
               className={({ isActive }) =>
                 `font-medium transition-colors duration-200 ${
                   isActive
                     ? "text-[var(--accent-primary)]"
                     : "hover:text-[var(--accent-primary)]"
                 }`
               }
             >
               Sign In
             </NavLink>
           ) : (
             <UserDetails />
           )}
         </div>
       </div>
     </nav>

     {/* Mobile */}
     <nav className="lg:hidden h-16 flex items-center justify-between px-5 border-b border-[var(--border-light)]">
       <button onClick={() => setOpen(true)}>
         <Menu size={24} />
       </button>

       <Link to="/">
         <h1 className="font-heading font-semibold text-xl">
           <span className="text-[var(--accent-primary)] font-heading ">
             NEURO
           </span>
           CARE
         </h1>
       </Link>

       {isAuthenticated ? (
         <UserDetails />
       ) : (
         <NavLink
           to="/signin"
           className="font-medium hover:text-[var(--accent-primary)]"
         >
           Sign In
         </NavLink>
       )}
     </nav>

     {/* Overlay */}
     <div
       ref={overlayRef}
       onClick={() => setOpen(false)}
       className="fixed inset-0 bg-black/40 hidden z-40"
     />

     {/* Drawer */}
     <div
       ref={drawerRef}
       className="fixed left-0 top-0 h-screen w-72 bg-[var(--bg-main)] z-50 border-r border-[var(--border-light)]"
       style={{ transform: "translateX(-100%)" }}
     >
       <div className="flex justify-between items-center h-16 px-6 border-b border-[var(--border-light)]">
         <h1 className="font-heading font-semibold text-lg">
           <span className="text-[var(--accent-primary)] font-heading ">
             NEURO
           </span>
           CARE
         </h1>

         <button onClick={() => setOpen(false)}>
           <X size={22} />
         </button>
       </div>

       <ul className="p-6 space-y-8 text-lg">
         {[
           ...navLinks,
           ...(isAuthenticated
             ? [
                 { name: "Profile", path: "/profile" },
                 { name: "Add Member", path: "/add/member" },
               ]
             : [{ name: "Sign In", path: "/signin" }]),
         ].map((route, index) => (
           <li
             key={route.path}
             ref={(el) => {
               if (el) itemsRef.current[index] = el;
             }}
           >
             <NavLink
               to={route.path}
               onClick={() => setOpen(false)}
               className={({ isActive }) =>
                 `block font-medium transition-colors duration-200 ${
                   isActive
                     ? "text-[var(--accent-primary)]"
                     : "hover:text-[var(--accent-primary)]"
                 }`
               }
             >
               {route.name}
             </NavLink>
           </li>
         ))}
       </ul>
     </div>
   </>
 );
};

export default Navbar;
