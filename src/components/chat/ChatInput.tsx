"use client";

import { useState } from "react";
import { Send, Dices } from "lucide-react";

export default function ChatInput({
  onSend,
  disabled,
  placeholder,
  onRoulette,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onRoulette?: () => void;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 p-3 border-t border-white/5 bg-slate-900/60 backdrop-blur-xl"
    >
      {onRoulette && (
        <button
          type="button"
          onClick={onRoulette}
          disabled={disabled}
          title="Verras me — draai een route"
          aria-label="Verras me — draai een route"
          className="w-12 h-12 rounded flex items-center justify-center shrink-0 glass border border-yellow-400/30 hover:border-yellow-400/70 hover:bg-yellow-400/10 transition-colors disabled:opacity-50"
        >
          <Dices className="w-5 h-5 text-yellow-400" />
        </button>
      )}
      <div className="relative flex-1">
        <input
          id="apex-chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          maxLength={280}
          aria-label="Bericht aan de route-assistent"
          title="Sneltoets: / focust dit veld"
          placeholder={placeholder || "Typ wat je wilt rijden..."}
          className="peer w-full bg-slate-800/60 border border-white/10 rounded px-4 py-3 pr-10 text-[15px] text-white placeholder:text-slate-500 outline-none focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/20 transition-all disabled:opacity-50"
        />
        <kbd
          aria-hidden
          className="absolute right-3 top-1/2 -translate-y-1/2 hidden peer-placeholder-shown:block peer-focus:hidden font-mono text-[11px] text-slate-500 border border-white/15 rounded px-1.5 py-0.5 select-none"
        >
          /
        </kbd>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="btn-brand w-12 h-12 rounded flex items-center justify-center shrink-0 disabled:opacity-50"
        aria-label="Versturen"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}