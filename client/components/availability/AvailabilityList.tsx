import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AvailabilityList({ username }: { username: string }) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const a = await api.trainerAvailability(username);
        setAvailability(Array.isArray(a) ? a : a?.availability || []);
        const b = await api.trainerBlockedDates(username);
        setBlocked(Array.isArray(b) ? b : b?.dates || []);
      } finally {
        setLoading(false);
      }
    };
    if (username) load();
  }, [username]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Weekly slots and blocked dates</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold mb-2">Weekly slots</h4>
          <ul className="text-sm divide-y rounded border">
            {loading ? (
              <li className="p-3 text-muted-foreground">Loading...</li>
            ) : availability.length === 0 ? (
              <li className="p-3 text-muted-foreground">No availability published.</li>
            ) : (
              availability.map((s:any, i:number)=> (
                <li key={i} className="p-3 flex items-center justify-between">
                  <span>{s.day_of_week}</span>
                  <span className="text-muted-foreground">{s.start_time}-{s.end_time}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Blocked dates</h4>
          <ul className="text-sm divide-y rounded border">
            {loading ? (
              <li className="p-3 text-muted-foreground">Loading...</li>
            ) : (!blocked || blocked.length===0) ? (
              <li className="p-3 text-muted-foreground">None</li>
            ) : (
              blocked.map((d:string)=> (
                <li key={d} className="p-3">{d}</li>
              ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
