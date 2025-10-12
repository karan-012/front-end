import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TrainerProfileForm from "@/components/forms/TrainerProfileForm";
import ClientProfileForm from "@/components/forms/ClientProfileForm";
import ProfileSummary from "@/components/profile/ProfileSummary";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import TrainerAvailabilityManager from "@/components/availability/TrainerAvailabilityManager";
import NotificationsCard from "@/components/notifications/NotificationsCard";
import BookingsChart from "@/components/analytics/BookingsChart";
import ReviewSection from "@/components/reviews/ReviewSection";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [trainerProfile, setTrainerProfile] = useState<any | null>(null);
  const [clientProfile, setClientProfile] = useState<any | null>(null);
  const [tBookings, setTBookings] = useState<any[]>([]);
  const [cBookings, setCBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      let tProf: any | null = null;
      let cProf: any | null = null;
      try { tProf = await api.myTrainerProfile(); } catch {}
      try { cProf = await api.myClientProfile(); } catch {}
      setTrainerProfile(tProf);
      setClientProfile(cProf);

      try { setTBookings(await api.trainerBookings()); } catch {}
      try { setCBookings(await api.clientBookings()); } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <MainLayout>
      <section className="container py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your trainer and client journeys.</p>
        </div>

        {error && <div className="mb-6 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">{error}</div>}

        <Tabs defaultValue="client">
          <TabsList>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="trainer">Trainer</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="mt-6">
            {loading ? (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading client dashboard...</div>
            ) : clientProfile ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 grid gap-6">
                  <ProfileSummary type="client" data={clientProfile} />
                  <NotificationsCard />
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming bookings</CardTitle>
                      <CardDescription>Your next sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cBookings.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No bookings yet.</div>
                      ) : (
                        <ul className="space-y-3 text-sm">
                          {cBookings.slice(0,5).map((b:any)=> (
                            <li key={b.id} className="flex items-center justify-between border-b py-2">
                              <span>{b.session_date} {b.start_time}-{b.end_time}</span>
                              <span className="rounded bg-secondary px-2 py-1 text-xs">{b.status || "pending"}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Overview</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm grid gap-3">
                      <div className="flex items-center justify-between"><span>Total bookings</span><span className="font-semibold">{cBookings.length}</span></div>
                      <div className="flex items-center justify-between"><span>Approved</span><span className="font-semibold">{cBookings.filter((b:any)=>b.status==="approved").length}</span></div>
                      <div className="flex items-center justify-between"><span>Pending</span><span className="font-semibold">{cBookings.filter((b:any)=>!b.status || b.status==="pending").length}</span></div>
                      <BookingsChart data={Object.values(cBookings.reduce((acc:any,b:any)=>{ const d=b.session_date||""; acc[d]=(acc[d]||{date:d,count:0}); acc[d].count+=1; return acc; }, {}))} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create your client profile</CardTitle>
                  <CardDescription>Tell trainers about your goals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientProfileForm onSaved={() => load()} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trainer" className="mt-6">
            {loading ? (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">Loading trainer dashboard...</div>
            ) : trainerProfile ? (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 grid gap-6">
                  <ProfileSummary type="trainer" data={trainerProfile} />
                  <NotificationsCard />
                  <ReviewSection trainerUsername={trainerProfile?.username} />
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming bookings</CardTitle>
                      <CardDescription>Your next sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tBookings.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No bookings yet.</div>
                      ) : (
                        <ul className="space-y-3 text-sm">
                          {tBookings.slice(0,5).map((b:any)=> (
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
                      )}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Overview</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm grid gap-3">
                      <div className="flex items-center justify-between"><span>Total bookings</span><span className="font-semibold">{tBookings.length}</span></div>
                      <div className="flex items-center justify-between"><span>Approved</span><span className="font-semibold">{tBookings.filter((b:any)=>b.status==="approved").length}</span></div>
                      <div className="flex items-center justify-between"><span>Pending</span><span className="font-semibold">{tBookings.filter((b:any)=>!b.status || b.status==="pending").length}</span></div>
                      <BookingsChart data={Object.values(tBookings.reduce((acc:any,b:any)=>{ const d=b.session_date||""; acc[d]=(acc[d]||{date:d,count:0}); acc[d].count+=1; return acc; }, {}))} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create your trainer profile</CardTitle>
                  <CardDescription>Let clients discover your expertise.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrainerProfileForm onSaved={() => load()} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
}
