"use client";

import { motion } from "framer-motion";
import { ConversationMessage } from "@/lib/wizard";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Mini-markdown: eerst escapen (veilig), daarna **bold** / *italic* / newlines. */
function renderContent(content: string): string {
  return escapeHtml(content)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>")
    .replace(/\n/g, "<br/>");
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="msg-pop"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-solid)] border border-white/10 rounded rounded-bl-sm w-fit">
        <span className="typing">
          <i />
          <i />
          <i />
        </span>
      </div>
    </motion.div>
  );
}

export default function ChatMessage({
  message,
  onQuickReply,
}: {
  message: ConversationMessage;
  onQuickReply?: (reply: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`msg-pop flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[88%]">
        <div
          className={
            isUser
              ? "px-4 py-3 rounded rounded-br-sm text-[15px] leading-relaxed font-semibold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] text-black border border-yellow-300/40"
              : "px-4 py-3 rounded rounded-bl-sm text-[15px] leading-relaxed bg-[var(--surface-solid)] border border-white/10 text-slate-100"
          }
          dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
        />

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2.5">
            {message.quickReplies.map((reply, i) => (
              <button
                key={`${message.id}-qr-${i}`}
                onClick={() => onQuickReply?.(reply)}
                className="px-3.5 py-2 rounded text-[13px] font-semibold bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/20 transition-colors font-mono uppercase tracking-wide"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
