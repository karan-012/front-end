import { useEffect, useState } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/api";
import { Link } from "react-router-dom";

export default function Index() {
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    training_type: "",
    min_price: "",
    max_price: "",
    min_experience: "",
    language: "",
  });
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchTrainers = async (params: Record<string, any> = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.searchTrainers({
        per_page: 6,
        page: 1,
        ...params,
      });
      const raw = (data as any)?.trainers;
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object"
          ? Object.values(raw as any)
          : Array.isArray(data)
            ? (data as any)
            : [];
      setTrainers(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTrainers(filters);
  };

  return (
    <MainLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--brand-start))] via-transparent to-transparent bg-[length:200%_200%] animate-gradient-x" />
        <div className="container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Train smarter with
                <span className="block bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] bg-clip-text text-transparent">
                  world‑class personal trainers
                </span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                MyPter connects clients and certified trainers globally. Search,
                chat, and book sessions with confidence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
                >
                  <Link to="/trainers">Find Trainers</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth?tab=register">Become a Trainer</Link>
                </Button>
              </div>
            </div>
            <div>
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <Input
                  placeholder="Specialization (e.g. Strength)"
                  value={filters.specialization}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      specialization: e.target.value,
                    }))
                  }
                  className="col-span-2 md:col-span-1"
                />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, location: e.target.value }))
                  }
                  className="col-span-2 md:col-span-1"
                />
                <Input
                  placeholder="Training type (Online / In-person)"
                  value={filters.training_type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, training_type: e.target.value }))
                  }
                  className="col-span-2"
                />
                <Input
                  placeholder="Language"
                  value={filters.language}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, language: e.target.value }))
                  }
                />
                <Input
                  placeholder="Min experience (years)"
                  value={filters.min_experience}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      min_experience: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Min price"
                  value={filters.min_price}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, min_price: e.target.value }))
                  }
                />
                <Input
                  placeholder="Max price"
                  value={filters.max_price}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, max_price: e.target.value }))
                  }
                />
                <Button
                  type="submit"
                  className="col-span-2 bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured trainers</h2>
            <p className="text-muted-foreground">
              Discover professionals tailored to your goals
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/trainers">View all</Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border bg-muted animate-pulse"
              />
            ))}
          {!loading && trainers.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>No trainers found</CardTitle>
                <CardDescription>
                  Try adjusting your filters to discover more trainers.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {!loading &&
            trainers.map((t: any, idx: number) => (
              <Card key={t.id || idx} className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[hsl(var(--brand-start))]/20 to-[hsl(var(--brand-end))]/20" />
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t.username || t.name || "Trainer"}
                  </CardTitle>
                  <CardDescription>
                    {[t.specialization, t.location].filter(Boolean).join(" • ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      {t.experience_years
                        ? `${t.experience_years} yrs exp`
                        : "Experience N/A"}
                    </span>
                    <span>
                      {t.price_per_session
                        ? `$${t.price_per_session}/session`
                        : "Price N/A"}
                    </span>
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link
                      to={`/profile?u=${encodeURIComponent(t.username || "")}`}
                    >
                      View Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>Find, chat, and book in minutes</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground grid gap-2">
              <div>1. Search trainers by specialization and location</div>
              <div>2. Chat to align on goals and availability</div>
              <div>3. Book and manage sessions seamlessly</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular categories</CardTitle>
              <CardDescription>Strength, Weight loss, Mobility, Yoga</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Explore expert-led programs tailored to your level and goals.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Flexible formats</CardTitle>
              <CardDescription>Online, In-person, Hybrid</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Train wherever you are with formats that fit your schedule.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-2xl border bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] p-8 md:p-12 text-white">
          <h3 className="text-2xl md:text-3xl font-extrabold">
            Are you a certified trainer?
          </h3>
          <p className="mt-2 max-w-2xl text-white/90">
            Join MyPter to reach clients worldwide, manage your availability,
            and grow your business.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-white text-foreground hover:bg-white/90"
          >
            <Link to="/auth?tab=register">Create trainer account</Link>
          </Button>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>What our users say</CardTitle>
              <CardDescription>Real stories, real results</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground grid gap-3">
              <div className="rounded border p-3">“Found an amazing trainer for my marathon prep!” — Priya</div>
              <div className="rounded border p-3">“Flexible online sessions fit my busy schedule.” — Amit</div>
              <div className="rounded border p-3">“Great platform to manage my clients.” — Rohan (Trainer)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Why MyPter</CardTitle>
              <CardDescription>Built for clients and trainers</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground grid gap-2">
              <div>• Verified trainer profiles</div>
              <div>• Calendar-friendly availability</div>
              <div>• Secure payments and receipts</div>
              <div>• Reviews and ratings you can trust</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="rounded-xl border p-6">
            <div className="text-3xl font-extrabold">10k+</div>
            <div className="text-muted-foreground">Sessions booked</div>
          </div>
          <div className="rounded-xl border p-6">
            <div className="text-3xl font-extrabold">4.8/5</div>
            <div className="text-muted-foreground">Average trainer rating</div>
          </div>
          <div className="rounded-xl border p-6">
            <div className="text-3xl font-extrabold">90%</div>
            <div className="text-muted-foreground">Client satisfaction</div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Common questions, answered</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground grid gap-3">
              <div>
                <div className="font-medium">How do I book a session?</div>
                <div>Find a trainer, open their profile, and request a booking.</div>
              </div>
              <div>
                <div className="font-medium">Can I reschedule?</div>
                <div>Yes, coordinate via chat and update the booking if needed.</div>
              </div>
              <div>
                <div className="font-medium">Is online training effective?</div>
                <div>Absolutely—our trainers run tailored sessions for home setups.</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Get started today</CardTitle>
              <CardDescription>It’s free to browse trainers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white">
                <Link to="/trainers">Find your trainer</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
