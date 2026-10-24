import type { Metadata, Viewport } from "next";
import "./globals.css";
import { assetPath } from "@/lib/asset-path";
export const metadata: Metadata = {
  title: "Cacique · Cozinha Regional",
  description:
    "História, tradição e muito sabor. Conheça os cardápios do Restaurante Cacique.",
  manifest: assetPath("/manifest.webmanifest"),
  icons: {
    icon: [32, 64].map((size) => ({
      url: assetPath(`/brand/cacique-simbolo-amarelo-${size}.png`),
      type: "image/png",
      sizes: `${size}x${size}`,
    })),
    apple: [{
      url: assetPath("/brand/cacique-simbolo-amarelo-180.png"),
      sizes: "180x180",
      type: "image/png",
    }],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#532f20",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
