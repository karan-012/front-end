import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileSummary({ data, type }: { data: any; type: "trainer" | "client" }) {
  if (!data) return null;
  const rows: Array<[string, any]> = type === "trainer"
    ? [
        ["Username", data.username],
        ["Specialization", data.specialization],
        ["Location", data.location],
        ["Experience", data.experience_years ? `${data.experience_years} yrs` : "-"],
        ["Training type", data.training_type],
        ["Price/session", data.price_per_session != null ? `$${data.price_per_session}` : "-"],
        ["Language", data.language],
      ]
    : [
        ["Username", data.username],
        ["Location", data.location],
        ["Fitness goal", data.fitness_goal],
        ["Preferred training", data.preferred_training_type],
        ["Budget", data.budget != null ? `$${data.budget}` : "-"],
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{type} profile</CardTitle>
        <CardDescription>Basic profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid md:grid-cols-2 gap-x-6 gap-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border-b py-2">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium">{String(value ?? "-")}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
