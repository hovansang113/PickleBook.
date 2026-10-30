import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../features/auth/useAuthStore";

const navItems = [
  { label: "Dashboard", icon: "📊", to: "/admin", end: true },
  { label: "Courts", icon: "🎾", to: "/admin/courts" },
  { label: "Bookings", icon: "📅", to: "/admin/bookings" },
];



export default function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-outline bg-neutral-50 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
          {user?.username?.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-semibold text-neutral-900">Admin Portal</p>
          <p className="text-xs text-neutral-500">Court Management</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
                : "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100"
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

      </nav>
      <button
        type="button"
        onClick={onLogout}
            className="mt-auto flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-500 hover:bg-error-bg hover:text-error"

      >
        Đăng xuất
      </button>
    </aside>
  );
}
