// ============================================
// 🏠 Ana Sayfa — Server Component
//
// Bu sayfa Server Component (varsayılan).
// Client bileşenlerini (MessageList, AddMessageDialog)
// import ederek kullanır.
//
// Server Component avantajı: Sayfa ilk yüklenmesinde
// HTML sunucudan gelir → SEO ve performans için iyi.
// ============================================

import AddMessageDialog from "@/components/add-message-dialog";
import MessageList from "@/components/message-list";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* ── Header ── */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            📒 Ziyaretçi Defteri
          </h1>
          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
            Mesajınızı bırakın, dosyanızı ekleyin, hatıranız kalsın!
          </p>

          {/* Mesaj Ekleme Butonu */}
          <div className="mt-6">
            <AddMessageDialog />
          </div>
        </header>

        {/* ── Mesaj Listesi ── */}
        <section aria-label="Ziyaretçi mesajları">
          <MessageList />
        </section>

        {/* ── Footer ── */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Next.js • TanStack Query • Zod • Radix UI • Vercel Blob
          </p>
        </footer>
      </div>
    </main>
  );
}
