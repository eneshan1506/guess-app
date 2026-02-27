// ============================================
// 🎨 Radix UI Dialog — Reusable Bileşen
//
// Radix UI "headless" bir kütüphanedir:
// → Davranış (accessibility, keyboard, focus) sağlar
// → Görünüm (stil) SAĞLAMAZ
//
// Biz Tailwind CSS ile kendi stilimizi ekliyoruz.
// Bu yaklaşım Shadcn/UI'ın mantığıyla aynıdır.
// ============================================

"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

// ── Root & Trigger — Doğrudan re-export ──
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

// ── Overlay — Koyu arka plan ──
export const DialogOverlay = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`
      fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
      data-[state=open]:animate-fade-in
      data-[state=closed]:animate-fade-out
      ${className}
    `}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

// ── Content — Modal kutusu ──
export const DialogContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className = "", children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`
        fixed left-1/2 top-1/2 z-50
        w-[calc(100%-2rem)] max-w-lg
        -translate-x-1/2 -translate-y-1/2
        rounded-2xl border border-white/10
        bg-white p-6 shadow-2xl
        dark:bg-zinc-900 dark:border-zinc-700
        data-[state=open]:animate-dialog-in
        data-[state=closed]:animate-dialog-out
        focus:outline-none
        ${className}
      `}
      {...props}
    >
      {children}

      {/* Kapat butonu (X) — Sağ üst köşe */}
      <DialogPrimitive.Close
        className="
          absolute right-4 top-4
          rounded-full p-1.5
          text-zinc-400 hover:text-zinc-800
          dark:hover:text-zinc-200
          hover:bg-zinc-100 dark:hover:bg-zinc-800
          transition-colors focus:outline-none
        "
        aria-label="Kapat"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

// ── Title ──
export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`text-xl font-semibold text-zinc-900 dark:text-zinc-100 ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

// ── Description ──
export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className = "", ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`mt-2 text-sm text-zinc-500 dark:text-zinc-400 ${className}`}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
