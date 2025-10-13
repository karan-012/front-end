import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Chat() {
  return (
    <MainLayout>
      <section className="container py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="mt-2 text-muted-foreground">Message trainers and clients in real-time. (API coming soon)</p>
          <div className="mt-6">
            <Button asChild className="bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"><Link to="/video">Start a video call</Link></Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
