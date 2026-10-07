"use client";
import Link from "next/link";
import { ProductVisual } from "./product-visual";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  ShoppingBag,
  MapPin,
  Coffee,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { CartItem, Menu, Product } from "@/types";
import { money, normalize, menuName } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { Brand } from "./brand";
import { Modal } from "./modal";
import { ProductDetail } from "./product-detail";
const mealCategories = [
  "Entradas",
  "Saladas",
  "Menu sertanejo",
  "Seleção premium do chef",
  "Pratos executivos",
  "Menu clássico",
  "Carnes na brasa",
  "Carnes / porções",
  "Porções",
  "Sucos",
  "Vitaminas",
  "Sobremesas da casa",
  "Bolo fatia",
  "Bolo inteiro",
  "Refrigerantes",
  "Bebidas",
  "Água",
  "Energéticos",
  "Cervejas",
  "Whisky garrafa",
  "Whisky dose",
  "Aperitivos",
  "Aguardente",
];
const cafeCategories = [
  "Café regional",
  "Porções",
  "Café da casa",
  "Cafés especiais",
  "Tapiocas",
  "Tapiocas doces",
  "Crepiocas e crepes",
  "Adicionais",
  "Massa salgada",
  "Sanduíches",
  ...mealCategories.slice(9),
];
export function Storefront({
  products,
  tables,
  table,
  menu,
  demoMode,
}: {
  products: Product[];
  tables: string[];
  table?: string;
  menu?: Menu;
  demoMode: boolean;
}) {
  const { items, setItems, note, setNote } = useCart(table);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todos"),
    [detail, setDetail] = useState<{
      product: Product;
      item?: CartItem;
    } | null>(null),
    [cart, setCart] = useState(false),
    [chooseTable, setChooseTable] = useState(false),
    [tableConfirmed, setTableConfirmed] = useState(false),
    [callWaiter, setCallWaiter] = useState(false);
  useEffect(() => {
    const confirmed =
      !!table && sessionStorage.getItem("cacique-confirmed-table") === table;
    setTableConfirmed(confirmed);
    setChooseTable(!confirmed);
  }, [table]);
  const base = table ? `/mesa/${table}` : "";
  const link = (m: Menu) =>
    `${base}/${m === "CAFE_DA_MANHA" ? "cafe-da-manha" : "refeicoes"}`;
  const available = products.filter((p) => p.active && p.menu === menu);
  const categories = [
    ...new Set([
      ...(menu === "REFEICOES" ? mealCategories : cafeCategories),
      ...available.map((p) => p.category),
    ]),
  ].filter((c) => available.some((p) => p.category === c));
  const visible = useMemo(
    () =>
      available.filter(
        (p) =>
          (category === "Todos" || p.category === category) &&
          normalize(`${p.name} ${p.code || ""} ${p.category}`).includes(
            normalize(query),
          ),
      ),
    [available, query, category],
  );
  const getPrice = (i: CartItem) => {
    const p = products.find((p) => p.id === i.productId);
    return p
      ? (p.price +
          p.options
            .flatMap((g) => g.values)
            .filter((v) => i.options.includes(v.id))
            .reduce((s, v) => s + v.price, 0)) *
          i.quantity
      : 0;
  };
  const total = items.reduce((s, i) => s + getPrice(i), 0),
    count = items.reduce((s, i) => s + i.quantity, 0);
  function update(next: CartItem[]) {
    setItems(next);
  }
  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <Brand href={base || "/"} />
          <nav className="header-nav">
            <span className="heritage">História, tradição e muito sabor.</span>
            <button
              className="table-button"
              onClick={() => setChooseTable(true)}
            >
              <MapPin size={16} />
              {table && tableConfirmed ? `Mesa ${table}` : "Escolher mesa"}
            </button>
            {items.length > 0 && (
              <button
                className="icon-button header-bag"
                aria-label="Abrir pedido"
                onClick={() => setCart(true)}
              >
                <ShoppingBag size={20} />
                <b>{count}</b>
              </button>
            )}
          </nav>
        </div>
      </header>
      {demoMode && (
        <div className="demo-banner">
          Demonstração local · mesas 01–20 ilustrativas
        </div>
      )}
      <div className="demo-banner">
        Cardápio para consulta · pedidos feitos presencialmente com o garçom.
      </div>
      {!menu ? (
        <main className="home">
          <section className="welcome">
            <span className="eyebrow ornament">BEM-VINDO À NOSSA MESA</span>
            <h1>
              O sabor da nossa terra.
              <br />
              <i>O carinho de sempre.</i>
            </h1>
            <p>
              Da primeira xícara à refeição em família,
              <br />a tradição cearense tem lugar à mesa.
            </p>
            <div className="divider">✦</div>
            <h2>Escolha seu cardápio</h2>
            <span className="muted">
              Sinta-se como na cozinha da sua própria casa.
            </span>
          </section>
          <section className="menu-choices">
            <Link
              className="menu-choice breakfast"
              href={link("CAFE_DA_MANHA")}
            >
              <div className="choice-photo">
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=85"
                  alt="Café, fotografia ilustrativa de banco de imagens"
                />
                <span className="photo-caption">Imagem ilustrativa</span>
                <span className="choice-number">01</span>
              </div>
              <div className="choice-copy">
                <Coffee size={25} />
                <span>
                  <small>PARA COMEÇAR BEM O DIA</small>
                  <h2>Café da manhã</h2>
                  <p>Café regional, tapiocas, pães e muito mais.</p>
                </span>
                <ArrowRight />
              </div>
            </Link>
            <Link className="menu-choice meals" href={link("REFEICOES")}>
              <div className="choice-photo">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85"
                  alt="Refeição, fotografia ilustrativa de banco de imagens"
                />
                <span className="photo-caption">Imagem ilustrativa</span>
                <span className="choice-number">02</span>
              </div>
              <div className="choice-copy">
                <UtensilsCrossed size={25} />
                <span>
                  <small>TRADIÇÃO EM CADA PRATO</small>
                  <h2>Refeições</h2>
                  <p>Sabores do sertão, da brasa à sua mesa.</p>
                </span>
                <ArrowRight />
              </div>
            </Link>
          </section>
          <div className="home-note">
            <span>✧</span>
            <p>
              Escolha seus favoritos. Prepare seu pedido.
              <br />
              <b>A gente cuida do resto.</b>
            </p>
          </div>
        </main>
      ) : (
        <main className="menu-page">
          <div className="menu-intro">
            <Link href={base || "/"} className="back">
              <ArrowLeft size={14} /> Trocar cardápio
            </Link>
            <div className="intro-row">
              <div>
                <span className="eyebrow">CACIQUE · COZINHA REGIONAL</span>
                <h1>{menuName(menu)}</h1>
                <p>
                  {menu === "REFEICOES"
                    ? "Receitas que contam a nossa história."
                    : "Comece o dia com os sabores da nossa terra."}
                </p>
              </div>
              <span className="intro-ornament">❧</span>
            </div>
          </div>
          <div className="menu-toolbar">
            <label className="search">
              <Search size={19} />
              <input
                placeholder="Busque por prato, código ou categoria"
                aria-label="Buscar produtos"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpar busca">
                  ×
                </button>
              )}
            </label>
            <span className="menu-count">
              {available.length} opções no cardápio
            </span>
          </div>
          <div className="menu-layout">
            <aside className="categories">
              <div className="category-heading">
                <SlidersHorizontal size={15} /> NOSSO CARDÁPIO
              </div>
              {["Todos", ...categories].map((c) => (
                <button
                  key={c}
                  className={c === category ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                  <span>
                    {c === "Todos"
                      ? available.length
                      : available.filter((p) => p.category === c).length}
                  </span>
                </button>
              ))}
            </aside>
            <div className="catalog-content">
              {visible.length === 0 ? (
                <div className="empty">
                  <Search />
                  <h2>Nenhum produto encontrado</h2>
                  <p>Tente outro nome ou código.</p>
                  <button
                    onClick={() => {
                      setCategory("Todos");
                      setQuery("");
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                categories.map((c) => {
                  const list = visible.filter((p) => p.category === c);
                  if (!list.length) return null;
                  return (
                    <section className="category-section" key={c}>
                      <div className="section-title">
                        <h2>{c}</h2>
                        <span>✦</span>
                        <div />
                      </div>
                      <div className="product-grid">
                        {list.map((p) => (
                          <article key={p.id} className="product-card">
                            <button
                              className="product-open"
                              onClick={() => setDetail({ product: p })}
                              aria-label={`Ver ${p.name}`}
                            >
                              <ProductVisual product={p} />
                              <div className="product-info">
                                <small className="product-code">
                                  {p.code ? "CÓD. " + p.code : c}
                                </small>
                                <h3>{p.name}</h3>
                                {p.description && <p>{p.description}</p>}
                                <span className="unit">{p.unit || " "}</span>
                              </div>
                            </button>
                            <div className="product-footer">
                              <strong>{money(p.price)}</strong>
                              <button
                                onClick={() => setDetail({ product: p })}
                                aria-label={`Adicionar ${p.name}`}
                              >
                                <Plus size={15} /> Adicionar
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>
        </main>
      )}
      <footer className="site-footer">
        <Brand href={base || "/"} />
        <p>Desde 1965, acolhendo você à nossa mesa.</p>
      </footer>
      {count > 0 && (
        <div className="cart-bar">
          <div>
            <ShoppingBag size={23} />
            <span>
              <b>
                {count} {count === 1 ? "item" : "itens"} no pedido
              </b>
              <small>
                {table && tableConfirmed
                  ? `Mesa ${table}`
                  : "Escolha sua mesa ao confirmar"}
              </small>
            </span>
          </div>
          <strong>{money(total)}</strong>
          <button onClick={() => setCart(true)}>
            Ver pedido <ArrowRight size={17} />
          </button>
        </div>
      )}
      {detail && (
        <ProductDetail
          product={detail.product}
          item={detail.item}
          onClose={() => setDetail(null)}
          onSave={(item) => {
            update(
              detail.item
                ? items.map((i) => (i.key === item.key ? item : i))
                : [...items, item],
            );
            setDetail(null);
          }}
        />
      )}
      {chooseTable && (
        <Modal title="Escolha sua mesa" onClose={() => setChooseTable(false)}>
          <div className="dialog-content">
            <MapPin className="large-icon" />
            <span className="eyebrow">SEU LUGAR À MESA</span>
            <h2>Em qual mesa você está?</h2>
            <p className="muted">
              Selecione o número da sua mesa para começar. Nenhuma mesa é
              confirmada sem a sua escolha.
              {demoMode
                ? " Para a demonstração, selecione uma mesa abaixo."
                : " Selecione a mesa em que você está sentado."}
            </p>
            <div className="table-grid">
              {tables.map((t) => (
                <Link
                  className={tableConfirmed && t === table ? "selected" : ""}
                  key={t}
                  href={`/mesa/${t}${menu ? "/" + (menu === "CAFE_DA_MANHA" ? "cafe-da-manha" : "refeicoes") : ""}`}
                  onClick={() => {
                    sessionStorage.setItem("cacique-confirmed-table", t);
                    setTableConfirmed(t === table);
                    if (items.length) {
                      sessionStorage.setItem(
                        "cacique-cart-v1-" + t,
                        JSON.stringify(items),
                      );
                      sessionStorage.setItem("cacique-cart-note-v1-" + t, note);
                      if (t !== table) {
                        sessionStorage.removeItem(
                          "cacique-cart-v1-" + (table || "consulta"),
                        );
                        sessionStorage.removeItem(
                          "cacique-cart-note-v1-" + (table || "consulta"),
                        );
                      }
                    }
                    setChooseTable(false);
                  }}
                >
                  {" "}
                  {t}{" "}
                </Link>
              ))}
            </div>
            <button
              className="secondary full"
              onClick={() => setChooseTable(false)}
            >
              Só quero conhecer o cardápio
            </button>
          </div>
        </Modal>
      )}
      {cart && (
        <Modal title="Seu pedido" onClose={() => setCart(false)}>
          <div className="dialog-content">
            <span className="eyebrow">
              {table && tableConfirmed
                ? "MESA " + table
                : "RESTAURANTE CACIQUE"}
            </span>
            <h2>Seu pedido</h2>
            <p className="muted">Confira os sabores que vão à sua mesa.</p>
            {items.length === 0 ? (
              <p>Seu pedido ainda está vazio.</p>
            ) : (
              items.map((item) => {
                const p = products.find((p) => p.id === item.productId);
                return (
                  <div className="cart-item" key={item.key}>
                    <div className="cart-item-title">
                      <h3>{p?.name || "Produto indisponível"}</h3>
                      <strong>{money(getPrice(item))}</strong>
                    </div>
                    <small>
                      {p && menuName(p.menu)} · {p?.unit}
                    </small>
                    <p>
                      {p?.options
                        .flatMap((g) => g.values)
                        .filter((v) => item.options.includes(v.id))
                        .map((v) => v.name)
                        .join(", ")}
                    </p>
                    {item.note && (
                      <p className="item-note">Obs.: {item.note}</p>
                    )}
                    <div className="cart-actions">
                      <div className="stepper">
                        <button
                          disabled={item.quantity === 1}
                          aria-label="Diminuir item"
                          onClick={() =>
                            update(
                              items.map((i) =>
                                i.key === item.key
                                  ? { ...i, quantity: i.quantity - 1 }
                                  : i,
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <b>{item.quantity}</b>
                        <button
                          disabled={item.quantity === 20}
                          aria-label="Aumentar item"
                          onClick={() =>
                            update(
                              items.map((i) =>
                                i.key === item.key
                                  ? { ...i, quantity: i.quantity + 1 }
                                  : i,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (p) {
                            setDetail({ product: p, item });
                            setCart(false);
                          }
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="icon-button"
                        aria-label="Remover item"
                        onClick={() =>
                          update(items.filter((i) => i.key !== item.key))
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <label className="field">
              Observação do pedido
              <textarea
                maxLength={500}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                }}
                placeholder="Anote aqui para conversar com o garçom."
              />
            </label>
            <div className="total-row">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="total-row grand">
              <b>Total do pedido</b>
              <strong>{money(total)}</strong>
            </div>
            <p className="hint">
              Sua seleção não é enviada. Chame o garçom para confirmar os itens
              e fazer o pedido presencialmente.
            </p>
            <button
              className="primary full"
              disabled={!items.length}
              onClick={() => setCallWaiter(true)}
            >
              Chamar o garçom
              <ArrowRight size={18} />
            </button>
          </div>
        </Modal>
      )}
      {callWaiter && (
        <Modal title="Chamar o garçom" onClose={() => setCallWaiter(false)}>
          <div className="dialog-content">
            <h2>Peça ao garçom na sua mesa</h2>
            <p>
              Chame um garçom presencialmente e mostre sua seleção para
              confirmar o pedido.
            </p>
            <p className="hint">
              Nenhum pedido ou chamado foi enviado pelo sistema.
            </p>
            <button
              className="primary full"
              onClick={() => setCallWaiter(false)}
            >
              Voltar à minha seleção
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
