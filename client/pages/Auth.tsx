import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthPage() {
  const { login, register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const initialTab = sp.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState<string>(initialTab);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    try {
      await login({
        email_or_username: String(form.get("email_or_username")),
        password: String(form.get("password")),
      });
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    try {
      await register({
        first_name: String(form.get("first_name")),
        last_name: String(form.get("last_name")),
        email: String(form.get("email")),
        username: String(form.get("username")),
        password: String(form.get("password")),
      });
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    }
  };

  return (
    <MainLayout>
      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="col-span-1 md:col-span-1">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] bg-clip-text text-transparent">
                  Welcome to MyPter
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Connect with world-class personal trainers, book sessions, and
                  achieve your goals.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Find trainers by specialization, location, and price
                  </li>
                  <li>• Real-time availability and easy booking</li>
                  <li>• Secure messaging and notifications</li>
                </ul>
              </div>
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {tab === "login" ? "Sign in" : "Create your account"}
                    </CardTitle>
                    <CardDescription>
                      {tab === "login"
                        ? "Access your dashboard"
                        : "Join as a trainer or client"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                        {error}
                      </div>
                    )}
                    {tab === "login" ? (
                      <form className="grid gap-4" onSubmit={handleLogin}>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Email or Username
                          </label>
                          <Input
                            name="email_or_username"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Password
                          </label>
                          <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <Button
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
                        >
                          {loading ? "Please wait..." : "Sign In"}
                        </Button>
                      </form>
                    ) : (
                      <form className="grid gap-4" onSubmit={handleRegister}>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            First name
                          </label>
                          <Input name="first_name" required />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Last name
                          </label>
                          <Input name="last_name" required />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input name="email" type="email" required />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Username
                          </label>
                          <Input name="username" required />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium">
                            Password
                          </label>
                          <Input name="password" type="password" required />
                        </div>
                        <Button
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
                        >
                          {loading ? "Creating..." : "Create Account"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
}
