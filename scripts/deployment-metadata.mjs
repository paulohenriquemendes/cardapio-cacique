import fs from "node:fs";
import assert from "node:assert/strict";

const commit = process.env.GITHUB_SHA;
assert.match(commit || "", /^[0-9a-f]{40}$/, "Commit de publicação inválido.");
for (const file of [
  "out/index.html",
  "out/admin/index.html",
  "out/cafe-da-manha/index.html",
  "out/refeicoes/index.html",
]) {
  assert.ok(fs.existsSync(file), `Arquivo estático ausente: ${file}`);
}
fs.writeFileSync(
  "out/deployment.json",
  JSON.stringify({ commit, published_at: new Date().toISOString() }),
);
console.log(`Site compilado para o commit ${commit}.`);
