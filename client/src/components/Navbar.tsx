import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ConnectionIndicator from "./ui/ConnectionIndicator";

const NAV_LINKS = [
  { label: "Problems", to: "/" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Daily Challenge", to: "/coding" },
  { label: "Challenge a Friend", to: "/play" },
];

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-[#f59e0b]"
        : "text-[#a1a1aa] hover:text-[#e5e5e5]"
    }`;

  return (
    <header className="border-b border-[#6b7280] bg-[#0a0a0a]">
     <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <NavLink
          to="/"
          className="text-sm font-bold uppercase tracking-wider text-[#e5e5e5] hover:text-[#f59e0b] font-mono"
        >
          CodeBattle Arena
        </NavLink>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ConnectionIndicator />
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-[#e5e5e5] hover:text-[#f59e0b] transition-colors"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 text-sm font-medium text-[#e5e5e5] hover:text-[#f59e0b] transition-colors"
            >
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[#6b7280] text-[#e5e5e5] hover:bg-[#121212] md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-[#6b7280] bg-[#0a0a0a] md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-3 text-sm font-medium text-[#a1a1aa] hover:text-[#e5e5e5] hover:bg-[#121212] rounded-[var(--radius-md)] transition-colors"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between px-3 py-3 border-t border-[#6b7280] mt-2">
              <ConnectionIndicator />
              {token ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-[#e5e5e5] hover:text-[#f59e0b] transition-colors"
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#e5e5e5] hover:text-[#f59e0b] transition-colors"
                >
                  Login
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
