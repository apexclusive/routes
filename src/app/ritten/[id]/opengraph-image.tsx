import { ImageResponse } from "next/og";
import { RITTEN } from "@/lib/ritten";

export const alt = "Apex Routes dagrit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** diakritiek strippen voor het standaardfont van satori */
function ascii(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default async function Og({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = RITTEN.find((x) => x.id === id);
  const naam = ascii(r?.naam ?? "Dagrit");
  const regio = ascii(r?.regio ?? "");
  const km = r?.lengthKm ?? 0;
  const uur = r ? `${Math.floor(r.rijmin / 60)} u ${r.rijmin % 60} min rijden` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #050507 55%, #15130a 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: "#ffe600",
              display: "flex",
            }}
          />
          <div style={{ color: "#9ca3af", fontSize: 26, letterSpacing: 8, display: "flex" }}>
            APEX ROUTES · DAGRIT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: naam.length > 24 ? 68 : 84,
              fontWeight: 700,
              display: "flex",
              maxWidth: 1000,
            }}
          >
            {naam}
          </div>
          <div style={{ color: "#ffe600", fontSize: 34, marginTop: 18, display: "flex" }}>
            {regio} — {km} km · {uur}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #26262b",
            paddingTop: 28,
          }}
        >
          <div style={{ color: "#64748b", fontSize: 26, display: "flex" }}>
            routes.apexclusive.nl/ritten
          </div>
          <div
            style={{
              color: "#050507",
              background: "#ffe600",
              fontSize: 26,
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 8,
              display: "flex",
            }}
          >
            Plan deze rit
          </div>
        </div>
      </div>
    ),
    size
  );
}
