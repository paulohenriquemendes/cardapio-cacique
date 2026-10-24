import { Product } from "@/types";
import illustrations from "@/lib/illustrations.json";
import { assetPath } from "@/lib/asset-path";
export function ProductVisual({
  product: p,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const temporary =
    p.category === "Carnes na brasa" && /bovino|bovina|bovinas/.test(p.name)
      ? "photo-1544025162-d76694265947"
      : /Café coado|Café expresso|Garrafa de café/.test(p.name)
        ? "photo-1442512595331-e89e73853f31"
        : null;
  const image =
    p.image ||
    (illustrations as Record<string, string>)[p.id] ||
    (p.name === "Carne de sol na manteiga da terra"
      ? "/images/illustrative/carne-de-sol.webp"
      : null) ||
    (temporary
      ? `https://images.unsplash.com/${temporary}?auto=format&fit=crop&w=${large ? 900 : 450}&q=80`
      : null);
  const generated = !p.image && image?.startsWith("/images/illustrative/");
  const representative = image?.startsWith("/images/illustrative/beverage-");
  return (
    <div
      className={`${large ? "detail-art" : "product-art"} ${image ? "has-image" : ""}`}
    >
      {image ? (
        <>
          <img
            src={assetPath(image)}
            alt={
              p.image
                ? p.name
                : generated
                  ? representative
                    ? `Ilustração por IA do tipo de bebida de ${p.name}; marca, embalagem e sabor podem variar`
                    : `Ilustração de ${p.name} gerada por IA`
                  : "Imagem ilustrativa de banco de imagens"
            }
            loading="lazy"
          />
          {!p.image && (
            <small className="temporary-photo">
              {generated ? "Ilustração por IA" : "Imagem ilustrativa"}
            </small>
          )}
        </>
      ) : (
        <>
          <span>❧</span>
          <small>{large ? "COZINHA REGIONAL" : "FOTO EM BREVE"}</small>
        </>
      )}
    </div>
  );
}
