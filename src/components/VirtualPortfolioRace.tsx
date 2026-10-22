"use client";

import { useCallback, useId, useMemo, useState, type FormEvent } from "react";
import useSWR from "swr";
import {
  BarChart3,
  Check,
  Minus,
  Play,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useLiveQuotes } from "@/hooks/useLiveQuotes";
import {
  getMarketPriceMeta,
  marketSymbolByCode,
  marketSymbols,
  type MarketCategory,
} from "@/data/marketSymbols";
import {
  GAME_MAX_ASSETS,
  GAME_START_CASH,
  isGameAsset,
  toTry,
} from "@/lib/gameMath";
import { formatMarketPrice, formatNumber } from "@/lib/utils";

type Holding = {
  symbol: string;
  quantity: number;
  price: number | null;
};

type Portfolio = {
  id: string;
  display_name: string;
  status: "ACTIVE" | "REMOVED";
  cash_balance: number;
  current_value: number;
  total_return_pct: number;
  started_at: string;
  holdings: Holding[];
};

type LeaderboardRow = {
  display_name: string;
  current_value: number;
  total_return_pct: number;
  started_at: string;
};

type Participant = {
  id: string;
  display_name: string;
  username: string | null;
  status: "ACTIVE" | "REMOVED";
  current_value: number;
  total_return_pct: number;
  started_at: string;
};

type RaceData = {
  period: string;
  leaderboard: LeaderboardRow[];
  portfolio: Portfolio | null;
  isAdmin: boolean;
  signedIn: boolean;
  canJoin?: boolean;
  participants?: Participant[];
  updatedAt: string;
};

type DraftItem = {
  symbol: string;
  amount: string;
};

type Period = "weekly" | "monthly" | "all";

type CategoryFilter = "all" | Exclude<MarketCategory, "endeks">;

type Notice = {
  kind: "error" | "ok";
  text: string;
} | null;

type PriceOf = (code: string) => number | null;

const DRAFT_KEY = "veriakis-race-draft-v1";
const MIN_AMOUNT = 100;

const POPULAR = [
  "THYAO",
  "ASELS",
  "GARAN",
  "GRAMALTIN",
  "BTCUSD",
  "ETHUSD",
  "USDTRY",
  "AAPL",
  "NVDA",
];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "Tümü",
  hisse: "Hisse",
  kripto: "Kripto",
  doviz: "Döviz",
  emtia: "Emtia",
};

const PERIOD_LABELS: Record<Period, string> = {
  weekly: "Haftalık",
  monthly: "Aylık",
  all: "Tümü",
};

const money = (value: number) => `${formatNumber(value, 2)} TL`;

