// ============================================
// 🔧 Providers — Client-side Context Wrapper
//
// Next.js App Router'da client-side context'ler
// (QueryClient, Toast) bir "Providers" bileşeni
// içinde sarılmalıdır.
//
// Bu bileşen "use client" olduğu için layout.tsx
// (Server Component) içinde import edilebilir.
// ============================================

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  // ⚠️ useState ile oluştur — her render'da yeni client oluşmasını önle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 30 saniye boyunca veri "taze" sayılır
            staleTime: 30 * 1000,
            // Sekme değişiminde otomatik yenileme
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>

      {/* Geliştirme ortamında React Query DevTools göster */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
