import { ImageResponse } from "next/og";
import { TOURS, tourKm, tourRijmin } from "@/lib/tours";
import { standaardRaming } from "@/lib/tourkosten";

export const alt = "Apex Routes meerdaagse tour";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** diakritiek strippen voor het standaardfont van satori */
function ascii(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default async function Og({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = TOURS.find((x) => x.id === id);
  const naam = ascii(t?.naam ?? "Meerdaagse tour");
  const basis = ascii(t?.basiskamp ?? "");
  const km = t ? tourKm(t) : 0;
  const min = t ? tourRijmin(t) : 0;
  const uur = min % 60 === 0 ? `${min / 60} uur` : `${Math.floor(min / 60)} u ${min % 60} min`;
  // het echte verkoopargument: wat scheelt zelf rijden per persoon?
  const besparing = t ? standaardRaming(t).besparingPerPersoonEur : 0;

  const cijfers: { label: string; waarde: string }[] = t
    ? [
        { label: "NACHTEN", waarde: String(t.nachten) },
        { label: "DAGRITTEN", waarde: String(t.dagen.length) },
        { label: "TOTAAL", waarde: `${km} km` },
        { label: "RIJTIJD", waarde: uur },
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #050507 52%, #15130a 100%)",
          padding: "56px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, background: "#ffe600", display: "flex" }} />
          <div style={{ color: "#9ca3af", fontSize: 24, letterSpacing: 8, display: "flex" }}>
            APEX ROUTES · MEERDAAGSE TOUR
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: naam.length > 26 ? 62 : 76,
              fontWeight: 700,
              display: "flex",
              maxWidth: 1010,
              lineHeight: 1.1,
            }}
          >
            {naam}
          </div>
          <div style={{ color: "#ffe600", fontSize: 32, marginTop: 16, display: "flex" }}>
            {t ? `${t.nachten} nachten in ${basis} — elke dag een andere lus` : ""}
          </div>
        </div>

        {/* de cijfers maken de kaart in een tijdlijn direct waardevol */}
        <div style={{ display: "flex", gap: 14 }}>
          {cijfers.map((c) => (
            <div
              key={c.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #26262b",
                borderRadius: 10,
                padding: "16px 24px",
                minWidth: 190,
              }}
            >
              <div style={{ color: "#64748b", fontSize: 19, letterSpacing: 3, display: "flex" }}>
                {c.label}
              </div>
              <div
                style={{
                  color: "#ffe600",
                  fontSize: 40,
                  fontWeight: 700,
                  marginTop: 6,
                  display: "flex",
                }}
              >
                {c.waarde}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #26262b",
            paddingTop: 24,
          }}
        >
          <div style={{ color: "#64748b", fontSize: 25, display: "flex" }}>
            routes.apexclusive.nl/tours
          </div>
          <div
            style={{
              color: "#050507",
              background: "#ffe600",
              fontSize: 25,
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 8,
              display: "flex",
            }}
          >
            {besparing > 0
              ? `Bespaar ${besparing.toLocaleString("nl-NL")} euro p.p.`
              : "Bekijk de tours"}
          </div>
        </div>
      </div>
    ),
    size
  );
}
