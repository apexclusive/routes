import Link from "next/link";
import { MapPinned } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-dvh w-full bg-[#050507] text-white flex items-center justify-center p-6">
      <div className="glass rounded p-8 max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded bg-yellow-400/12 border border-yellow-400/25 flex items-center justify-center">
          <MapPinned className="w-7 h-7 text-yellow-300" />
        </div>
        <h1 className="font-display font-bold text-xl mb-2">
          Deze route bestaat niet
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          De pagina die je zocht hebben we niet gevonden — misschien een verlopen
          deel-link?
        </p>
        <Link
          href="/"
          className="btn-brand inline-block px-5 py-2.5 rounded font-semibold text-sm"
        >
          Naar de routeplanner
        </Link>
      </div>
    </div>
  );
}
