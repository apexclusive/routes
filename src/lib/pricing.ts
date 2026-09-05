export const PRICING_FAQ = [
  {
    q: "Blijft de gratis planner echt bruikbaar?",
    a: "Ja. Basis houdt routeplanning, kaart, delen en vijf GPX-downloads per dag. Betalen haalt vooral gebruikslimieten weg en helpt routing en datakwaliteit financieren.",
  },
  {
    q: "Wat gebeurt er met mijn opgeslagen routes als ik stop?",
    a: "Niets. Routes blijven lokaal in jouw browser staan en zijn nog te exporteren binnen de Basis-limiet. Apex houdt je routehistorie niet gegijzeld.",
  },
  {
    q: "Kan ik een maand- of jaarabonnement opzeggen?",
    a: "Ja. Open in Apex je Pro-status en kies ‘Abonnement en facturen beheren’ voor de beveiligde Stripe Portal, of mail het team. Je betaalde periode blijft geldig; er volgt daarna geen nieuwe verlenging.",
  },
  {
    q: "Welke betaalgegevens ziet Apex?",
    a: "Geen kaart- of bankgegevens. Stripe verwerkt de checkout. Apex ontvangt alleen de betaalstatus, het gekozen plan en het e-mailadres op de betaling.",
  },
  {
    q: "Werkt mijn aankoop automatisch op een ander apparaat?",
    a: "Nog niet: Apex heeft bewust geen centraal routeaccount en bewaart het recht lokaal na Stripe-verificatie. Voor een betaald plan of Lifetime helpt support met apparaatmigratie op basis van je betaalbewijs.",
  },
  {
    q: "Waarom kost Pro geld als OpenStreetMap gratis is?",
    a: "De kaartdata is open, maar betrouwbare routingservers, hoogte- en weerrequests, AI-verwerking, monitoring en handmatige routecontrole kosten capaciteit en tijd.",
  },
] as const;

export const PRICING_COMPARISON = [
  { feature: "AI-routeopdrachten per dag", basis: "3", supporter: "10", pro: "Onbeperkt" },
  { feature: "GPX-downloads per dag", basis: "5", supporter: "15", pro: "Onbeperkt" },
  { feature: "Kaart, weer, hoogte en POI-stops", basis: "Inbegrepen", supporter: "Inbegrepen", pro: "Inbegrepen" },
  { feature: "Deelkaart zonder gratis-laagregel", basis: "—", supporter: "Inbegrepen", pro: "Inbegrepen" },
  { feature: "Nieuwe Pro-functies", basis: "Na uitrol", supporter: "Na uitrol", pro: "Voorrang" },
] as const;
