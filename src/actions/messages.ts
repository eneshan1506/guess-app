// ============================================
// 🖥️ Server Actions — Mesaj İşlemleri
//
// "use server" ile işaretlenmiş bu fonksiyonlar
// SUNUCUDA çalışır. Client tarafından çağrılır
// ama kod asla tarayıcıya gitmez.
//
// İki action var:
// 1. getMessagesAction → Mesajları oku (TanStack Query queryFn)
// 2. addMessageAction → Yeni mesaj ekle (useMutation mutationFn)
//
// 💡 NOT: Eski yöntemde veri okumak için ayrı bir
// API Route Handler (app/api/messages/route.ts) yazılırdı.
// Server Action ile buna gerek kalmıyor!
// Action'lar hem okuma hem yazma işlemi yapabilir.
// ============================================

"use server";

import { revalidatePath } from "next/cache";
import { getMessages, saveMessages, uploadFile } from "@/lib/blob-storage";
import {
  serverMessageSchema,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "@/lib/validations";
import type { ActionResponse, GuestMessage } from "@/types";

// ------------------------------------
// 📖 Mesajları Getir — Server Action
// ------------------------------------

/**
 * Vercel Blob'dan tüm mesajları getirir.
 *
 * TanStack Query'nin useQuery hook'u bu action'ı
 * queryFn olarak çağırır:
 *
 * useQuery({
 *   queryKey: ["messages"],
 *   queryFn: getMessagesAction,  ← Doğrudan Server Action!
 * })
 *
 * ⚡ API Route Handler'a gerek yok!
 * Server Action bir async fonksiyondur ve
 * useQuery'nin queryFn'i de async fonksiyon bekler.
 */
export async function getMessagesAction(): Promise<GuestMessage[]> {
  try {
    return await getMessages();
  } catch (error) {
    console.error("Mesajlar alınamadı:", error);
    return [];
  }
}

/**
 * Ziyaretçi defterine yeni mesaj ekleyen Server Action.
 *
 * Akış:
 * 1. FormData'dan verileri çıkar (name, message, file)
 * 2. Server-side Zod validasyonu (text alanları)
 * 3. Dosya validasyonu (boyut + tip)
 * 4. Dosya varsa → Vercel Blob'a yükle
 * 5. Yeni GuestMessage objesi oluştur
 * 6. messages.json'a ekle ve kaydet
 * 7. Sayfayı revalidate et
 */
export async function addMessageAction(
  formData: FormData
): Promise<ActionResponse> {
  try {
    // ── 1. FormData'dan verileri çıkar ──
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;
    const file = formData.get("file") as File | null;

    // ── 2. Text alanlarını Zod ile validate et ──
    const validationResult = serverMessageSchema.safeParse({ name, message });

    if (!validationResult.success) {
      // İlk hata mesajını döndür
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError.message };
    }

    // ── 3. Dosya validasyonu (varsa) ──
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileType: string | undefined;

    if (file && file.size > 0) {
      // Boyut kontrolü
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Dosya boyutu en fazla ${MAX_FILE_SIZE / (1024 * 1024)} MB olabilir.`,
        };
      }

      // Tip kontrolü
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
          success: false,
          error: "Sadece JPEG, PNG, WebP, GIF ve PDF dosyaları kabul edilir.",
        };
      }

      // ── 4. Dosyayı Vercel Blob'a yükle ──
      // ⚡ Ders notlarındaki writeFile() yerine Vercel Blob put() kullanıyoruz
      fileUrl = await uploadFile(file);
      fileName = file.name;
      fileType = file.type;
    }

    // ── 5. Yeni mesaj objesi oluştur ──
    const newMessage: GuestMessage = {
      id: crypto.randomUUID(),
      name: validationResult.data.name,
      message: validationResult.data.message,
      fileUrl,
      fileName,
      fileType,
      createdAt: new Date().toISOString(),
    };

    // ── 6. Mevcut mesajlara ekle ve kaydet ──
    const existingMessages = await getMessages();
    const updatedMessages = [newMessage, ...existingMessages]; // Yeni en üstte
    await saveMessages(updatedMessages);

    // ── 7. Sayfayı revalidate et ──
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Mesaj eklenirken hata:", error);
    return {
      success: false,
      error: "Bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
