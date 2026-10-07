import Link from "next/link";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="brand"
      aria-label="Restaurante Cacique, início"
    >
      <span className="official-brand">
        <img
          src="/brand/cacique-marrom.png"
          alt="Restaurante Cacique · Cozinha Regional · Desde 1965"
        />
      </span>
    </Link>
  );
}
