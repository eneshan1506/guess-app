// ============================================
// 📋 MessageList — Mesaj Listesi Bileşeni
//
// TanStack Query (React Query) Kullanımı:
//
// useQuery vs useEffect:
// ┌─────────────────────────────────────────┐
// │ useEffect ile:                           │
// │  const [data, setData] = useState([])    │
// │  const [loading, setLoading] = useState()│
// │  const [error, setError] = useState()    │
// │  useEffect(() => { fetch()... }, [])     │
// │  → 3 ayrı state + useEffect = Karmaşık  │
// ├─────────────────────────────────────────┤
// │ useQuery ile:                            │
// │  const { data, isLoading, error } = ...  │
// │  → Tek satır = Temiz ve güçlü            │
// └─────────────────────────────────────────┘
//
// 💡 queryFn olarak doğrudan Server Action
// kullanıyoruz. API Route Handler'a gerek yok!
// ============================================

"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessagesAction } from "@/actions/messages";
import type { GuestMessage } from "@/types";

/**
 * MessageList — Ziyaretçi defterindeki mesajları listeler.
 *
 * useQuery özellikleri:
 * - Otomatik loading/error yönetimi
 * - Arka planda veri yenileme (stale-while-revalidate)
 * - Sekme değişiminde otomatik refetch
 * - Cache'leme (aynı veriyi tekrar çekmez)
 */
export default function MessageList() {
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<GuestMessage[]>({
    queryKey: ["messages"], // Cache anahtarı — invalidateQueries ile eşleşir
    queryFn: getMessagesAction, // ← Server Action doğrudan queryFn olarak!
  });

  // ── Loading Durumu — Skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error Durumu ──
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          ❌ Mesajlar yüklenirken bir hata oluştu.
        </p>
        <p className="text-sm text-red-500 dark:text-red-500 mt-1">
          Lütfen sayfayı yenileyip tekrar deneyin.
        </p>
      </div>
    );
  }

  // ── Boş Durum ──
  if (!messages || messages.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-12 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Henüz kimse mesaj bırakmamış.
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
          İlk mesajı siz bırakın!
        </p>
      </div>
    );
  }

  // ── Mesaj Listesi ──
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <article
          key={msg.id}
          className="
            group rounded-2xl border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            p-5 transition-all duration-200
            hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800
            hover:-translate-y-0.5
          "
        >
          {/* Üst Kısım — İsim + Tarih */}
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar — İsmin baş harfi */}
            <div
              className="
              flex h-10 w-10 items-center justify-center
              rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
              text-white font-bold text-sm shrink-0
            "
            >
              {msg.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {msg.name}
              </p>
              <time className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(msg.createdAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </div>

          {/* Mesaj Metni */}
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {msg.message}
          </p>

          {/* Dosya Eki (varsa) */}
          {msg.fileUrl && (
            <div className="mt-4">
              {msg.fileType?.startsWith("image/") ? (
                // Resim — Inline göster
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={msg.fileUrl}
                    alt={msg.fileName || "Ek resim"}
                    className="w-full max-h-80 object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                // Diğer dosyalar — İndirme linki
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-2 rounded-xl
                    border border-zinc-200 dark:border-zinc-700
                    bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5
                    text-sm text-violet-600 dark:text-violet-400
                    font-medium hover:bg-violet-50 dark:hover:bg-violet-950
                    transition-colors
                  "
                >
                  {/* Dosya ikonu */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                  📎 {msg.fileName || "Dosya İndir"}
                </a>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
