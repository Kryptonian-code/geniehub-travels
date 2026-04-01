import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardShell from "@/components/dashboard/DashboardShell";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useClientDashboard } from "@/contexts/ClientDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function MessagesPage() {
  const { user } = useAuth();
  const { workspace, loading, sendMessage } = useClientDashboard();
  const { runAction, isPending } = useAsyncAction();
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!workspace?.messageThreads.length) {
      setActiveThreadId(null);
      return;
    }

    if (!activeThreadId || !workspace.messageThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(workspace.messageThreads[0].id);
    }
  }, [activeThreadId, workspace]);

  const activeThread = useMemo(
    () => workspace?.messageThreads.find((thread) => thread.id === activeThreadId) ?? workspace?.messageThreads[0] ?? null,
    [activeThreadId, workspace],
  );
  const threadMessages = useMemo(
    () => workspace?.messages.filter((message) => message.threadId === activeThread?.id) ?? [],
    [activeThread?.id, workspace],
  );

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !user) return;

    try {
      await runAction("send-message", () =>
        sendMessage({
          body: draft.trim(),
          threadId: activeThread?.id,
          subject: activeThread?.subject ?? (subject.trim() || "Support request"),
        }),
      );
      setDraft("");
      setSubject("");
      toast.success("Message sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send message.");
    }
  }

  return (
    <DashboardShell title="Messages" subtitle="Send secure updates and questions to the GenieHub team without leaving your dashboard.">
      <div className="grid xl:grid-cols-[0.85fr_1.15fr] gap-6">
        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Conversations</h2>
          {loading || !workspace ? (
            <DashboardLoadingState cards={2} lines={2} />
          ) : workspace.messageThreads.length ? (
            <div className="space-y-3">
              {workspace.messageThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  className={`w-full text-left rounded-2xl p-4 transition-colors ${thread.id === activeThread?.id ? "card-theme border border-[color:var(--color-accent)]" : "card-theme-soft"}`}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="body-sm">{thread.subject}</p>
                      <p className="caption text-muted-green mt-1">Last update {new Date(thread.lastMessageAt).toLocaleString()}</p>
                    </div>
                    {thread.unreadCount > 0 && <span className="caption text-accent-gold">{thread.unreadCount} unread</span>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing here yet" description="Your secure conversation history with the agency will appear here." />
          )}
        </section>

        <section className="card-theme p-6">
          <h2 className="heading-sm mb-4">Secure conversation</h2>
          {activeThread ? (
            <>
              <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
                {threadMessages.map((message) => (
                  <div key={message.id} className={`rounded-2xl px-4 py-3 ${message.sender === "client" ? "bg-surface-soft ml-auto max-w-[85%]" : "card-theme-soft max-w-[85%]"}`}>
                    <p className="body-sm">{message.body}</p>
                    <p className="caption text-muted-green mt-2">
                      {message.sender === "client" ? "You" : "GenieHub team"} | {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <form className="mt-5 space-y-3" onSubmit={handleSend}>
                <div>
                  <label className="label-text mb-1 block">Message</label>
                  <textarea className="field-theme" rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write your message to the GenieHub team here." />
                </div>
                <button className="btn-accent" type="submit" disabled={isPending("send-message")}>
                  {isPending("send-message") ? "Sending..." : "Send message"}
                </button>
              </form>
            </>
          ) : (
            <>
              <EmptyState title="Start a secure conversation" description="Send a message to the GenieHub team and we will reply here inside your client dashboard." />
              <form className="mt-5 space-y-3" onSubmit={handleSend}>
                <div>
                  <label className="label-text mb-1 block">Subject</label>
                  <input className="field-theme" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Example: Need help with my documents" />
                </div>
                <div>
                  <label className="label-text mb-1 block">Message</label>
                  <textarea className="field-theme" rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write your message to the GenieHub team here." />
                </div>
                <button className="btn-accent" type="submit" disabled={isPending("send-message")}>
                  {isPending("send-message") ? "Sending..." : "Send message"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
