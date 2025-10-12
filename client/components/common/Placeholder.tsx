import MainLayout from "@/components/layout/MainLayout";

export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <MainLayout>
      <section className="container py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
          <div className="mt-6 rounded-lg border p-6 text-sm text-muted-foreground">
            This page is a placeholder. Tell me what to include and I'll build
            it out next.
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
