import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TrainerProfileForm from "@/components/forms/TrainerProfileForm";
import ClientProfileForm from "@/components/forms/ClientProfileForm";
import ProfileSummary from "@/components/profile/ProfileSummary";
import AvailabilityList from "@/components/availability/AvailabilityList";
import BookingDialog from "@/components/booking/BookingDialog";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Profile() {
  const q = useQuery();
  const params = useParams();
  const username = params.username || q.get("u") || "";
  const [trainer, setTrainer] = useState<any | null>(null);
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isViewingOther = !!username;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isViewingOther) {
          try {
            setTrainer(await api.getTrainerByUsername(username));
          } catch {}
          try {
            setClient(await api.getClientByUsername(username));
          } catch {}
        } else {
          try {
            setTrainer(await api.myTrainerProfile());
          } catch {}
          try {
            setClient(await api.myClientProfile());
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, isViewingOther]);

  if (isViewingOther) {
    const data = trainer || client;
    const name = data?.name || data?.username || username;
    return (
      <MainLayout>
        <section className="container py-10 grid gap-6">
          {error && (
            <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {error}
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold">{name}</CardTitle>
              <CardDescription>
                {[data?.specialization, data?.location]
                  .filter(Boolean)
                  .join(" • ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ProfileSummary
                  type={trainer ? "trainer" : "client"}
                  data={data}
                />
              </div>
              {trainer ? (
                <div className="grid gap-3">
                  <BookingDialog trainerUsername={data?.username || username} />
                  <AvailabilityList username={data?.username || username} />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="container py-10 grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
        {loading ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>My Client Profile</CardTitle>
                <CardDescription>
                  Create or update your client profile
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {client ? <ProfileSummary type="client" data={client} /> : null}
                <ClientProfileForm
                  initial={client || undefined}
                  onSaved={() => window.location.reload()}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>My Trainer Profile</CardTitle>
                <CardDescription>
                  Create or update your trainer profile
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {trainer ? (
                  <ProfileSummary type="trainer" data={trainer} />
                ) : null}
                <TrainerProfileForm
                  initial={trainer || undefined}
                  onSaved={() => window.location.reload()}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
