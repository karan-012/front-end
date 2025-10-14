import MainLayout from "@/components/layout/MainLayout";
import SidebarNav from "@/components/layout/SidebarNav";

export default function DashboardLayout({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string; }) {
  return (
    <MainLayout>
      <section className="container py-10">
        {(title || subtitle) ? (
          <div className="mb-6">
            {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
            {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-[240px_1fr] min-h-[60vh]">
          <SidebarNav />
          <div>{children}</div>
        </div>
      </section>
    </MainLayout>
  );
}
