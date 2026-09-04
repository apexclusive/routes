"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Map as MapIcon,
  Route,
  Mountain,
  CalendarDays,
  Compass,
  BookOpen,
  MessagesSquare,
  Archive,
  ClipboardCheck,
  FileDown,
  Megaphone,
} from "lucide-react";
import { SITE_LINKS, SITE_GROEPEN } from "@/lib/nav";

const ICONEN = {
  planner: MapIcon,
  ritten: Route,
  klimmen: Mountain,
  kalender: CalendarDays,
  forum: MessagesSquare,
  atlas: Compass,
  advisor: BookOpen,
  ritbank: Archive,
  checklist: ClipboardCheck,
  gpx: FileDown,
  adverteren: Megaphone,
} as const;

/**
 * Site-breed hamburger-menu: garandeert dat elke pagina op elke
 * schermgrootte naar álle secties kan navigeren (incl. terug naar home).
 */
export default function SiteMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Site-menu"
        className="w-10 h-10 rounded glass border border-white/10 flex items-center justify-center hover:border-yellow-400/50 transition-colors shrink-0"
      >
        {open ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.nav
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.22 }}
              aria-label="Sitenavigatie"
              className="absolute top-0 right-0 h-dvh w-[min(22rem,calc(100vw-2rem))] bg-[#0a0a0d]/95 border-l border-white/10 overflow-y-auto px-5 py-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="eyebrow">APEX ROUTES</p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Menu sluiten"
                  className="w-9 h-9 rounded glass border border-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4" aria-hidden />
                </button>
              </div>

              {SITE_GROEPEN.map((g) => (
                <div key={g.id} className="mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">{g.label}</p>
                  <ul className="space-y-1">
                    {SITE_LINKS.filter((l) => l.groep === g.id).map((l) => {
                      const Icoon = ICONEN[l.icon];
                      const actief = pathname === l.href;
                      return (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded text-[14px] font-medium transition-colors ${
                              actief
                                ? "bg-yellow-400/10 border border-yellow-400/30 text-yellow-300"
                                : "text-slate-300 hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <Icoon className="w-4 h-4 shrink-0" aria-hidden />
                            {l.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">
                routes.apexclusive.nl — planner, ritten, klimmen en kalender in
                één hand.
              </p>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
