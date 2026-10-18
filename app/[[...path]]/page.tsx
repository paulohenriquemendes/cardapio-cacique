import { notFound } from "next/navigation";
import catalog from "@/database/catalog.json";
import { LiveMenu } from "@/components/live-menu";
import type { Product } from "@/types";

const tables = Array.from({ length: 20 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const menus = ["cafe-da-manha", "refeicoes"];
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    { path: [] },
    ...menus.map((menu) => ({ path: [menu] })),
    ...tables.flatMap((table) => [
      { path: ["mesa", table] },
      ...menus.map((menu) => ({ path: ["mesa", table, menu] })),
    ]),
  ];
}
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  const table = path[0] === "mesa" ? path[1] : undefined;
  const slug = table ? path[2] : path[0];
  if (table && !tables.includes(table)) notFound();
  if (slug && !menus.includes(slug)) notFound();
  return (
    <LiveMenu
      key={`${table}/${slug}`}
      products={catalog as Product[]}
      tables={tables}
      table={table}
      menu={
        slug
          ? slug === "refeicoes"
            ? "REFEICOES"
            : "CAFE_DA_MANHA"
          : undefined
      }
      demoMode={false}
    />
  );
}
