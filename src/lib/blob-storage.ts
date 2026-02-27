// ============================================
// 💾 Vercel Blob Storage Yardımcı Fonksiyonları
//
// Vercel Blob bir "object storage" (AWS S3 benzeri).
// Veritabanı DEĞİLDİR. Dosyaları binary olarak saklar.
//
// Bu projede iki tür blob kullanıyoruz:
// 1. messages.json → Mesaj metadata'sı (JSON)
// 2. uploads/xxx.jpg → Kullanıcı dosyaları (binary)
// ============================================

import { put, list } from "@vercel/blob";
import type { GuestMessage } from "@/types";

// Mesajların saklandığı blob dosyasının adı
const MESSAGES_BLOB_PATH = "guestbook/messages.json";

// ------------------------------------
// 📖 Mesajları Okuma
// ------------------------------------

/**
 * Vercel Blob'dan mesaj listesini okur.
 * Blob henüz oluşturulmamışsa boş array döner.
 *
 * Nasıl çalışır:
 * 1. list() ile blob'ları listele
 * 2. messages.json blob'unun URL'sini bul
 * 3. fetch() ile JSON içeriğini oku
 * 4. GuestMessage[] olarak parse et
 */
export async function getMessages(): Promise<GuestMessage[]> {
  try {
    // Blob store'daki dosyaları listele
    const { blobs } = await list({ prefix: "guestbook/messages" });

    // messages.json henüz oluşturulmamışsa
    if (blobs.length === 0) {
      return [];
    }

    // Blob'un public URL'sinden JSON'u oku
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    const messages: GuestMessage[] = await response.json();

    return messages;
  } catch (error) {
    console.error("Mesajlar okunurken hata:", error);
    return [];
  }
}

// ------------------------------------
// 💾 Mesajları Kaydetme
// ------------------------------------

/**
 * Mesaj listesini Vercel Blob'a JSON olarak yazar.
 * Mevcut dosyanın üzerine yazar (allowOverwrite: true).
 *
 * put() fonksiyonu:
 * - 1. parametre: dosya yolu (blob adı)
 * - 2. parametre: içerik (string, Buffer, File, vb.)
 * - 3. parametre: seçenekler (access, allowOverwrite, vb.)
 */
export async function saveMessages(messages: GuestMessage[]): Promise<void> {
  const jsonContent = JSON.stringify(messages, null, 2);

  await put(MESSAGES_BLOB_PATH, jsonContent, {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

// ------------------------------------
// 📁 Dosya Yükleme
// ------------------------------------

/**
 * Kullanıcının yüklediği dosyayı Vercel Blob'a kaydeder.
 * Benzersiz bir URL döner.
 *
 * ⚡ Ders Notu Bağlantısı:
 * Ders notlarında dosya şu şekilde diske yazılıyordu:
 *   const buffer = Buffer.from(await file.arrayBuffer());
 *   await writeFile(filePath, buffer);
 *
 * Vercel Blob ile çok daha basit:
 *   const blob = await put(fileName, file, { access: "public" });
 *
 * Buffer dönüşümüne bile gerek yok! SDK her şeyi halleder.
 *
 * @param file - Kullanıcının yüklediği File nesnesi
 * @returns Blob'un public URL'si
 */
export async function uploadFile(file: File): Promise<string> {
  // Dosyayı "guestbook/uploads/" klasörüne yükle
  const blob = await put(`guestbook/uploads/${file.name}`, file, {
    access: "public",
    // addRandomSuffix varsayılan olarak true'dur
    // Bu sayede aynı isimli dosyalar çakışmaz (crypto.randomUUID() gibi)
  });

  return blob.url;
}
