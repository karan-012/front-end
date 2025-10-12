import { useEffect, useState } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      const data = await api.searchTrainers({ per_page: 6, page: 1, ...params });
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
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
        <div className="absolute inset-0 -z-10 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(var(--brand-start))] via-transparent to-transparent" />
        <div className="container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Train smarter with
                <span className="block bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] bg-clip-text text-transparent">world‑class personal trainers</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">MyPter connects clients and certified trainers globally. Search, chat, and book sessions with confidence.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"><Link to="/trainers">Find Trainers</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/auth?tab=register">Become a Trainer</Link></Button>
              </div>
            </div>
            <div>
              <form onSubmit={handleSearch} className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 shadow-sm">
                <Input placeholder="Specialization (e.g. Strength)" value={filters.specialization} onChange={(e)=>setFilters(f=>({...f,specialization:e.target.value}))} className="col-span-2 md:col-span-1" />
                <Input placeholder="Location" value={filters.location} onChange={(e)=>setFilters(f=>({...f,location:e.target.value}))} className="col-span-2 md:col-span-1" />
                <Input placeholder="Training type (Online / In-person)" value={filters.training_type} onChange={(e)=>setFilters(f=>({...f,training_type:e.target.value}))} className="col-span-2" />
                <Input placeholder="Language" value={filters.language} onChange={(e)=>setFilters(f=>({...f,language:e.target.value}))} />
                <Input placeholder="Min experience (years)" value={filters.min_experience} onChange={(e)=>setFilters(f=>({...f,min_experience:e.target.value}))} />
                <Input placeholder="Min price" value={filters.min_price} onChange={(e)=>setFilters(f=>({...f,min_price:e.target.value}))} />
                <Input placeholder="Max price" value={filters.max_price} onChange={(e)=>setFilters(f=>({...f,max_price:e.target.value}))} />
                <Button type="submit" className="col-span-2 bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white" disabled={loading}>{loading?"Searching...":"Search"}</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Featured trainers</h2>
            <p className="text-muted-foreground">Discover professionals tailored to your goals</p>
          </div>
          <Button variant="ghost" asChild><Link to="/trainers">View all</Link></Button>
        </div>

        {error && <div className="mb-6 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_,i)=> (
            <div key={i} className="h-48 rounded-xl border bg-muted animate-pulse" />
          ))}
          {!loading && trainers.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>No trainers found</CardTitle>
                <CardDescription>Try adjusting your filters to discover more trainers.</CardDescription>
              </CardHeader>
            </Card>
          )}
          {!loading && trainers.map((t:any, idx:number)=> (
            <Card key={t.id || idx} className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-[hsl(var(--brand-start))]/20 to-[hsl(var(--brand-end))]/20" />
              <CardHeader>
                <CardTitle className="text-lg">{t.username || t.name || "Trainer"}</CardTitle>
                <CardDescription>{[t.specialization, t.location].filter(Boolean).join(" • ")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>{t.experience_years? `${t.experience_years} yrs exp` : "Experience N/A"}</span>
                  <span>{t.price_per_session? `$${t.price_per_session}/session` : "Price N/A"}</span>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full"><Link to={`/profile?u=${encodeURIComponent(t.username || "")}`}>View Profile</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="rounded-2xl border bg-gradient-to-br from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] p-8 md:p-12 text-white">
          <h3 className="text-2xl md:text-3xl font-extrabold">Are you a certified trainer?</h3>
          <p className="mt-2 max-w-2xl text-white/90">Join MyPter to reach clients worldwide, manage your availability, and grow your business.</p>
          <Button asChild size="lg" className="mt-6 bg-white text-foreground hover:bg-white/90"><Link to="/auth?tab=register">Create trainer account</Link></Button>
        </div>
      </section>
    </MainLayout>
  );
}
