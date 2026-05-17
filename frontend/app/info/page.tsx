import type { Metadata } from "next";
import InfoClient from "./InfoClient";

export const metadata: Metadata = {
  title: "Info — LIFE",
  description: "The intention behind LIFE, and the methods it draws from.",
};

export default function InfoPage() {
  return <InfoClient />;
}
