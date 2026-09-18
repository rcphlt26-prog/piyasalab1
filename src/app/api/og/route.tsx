import { ImageResponse } from "next/og";
import { marketSymbolByCode, stockByTicker } from "@/data/marketSymbols";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ticker = url.searchParams.get("ticker")?.toUpperCase();
  const title = url.searchParams.get("title") ?? (ticker ? `${ticker} Canlı Piyasa Analizi` : "VeriAkış | Canlı Finans Merkezi");
  const market = ticker ? marketSymbolByCode.get(ticker) : undefined;
  const entry = ticker ? stockByTicker.get(ticker) : undefined;
  const subtitle = url.searchParams.get("subtitle") ?? market?.label ?? entry?.name ?? "BIST, altın, döviz, portföy ve finans araçları";

  return new ImageResponse(
    (
      <div style={{ background: "#080b12", color: "#f8fafc", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://piyasalab.com.tr/gemini-svg.svg" alt="VeriAkış" width="76" height="76" style={{ borderRadius: "18px" }} />
          <div style={{ color: "#34d399", display: "flex", fontSize: 30, fontWeight: 700 }}>VeriAkış</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1000px" }}>
          <div style={{ color: "#34d399", display: "flex", fontSize: 24, fontWeight: 600 }}>Canlı piyasa özeti</div>
          <div style={{ display: "flex", fontSize: 58, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
          <div style={{ color: "#cbd5e1", display: "flex", fontSize: 28 }}>{subtitle}</div>
        </div>
        <div style={{ color: "#94a3b8", display: "flex", fontSize: 22 }}>piyasalab.com.tr · Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
