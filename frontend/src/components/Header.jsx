import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../features/auth/useAuthStore";

const navLinkClass = ({ isActive }) =>
  isActive
    ? "font-medium text-primary underline underline-offset-4"
    : "text-neutral-600 transition-colors hover:text-neutral-900";

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  const initial = user?.username?.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-outline px-8 py-4">
      <span className="font-headline text-xl font-bold text-primary">
        SangPickle
      </span>

      <nav className="flex items-center gap-6">
        <NavLink to="/courts" className={navLinkClass}>
          Courts
        </NavLink>
        <NavLink to="/rewards" className={navLinkClass}>
          Rewards
        </NavLink>
        <NavLink to="/about" className={navLinkClass}>
          About
        </NavLink>
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-neutral-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initial}
              </span>
              <span className="text-sm font-medium text-neutral-700">
                {user.username}
              </span>
              <span
                className={`text-xs text-neutral-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-outline bg-neutral-50 py-1 shadow-soft">
                <NavLink
                  to="/my-bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  Lịch sử đặt sân
                </NavLink>
                <button
                  type="button"
                  onClick={onLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-error-bg"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="text-neutral-700">
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Join Now
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
