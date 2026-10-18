import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const photosConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
let adminClient: SupabaseClient | undefined;
export function photoClient() {
  if (!photosConfigured)
    throw new Error("O painel de imagens ainda não foi configurado.");
  return (adminClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: "cacique-photo-admin",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    },
  ));
}
export type PhotoRecord = {
  product_id: string;
  storage_path: string;
  updated_at: string;
};
export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-photos/${path}`;
}
// Public reads never carry an administrator's session.
export async function loadPhotos(signal?: AbortSignal): Promise<PhotoRecord[]> {
  if (!photosConfigured) return [];
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/product_photos?select=product_id,storage_path,updated_at`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      cache: "no-store",
      signal,
    },
  );
  if (!res.ok)
    throw new Error(
      "Não foi possível atualizar as fotografias. Tente novamente.",
    );
  return res.json();
}

export async function preparePhoto(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (!file.size || file.size > 20 * 1024 * 1024)
    throw new Error("Escolha uma imagem de até 20 MB.");
  const image = await createImageBitmap(file);
  try {
    if (!image.width || !image.height)
      throw new Error("A imagem não pôde ser aberta.");
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não conseguiu preparar a imagem.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error("Não foi possível preparar a foto.")),
        "image/jpeg",
        0.85,
      ),
    );
    if (blob.size > 5 * 1024 * 1024)
      throw new Error("A imagem ficou muito grande. Escolha outra foto.");
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } finally {
    image.close();
  }
}
