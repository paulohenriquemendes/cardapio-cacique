import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="brand"
      aria-label="Restaurante Cacique, início"
    >
      <span className="official-brand">
        <img
          src={assetPath("/brand/cacique-alinhada-esquerda-marrom.png")}
          alt="Restaurante Cacique · Cozinha Regional · Desde 1965"
          width={960}
          height={324}
        />
      </span>
    </Link>
  );
}
