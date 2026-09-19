import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Finans Hesaplayıcıları",
  description: "Bileşik getiri, temettü, maliyet ortalaması ve hisse-altın karşılaştırma hesaplayıcıları.",
  alternates: { canonical: "https://veriakis.com/hesaplayicilar" },
};

const calculators = [
  ["bilesik-getiri", "Bileşik Getiri Hesaplama", "Yatırımınızın tarihsel bileşik değerini hesaplayın."],
  ["temettu-getirisi", "Temettü Getirisi Hesaplama", "Temettü ve yeniden yatırım etkisini inceleyin."],
  ["maliyet-ortalamasi", "Maliyet Ortalaması Hesaplama", "Düzenli alımlarda ortalama maliyeti bulun."],
  ["hisse-vs-altin", "Hisse vs Altın", "100.000 TL'nin 5 yıl önceki karşılığını kıyaslayın."],
];

export default function CalculatorsPage() {
  return <main className="app-bg min-h-screen px-4 py-10"><section className="section-card mx-auto max-w-4xl"><h1 className="app-text text-3xl font-bold">Finans Hesaplayıcıları</h1><p className="app-text-secondary mt-2 text-sm">Borsa, temettü ve alım gücü için pratik finans araçları.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{calculators.map(([slug, title, description]) => <Link key={slug} href={`/hesaplayicilar/${slug}`} className="app-surface-2 app-border card-hover rounded-xl border p-4"><h2 className="app-text font-semibold">{title}</h2><p className="app-muted mt-1 text-sm">{description}</p></Link>)}</div></section></main>;
}
