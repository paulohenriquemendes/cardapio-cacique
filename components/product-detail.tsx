"use client";
import { ProductVisual } from "./product-visual";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Product, CartItem } from "@/types";
import { money } from "@/lib/format";
import { Modal } from "./modal";
export function ProductDetail({
  product: p,
  item,
  onClose,
  onSave,
}: {
  product: Product;
  item?: CartItem;
  onClose: () => void;
  onSave: (item: CartItem) => void;
}) {
  const [quantity, setQuantity] = useState(item?.quantity || 1),
    [options, setOptions] = useState<string[]>(item?.options || []),
    [note, setNote] = useState(item?.note || "");
  const valid = p.options.every((g) => {
    const n = g.values.filter((v) => options.includes(v.id)).length;
    return n >= g.min && n <= g.max;
  });
  const total =
    (p.price +
      p.options
        .flatMap((g) => g.values)
        .filter((v) => options.includes(v.id))
        .reduce((s, v) => s + v.price, 0)) *
    quantity;
  return (
    <Modal title={p.name} onClose={onClose}>
      <ProductVisual product={p} large />
      <div className="detail-body">
        <span className="eyebrow">
          {p.category}
          {p.code ? " · CÓD. " + p.code : ""}
        </span>
        <h2>{p.name}</h2>
        <p className="muted">{p.description}</p>
        <div className="price-line">
          <span>{p.unit}</span>
          <strong>{money(p.price)}</strong>
        </div>
        {p.options.map((g) => {
          const count = g.values.filter((v) => options.includes(v.id)).length;
          return (
            <fieldset key={g.id}>
              <legend>
                {g.name}{" "}
                <small>
                  {g.min
                    ? `Obrigatório · ${g.min === g.max ? g.min : `até ${g.max}`}`
                    : "Opcional"}
                </small>
              </legend>
              <span className="selection-count">
                {count} de {g.max} selecionado(s)
              </span>
              {g.values.map((v) => (
                <label className="option" key={v.id}>
                  <input
                    type={g.max === 1 ? "radio" : "checkbox"}
                    name={g.id}
                    checked={options.includes(v.id)}
                    onChange={() =>
                      setOptions((prev) =>
                        g.max === 1
                          ? [
                              ...prev.filter(
                                (id) => !g.values.some((x) => x.id === id),
                              ),
                              v.id,
                            ]
                          : prev.includes(v.id)
                            ? prev.filter((id) => id !== v.id)
                            : count < g.max
                              ? [...prev, v.id]
                              : prev,
                      )
                    }
                  />
                  <span>{v.name}</span>
                  {v.price > 0 && <b>+ {money(v.price)}</b>}
                </label>
              ))}
            </fieldset>
          );
        })}
        <label className="field">
          Alguma observação?
          <textarea
            placeholder="Ex.: sem tomate, carne bem passada…"
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="detail-bottom">
          <div className="stepper">
            <button
              aria-label="Diminuir quantidade"
              disabled={quantity === 1}
              onClick={() => setQuantity(quantity - 1)}
            >
              <Minus size={16} />
            </button>
            <b>{quantity}</b>
            <button
              aria-label="Aumentar quantidade"
              disabled={quantity === 20}
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            className="primary"
            disabled={!valid}
            onClick={() =>
              onSave({
                key: item?.key || crypto.randomUUID(),
                productId: p.id,
                quantity,
                options,
                note,
              })
            }
          >
            {item ? "Salvar" : "Adicionar"} · {money(total)}
          </button>
        </div>
        {!valid && (
          <p className="hint">Escolha as opções obrigatórias para continuar.</p>
        )}
      </div>
    </Modal>
  );
}
