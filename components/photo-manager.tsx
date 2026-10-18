"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import catalog from "@/database/catalog.json";
import type { Product, Menu } from "@/types";
import { normalize } from "@/lib/format";
import {
  loadPhotos,
  photoClient,
  photoUrl,
  photosConfigured,
  preparePhoto,
  type PhotoRecord,
} from "@/lib/photos";
import { Brand } from "./brand";
import { Modal } from "./modal";
import { ProductVisual } from "./product-visual";

export function PhotoManager() {
  const [ready, setReady] = useState(false),
    [authorized, setAuthorized] = useState(false);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]),
    [menu, setMenu] = useState<Menu>("REFEICOES");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Product | null>(null),
    [draft, setDraft] = useState<File | null>(null),
    [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const operation = useRef(false);
  useEffect(() => {
    if (!photosConfigured) {
      setReady(true);
      return;
    }
    let active = true;
    const client = photoClient();
    async function verify() {
      const { data, error } = await client.auth.getUser();
      if (!active) return;
      const ok =
        !error &&
        ["admin", "photo_editor"].includes(data.user?.app_metadata?.role);
      setAuthorized(ok);
      setReady(true);
      if (ok)
        loadPhotos()
          .then((p) => {
            if (active) setPhotos(p);
          })
          .catch((e) => {
            if (active) setError(e.message);
          });
    }
    void verify();
    const { data: listener } = client.auth.onAuthStateChange(() => {
      void verify();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!draft) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(draft);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draft]);
  const photoMap = new Map(photos.map((p) => [p.product_id, p]));
  const products = (catalog as Product[]).filter(
    (p) => p.active && p.menu === menu,
  );
  const categories = [...new Set(products.map((p) => p.category))];
  const visible = products.filter(
    (p) =>
      (!category || p.category === category) &&
      normalize(`${p.name} ${p.code || ""} ${p.category}`).includes(
        normalize(query),
      ) &&
      (filter === "all" ||
        (filter === "real" ? photoMap.has(p.id) : !photoMap.has(p.id))),
  );
  async function refresh() {
    setPhotos(await loadPhotos());
  }
  async function save() {
    if (!selected || !draft || operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const client = photoClient();
      const path = `${selected.id}/${crypto.randomUUID()}.jpg`;
      const upload = await client.storage
        .from("menu-photos")
        .upload(path, draft, { contentType: "image/jpeg", upsert: false });
      if (upload.error)
        throw new Error(
          "Não foi possível enviar a foto. Confira sua conexão e tente novamente.",
        );
      const save = await client
        .from("product_photos")
        .upsert({ product_id: selected.id, storage_path: path });
      if (save.error)
        throw new Error("A foto não foi publicada. Tente salvar novamente.");
      await refresh();
      setSelected(null);
      setDraft(null);
      setNotice(
        `Foto de ${selected.name} salva. Já está disponível ao abrir ou atualizar o cardápio.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }
  async function revert() {
    if (!selected || operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      const { error } = await photoClient()
        .from("product_photos")
        .delete()
        .eq("product_id", selected.id);
      if (error)
        throw new Error("Não foi possível restaurar a imagem ilustrativa.");
      await refresh();
      setSelected(null);
      setDraft(null);
      setNotice(
        "Imagem ilustrativa restaurada. A fotografia anterior permanece guardada no armazenamento.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível restaurar.");
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }
  function close() {
    if (!busy) {
      setSelected(null);
      setDraft(null);
      setError("");
    }
  }
  if (!ready)
    return (
      <main className="login-page">
        <p role="status">Abrindo painel…</p>
      </main>
    );
  if (!authorized)
    return (
      <main className="login-page">
        <Brand />
        <form
          className="login-card"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || !photosConfigured) return;
            const fields = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
              const user = String(fields.get("username") || "").trim();
              const email =
                user.toLowerCase() === "admin"
                  ? process.env.NEXT_PUBLIC_PHOTO_ADMIN_EMAIL ||
                    "imagens@cacique.example"
                  : user;
              const { data, error } =
                await photoClient().auth.signInWithPassword({
                  email,
                  password: String(fields.get("password") || ""),
                });
              if (
                error ||
                !["admin", "photo_editor"].includes(
                  data.user?.app_metadata?.role,
                )
              ) {
                if (data.session) await photoClient().auth.signOut();
                throw new Error(
                  "Usuário ou senha inválidos, ou acesso não autorizado.",
                );
              }
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Não foi possível entrar.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <span className="eyebrow">ADMINISTRAÇÃO DO CARDÁPIO</span>
          <h1>Fotos dos produtos</h1>
          <p>Entre para enviar as fotografias do restaurante.</p>
          <label className="field">
            Usuário ou e-mail
            <input
              name="username"
              autoComplete="username"
              required
              disabled={busy}
            />
          </label>
          <label className="field">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
            />
          </label>
          {(!photosConfigured || error) && (
            <p className="error" role="alert">
              {error || "O painel de imagens ainda não foi configurado."}
            </p>
          )}
          <button className="primary full" disabled={busy || !photosConfigured}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
          <Link href="/">Voltar ao cardápio</Link>
        </form>
      </main>
    );
  return (
    <>
      <header className="site-header">
        <Brand />
        <Link href="/">Ver cardápio</Link>
        <button
          className="secondary"
          onClick={async () => {
            await photoClient().auth.signOut();
            setAuthorized(false);
            setSelected(null);
            setDraft(null);
            setError("");
          }}
        >
          Sair
        </button>
      </header>
      <main className="photo-admin">
        <span className="eyebrow">ADMINISTRAÇÃO DO CARDÁPIO</span>
        <h1>Fotografias do Cacique</h1>
        <p>
          Localize o produto, escolha a foto e salve. A imagem será atualizada
          no cardápio do cliente.
        </p>
        <div className="photo-menu-tabs">
          {(["REFEICOES", "CAFE_DA_MANHA"] as Menu[]).map((m) => (
            <button
              key={m}
              className={menu === m ? "primary" : "secondary"}
              aria-pressed={menu === m}
              onClick={() => {
                setMenu(m);
                setCategory("");
              }}
            >
              {m === "REFEICOES" ? "Refeições" : "Café da manhã"}
            </button>
          ))}
        </div>
        <div className="photo-filters">
          <label className="field">
            Buscar produto
            <input
              placeholder="Nome, código ou categoria"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="field">
            Categoria
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Fotografia
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todas</option>
              <option value="missing">Sem foto enviada</option>
              <option value="real">Com foto enviada</option>
            </select>
          </label>
        </div>
        <p>
          {visible.length} produtos ·{" "}
          {products.filter((p) => photoMap.has(p.id)).length} com foto enviada
        </p>
        {notice && (
          <p className="photo-notice" role="status">
            {notice}
          </p>
        )}
        {error && !selected && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="photo-grid">
          {visible.map((p) => (
            <article className="photo-card" key={p.id}>
              <ProductVisual
                product={
                  photoMap.has(p.id)
                    ? {
                        ...p,
                        image: photoUrl(photoMap.get(p.id)!.storage_path),
                      }
                    : p
                }
              />
              <div>
                <small>
                  {p.category} · {p.code || "Sem código"}
                </small>
                <h2>{p.name}</h2>
                <p>
                  {p.unit} ·{" "}
                  {photoMap.has(p.id) ? "Foto enviada" : "Imagem ilustrativa"}
                </p>
                <button
                  className="primary full"
                  onClick={() => {
                    setSelected(p);
                    setDraft(null);
                    setError("");
                    setNotice("");
                  }}
                >
                  {photoMap.has(p.id) ? "Trocar foto" : "Enviar foto"}
                  <span className="sr-only"> de {p.name}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && (
          <p>Nenhum produto encontrado. Experimente outro nome ou código.</p>
        )}
      </main>
      {selected && (
        <Modal title={`Foto de ${selected.name}`} onClose={close}>
          <div className="dialog-content">
            <span className="eyebrow">
              {selected.category} · {selected.code || "Sem código"}
            </span>
            <h2>{selected.name}</h2>
            {preview ? (
              <img
                className="photo-preview"
                src={preview}
                alt={`Prévia de ${selected.name}`}
              />
            ) : (
              <ProductVisual
                large
                product={
                  photoMap.has(selected.id)
                    ? {
                        ...selected,
                        image: photoUrl(
                          photoMap.get(selected.id)!.storage_path,
                        ),
                      }
                    : selected
                }
              />
            )}
            <label className="field">
              Escolher fotografia
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  setError("");
                  setDraft(null);
                  try {
                    setDraft(await preparePhoto(file));
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "Imagem inválida.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            <p className="hint">
              JPG, PNG ou WebP de até 20 MB. A foto é otimizada antes do envio e
              só substitui a atual depois de salvar.
            </p>
            {draft && (
              <p role="status">
                Foto pronta · {Math.round(draft.size / 1024)} KB
              </p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button
              className="primary full"
              disabled={!draft || busy}
              onClick={save}
            >
              {busy ? "Processando…" : "Salvar fotografia"}
            </button>
            {photoMap.has(selected.id) && (
              <button
                className="secondary full"
                disabled={busy}
                onClick={revert}
              >
                Voltar à imagem ilustrativa
              </button>
            )}
            <button className="secondary full" disabled={busy} onClick={close}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
