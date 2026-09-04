"use client";

import { useRef } from "react";

/**
 * 3D-tilt-kaart: kantelt subtiel mee met de muis en legt een glare-glow
 * neer waar de aanwijzer is. Respecteert prefers-reduced-motion.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * maxTilt * 2;
    const ry = (px - 0.5) * maxTilt * 2;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  };

  return (
    <div className="tilt-wrap">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`tilt-card relative ${className}`}
      >
        {children}
        <span className="tilt-glare" aria-hidden />
      </div>
    </div>
  );
}
