import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function TrainerProfileForm({ initial, onSaved }: { initial?: any; onSaved?: (p: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      gender: String(form.get("gender") || ""),
      age: Number(form.get("age") || 0),
      location: String(form.get("location") || ""),
      language: String(form.get("language") || ""),
      specialization: String(form.get("specialization") || ""),
      experience_years: Number(form.get("experience_years") || 0),
      certifications: String(form.get("certifications") || ""),
      training_type: String(form.get("training_type") || ""),
      price_per_session: Number(form.get("price_per_session") || 0),
      about: String(form.get("about") || ""),
    };
    setError("");
    setLoading(true);
    try {
      const saved = await api.upsertTrainerProfile(body, initial ? "PUT" : "POST");
      onSaved?.(saved);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="grid gap-1.5"><label className="text-sm font-medium">Gender</label><Input name="gender" defaultValue={initial?.gender} /></div>
        <div className="grid gap-1.5"><label className="text-sm font-medium">Age</label><Input name="age" type="number" min={0} defaultValue={initial?.age} /></div>
        <div className="grid gap-1.5"><label className="text-sm font-medium">Location</label><Input name="location" defaultValue={initial?.location} /></div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="grid gap-1.5"><label className="text-sm font-medium">Language</label><Input name="language" defaultValue={initial?.language} /></div>
        <div className="grid gap-1.5"><label className="text-sm font-medium">Specialization</label><Input name="specialization" defaultValue={initial?.specialization} /></div>
        <div className="grid gap-1.5"><label className="text-sm font-medium">Experience (years)</label><Input name="experience_years" type="number" min={0} defaultValue={initial?.experience_years} /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5"><label className="text-sm font-medium">Certifications</label><Input name="certifications" defaultValue={initial?.certifications} /></div>
        <div className="grid gap-1.5"><label className="text-sm font-medium">Training type</label><Input name="training_type" placeholder="Online / In-person" defaultValue={initial?.training_type} /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5"><label className="text-sm font-medium">Price per session</label><Input name="price_per_session" type="number" min={0} step="0.01" defaultValue={initial?.price_per_session} /></div>
        <div className="grid gap-1.5"></div>
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">About</label>
        <Textarea name="about" defaultValue={initial?.about} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white">{loading ? "Saving..." : initial ? "Update profile" : "Create profile"}</Button>
      </div>
    </form>
  );
}
