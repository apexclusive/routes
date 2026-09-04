"use client";

import { ImageDown } from "lucide-react";

/**
 * Downloadbare deelkaart (1080×1080, Instagram/Schep-formaat) —
 * canvas op de client, merkhuisstijl: zwart, geel accent, raster.
 */
export default function DeelKaart({
  soort,
  naam,
  sub,
  stats,
  urlLabel,
}: {
  soort: "DAGRIT" | "BEKLIMMING";
  naam: string;
  sub: string;
  stats: string[];
  urlLabel: string;
}) {
  const genereer = () => {
    const W = 1080;
    const H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // achtergrond
    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, W, H);

    // gele gloed rechtsboven
    const glow = ctx.createRadialGradient(W - 120, -80, 40, W - 120, -80, 640);
    glow.addColorStop(0, "rgba(255,230,0,0.16)");
    glow.addColorStop(1, "rgba(255,230,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // raster
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let x = 40; x < W; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 40; y < H; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // eyebrow
    ctx.fillStyle = "#ffe600";
    ctx.fillRect(72, 96, 14, 14);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 26px system-ui, -apple-system, 'Segoe UI', Arial";
    ctx.letterSpacing = "6px";
    ctx.fillText(`APEX ROUTES · ${soort}`, 102, 111);
    ctx.letterSpacing = "0px";

    // naam (automatische regelafbreking)
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 96px system-ui, -apple-system, 'Segoe UI', Arial";
    const maxW = W - 144;
    const words = naam.split(" ");
    const regels: string[] = [];
    let regel = "";
    for (const w of words) {
      const proef = regel ? `${regel} ${w}` : w;
      if (ctx.measureText(proef).width > maxW && regel) {
        regels.push(regel);
        regel = w;
      } else {
        regel = proef;
      }
    }
    if (regel) regels.push(regel);
    const fontGroot = regels.length > 2 ? 72 : 96;
    ctx.font = `700 ${fontGroot}px system-ui, -apple-system, 'Segoe UI', Arial`;
    let y = 460;
    for (const r of regels.slice(0, 3)) {
      ctx.fillText(r, 72, y);
      y += fontGroot + 22;
    }

    // sub-regel (geel)
    ctx.fillStyle = "#ffe600";
    ctx.font = "600 40px system-ui, -apple-system, 'Segoe UI', Arial";
    ctx.fillText(sub.slice(0, 42), 72, y + 26);

    // stats-blok
    ctx.font = "600 30px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
    let sx = 72;
    const sy = 830;
    for (const st of stats.slice(0, 4)) {
      const tekst = st.toUpperCase();
      const breed = ctx.measureText(tekst).width;
      if (sx + breed > W - 72) break;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(sx - 16, sy - 34, breed + 32, 52);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.strokeRect(sx - 16, sy - 34, breed + 32, 52);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(tekst, sx, sy);
      sx += breed + 56;
    }

    // onderbalk
    ctx.strokeStyle = "#26262b";
    ctx.beginPath();
    ctx.moveTo(72, 930);
    ctx.lineTo(W - 72, 930);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "500 28px system-ui, -apple-system, 'Segoe UI', Arial";
    ctx.fillText(urlLabel, 72, 986);

    ctx.fillStyle = "#ffe600";
    const badge = "PLAN DEZE RIT";
    ctx.font = "700 28px system-ui, -apple-system, 'Segoe UI', Arial";
    const bw = ctx.measureText(badge).width;
    ctx.fillRect(W - 72 - bw - 48, 950, bw + 48, 60);
    ctx.fillStyle = "#050507";
    ctx.fillText(badge, W - 72 - bw - 24, 988);

    // download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `apex-routes-${naam.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  };

  return (
    <button
      onClick={genereer}
      className="glass border border-white/10 hover:border-yellow-400/50 px-4 py-2.5 rounded font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
    >
      <ImageDown className="w-4 h-4 text-yellow-300" aria-hidden />
      Deelkaart
    </button>
  );
}
