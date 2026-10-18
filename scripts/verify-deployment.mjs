import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";

const origin =
  process.env.DEPLOYMENT_URL || "https://cardapio-cacique.pages.dev";
const expected = process.env.GITHUB_SHA;
assert.match(
  expected || "",
  /^[0-9a-f]{40}$/,
  "Informe GITHUB_SHA para verificar a publicação.",
);
let deployed = false;
for (let attempt = 0; attempt < 12; attempt++) {
  try {
    const response = await fetch(
      `${origin}/deployment.json?commit=${expected}&attempt=${attempt}`,
      { cache: "no-store", signal: AbortSignal.timeout(15000) },
    );
    if (response.ok && (await response.json()).commit === expected) {
      deployed = true;
      break;
    }
  } catch {
    /* Aguarda a propagação do deploy. */
  }
  await setTimeout(5000);
}
assert.ok(deployed, "O commit esperado ainda não foi encontrado em produção.");
for (const route of [
  "/",
  "/admin/",
  "/cafe-da-manha/",
  "/refeicoes/",
  "/mesa/12/refeicoes/",
]) {
  const response = await fetch(origin + route, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, `Rota indisponível: ${route}`);
}
console.log(
  `PASS: commit ${expected} e rotas principais disponíveis em ${origin}.`,
);
