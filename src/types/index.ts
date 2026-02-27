// ============================================
// 📌 Global TypeScript Type Tanımları
// Proje genelinde kullanılan tüm tipler burada
// ============================================

/**
 * Ziyaretçi defterindeki tek bir mesajın veri yapısı.
 * Vercel Blob'da `messages.json` içinde bu tipte objeler saklanır.
 */
export type GuestMessage = {
  id: string;
  name: string;
  message: string;
  fileUrl?: string; // Vercel Blob public URL (resim veya dosya)
  fileName?: string; // Orijinal dosya adı (kullanıcının yüklediği)
  fileType?: string; // MIME type: "image/jpeg", "application/pdf" vb.
  createdAt: string; // ISO 8601 format: "2026-02-18T11:00:00.000Z"
};

/**
 * Server Action'lardan dönen standart yanıt tipi.
 * Tüm action'lar bu formatta sonuç döner.
 */
export type ActionResponse = {
  success: boolean;
  error?: string;
};
