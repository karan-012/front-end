import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";

export default function ReviewSection({
  trainerUsername,
}: {
  trainerUsername?: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!trainerUsername) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.listReviews(trainerUsername);
      setItems(
        Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [],
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [trainerUsername]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trainerUsername) return;
    setError("");
    try {
      await api.addReview({
        trainer_username: trainerUsername,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to add review");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>What clients say</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
          <Input
            type="number"
            min={1}
            max={5}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <div className="md:col-span-3">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a review..."
            />
          </div>
          <Button className="md:col-span-4 bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white">
            Submit review
          </Button>
        </form>
        {error && (
          <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        <ul className="divide-y rounded border">
          {loading ? (
            <li className="p-3 text-sm text-muted-foreground">Loading...</li>
          ) : null}
          {!loading && items.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">
              No reviews yet.
            </li>
          ) : null}
          {items.map((r: any, i: number) => (
            <li key={r.id || i} className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <strong>{r.author || "Anonymous"}</strong>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                  {r.rating ?? "-"}/5
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{r.comment}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
