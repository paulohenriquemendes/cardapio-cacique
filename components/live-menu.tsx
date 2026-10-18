"use client";
import { useEffect, useState } from "react";
import type { Product, Menu } from "@/types";
import { loadPhotos, photoUrl, type PhotoRecord } from "@/lib/photos";
import { Storefront } from "./storefront";

export function LiveMenu(props: {
  products: Product[];
  tables: string[];
  table?: string;
  menu?: Menu;
  demoMode: boolean;
}) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      void loadPhotos(controller.signal)
        .then(setPhotos)
        .catch(() => {
          /* Keep the static catalog available if the photo service is offline. */
        });
    };
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const paths = new Map(photos.map((p) => [p.product_id, p.storage_path]));
  return (
    <Storefront
      {...props}
      products={props.products.map((p) =>
        paths.has(p.id) ? { ...p, image: photoUrl(paths.get(p.id)!) } : p,
      )}
    />
  );
}
