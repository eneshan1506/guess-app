// ============================================
// ✍️ AddMessageDialog — Mesaj Ekleme Formu
//
// Bu bileşen 3 ana teknolojiyi birleştirir:
//
// 1. Radix Dialog → Modal form açma/kapama
// 2. React Hook Form + Zod → Type-safe validasyon
// 3. TanStack Query useMutation → Server Action çağrısı
//    + invalidateQueries ile otomatik liste güncelleme
//
// Form submit akışı:
// Kullanıcı "Gönder" → RHF validate → FormData oluştur
// → useMutation → Server Action → Blob'a kaydet
// → invalidateQueries → Liste güncellenir → Toast göster
// ============================================

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { messageFormSchema, type MessageFormValues } from "@/lib/validations";
import { addMessageAction } from "@/actions/messages";

export default function AddMessageDialog() {
  // Dialog açık/kapalı state'i
  const [open, setOpen] = useState(false);

  // Dosya önizleme state'i
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast hook'u — bildirimler için
  const { toast } = useToast();

  // TanStack Query — Cache yönetimi
  const queryClient = useQueryClient();

  // ── React Hook Form + Zod ──
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  // ── TanStack Query — useMutation ──
  // useMutation: Veri YAZAN işlemler için (POST, PUT, DELETE)
  // useQuery: Veri OKUYAN işlemler için (GET)
  const mutation = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      // FormData oluştur — Server Action FormData bekler
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("message", data.message);

      // Dosya varsa ekle
      if (data.file && data.file.size > 0) {
        formData.append("file", data.file);
      }

      // Server Action'ı çağır
      const result = await addMessageAction(formData);

      // Hata varsa throw et (onError'a düşer)
      if (!result.success) {
        throw new Error(result.error || "Bir hata oluştu.");
      }

      return result;
    },

    // ── Başarılı olursa ──
    onSuccess: () => {
      // 🔄 invalidateQueries → "messages" cache'ini geçersiz kıl
      // → useQuery otomatik olarak yeni veriyi çeker
      // → Sayfa yenilenmeden liste güncellenir!
      queryClient.invalidateQueries({ queryKey: ["messages"] });

      // Formu sıfırla
      reset();
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Dialog'u kapat
      setOpen(false);

      // Toast bildirimi göster ✅
      toast({
        title: "Mesajınız eklendi!",
        description: "Ziyaretçi defterine başarıyla kayıt oldunuz.",
        variant: "success",
      });
    },

    // ── Hata olursa ──
    onError: (error: Error) => {
      toast({
        title: "Mesaj eklenemedi",
        description: error.message,
        variant: "error",
      });
    },
  });

  // ── Dosya seçim handler'ı ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // React Hook Form'a dosyayı set et
      setValue("file", file, { shouldValidate: true });

      // Resimse önizleme oluştur
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // ── Form submit ──
  const onSubmit = (data: MessageFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Tetikleyici Buton */}
      <DialogTrigger asChild>
        <button
          className="
            inline-flex items-center gap-2 rounded-full
            bg-gradient-to-r from-violet-600 to-indigo-600
            px-6 py-3 text-white font-semibold
            shadow-lg shadow-violet-500/25
            hover:shadow-xl hover:shadow-violet-500/30
            hover:from-violet-500 hover:to-indigo-500
            active:scale-95 transition-all duration-200
          "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
          Mesaj Bırak
        </button>
      </DialogTrigger>

      {/* Dialog İçeriği */}
      <DialogContent>
        <DialogTitle>✍️ Ziyaretçi Defterine Yaz</DialogTitle>
        <DialogDescription>
          Adınızı, mesajınızı ve isterseniz bir dosya ekleyerek ziyaretçi
          defterinde yerinizi alın.
        </DialogDescription>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {/* İsim Alanı */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              İsim
            </label>
            <input
              id="name"
              type="text"
              placeholder="Adınızı yazın..."
              {...register("name")}
              className={`
                w-full rounded-xl border px-4 py-2.5 text-sm
                bg-zinc-50 dark:bg-zinc-800
                text-zinc-800 dark:text-zinc-200
                placeholder:text-zinc-400
                focus:outline-none focus:ring-2 transition-all
                ${
                  errors.name
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500/20"
                    : "border-zinc-200 dark:border-zinc-700 focus:ring-violet-500/20 focus:border-violet-400"
                }
              `}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Mesaj Alanı */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Mesaj
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Mesajınızı yazın... (en az 10 karakter)"
              {...register("message")}
              className={`
                w-full rounded-xl border px-4 py-2.5 text-sm resize-none
                bg-zinc-50 dark:bg-zinc-800
                text-zinc-800 dark:text-zinc-200
                placeholder:text-zinc-400
                focus:outline-none focus:ring-2 transition-all
                ${
                  errors.message
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500/20"
                    : "border-zinc-200 dark:border-zinc-700 focus:ring-violet-500/20 focus:border-violet-400"
                }
              `}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Dosya Yükleme Alanı */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Dosya Ekle{" "}
              <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                (opsiyonel — max 5MB)
              </span>
            </label>
            <input
              id="file"
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              onChange={handleFileChange}
              className="
                w-full rounded-xl border border-zinc-200 dark:border-zinc-700
                bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm
                text-zinc-600 dark:text-zinc-400
                file:mr-3 file:rounded-lg file:border-0
                file:bg-violet-100 dark:file:bg-violet-900
                file:px-3 file:py-1 file:text-sm
                file:font-medium file:text-violet-700 dark:file:text-violet-300
                file:cursor-pointer hover:file:bg-violet-200 dark:hover:file:bg-violet-800
                focus:outline-none focus:ring-2 focus:ring-violet-500/20
                transition-all
              "
            />
            {errors.file && (
              <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                {errors.file.message}
              </p>
            )}

            {/* Resim Önizleme */}
            {filePreview && (
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                <img
                  src={filePreview}
                  alt="Önizleme"
                  className="w-full max-h-48 object-cover"
                />
              </div>
            )}
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="
              w-full rounded-xl py-3 text-sm font-semibold
              bg-gradient-to-r from-violet-600 to-indigo-600
              text-white shadow-md
              hover:from-violet-500 hover:to-indigo-500
              active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:active:scale-100
              transition-all duration-200
            "
          >
            {mutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Gönderiliyor...
              </span>
            ) : (
              "Gönder"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
