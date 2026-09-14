const STORAGE_KEY = "piyasalab_client_id";

/**
 * Tarayıcı bazlı anonim istemci kimliği döndürür.
 * Supabase user_watchlists tablosunda kullanıcıyı (oturum açmadan) ayırt etmek için kullanılır.
 * SSR sırasında boş string döner.
 */
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `pl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
