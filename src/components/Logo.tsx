"use client";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="btn-brand rounded flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 18 C8 18 8 7 12 7 C16 7 16 15 21 15" />
        <circle cx="12" cy="7" r="2.4" fill="white" stroke="none" />
      </svg>
    </div>
  );
}