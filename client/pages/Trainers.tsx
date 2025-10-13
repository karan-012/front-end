import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/services/api";
import { useEffect, useState } from "react";
import BookingDialog from "@/components/booking/BookingDialog";

export default function Trainers() {
  const [q, setQ] = useState({
    specialization: "",
    location: "",
    training_type: "",
    language: "",
    min_price: "",
    max_price: "",
    min_experience: "",
    sort_by: "experience",
    sort_order: "desc",
  });
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 9;
  const [error, setError] = useState("");

  const fetchList = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.searchTrainers({
        ...q,
        page: p,
        per_page: perPage,
      });
      const raw = (data as any)?.trainers;
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object"
          ? Object.values(raw as any)
          : Array.isArray(data)
            ? (data as any)
            : [];
      setItems(list);
      setTotal((data as any)?.total ?? list.length);
      setPages((data as any)?.pages ?? Math.max(1, Math.ceil(((data as any)?.total ?? list.length) / perPage)));
      setPage((data as any)?.page ?? p);
    } catch (e: any) {
      setError(e?.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  return (
    <MainLayout>
      <section className="container py-10">
        <h1 className="text-3xl font-bold">Find Trainers</h1>
        <p className="text-muted-foreground">
          Search by specialization, experience, and more.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchList(1);
          }}
          className="mt-6 grid gap-3 md:grid-cols-4"
        >
          <Input
            placeholder="Specialization"
            value={q.specialization}
            onChange={(e) => setQ({ ...q, specialization: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={q.location}
            onChange={(e) => setQ({ ...q, location: e.target.value })}
          />
          <Input
            placeholder="Training type"
            value={q.training_type}
            onChange={(e) => setQ({ ...q, training_type: e.target.value })}
          />
          <Input
            placeholder="Language"
            value={q.language}
            onChange={(e) => setQ({ ...q, language: e.target.value })}
          />
          <Input
            placeholder="Min price"
            value={q.min_price}
            onChange={(e) => setQ({ ...q, min_price: e.target.value })}
          />
          <Input
            placeholder="Max price"
            value={q.max_price}
            onChange={(e) => setQ({ ...q, max_price: e.target.value })}
          />
          <Input
            placeholder="Min experience"
            value={q.min_experience}
            onChange={(e) => setQ({ ...q, min_experience: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={q.sort_by}
              onChange={(e) => setQ({ ...q, sort_by: e.target.value })}
            >
              <option value="experience">Sort by experience</option>
              <option value="price">Sort by price</option>
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={q.sort_order}
              onChange={(e) => setQ({ ...q, sort_order: e.target.value })}
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <Button
            type="submit"
            className="md:col-span-4 bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="trainers-grid">
          {loading &&
            Array.from({ length: perPage }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl border bg-muted animate-pulse"
              />
            ))}
          {!loading && items.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>No trainers found</CardTitle>
                <CardDescription>Try adjusting your filters.</CardDescription>
              </CardHeader>
            </Card>
          )}
          {!loading &&
            items.map((t: any, idx: number) => (
              <Card
                key={t.id || idx}
                className="overflow-hidden transition-transform hover:scale-[1.01]"
              >
                <div className="h-24 bg-gradient-to-r from-[hsl(var(--brand-start))]/20 to-[hsl(var(--brand-end))]/20" />
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a href={`/profile/${encodeURIComponent(t.username || "")}`} className="hover:underline">
                      {t.username || t.name || "Trainer"}
                    </a>
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
                  <div className="mt-4">
                    <BookingDialog trainerUsername={t.username || ""} />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => fetchList(page - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            disabled={page >= pages}
            onClick={() => fetchList(page + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
