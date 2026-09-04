import Logo from "@/components/Logo";

/** Route-level laadstaat: STARTGRID-stil, geen layout-shift. */
export default function Loading() {
  return (
    <div className="h-dvh w-full bg-[#050507] flex flex-col items-center justify-center gap-4">
      <Logo size={44} />
      <div
        role="status"
        aria-label="Pagina laden"
        className="w-8 h-8 border-[3px] border-white/10 border-t-yellow-400 rounded-full animate-spin"
      />
    </div>
  );
}
