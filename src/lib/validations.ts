// ============================================
// ✅ Zod Validasyon Şemaları
// Client + Server tarafında AYNI şema kullanılır.
// Bu sayede validasyon kuralları tek bir yerde
// tanımlanır ve tip güvenliği sağlanır.
// ============================================

import { z } from "zod";
import { containsProfanity } from "./profanity";

// ------------------------------------
// 📋 İzin verilen dosya tipleri ve boyut limiti
// ------------------------------------
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_FILE_TYPES = [
  // Resimler
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  // Dökümanlar
  "application/pdf",
];

// ------------------------------------
// 📝 Mesaj Formu Zod Şeması
// ------------------------------------

/**
 * Client tarafında React Hook Form ile kullanılan şema.
 * `file` alanı File | undefined olarak tanımlanır çünkü
 * tarayıcıda File nesnesi olarak gelir.
 */
export const messageFormSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı.")
    .max(50, "İsim en fazla 50 karakter olabilir.")
    .refine((val) => !containsProfanity(val), {
      message: "İsim uygunsuz ifade içeriyor.",
    }),

  message: z
    .string()
    .min(10, "Mesaj en az 10 karakter olmalı.")
    .max(500, "Mesaj en fazla 500 karakter olabilir.")
    .refine((val) => !containsProfanity(val), {
      message: "Mesaj uygunsuz ifade içeriyor.",
    }),

  // Dosya opsiyonel — kullanıcı istemezse yüklemeyebilir
  file: z
    .custom<File>()
    .optional()
    .refine(
      (file) => {
        if (!file || file.size === 0) return true; // Dosya yoksa geç
        return file.size <= MAX_FILE_SIZE;
      },
      { message: `Dosya boyutu en fazla ${MAX_FILE_SIZE / (1024 * 1024)} MB olabilir.` }
    )
    .refine(
      (file) => {
        if (!file || file.size === 0) return true; // Dosya yoksa geç
        return ALLOWED_FILE_TYPES.includes(file.type);
      },
      { message: "Sadece JPEG, PNG, WebP, GIF ve PDF dosyaları kabul edilir." }
    ),
});

/**
 * Şemadan otomatik çıkarılan TypeScript tipi.
 * React Hook Form'da `useForm<MessageFormValues>()` şeklinde kullanılır.
 */
export type MessageFormValues = z.infer<typeof messageFormSchema>;

// ------------------------------------
// 🖥️ Server-side Validasyon Şeması
// ------------------------------------

/**
 * Server Action'da FormData'dan çıkarılan text alanları için.
 * Dosya validasyonu server tarafında ayrıca yapılır.
 */
export const serverMessageSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalı.")
    .max(50, "İsim en fazla 50 karakter olabilir.")
    .refine((val) => !containsProfanity(val), {
      message: "İsim uygunsuz ifade içeriyor.",
    }),

  message: z
    .string()
    .min(10, "Mesaj en az 10 karakter olmalı.")
    .max(500, "Mesaj en fazla 500 karakter olabilir.")
    .refine((val) => !containsProfanity(val), {
      message: "Mesaj uygunsuz ifade içeriyor.",
    }),
});

export { MAX_FILE_SIZE, ALLOWED_FILE_TYPES };
