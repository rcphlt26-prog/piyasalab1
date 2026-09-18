import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";

export const metadata: Metadata = {
  title: "Üye Ol | VeriAkış",
  description: "VeriAkış kişisel finans merkezine ücretsiz üye olun.",
};

export default function RegisterPage() {
  return (
    <main className="app-bg flex min-h-screen items-start justify-center px-4 py-12">
      <section className="section-card w-full max-w-md">
        <h1 className="app-text text-2xl font-bold">Ücretsiz hesap oluştur</h1>
        <p className="app-text-secondary mt-2 text-sm">Portföyünü, izleme listeni ve alarmlarını tek yerde takip et.</p>
        <div className="mt-5"><AuthPanel initialMode="signup" /></div>
        <Link href="/login" target="_blank" rel="noopener noreferrer" className="app-text-secondary mt-5 inline-block text-sm underline">Zaten hesabın var mı? Giriş yap</Link>
      </section>
    </main>
  );
}