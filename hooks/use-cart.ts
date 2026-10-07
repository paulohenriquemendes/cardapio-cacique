"use client";
import { useEffect, useState } from "react";
import { CartItem } from "@/types";
export function useCart(table?: string) {
  const key = "cacique-cart-v1-" + (table || "consulta");
  const noteKey = "cacique-cart-note-v1-" + (table || "consulta");
  const [items, setItems] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(key) || "[]");
      setItems(Array.isArray(raw) ? raw : []);
      setNote((sessionStorage.getItem(noteKey) || "").slice(0, 500));
    } catch {
      setItems([]);
      setNote("");
    }
    setLoaded(true);
  }, [key, noteKey]);
  useEffect(() => {
    if (loaded) sessionStorage.setItem(key, JSON.stringify(items));
  }, [items, key, loaded]);
  useEffect(() => {
    if (loaded) sessionStorage.setItem(noteKey, note);
  }, [note, noteKey, loaded]);
  return { items, setItems, note, setNote };
}
