import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function AdminMessagesPage() {
  const { workspace, loading, sendReply, assignChat, sendChatReply } = useAdminDashboard();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const { runAction, isPending } = useAsyncAction();
  const activeThread = useMemo(() => workspace?.messageThreads.find((item) => item.id === activeThreadId) ?? workspace?.messageThreads[0] ?? null, [activeThreadId, workspace]);
  const threadMessages = useMemo(() => workspace?.messages.filter((item) => item.threadId === activeThread?.id) ?? [], [activeThread?.id, workspace]);
  const activeChatThread = useMemo(() => workspace?.chatThreads.find((item) => item.id === activeChatThreadId) ?? workspace?.chatThreads[0] ?? null, [activeChatThreadId, workspace]);
  const chatMessages = useMemo(() => workspace?.chatMessages.filter((item) => item.threadId === activeChatThread?.id) ?? [], [activeChatThread?.id, workspace]);

  async function handleReply() {
    if (!activeThread || !draft.trim()) return;
    try {
      await runAction("reply-thread", () => sendReply(activeThread.id, draft.trim()));
      setDraft("");
      toast.success("Reply sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the reply.");
    }
  }

  async function handleChatReply() {
    if (!activeChatThread || !chatDraft.trim()) return;
    try {
      await runAction("reply-chat", () => sendChatReply(activeChatThread.id, chatDraft.trim()));
      setChatDraft("");
      toast.success("Live chat reply sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the live chat reply.");
    }
  }

  async function handleAssignChat(staffId?: string) {
    if (!activeChatThread) return;
    try {
      await runAction(`assign-chat-${activeChatThread.id}`, () => assignChat(activeChatThread.id, staffId));
      toast.success("Chat assignment updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update chat assignment.");
    }
  }

  return (
    <AdminShell title="Messages" subtitle="Keep secure client communication practical and easy to triage without turning it into a noisy chat app.">
      {loading || !workspace ? (
        <DashboardLoadingState cards={2} lines={5} />
      ) : (
        <div className="space-y-6">
          <div className="grid xl:grid-cols-[0.85fr_1.15fr] gap-6">
          <section className="card-theme p-6">
            <h2 className="heading-sm mb-4">Threads</h2>
            <div className="space-y-3">
              {workspace.messageThreads.map((thread) => (
                <button key={thread.id} type="button" className={`w-full text-left rounded-2xl p-4 ${thread.id === activeThread?.id ? "card-theme border border-[color:var(--color-accent)]" : "card-theme-soft"}`} onClick={() => setActiveThreadId(thread.id)}>
                  <p className="body-sm">{workspace.clients.find((client) => client.id === thread.userId)?.profile.fullName ?? thread.subject}</p>
                  <p className="caption text-muted-green mt-1">{thread.subject}</p>
                  <p className="caption text-muted-green mt-1">{new Date(thread.lastMessageAt).toLocaleString()}</p>
                </button>
              ))}
              {!workspace.messageThreads.length && <EmptyState title="No threads yet" description="Client message threads will appear here when communication starts." />}
            </div>
          </section>

          <section className="card-theme p-6">
            <h2 className="heading-sm mb-4">Conversation</h2>
            {activeThread ? (
              <>
                <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
                  {threadMessages.map((message) => (
                    <div key={message.id} className={`rounded-2xl px-4 py-3 ${message.sender === "agency" ? "bg-surface-soft ml-auto max-w-[85%]" : "card-theme-soft max-w-[85%]"}`}>
                      <p className="body-sm">{message.body}</p>
                      <p className="caption text-muted-green mt-2">{message.senderName ?? (message.sender === "agency" ? "GenieHub Team" : workspace.clients.find((client) => client.id === activeThread.userId)?.profile.fullName ?? "Client")} | {new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="label-text mb-1 block">Reply</label>
                  <textarea className="field-theme" rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply to this client thread." />
                </div>
                <button className="btn-accent mt-4" type="button" disabled={isPending("reply-thread")} onClick={() => void handleReply()}>{isPending("reply-thread") ? "Sending..." : "Send reply"}</button>
              </>
            ) : (
              <EmptyState title="Select a thread" description="Choose a client conversation on the left to view and reply." />
            )}
          </section>
        </div>
          <div className="grid xl:grid-cols-[0.85fr_1.15fr] gap-6">
            <section className="card-theme p-6">
              <h2 className="heading-sm mb-4">Live chat inbox</h2>
              <div className="space-y-3">
                {workspace.chatThreads.map((thread) => (
                  <button key={thread.id} type="button" className={`w-full text-left rounded-2xl p-4 ${thread.id === activeChatThread?.id ? "card-theme border border-[color:var(--color-accent)]" : "card-theme-soft"}`} onClick={() => setActiveChatThreadId(thread.id)}>
                    <p className="body-sm">{thread.visitorName ?? "Website visitor"}</p>
                    <p className="caption text-muted-green mt-1">{thread.subject}</p>
                    <p className="caption text-muted-green mt-1">Assigned: {workspace.adminUsers.find((item) => item.id === thread.assignedStaffId)?.fullName ?? "Unassigned"}</p>
                  </button>
                ))}
                {!workspace.chatThreads.length && <EmptyState title="Nothing here yet" description="Synced Tawk conversations will show up here for assignment and reply." />}
              </div>
            </section>
            <section className="card-theme p-6">
              <h2 className="heading-sm mb-4">Live chat conversation</h2>
              {activeChatThread ? (
                <>
                  <div className="grid md:grid-cols-[1fr_220px] gap-4 mb-4">
                    <div className="card-theme-soft p-4">
                      <p className="body-sm">{activeChatThread.visitorName ?? "Website visitor"}</p>
                      <p className="caption text-muted-green mt-1">{activeChatThread.visitorEmail ?? "No email provided"}</p>
                      <p className="caption text-muted-green mt-1">{activeChatThread.visitorPhone ?? "No phone provided"}</p>
                    </div>
                    <label className="block">
                      <span className="label-text mb-1 block">Assign staff</span>
                      <select className="field-theme" value={activeChatThread.assignedStaffId ?? ""} disabled={isPending(`assign-chat-${activeChatThread.id}`)} onChange={(event) => void handleAssignChat(event.target.value || undefined)}>
                        <option value="">Unassigned</option>
                        {workspace.adminUsers.filter((item) => item.active && item.isChatAgent).map((item) => (
                          <option key={item.id} value={item.id}>{item.fullName}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="space-y-3 max-h-[24rem] overflow-auto pr-1">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`rounded-2xl px-4 py-3 ${message.senderRole === "staff" ? "bg-surface-soft ml-auto max-w-[85%]" : "card-theme-soft max-w-[85%]"}`}>
                        <p className="body-sm">{message.body}</p>
                        <p className="caption text-muted-green mt-2">{message.senderName} | {new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="label-text mb-1 block">Reply to visitor</label>
                    <textarea className="field-theme" rows={4} value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Reply to the live chat conversation from here." />
                  </div>
                  <button className="btn-accent mt-4" type="button" disabled={isPending("reply-chat")} onClick={() => void handleChatReply()}>{isPending("reply-chat") ? "Sending..." : "Send live chat reply"}</button>
                </>
              ) : (
                <EmptyState title="Nothing here yet" description="Choose a live chat thread on the left to review visitor details and respond." />
              )}
            </section>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
