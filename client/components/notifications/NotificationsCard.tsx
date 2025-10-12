import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

export default function NotificationsCard() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await api.listNotifications();
      setItems(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch {
      setItems([]); // gracefully empty if endpoint missing
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const markRead = async (id: string) => {
    try { await api.markNotificationRead(id); await load(); } catch {}
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Your latest updates</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">You're all caught up.</div>
        ) : (
          <ul className="space-y-3 text-sm">
            {items.map((n:any)=> (
              <li key={n.id} className="flex items-center justify-between border-b py-2">
                <span>{n.title || n.message}</span>
                {!n.read && <Button size="sm" variant="outline" onClick={()=>markRead(String(n.id))}>Mark read</Button>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
