import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function ClientProfileForm({
  initial,
  onSaved,
}: {
  initial?: any;
  onSaved?: (p: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = {
      gender: String(form.get("gender") || ""),
      age: Number(form.get("age") || 0),
      location: String(form.get("location") || ""),
      fitness_goal: String(form.get("fitness_goal") || ""),
      preferred_training_type: String(
        form.get("preferred_training_type") || "",
      ),
      budget: Number(form.get("budget") || 0),
    };
    setError("");
    setLoading(true);
    try {
      const saved = await api.upsertClientProfile(
        body,
        initial ? "PUT" : "POST",
      );
      onSaved?.(saved);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {error}
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Gender</label>
          <Input name="gender" defaultValue={initial?.gender} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Age</label>
          <Input name="age" type="number" min={0} defaultValue={initial?.age} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Location</label>
          <Input name="location" defaultValue={initial?.location} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Fitness goal</label>
          <Input name="fitness_goal" defaultValue={initial?.fitness_goal} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Preferred training type</label>
          <Input
            name="preferred_training_type"
            placeholder="Online / In-person"
            defaultValue={initial?.preferred_training_type}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium">Budget</label>
          <Input
            name="budget"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.budget}
          />
        </div>
        <div className="grid gap-1.5"></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
        >
          {loading
            ? "Saving..."
            : initial
              ? "Update profile"
              : "Create profile"}
        </Button>
      </div>
    </form>
  );
}
