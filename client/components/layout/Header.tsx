import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const activeClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))]" />
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] bg-clip-text text-transparent">
            MyPter
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink to="/trainers" className={activeClass}>
            Find Trainers
          </NavLink>
          <NavLink to="/bookings" className={activeClass}>
            Bookings
          </NavLink>
          <NavLink to="/chat" className={activeClass}>
            Chat
          </NavLink>
          <NavLink to="/dashboard" className={activeClass}>
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
              >
                <Link to="/auth?tab=register">Get started</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm text-muted-foreground">
                Hi, {user?.username || user?.first_name}
              </span>
              <Button variant="outline" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
