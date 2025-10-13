import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useEffect, useState } from "react";

export default function Bookings() {
  const [trainerList, setTrainerList] = useState<any[]>([]);
  const [clientList, setClientList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      try { setTrainerList(await api.trainerBookings()); } catch {}
      try { setClientList(await api.clientBookings()); } catch {}
    } catch (e:any) { setError(e?.message || "Failed to load bookings"); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <MainLayout>
      <section className="container py-10">
        <h1 className="text-3xl font-bold">Bookings</h1>
        {error && <div className="mt-4 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}
        <Tabs defaultValue="client" className="mt-6">
          <TabsList>
            <TabsTrigger value="client">As Client</TabsTrigger>
            <TabsTrigger value="trainer">As Trainer</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your bookings</CardTitle>
                <CardDescription>Sessions you created</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-sm text-muted-foreground">Loading...</div> : (
                  clientList.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No bookings.</div>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {clientList.map((b:any)=> (
                        <li key={b.id} className="flex items-center justify-between border-b py-2">
                          <span>{b.session_date} {b.start_time}-{b.end_time}</span>
                          <span className="rounded bg-secondary px-2 py-1 text-xs">{b.status || "pending"}</span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Requests</CardTitle>
                <CardDescription>Approve or reject</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-sm text-muted-foreground">Loading...</div> : (
                  trainerList.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No booking requests.</div>
                  ) : (
                    <ul className="space-y-3 text-sm">
                      {trainerList.map((b:any)=> (
                        <li key={b.id} className="flex items-center justify-between gap-3 border-b py-2">
                          <span>{b.session_date} {b.start_time}-{b.end_time}</span>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-secondary px-2 py-1 text-xs">{b.status || "pending"}</span>
                            {!b.status || b.status === "pending" ? (
                              <>
                                <Button size="sm" variant="outline" onClick={async()=>{ await api.updateBookingStatus(String(b.id), "approved"); await load(); }}>Approve</Button>
                                <Button size="sm" variant="outline" onClick={async()=>{ await api.updateBookingStatus(String(b.id), "rejected"); await load(); }}>Reject</Button>
                              </>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
}
