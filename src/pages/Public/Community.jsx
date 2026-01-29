import { useEffect, useMemo, useState } from "react";
import { Users, Send, Loader2, RefreshCw, User, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import API_PATH from "../../utils/API_PATH";

async function safeJson(res) {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function toInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "A";
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export default function Community() {
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const [text, setText] = useState("");
  const [name, setName] = useState("");

  async function loadMessages() {
    setLoadingList(true);
    setError(null);
    try {
      const r = await fetch(API_PATH.MESSAGES.LIST);
      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.message || "Failed to load messages");
      setMessages(normalizeList(j));
    } catch (e) {
      setMessages([]);
      setError(e.message || "Failed to load messages");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const stats = useMemo(() => {
    return { total: messages.length };
  }, [messages]);

  async function sendMessage() {
    const msg = text.trim();
    const nm = name.trim();
    if (!msg) return;

    setSending(true);
    setError(null);

    try {
      const r = await fetch(API_PATH.MESSAGES.SEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: msg,
          name: nm || "Anonymous",
        }),
      });

      const j = await safeJson(r);
      if (!r.ok) throw new Error(j?.message || "Failed to send message");

      setText("");
      await loadMessages();
    } catch (e) {
      setError(e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-7"
      >
        <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center shadow-glow">
              <Users className="text-cyan-200" />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tight">Community Updates</div>
              <div className="text-sm text-white/60 mt-1">
                Public messages, help requests, and verified community support updates.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
              Total posts: <span className="text-white/90 font-medium">{stats.total}</span>
            </span>

            <button
              onClick={loadMessages}
              disabled={loadingList}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingList ? "animate-spin" : ""} />
              {loadingList ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare size={16} className="text-white/70" />
                Post an update
              </div>
              <div className="text-xs text-white/60">Be respectful • No spam</div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            <div className="grid gap-3 md:grid-cols-[260px_1fr_auto]">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
                  <User size={16} />
                </div>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-white/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                />
              </div>

              <input
                className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-white/20"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a community update / help request..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button
                onClick={sendMessage}
                disabled={sending}
                className="rounded-xl px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                {sending ? "Sending" : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur shadow-glow overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Latest Updates</div>
              <div className="text-xs text-white/60">
                Showing {messages.length}
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {loadingList ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                No messages yet. Be the first to post an update.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {messages.map((m, idx) => {
                  const author = m.name || m.user || "Anonymous";
                  const when = new Date(m.createdAt || m.time || Date.now()).toLocaleString();
                  const content = m.note || m.text || m.body || "";
                  return (
                    <div
                      key={m._id || m.id || idx}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/7"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_55%)]" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white/80">
                            {toInitials(author)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white/95 truncate">{author}</div>
                            <div className="text-xs text-white/55 mt-0.5">{when}</div>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-3 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
