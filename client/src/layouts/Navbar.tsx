import ThemeToggle from "../components/ThemeToggle";
import UserDetails from "../components/UserDetails";

const Navbar = () => {
  return (
    <nav className="border border-[var(--border-light)] h-16 flex justify-between items-center">
      <div className="left py-5 px-16">
        <h1 className="font-heading text-2xl font-medium">
          <span className="text-[var(--accent-primary)]">NEURO</span>CARE
        </h1>
      </div>
      <div className="right py-5 px-16 flex gap-26">
        <ul className="flex gap-10 items-center">
          <li className="cursor-pointer">Home</li>
          <li className="cursor-pointer">About</li>
          <li className="cursor-pointer">Contact</li>
        </ul>
        <div className="btn flex gap-6">
          <button>Login</button>
          <UserDetails/>
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