const signedPct = (value: number) =>
  `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;

const labelOf = (code: string) =>
  marketSymbolByCode.get(code)?.label ?? code;

function loadDraft(): DraftItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(DRAFT_KEY) ?? "[]",
    );

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is DraftItem =>
          typeof item?.symbol === "string" &&
          typeof item?.amount === "string" &&
          isGameAsset(item.symbol),
      )
      .slice(0, GAME_MAX_ASSETS);
  } catch {
    return [];
  }
}

function saveDraft(items: DraftItem[]) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
  } catch {
    // Depolama kapalıysa taslak yalnızca bu oturumda tutulur.
  }
}

async function fetchRace(url: string): Promise<RaceData> {
  const response = await fetch(url);

  const payload = (await response.json().catch(() => ({}))) as RaceData & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Yarışma verisi alınamadı.");
  }

  return payload;
}

async function sendRace(
  method: "POST" | "DELETE",
  url: string,
  body?: unknown,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    return response.ok
      ? { ok: true }
      : {
          ok: false,
          error: payload.error ?? "İşlem başarısız.",
        };
  } catch {
    return {
      ok: false,
      error: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
    };
  }
}

function AssetPicker({
  priceOf,
  chosen,
  onPick,
  title,
}: {
  priceOf: PriceOf;
  chosen: Set<string>;
  onPick: (code: string) => void;
  title: string;
}) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");

    if (!term && category === "all") {
      return POPULAR.map((code) => marketSymbolByCode.get(code)).filter(
        (item): item is NonNullable<typeof item> => Boolean(item),
      );
    }

    return marketSymbols
      .filter(
        (item) =>
          isGameAsset(item.code) &&
          (category === "all" || item.category === category) &&
          (!term ||
            `${item.code} ${item.label}`
              .toLocaleLowerCase("tr-TR")
              .includes(term)),
      )
      .slice(0, 40);
  }, [query, category]);

  return (
    <div>
      <label
        htmlFor={inputId}
        className="app-text mb-1 block text-sm font-semibold"
      >
        {title}
      </label>

      <div className="app-surface app-border flex items-center gap-2 rounded-lg border px-3">
        <Search
          className="app-muted h-4 w-4 shrink-0"
          aria-hidden="true"
        />

        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          placeholder="Sembol veya isim: THYAO, Bitcoin, altın..."
          className="app-text min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:opacity-60"
        />

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Aramayı temizle"
            className="app-muted"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div
        className="mt-2 flex flex-wrap gap-1.5"
        role="group"
        aria-label="Varlık kategorisi"
      >
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              category === key
                ? "border-transparent bg-[var(--color-primary)] text-white"
                : "app-surface app-border app-text-secondary"
            }`}
          >
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <p className="app-muted mt-2 text-[11px]">
        {query.trim() || category !== "all"
          ? `${results.length} sonuç`
          : "Öne çıkanlar · tüm varlıkları görmek için arayın veya kategori seçin"}
      </p>

      <ul
        className="mt-1 max-h-72 space-y-1 overflow-y-auto pr-1"
        aria-label="Varlık sonuçları"
      >
        {results.length ? (
          results.map((item) => {
            const price = priceOf(item.code);
            const added = chosen.has(item.code);

            return (
              <li key={item.code}>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => onPick(item.code)}
                  className="app-surface app-border hover:border-[var(--color-primary)] flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left disabled:opacity-60"
                >
                  <span className="app-surface-2 app-border flex h-9 w-12 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold">
                    {item.code.slice(0, 5)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="app-text block truncate text-sm font-semibold">
                      {item.label}
                    </span>

                    <span className="app-muted block text-[11px]">
                      {CATEGORY_LABELS[item.category as CategoryFilter] ??
                        item.category}
                    </span>
                  </span>

                  <span className="text-right text-xs">
                    <span className="app-text block font-semibold">
                      {price ? money(price) : "Fiyat bekleniyor"}
                    </span>

                    {added ? (
                      <span className="text-bull inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Eklendi
                      </span>
                    ) : (
                      <span className="text-primary inline-flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Ekle
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })
        ) : (
          <li className="app-muted py-4 text-center text-sm">
            Eşleşen varlık bulunamadı.
          </li>
        )}
      </ul>
    </div>
  );
}

export function VirtualPortfolioRace() {
  const { quotes } = useLiveQuotes();

  const [period, setPeriod] = useState<Period>("weekly");

  const { data, error, mutate } = useSWR<RaceData>(
    `/api/games/trading?period=${period}`,
    fetchRace,
    {
      refreshInterval: 30_000,
      dedupingInterval: 10_000,
      keepPreviousData: true,
    },
  );

  const [draft, setDraft] = useState<DraftItem[]>(loadDraft);
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [joiningNew, setJoiningNew] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [mode, setMode] = useState<"ADD" | "REMOVE">("ADD");
  const [adjSymbol, setAdjSymbol] = useState<string | null>(null);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjAll, setAdjAll] = useState(false);

  const quoteMap = useMemo(
    () => new Map(quotes.map((quote) => [quote.code, quote])),
    [quotes],
  );

  const usdTry = quoteMap.get("USDTRY")?.price ?? 0;

  const priceOf = useCallback<PriceOf>(
    (code) => {
      const quote = quoteMap.get(code);

      if (!quote) return null;

      if (
        getMarketPriceMeta(marketSymbolByCode.get(code)).currency === "USD" &&
        !usdTry
      ) {
        return null;
      }

      return toTry(code, quote.price, usdTry);
    },
    [quoteMap, usdTry],
  );

  const portfolio = data?.portfolio ?? null;

  const live = useMemo(() => {
    if (!portfolio) return null;

    const rows = portfolio.holdings.map((holding) => {
      const price = priceOf(holding.symbol) ?? holding.price ?? 0;

      return {
        ...holding,
        price,
        value: holding.quantity * price,
      };
    });

    const value =
      portfolio.cash_balance +
      rows.reduce((sum, row) => sum + row.value, 0);

    return {
      rows,
      value,
      pct: (value / GAME_START_CASH - 1) * 100,
    };
  }, [portfolio, priceOf]);

  const draftTotal = draft.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const draftRemaining = GAME_START_CASH - draftTotal;

  const draftInvalid =
    draft.length === 0 ||
    draft.some((item) => !(Number(item.amount) >= MIN_AMOUNT)) ||
    draftTotal > GAME_START_CASH + 1e-6;

  const draftSymbols = useMemo(
    () => new Set(draft.map((item) => item.symbol)),
    [draft],
  );

  const heldSymbols = useMemo(
    () => new Set((portfolio?.holdings ?? []).map((holding) => holding.symbol)),
    [portfolio],
  );

  function updateDraft(next: DraftItem[]) {
    setDraft(next);
    saveDraft(next);
  }

  function addToDraft(code: string) {
    if (draft.length >= GAME_MAX_ASSETS) {
      return setNotice({
        kind: "error",
        text: `En fazla ${GAME_MAX_ASSETS} varlık seçebilirsiniz.`,
      });
    }

    if (draftRemaining < MIN_AMOUNT) {
      return setNotice({
        kind: "error",
        text: "Sanal bütçe doldu; önce başka bir seçimin tutarını azaltın veya çıkarın.",
      });
    }

    setNotice(null);

    updateDraft([
      ...draft,
      {
        symbol: code,
        amount: String(
          Math.min(10000, Math.floor(draftRemaining)),
        ),
      },
    ]);
  }

  function splitEqually() {
    if (!draft.length) return;

    const each = Math.floor(GAME_START_CASH / draft.length);

    updateDraft(
      draft.map((item) => ({
        ...item,
        amount: String(each),
      })),
    );
  }

  async function joinRace() {
    setBusy(true);
    setNotice(null);

    const result = await sendRace(
      "POST",
      "/api/games/trading",
      {
        action: "join",
        displayName,
        items: draft.map((item) => ({
          symbol: item.symbol,
          amountTry: Number(item.amount),
        })),
      },
    );

    if (result.ok) {
      updateDraft([]);
      setConsent(false);
      setJoiningNew(false);

      setNotice({
        kind: "ok",
        text: "Yarışa katıldınız. Başarılar!",
      });

      await mutate();
    } else {
      setNotice({
        kind: "error",
        text: result.error ?? "Yarışa katılınamadı.",
      });
    }

    setBusy(false);
  }

  async function submitAdjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adjSymbol) return;

    setBusy(true);
    setNotice(null);

    const result = await sendRace(
      "POST",
      "/api/games/trading",
      {
        action: "adjust",
        symbol: adjSymbol,
        mode,
        amountTry: Number(adjAmount),
        all: mode === "REMOVE" && adjAll,
      },
    );

    if (result.ok) {
      setNotice({
        kind: "ok",
        text:
          mode === "ADD"
            ? "Varlık portföye eklendi."
            : "Varlık portföyden çıkarıldı.",
      });

      setAdjAmount("");
      setAdjAll(false);

      await mutate();
    } else {
      setNotice({
        kind: "error",
        text: result.error ?? "İşlem başarısız.",
      });
    }

    setBusy(false);
  }

  async function removeParticipant(participant: Participant) {
    if (
      !window.confirm(
        `${participant.display_name} yarıştan çıkarılsın mı? Kullanıcı bugün yeniden katılamaz, ertesi gün tekrar katılabilir.`,
      )
    ) {
      return;
    }

    setBusy(true);

    const result = await sendRace(
      "DELETE",
      `/api/games/trading?id=${encodeURIComponent(participant.id)}`,
    );

    setNotice(
      result.ok
        ? {
            kind: "ok",
            text: `${participant.display_name} yarıştan çıkarıldı.`,
          }
        : {
            kind: "error",
            text: result.error ?? "Yarışmacı çıkarılamadı.",
          },
    );

    if (result.ok) {
      await mutate();
    }

    setBusy(false);
  }

  function pickAdjust(code: string) {
    setAdjSymbol(code);
    setAdjAll(false);
    setAdjAmount("");
  }

  function applyPercent(percent: number) {
    if (!adjSymbol || !portfolio || !live) return;

    const base =
      mode === "ADD"
        ? portfolio.cash_balance
        : live.rows.find((row) => row.symbol === adjSymbol)?.value ?? 0;

    setAdjAmount(
      String(Math.floor((base * percent) / 100) || ""),
    );

    setAdjAll(mode === "REMOVE" && percent === 100);
  }

  const adjHolding = adjSymbol
    ? live?.rows.find((row) => row.symbol === adjSymbol)
    : undefined;

  const adjPrice = adjSymbol ? priceOf(adjSymbol) : null;

  const removed = portfolio?.status === "REMOVED";

  const active = portfolio?.status === "ACTIVE" && live;

  const lastUpdate = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString("tr-TR")
    : null;

  const noticeBox = notice ? (
    <p
      role={notice.kind === "error" ? "alert" : "status"}
      className={`mb-3 rounded-lg border p-3 text-xs ${
        notice.kind === "error"
          ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-gold"
          : "border-[var(--color-bull)]/40 bg-[var(--color-bull)]/10 text-bull"
      }`}
    >
      {notice.text}
    </p>
  ) : null;

  return (
    <section
      className="section-card mb-6 border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--surface)] to-[var(--color-gold)]/10"
      aria-labelledby="race-title"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
          <BarChart3 className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="app-muted text-xs font-semibold uppercase tracking-wide">
            Canlı fiyatlı yarış · günde bir katılım hakkı
          </p>

          <h2
            id="race-title"
            className="app-text text-2xl font-bold"
          >
            100.000 TL Sanal Portföy Yarışı
          </h2>

          <p className="app-text-secondary mt-1 text-sm">
            Almak istediklerini seç, tutarlarını düzenle ve yarışa başla.
            Sıralama canlı fiyatlarla sürekli güncellenir.
          </p>
        </div>
      </div>

      {error && !data ? (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-[var(--color-gold)] bg-[var(--color-gold)]/10 p-3 text-xs text-gold"
        >
          {error.message}
        </p>
      ) : null}

      {noticeBox}

      {removed ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--color-bear)]/40 bg-[var(--color-bear)]/10 p-4 text-sm text-bear">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Bu katılım oturumunuz kapatıldı. Yeni bir portföyle tekrar yarışa katılabilirsiniz (günde 1 kez).</p>
        </div>
      ) : null}

      {!portfolio || joiningNew ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="app-surface-2 app-border rounded-xl border p-4">
            <AssetPicker
              title="1. Varlık seç"
              priceOf={priceOf}
              chosen={draftSymbols}
              onPick={addToDraft}
            />
          </div>

          <div className="app-surface-2 app-border rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="app-text text-sm font-semibold">
                2. Seçimlerini düzenle
              </h3>

              {draft.length ? (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={splitEqually}
                    className="app-border app-text-secondary rounded-lg border px-2.5 py-1"
                  >
                    Eşit dağıt
                  </button>

                  <button
                    type="button"
                    onClick={() => updateDraft([])}
                    className="app-border app-text-secondary rounded-lg border px-2.5 py-1"
                  >
                    Temizle
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <div className="app-muted flex justify-between text-[11px]">
                <span>Harcanan {money(draftTotal)}</span>

                <span className={draftRemaining < 0 ? "text-bear" : ""}>
                  Kalan {money(draftRemaining)}
                </span>
              </div>

              <div
                className="app-surface-3 mt-1 h-2 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={GAME_START_CASH}
                aria-valuenow={Math.max(
                  0,
                  Math.min(GAME_START_CASH, draftTotal),
                )}
                aria-label="Sanal bütçe kullanımı"
              >
                <div
                  className={`h-full rounded-full ${
                    draftRemaining < 0
                      ? "bg-[var(--color-bear)]"
                      : "bg-[var(--color-primary)]"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (draftTotal / GAME_START_CASH) * 100,
                    )}%`,
                  }}
                />
              </div>

              <p className="app-muted mt-1 text-[11px]">
                Kullanılmayan tutar nakitte kalır. Her varlık için en az{" "}
                {MIN_AMOUNT} TL girin.
              </p>
            </div>

            {draft.length ? (
              <ul className="space-y-2">
                {draft.map((item) => {
                  const price = priceOf(item.symbol);
                  const amount = Number(item.amount) || 0;

                  return (
                    <li
                      key={item.symbol}
                      className="app-surface app-border grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border p-2.5 sm:grid-cols-[1fr_130px_auto]"
                    >
                      <div className="min-w-0">
                        <p className="app-text truncate text-sm font-semibold">
                          {labelOf(item.symbol)}
                        </p>

                        <p className="app-muted text-[11px]">
                          {item.symbol} ·{" "}
                          {price
                            ? `${money(price)} · yaklaşık ${formatMarketPrice(
                                amount / price,
                              )} adet`
                            : "fiyat bekleniyor"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(
                            draft.filter(
                              (entry) => entry.symbol !== item.symbol,
                            ),
                          )
                        }
                        aria-label={`${labelOf(
                          item.symbol,
                        )} seçimini kaldır`}
                        className="app-border text-bear row-start-1 col-start-2 rounded-lg border p-2 sm:col-start-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <label className="app-text-secondary col-span-2 text-xs sm:col-span-1 sm:col-start-2 sm:row-start-1">
                        Tutar (TL)

                        <input
                          type="number"
                          min={MIN_AMOUNT}
                          step="any"
                          value={item.amount}
                          onChange={(event) =>
                            updateDraft(
                              draft.map((entry) =>
                                entry.symbol === item.symbol
                                  ? {
                                      ...entry,
                                      amount: event.target.value,
                                    }
                                  : entry,
                              ),
                            )
                          }
                          className="app-surface-2 app-border app-text mt-1 w-full rounded-lg border px-2.5 py-2 text-sm outline-none"
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="app-muted rounded-lg border border-dashed py-8 text-center text-sm">
                Henüz varlık seçmedin. Soldaki listeden ekle.
              </p>
            )}

            <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
              <label className="app-text-secondary block text-xs">
                Oyuncu adı

                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={30}
                  placeholder="Takma adın (boşsa kullanıcı adın)"
                  className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                />
              </label>

              <label className="app-text-secondary flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5"
                />

                <span>
                  Her gün en fazla bir kez katılabildiğimi (yöneticiler
                  hariç) ve seçimlerimin güncel fiyatlarla alınacağını
                  anlıyorum.
                </span>
              </label>

              {data && !data.signedIn ? (
                <p className="text-xs text-gold">
                  Yarışa katılmak için üye girişi yapmalısın. Seçimlerin bu
                  cihazda saklanır.
                </p>
              ) : null}

              <button
                type="button"
                disabled={
                  busy ||
                  draftInvalid ||
                  !consent ||
                  Boolean(data && !data.signedIn)
                }
                onClick={() => void joinRace()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Yarışa Başla
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {active ? (
        <>
          {data?.canJoin ? (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setJoiningNew((value) => !value)}
                className="app-border app-text rounded-lg border px-3 py-2 text-xs font-semibold"
              >
                {joiningNew
                  ? "Yeni katılımı kapat"
                  : data.isAdmin
                    ? "Yeni katılım ekle (yönetici, sınırsız)"
                    : "Bugün için yeni katılım yap"}
              </button>
            </div>
          ) : null}

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="app-surface-2 app-border rounded-xl border p-3">
              <p className="app-muted text-xs">
                Canlı portföy · {portfolio?.display_name}
              </p>

              <p className="app-text text-xl font-bold">
                {money(live.value)}
              </p>
            </div>

            <div className="app-surface-2 app-border rounded-xl border p-3">
              <p className="app-muted text-xs">Getiri</p>

              <p
                className={`text-xl font-bold ${
                  live.pct >= 0 ? "text-bull" : "text-bear"
                }`}
              >
                {signedPct(live.pct)}
              </p>
            </div>

            <div className="app-surface-2 app-border rounded-xl border p-3">
              <p className="app-muted text-xs">Nakit</p>

              <p className="app-text text-xl font-bold">
                {money(portfolio?.cash_balance ?? 0)}
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <div className="app-surface-2 app-border rounded-xl border p-4">
              <h3 className="app-text mb-2 text-sm font-semibold">
                Portföyündekiler
              </h3>

              {live.rows.length ? (
  <>
    {/* Mobil görünüm */}
    <div className="space-y-2 sm:hidden">
      {live.rows.map((row) => (
        <div
          key={row.symbol}
          className="app-surface app-border rounded-lg border p-3"
        >
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="app-text truncate text-sm font-semibold">
                {labelOf(row.symbol)}
              </p>

              <p className="app-muted truncate text-[10px]">
                {row.symbol}
              </p>
            </div>

            <button
              type="button"
              onClick={() => pickAdjust(row.symbol)}
              aria-label={`${labelOf(row.symbol)} varlığını düzenle`}
              className="app-border text-primary inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1.5 text-[11px] font-semibold leading-none"
            >
              Düzenle
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-2">
            <div>
              <p className="app-muted text-[10px]">
                Adet
              </p>

              <p className="app-text whitespace-nowrap text-xs font-semibold">
                {formatMarketPrice(row.quantity)}
              </p>
            </div>

            <div className="text-right">
              <p className="app-muted text-[10px]">
                Değer
              </p>

              <p className="app-text whitespace-nowrap text-xs font-semibold">
                {money(row.value)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Tablet / masaüstü görünüm */}
    <div className="hidden w-full sm:block">
      <table className="w-full text-left text-xs">
        <thead className="app-muted border-b">
          <tr>
            <th className="px-2 py-1.5">
              Varlık
            </th>

            <th className="px-2 py-1.5">
              Adet
            </th>

            <th className="px-2 py-1.5">
              Değer
            </th>

            <th className="px-2 py-1.5 text-right">
              <span className="sr-only">
                Düzenle
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {live.rows.map((row) => (
            <tr
              key={row.symbol}
              className="app-border border-b last:border-b-0"
            >
              <td className="min-w-0 px-2 py-2">
                <div className="min-w-0">
                  <p className="app-text truncate font-semibold">
                    {labelOf(row.symbol)}
                  </p>

                  <p className="app-muted truncate text-[10px]">
                    {row.symbol}
                  </p>
                </div>
              </td>

              <td className="app-text whitespace-nowrap px-2 py-2">
                {formatMarketPrice(row.quantity)}
              </td>

              <td className="app-text whitespace-nowrap px-2 py-2">
                {money(row.value)}
              </td>

              <td className="px-2 py-2 text-right">
                <button
                  type="button"
                  onClick={() => pickAdjust(row.symbol)}
                  aria-label={`${labelOf(row.symbol)} varlığını düzenle`}
                  className="app-border text-primary inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-semibold leading-none transition-colors hover:bg-[var(--color-primary)]/10 active:scale-[0.98]"
                >
                  Düzenle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
) : (
  <p className="app-muted py-4 text-center text-sm">
    Portföyünde varlık yok; sağdan ekleyebilirsin.
  </p>
)}
            </div>

            <div className="app-surface-2 app-border rounded-xl border p-4">
              <h3 className="app-text mb-2 text-sm font-semibold">
                Ekle / Çıkar
              </h3>

              <div
                className="app-surface app-border mb-3 grid grid-cols-2 gap-1 rounded-lg border p-1"
                role="group"
                aria-label="İşlem türü"
              >
                <button
                  type="button"
                  aria-pressed={mode === "ADD"}
                  onClick={() => {
                    setMode("ADD");
                    setAdjAll(false);
                  }}
                  className={`inline-flex items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold ${
                    mode === "ADD"
                      ? "bg-[var(--color-bull)] text-white"
                      : "app-text-secondary"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>

                <button
                  type="button"
                  aria-pressed={mode === "REMOVE"}
                  onClick={() => {
                    setMode("REMOVE");
                    setAdjAll(false);
                  }}
                  className={`inline-flex items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold ${
                    mode === "REMOVE"
                      ? "bg-[var(--color-bear)] text-white"
                      : "app-text-secondary"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  Çıkar
                </button>
              </div>

              {mode === "ADD" ? (
                <div className="mb-3">
                  <AssetPicker
                    title="Eklenecek varlık"
                    priceOf={priceOf}
                    chosen={new Set()}
                    onPick={pickAdjust}
                  />
                </div>
              ) : (
                <p className="app-muted mb-3 text-xs">
                  Çıkarmak istediğin varlığın yanındaki{" "}
                  <strong className="app-text">Düzenle</strong> düğmesine
                  bas.
                </p>
              )}

              <form
                onSubmit={submitAdjust}
                className="space-y-2"
              >
                <p className="app-text rounded-lg border border-dashed px-3 py-2 text-sm">
                  {adjSymbol ? (
                    <>
                      <strong>{labelOf(adjSymbol)}</strong>

                      <span className="app-muted">
                        {" "}
                        ·{" "}
                        {adjPrice
                          ? money(adjPrice)
                          : "fiyat bekleniyor"}
                        {adjHolding
                          ? ` · elinde ${money(adjHolding.value)}`
                          : ""}
                      </span>
                    </>
                  ) : (
                    <span className="app-muted">
                      Henüz varlık seçilmedi.
                    </span>
                  )}
                </p>

                <label className="app-text-secondary block text-xs">
                  Tutar (TL)

                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={adjAmount}
                    onChange={(event) => {
                      setAdjAmount(event.target.value);
                      setAdjAll(false);
                    }}
                    className="app-surface app-border app-text mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  />
                </label>

                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Hızlı tutar"
                >
                  {[25, 50, 100].map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => applyPercent(percent)}
                      className="app-border app-text-secondary rounded-full border px-3 py-1 text-xs font-semibold"
                    >
                      {mode === "ADD"
                        ? `Nakdin %${percent}`
                        : percent === 100
                          ? "Tümünü çıkar"
                          : `Pozisyonun %${percent}`}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={
                    busy ||
                    !adjSymbol ||
                    !adjAmount ||
                    (mode === "REMOVE" &&
                      !heldSymbols.has(adjSymbol ?? ""))
                  }
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                    mode === "ADD"
                      ? "bg-[var(--color-bull)]"
                      : "bg-[var(--color-bear)]"
                  }`}
                >
                  {mode === "ADD"
                    ? "Portföye ekle"
                    : "Portföyden çıkar"}
                </button>
              </form>
            </div>
          </div>
        </>
      ) : null}

      <div className="app-surface-2 app-border rounded-xl border p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />

            <h3 className="app-text text-sm font-semibold">
              Canlı Sıralama
            </h3>
          </div>

          <div
            className="flex gap-1"
            role="group"
            aria-label="Sıralama dönemi"
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={period === key}
                onClick={() => setPeriod(key)}
                className={`rounded-lg px-3 py-1 text-xs ${
                  period === key
                    ? "bg-[var(--color-primary)] text-white"
                    : "app-text-secondary"
                }`}
              >
                {PERIOD_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {data?.leaderboard.length ? (
          <ol className="space-y-2">
            {data.leaderboard.map((row, index) => {
              const mine =
                portfolio?.display_name === row.display_name &&
                portfolio.started_at === row.started_at;

              return (
                <li
                  key={`${row.display_name}-${row.started_at}`}
                  className={`app-border flex items-center justify-between gap-3 border-b pb-2 text-sm ${
                    mine ? "font-semibold" : ""
                  }`}
                >
                  <span className="app-text min-w-0 truncate">
                    <strong className="mr-2 text-gold">
                      #{index + 1}
                    </strong>

                    {row.display_name}

                    {mine ? (
                      <span className="app-muted ml-1 text-[11px]">
                        (sen)
                      </span>
                    ) : null}
                  </span>

                  <span className="shrink-0 text-right">
                    <span
                      className={
                        row.total_return_pct >= 0
                          ? "text-bull"
                          : "text-bear"
                      }
                    >
                      {signedPct(row.total_return_pct)}
                    </span>

                    <span className="app-muted block text-[11px]">
                      {money(row.current_value)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="app-muted text-xs">
            Bu dönemde henüz yarışmacı yok.
          </p>
        )}

        <p className="app-muted mt-3 text-[11px]">
          Fiyatlar 30 saniyede bir otomatik yenilenir · Son güncelleme:{" "}
          {lastUpdate ?? "bekleniyor"}
        </p>
      </div>

      {data?.isAdmin ? (
        <div className="app-surface-2 app-border mt-4 rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />

            <h3 className="app-text text-sm font-semibold">
              Yönetici · Yarışmacılar
            </h3>
          </div>

          {data.participants?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="app-muted border-b">
                  <tr>
                    <th className="px-2 py-1.5">Oyuncu</th>
                    <th className="px-2 py-1.5">Kullanıcı</th>
                    <th className="px-2 py-1.5">Durum</th>
                    <th className="px-2 py-1.5 text-right">
                      Değer
                    </th>
                    <th className="px-2 py-1.5 text-right">
                      Getiri
                    </th>
                    <th className="px-2 py-1.5">
                      <span className="sr-only">İşlem</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className={`app-border border-b ${
                        participant.status === "REMOVED"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <td className="app-text px-2 py-1.5 font-semibold">
                        {participant.display_name}
                      </td>

                      <td className="app-muted px-2 py-1.5">
                        {participant.username ?? "-"}
                      </td>

                      <td className="px-2 py-1.5">
                        {participant.status === "ACTIVE" ? (
                          <span className="text-bull">
                            Yarışta
                          </span>
                        ) : (
                          <span className="text-bear">
                            Çıkarıldı
                          </span>
                        )}
                      </td>

                      <td className="app-text px-2 py-1.5 text-right">
                        {money(participant.current_value)}
                      </td>

                      <td
                        className={`px-2 py-1.5 text-right ${
                          participant.total_return_pct >= 0
                            ? "text-bull"
                            : "text-bear"
                        }`}
                      >
                        {signedPct(participant.total_return_pct)}
                      </td>

                      <td className="px-2 py-1.5 text-right">
                        {participant.status === "ACTIVE" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void removeParticipant(participant)
                            }
                            className="app-border text-bear inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Çıkar
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="app-muted text-xs">
              Henüz yarışmacı yok.
            </p>
          )}

          <p className="app-muted mt-2 text-[11px]">
            Çıkarılan yarışmacı sıralamadan kalkar. Aynı kullanıcı aynı gün yalnızca 1 kez yeniden katılabilir.
          </p>
        </div>
      ) : null}
    </section>
  );
}