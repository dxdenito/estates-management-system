import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES, withAdmin } from "../../routing/roles";
import { secondaryButtonClass } from "../ui/styles";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", roles: null },
  { to: "/triage", label: "Triage Queue", roles: withAdmin(ROLES.OFFICER) },
  { to: "/workbench", label: "Workbench", roles: withAdmin(ROLES.FIELD_SUPERVISOR) },
  { to: "/manager", label: "Manager Console", roles: withAdmin(ROLES.MANAGER) },
  { to: "/tasks", label: "My Tasks", roles: withAdmin(ROLES.ARTISAN) },
  { to: "/cleaning", label: "Cleaning Oversight", roles: withAdmin(ROLES.CLEANING_SUPERVISOR) },
  { to: "/reports", label: "Reports", roles: withAdmin(ROLES.MANAGER) },
  { to: "/admin/users", label: "Users & Roles", roles: withAdmin() },
  { to: "/admin/reference-data", label: "Reference Data", roles: withAdmin(ROLES.MANAGER) },
  { to: "/contractor", label: "Contractor Portal", roles: withAdmin(ROLES.CONTRACTOR_SUPERVISOR) },
];

const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-control px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-primary-soft text-primary"
      : "text-ink-muted hover:bg-surface-muted hover:text-ink"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

    const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((role) => user.roles?.includes(role))
  );

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted text-ink">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:px-6">
        <span className="text-lg font-semibold text-primary">Estates Management</span>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-ink-muted sm:inline">{user.name}</span>
          <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
            Log out
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface p-2 md:w-60 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:p-4">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}