import { Link, useLocation } from "react-router-dom";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/bookings", label: "Bookings" },
  { href: "/profile", label: "Profile" },
  { href: "/trainers", label: "Find Trainers" },
];

export default function SidebarNav() {
  const { pathname } = useLocation();
  return (
    <aside className="rounded-lg border p-3 h-full">
      <div className="mb-2 text-sm font-semibold">Navigation</div>
      <nav className="text-sm grid">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              to={l.href}
              className={`rounded px-2 py-2 hover:bg-accent ${active ? "bg-accent font-medium" : ""}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
