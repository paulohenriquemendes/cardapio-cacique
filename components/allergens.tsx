import { Bean, CircleHelp, Egg, Fish, Milk, Nut, Shell, Shrimp, Sprout, Wheat } from "lucide-react";
import records from "@/database/allergens.json";

const icons = {
  Glúten: Wheat,
  Leite: Milk,
  Ovos: Egg,
  Peixe: Fish,
  Soja: Bean,
  Castanhas: Nut,
  Amendoim: Bean,
  Crustáceos: Shrimp,
  Moluscos: Shell,
  Gergelim: Sprout,
  Outros: CircleHelp,
};
type Allergen = keyof typeof icons;
type Record = { source: string[]; review: string[] };
const byProduct: { [id: string]: Record | undefined } = records;

function Badges({ labels, pending = false }: { labels: string[]; pending?: boolean }) {
  return (
    <span className="allergen-badges">
      {labels.map((label) => {
        const Icon = icons[label as Allergen] || CircleHelp;
        return (
          <span className={pending ? "allergen-badge pending" : "allergen-badge"} key={label}>
            <Icon size={14} aria-hidden="true" /> {label}
          </span>
        );
      })}
    </span>
  );
}

export function AllergenLegend({ available }: { available: boolean }) {
  return (
    <details className="allergen-legend">
      <summary>Informações sobre alergênicos</summary>
      {available ? (
        <>
          <p>Informações em revisão pela cozinha. Os selos de borda tracejada indicam hipóteses a confirmar.</p>
          <Badges labels={Object.keys(icons).slice(0, 7)} />
        </>
      ) : (
        <p>A ficha de alergênicos do Café da Manhã ainda não está disponível.</p>
      )}
      <p>Sem ícone não significa sem alergênicos. Em caso de alergia, confirme ingredientes, acompanhamentos e contato cruzado com a equipe antes de pedir.</p>
    </details>
  );
}

export function ProductAllergens({ id, detail = false }: { id: string; detail?: boolean }) {
  const record = byProduct[id];
  if (!detail) {
    if (!record || (!record.source.length && !record.review.length)) return null;
    return (
      <span className="product-allergens">
        <span className="allergen-label">Alergênicos em revisão</span>
        <Badges labels={record.source} />
        <Badges labels={record.review} pending />
      </span>
    );
  }

  return (
    <section className="allergen-detail" aria-label="Alergênicos">
      <h3>Alergênicos</h3>
      {record ? (
        <>
          <p><strong>Ficha em revisão pela cozinha.</strong></p>
          {record.source.length > 0 && <p>Identificados nas fontes <Badges labels={record.source} /></p>}
          {record.review.length > 0 && <p>Hipóteses a confirmar <Badges labels={record.review} pending /></p>}
          {!record.source.length && !record.review.length && <p>Sem marcações na ficha. A ausência de alergênicos não foi confirmada.</p>}
        </>
      ) : (
        <p>Ficha de alergênicos indisponível para este item.</p>
      )}
      <p>Em caso de alergia, confirme ingredientes, opções e contato cruzado com a equipe antes de pedir.</p>
    </section>
  );
}
