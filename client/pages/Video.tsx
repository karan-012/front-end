import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useState } from "react";

export default function Video() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const createAndJoin = async () => {
    if (!room) return;
    setLoading(true); setError("");
    try {
      await api.createVideoRoom({ name: room });
      const res = await api.getVideoToken({ room });
      setToken(res?.token || "");
      setJoined(true);
    } catch (e:any) { setError(e?.message || "Video API not available yet"); } finally { setLoading(false); }
  };

  const leave = () => { setJoined(false); setToken(""); };

  return (
    <MainLayout>
      <section className="container py-10">
        <h1 className="text-3xl font-bold">Video Conferencing</h1>
        <p className="text-muted-foreground">Start a secure video room with your trainer/client. (Placeholder until backend is ready)</p>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Room</CardTitle>
              <CardDescription>Create or join a room</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="Room name" value={room} onChange={(e)=>setRoom(e.target.value)} />
              {!joined ? (
                <Button onClick={createAndJoin} disabled={loading} className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white">{loading?"Joining...":"Create & Join"}</Button>
              ) : (
                <Button variant="outline" onClick={leave}>Leave room</Button>
              )}
              {error && <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Call</CardTitle>
              <CardDescription>Video area</CardDescription>
            </CardHeader>
            <CardContent>
              {!joined ? (
                <div className="h-64 grid place-items-center text-sm text-muted-foreground">Join a room to start</div>
              ) : (
                <div className="h-64 rounded-lg border bg-muted grid place-items-center text-sm">
                  Connected to room "{room}" with token: {token ? token.slice(0,6)+"..." : "-"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}
