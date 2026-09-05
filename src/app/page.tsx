import type { Metadata } from "next";
import PlannerApp from "@/components/PlannerApp";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <PlannerApp />;
}