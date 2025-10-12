import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrainerAvailabilityManager() {
  const [availability, setAvailability] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    try {
      const a = await api.myAvailability();
      setAvailability(Array.isArray(a) ? a : a?.availability || []);
      const b = await api.myBlockedDates();
      setBlocked(Array.isArray(b) ? b : b?.dates || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load availability");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addSlot = async () => {
    if (!day || !start || !end) return;
    setLoading(true);
    setError("");
    try {
      await api.setAvailability([
        { day_of_week: day, start_time: start, end_time: end },
      ]);
      setDay("");
      setStart("");
      setEnd("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to add slot");
    } finally {
      setLoading(false);
    }
  };

  const addBlock = async () => {
    if (!blockDate) return;
    setLoading(true);
    setError("");
    try {
      await api.blockDates([blockDate], reason || undefined);
      setBlockDate("");
      setReason("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to block date");
    } finally {
      setLoading(false);
    }
  };

  const removeBlock = async (d: string) => {
    setLoading(true);
    setError("");
    try {
      await api.unblockDate(d);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to remove block");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Add weekly slots</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-4 gap-3">
            <Input
              placeholder="Day of week (e.g. Monday)"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
            <Input
              placeholder="Start (HH:MM)"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <Input
              placeholder="End (HH:MM)"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
            <Button
              onClick={addSlot}
              disabled={loading}
              className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
            >
              {loading ? "Saving..." : "Add"}
            </Button>
          </div>
          <ul className="text-sm divide-y rounded border">
            {availability.length === 0 && (
              <li className="p-3 text-muted-foreground">
                No availability yet.
              </li>
            )}
            {availability.map((s: any, i: number) => (
              <li key={i} className="p-3 flex items-center justify-between">
                <span>
                  {s.day_of_week}: {s.start_time}-{s.end_time}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked dates</CardTitle>
          <CardDescription>Manage exceptions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
            />
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              onClick={addBlock}
              disabled={loading}
              className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"
            >
              {loading ? "Saving..." : "Block date"}
            </Button>
          </div>
          <ul className="text-sm divide-y rounded border">
            {(!blocked || blocked.length === 0) && (
              <li className="p-3 text-muted-foreground">No blocked dates.</li>
            )}
            {blocked?.map((d: string) => (
              <li key={d} className="p-3 flex items-center justify-between">
                <span>{d}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBlock(d)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
