// ============================================
// 🔔 Radix UI Toast — Reusable Bildirim Sistemi
//
// Toast: Ekranın kenarında beliren kısa süreli
// bildirimlerdir (notification). Kullanıcının
// dikkatini çekmek için kullanılır.
//
// Bu bileşen:
// 1. Radix Toast primitive'ini sarar (headless)
// 2. Tailwind ile stillendirir
// 3. useToast() hook'u ile kolay kullanım sağlar
// ============================================

"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

// ------------------------------------
// 🎨 Toast Varyantları
// ------------------------------------
type ToastVariant = "success" | "error";

type ToastData = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

// ------------------------------------
// 📌 Toast Context — Global State
// ------------------------------------
type ToastContextType = {
  toast: (data: Omit<ToastData, "id">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * useToast hook'u — Herhangi bir bileşenden toast göstermek için.
 *
 * Kullanım:
 * const { toast } = useToast();
 * toast({ title: "Başarılı!", variant: "success" });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ------------------------------------
// 🏗️ Toast Provider + Viewport
// ------------------------------------

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
};

const variantTitleStyles: Record<ToastVariant, string> = {
  success: "text-emerald-800 dark:text-emerald-200",
  error: "text-red-800 dark:text-red-200",
};

/**
 * ToastProvider — Layout'a sarılır.
 * Toast bildirimleri bu provider aracılığıyla gösterilir.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((data: Omit<ToastData, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
        {children}

        {/* Aktif toast'ları render et */}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={`
              rounded-xl border p-4 shadow-lg
              data-[state=open]:animate-toast-in
              data-[state=closed]:animate-toast-out
              data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
              data-[swipe=cancel]:translate-x-0
              data-[swipe=end]:animate-toast-out
              ${variantStyles[t.variant]}
            `}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id);
            }}
          >
            <ToastPrimitive.Title
              className={`text-sm font-semibold ${variantTitleStyles[t.variant]}`}
            >
              {t.variant === "success" ? "✅ " : "❌ "}
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </ToastPrimitive.Root>
        ))}

        {/* Viewport — Toast'ların gösterileceği alan (sağ üst) */}
        <ToastPrimitive.Viewport
          className="
            fixed top-4 right-4 z-[100]
            flex w-96 max-w-[calc(100vw-2rem)]
            flex-col gap-2
          "
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
