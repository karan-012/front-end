import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";

export default function ReviewSection({
  trainerUsername,
  trainerId,
}: {
  trainerUsername?: string;
  trainerId?: number | string;
}) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canReply = useMemo(
    () =>
      !!trainerUsername && user?.username && user?.username === trainerUsername,
    [trainerUsername, user?.username],
  );

  const load = async (p = 1) => {
    if (!trainerUsername) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getReviewsByUsername(trainerUsername, {
        page: p,
        limit: 10,
      });
      const list = Array.isArray((data as any)?.reviews)
        ? (data as any).reviews
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : Array.isArray(data)
            ? (data as any)
            : [];
      setItems(list);
      setPage((data as any)?.page || p);
      setTotalPages((data as any)?.total_pages || (list.length ? 1 : 0) || 1);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
    try {
      const r = await api.getTrainerRating(trainerUsername);
      if (r) {
        setAvgRating(
          typeof r.average_rating === "number" ? r.average_rating : null,
        );
        setTotalReviews(
          typeof r.total_reviews === "number" ? r.total_reviews : 0,
        );
      }
    } catch {}
  };

  useEffect(() => {
    setPage(1);
    load(1);
  }, [trainerUsername]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trainerUsername) return;
    setError("");
    try {
      if (trainerId != null) {
        await api.addReviewById({ trainer_id: trainerId, rating, comment });
      } else {
        await api.addReview({
          trainer_id: undefined,
          trainer_username: trainerUsername,
          rating,
          comment,
        });
      }
      setComment("");
      setRating(5);
      await load(page);
    } catch (e: any) {
      setError(e?.message || "Failed to add review");
    }
  };

  const submitReply = async (reviewId: number | string) => {
    try {
      const text = replyMap[String(reviewId)]?.trim();
      if (!text) return;
      await api.replyToReview(reviewId, text);
      setReplyMap((m) => ({ ...m, [String(reviewId)]: "" }));
      await load(page);
    } catch (e: any) {
      setError(e?.message || "Failed to add reply");
    }
  };

  const removeReview = async (reviewId: number | string) => {
    try {
      await api.deleteReview(reviewId);
      await load(page);
    } catch (e: any) {
      setError(e?.message || "Failed to delete review");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>What clients say</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">
            {avgRating != null ? avgRating.toFixed(1) : "-"}
            <span className="ml-1 text-sm text-muted-foreground">/5</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalReviews} review{totalReviews === 1 ? "" : "s"}
          </div>
        </div>

        {isAuthenticated ? (
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
        ) : null}

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
          {items.map((r: any, i: number) => {
            const clientName =
              r.client_name || r.author || r.client_username || "Anonymous";
            const canDelete = !!(
              (user?.username &&
                (r.client_username === user.username ||
                  r.client_name === user.username)) ||
              (user && (user.is_admin || user.role === "admin"))
            );
            return (
              <li key={r.id || i} className="p-3 text-sm grid gap-2">
                <div className="flex items-center justify-between">
                  <strong>{clientName}</strong>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                      {(r.rating ?? "-") + "/5"}
                    </span>
                    {canDelete ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeReview(r.id)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
                <p className="text-muted-foreground">{r.comment}</p>
                {Array.isArray(r.replies) && r.replies.length > 0 ? (
                  <div className="ml-3 border-l pl-3">
                    {r.replies.map((rep: any) => (
                      <div
                        key={rep.id}
                        className="text-muted-foreground text-xs py-1"
                      >
                        <span className="font-medium">Trainer:</span>{" "}
                        {rep.trainer_reply || rep.reply}
                      </div>
                    ))}
                  </div>
                ) : null}
                {canReply ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Write a reply..."
                      value={replyMap[String(r.id)] || ""}
                      onChange={(e) =>
                        setReplyMap((m) => ({
                          ...m,
                          [String(r.id)]: e.target.value,
                        }))
                      }
                    />
                    <Button size="sm" onClick={() => submitReply(r.id)}>
                      Reply
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
          >
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
