// ============================================
// 🚫 Basit Küfür/Uygunsuz İçerik Filtresi
// Eğitim amaçlı örnek bir kelime listesi.
// Gerçek projede daha kapsamlı bir kütüphane
// veya AI tabanlı content moderation kullanılır.
// ============================================

const BLOCKED_WORDS = [
  // Türkçe — eğitim amaçlı birkaç örnek
  "aptal",
  "salak",
  "gerizekalı",
  "mal",
  // İngilizce — eğitim amaçlı birkaç örnek
  "idiot",
  "stupid",
  "dumb",
];

/**
 * Verilen metinde uygunsuz kelime olup olmadığını kontrol eder.
 * Kelimeler büyük/küçük harf duyarsız olarak aranır.
 *
 * @param text - Kontrol edilecek metin
 * @returns true → uygunsuz içerik var, false → temiz
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lowerText.includes(word));
}
