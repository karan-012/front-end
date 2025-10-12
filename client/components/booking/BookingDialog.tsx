import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import api from "@/services/api";

export default function BookingDialog({ trainerUsername }: { trainerUsername: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true); setError("");
    try {
      await api.createBooking({
        trainer_username: trainerUsername,
        session_date: String(form.get("session_date")),
        start_time: String(form.get("start_time")),
        end_time: String(form.get("end_time")),
        notes: String(form.get("notes") || ""),
      });
      setOpen(false);
    } catch (e: any) { setError(e?.message || "Failed to create booking"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white w-full">Book session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book with {trainerUsername}</DialogTitle>
          <DialogDescription>Choose a date and time to request a session.</DialogDescription>
        </DialogHeader>
        {error && <div className="mb-3 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Input type="date" name="session_date" required />
          <div className="grid grid-cols-2 gap-3">
            <Input type="time" name="start_time" required />
            <Input type="time" name="end_time" required />
          </div>
          <Textarea name="notes" placeholder="Notes (optional)" />
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white">{loading?"Creating...":"Create booking"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
