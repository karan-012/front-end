import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";

export default function Chat() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    setLoading(true);
    try { const data = await api.chatThreads(); setThreads(Array.isArray((data as any)?.items) ? (data as any).items : Array.isArray(data) ? data as any : []); } finally { setLoading(false); }
  };
  const loadMessages = async (id: string) => {
    try { const data = await api.chatMessages(id); setMessages(Array.isArray((data as any)?.items) ? (data as any).items : Array.isArray(data) ? data as any : []); } catch { setMessages([]); }
  };

  useEffect(()=>{ loadThreads(); }, []);
  useEffect(()=>{ if (activeId) loadMessages(activeId); }, [activeId]);

  const otherUsername = useMemo(()=>{
    const t = threads.find((x:any)=> String(x.id)===String(activeId));
    const participants: string[] = t?.participants || [];
    const me = user?.username || user?.name;
    const others = participants?.filter((p)=> p !== me);
    return t?.title || t?.name || others?.[0] || "";
  }, [threads, activeId, user]);

  const send = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeId || !text.trim()) return;
    const tmp = { id: Date.now(), message: text, author: user?.username || "me", created_at: new Date().toISOString() };
    setMessages((m)=> [...m, tmp]);
    setText("");
    try { await api.chatSend({ thread_id: String(activeId), message: tmp.message }); } catch {}
  };

  return (
    <MainLayout>
      <section className="container py-10">
        <h1 className="text-3xl font-bold">Chat</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr]">
          <aside className="rounded-lg border p-3">
            <div className="mb-2 text-sm font-semibold">Conversations</div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="text-sm text-muted-foreground">No chats yet.</div>
            ) : (
              <ul className="text-sm">
                {threads.map((t:any)=>{
                  const name = t.title || t.name || (t.participants?.filter((p:string)=> p !== (user?.username||user?.name))[0] || "");
                  return (
                    <li key={t.id}>
                      <button onClick={()=>setActiveId(String(t.id))} className={`w-full text-left rounded px-2 py-2 hover:bg-accent ${String(activeId)===String(t.id)?'bg-accent':''}`}>
                        <div className="font-medium truncate">{name || `Thread ${t.id}`}</div>
                        {t.last_message ? <div className="text-muted-foreground truncate">{t.last_message}</div> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-3">
              <Button asChild className="w-full bg-gradient-to-r from-[hsl(var(--brand-start))] to-[hsl(var(--brand-end))] text-white"><a href="/video">Start video</a></Button>
            </div>
          </aside>
          <div className="rounded-lg border p-3 flex flex-col min-h-[60vh]">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="font-semibold">{otherUsername || 'Select a conversation'}</div>
              {otherUsername ? <a href={`/profile?u=${encodeURIComponent(otherUsername)}`} className="text-sm text-primary hover:underline">View profile</a> : null}
            </div>
            <div className="flex-1 overflow-auto py-3 space-y-2">
              {messages.map((m:any)=> (
                <div key={m.id} className={`max-w-[80%] rounded px-3 py-2 text-sm ${m.author === (user?.username||'me') ? 'bg-primary text-primary-foreground ml-auto' : 'bg-accent'}`}>
                  <div className="text-xs opacity-70">{m.author}</div>
                  <div>{m.message || m.text}</div>
                </div>
              ))}
            </div>
            {activeId ? (
              <form onSubmit={send} className="mt-2 flex gap-2">
                <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message..." />
                <Button type="submit">Send</Button>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
