import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Megaphone, Mountain, CalendarDays, MousePointerClick, ShieldCheck } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";
import PartnerForm from "@/components/PartnerForm";
import SiteMenu from "@/components/SiteMenu";
import ThemeSwitch from "@/components/ThemeSwitch";
import Logo from "@/components/Logo";

export const metadata = pageMetadata({
  title: "Adverteren & partnerschappen · Apex Routes",
  description: "Zet je hotel, event, merk of dienst voor motorrijders, automobilisten, fietsers en wandelaars. Apex Routes bereikt rijdende reizigers op het moment dat ze plannen — vraag de mediakit aan.",
  path: "/adverteren",
});

const PACKAGES = [
  {
    title: "Event-promotie",
    price: "vanaf € 49 / editie",
    points: [
      "Uitgelichte kaart in de Apex Kalender met logo-vermelding",
      "Aanklikbare kaartjes- of inschrijflink",
      "Vermelding in de live-feed-agenda",
    ],
  },
  {
    title: "Partner van het seizoen",
    price: "vanaf € 149 / maand",
    points: [
      "Naamsvermelding op de planner en klimbibliotheek",
      "Eigen kortingscode voor onze leden (meetbaar)",
      "Backlink vanaf de credits-sectie",
    ],
  },
  {
    title: "Hotel- & horecapartner",
    price: "commissie per boeking",
    points: [
      "Opname in de Hotel voor deze rit-knop (Booking-partnerprogramma)",
      "Optioneel eigen landingpage met routetips vanaf je deur",
      "Volledig meetbaar via partner-id",
    ],
  },
];

export default function AdverterenPage() {
  return (
    <div className="min-h-dvh text-slate-100 grain relative overflow-x-clip bg-[var(--base)]">
      <nav className="sticky top-0 z-40 px-4 sm:px-5 py-3 flex items-center justify-between max-w-7xl mx-auto glass site-nav w-[calc(100%-1.25rem)] border border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-lg font-bold tracking-tight font-display">Partners</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <SiteMenu />
        </div>
      </nav>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="aurora w-[42rem] h-[42rem] bg-[var(--accent)]/[0.10] top-[-180px] right-[-140px]" />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <main id="apex-main" className="relative z-10 px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: "Adverteren", path: "/adverteren" },
              ])
            ),
          }}
        />
        <p className="eyebrow">PARTNERS</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2 mb-4">
          Bereik rijdende reizigers op het moment dat ze plannen
        </h1>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-2xl mb-10">
          Apex Routes wordt gebruikt vóór de rit: routes bouwen, klimmen kiezen,
          events uitzoeken, hotels boeken. Dat is het moment waarop jouw
          aanbod relevant is — niet erna.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: Mountain, titel: "Niche-publiek", tekst: "Motorrijders, automobilisten, fietsers en wandelaars in de Benelux, Duitsland en de Alpen." },
            { icon: MousePointerClick, titel: "Hoge intentie", tekst: "Bezoekers plannen een rit of boeken een verblijf — geen scrollend publiek." },
            { icon: ShieldCheck, titel: "Eerlijke plaatsing", tekst: "Sponsorblocks altijd herkenbaar; nooit vermengd met redactionele data." },
          ].map((k) => (
            <div key={k.titel} className="glass rounded border border-white/10 p-5">
              <k.icon className="w-5 h-5 text-yellow-400 mb-3" aria-hidden />
              <h2 className="font-display font-bold text-[15px] mb-1.5">{k.titel}</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed">{k.tekst}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display font-bold text-2xl mb-4">Pakketten</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {PACKAGES.map((p, i) => (
            <div
              key={p.title}
              className={`rounded p-5 flex flex-col ${
                i === 1
                  ? "border border-yellow-400/50 relative bg-yellow-400/[0.04]"
                  : "glass border border-white/10"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-2 left-4 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                  DOORLOPENDE ZICHTBAARHEID
                </span>
              )}
              <h3 className="font-display font-bold text-[16px] mb-1">{p.title}</h3>
              <p className="font-mono text-[13px] text-yellow-300 mb-3">{p.price}</p>
              <ul className="space-y-2 flex-1">
                {p.points.map((pt) => (
                  <li key={pt} className="text-[13px] text-slate-400 leading-snug flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5" aria-hidden>✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <PartnerForm />

        <div className="glass rounded border border-yellow-400/30 p-5 flex flex-wrap items-center gap-4 mt-4">
          <Megaphone className="w-6 h-6 text-yellow-300 shrink-0" aria-hidden />
          <p className="text-[14px] text-slate-300 flex-1 min-w-[240px]">
            Liever eerst praten? Mail{" "}
            <a href="mailto:partners@apexclusive.nl" className="text-yellow-300 underline underline-offset-2">
              partners@apexclusive.nl
            </a>{" "}
            of stuur de aanvraag rechtstreeks naar het partnerteam.
          </p>
          <Link href="/" className="btn-brand px-4 py-2.5 rounded font-semibold text-[13px]">
            Bekijk de site
          </Link>
        </div>

        <p className="text-[11px] text-slate-500 mt-6">
          Tarieven zijn indicatief en excl. btw; definitieve afspraken worden
          vastgelegd in een partnerschapsovereenkomst. Events blijven gratis
          opgenomen in de kalender — promotie is optioneel.
        </p>
        <div className="mt-8">
          <Link href="/kalender" className="text-[12px] text-slate-500 hover:text-yellow-400 transition-colors">
            <CalendarDays className="w-3.5 h-3.5 inline -mt-0.5 mr-1" aria-hidden />
            Zie hoe events erbij staan in de kalender
          </Link>
        </div>
      </main>
    </div>
  );
}
