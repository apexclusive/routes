import type { Metadata, Viewport } from "next";
import Analytics from "@/components/Analytics";
import { themeBootScript } from "@/lib/theme";
import BillingReturn from "@/components/BillingReturn";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://routes.apexclusive.nl"),
  applicationName: "Apex Routes",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Apex Routes",
    statusBarStyle: "black-translucent",
  },
  title: "Apex Routes — Plan de mooiste route in seconden",
  description:
    "Apex Routes is een slimme routeplanner voor motor, auto, fiets en wandelen. Beschrijf in gewone taal wat je wilt rijden en krijg één doorlopende route over de echte wegen — klaar om te delen naar Google Maps, Waze of GPX.",
  keywords: [
    "route planner",
    "AI route planner",
    "navigatie",
    "motor route",
    "scenic route",
    "fietsroute",
    "GPX",
    "Google Maps",
    "TomTom",
  ],
  authors: [{ name: "Apex Routes" }],
  openGraph: {
    title: "Apex Routes — AI Route Planner",
    description:
      "Plan moeiteloos de perfecte route met AI. Kronkelige tochten, scenic uitjes of efficiënte routes.",
    type: "website",
    locale: "nl_NL",
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Apex Routes — plan de mooiste route in seconden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
    title: "Apex Routes — AI Route Planner",
    description: "Plan moeiteloos de perfecte route met AI.",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* Zet het thema vóór de eerste paint: geen witte flits bij donker. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript() }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* gestructureerde data voor zoekmachines en AI-assistenten */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Apex Routes",
              url: "https://routes.apexclusive.nl",
              description:
                "AI-routeplanner voor motor, auto, fiets en wandelen: beschrijf je rit of importeer GPX/FIT en krijg een navigeerbare route met afslaginstructies.",
              inLanguage: ["nl", "en", "fr", "de"],
              publisher: {
                "@type": "Organization",
                name: "Apex Routes",
                url: "https://routes.apexclusive.nl",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Apex Routes",
              url: "https://routes.apexclusive.nl",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web",
              description:
                "Routeplanner voor motor, auto, fiets en wandelen: chat of GPX-import, turn-by-turn, tankstops, weer en export naar Google Maps, Waze en GPX.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              inLanguage: ["nl", "en", "fr", "de"],
            }),
          }}
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- bewust een
            <link> i.p.v. next/font: geen build-time afhankelijkheid van het netwerk */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <BillingReturn />
      </body>
    </html>
  );
}