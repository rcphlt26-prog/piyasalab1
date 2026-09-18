import type { Metadata } from "next";
import { ProfileClient } from "@/components/ProfileClient";

export const metadata: Metadata = { title: "Profilim", description: "VeriAkış profil ve takma ad ayarları." };

export default function ProfilePage() {
  return <main className="app-bg min-h-screen px-4 py-10"><ProfileClient /></main>;
}
