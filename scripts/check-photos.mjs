import assert from "node:assert/strict";
import fs from "node:fs";
import { parseEnv } from "node:util";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const config = parseEnv(fs.readFileSync(".env.local", "utf8"));
const url = config.NEXT_PUBLIC_SUPABASE_URL,
  key = config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const create = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const anon = create(),
  editor = create();
const credentials = JSON.parse(
  fs.readFileSync(".local/photo-admin.json", "utf8"),
);
const login = await editor.auth.signInWithPassword(credentials);
assert.equal(login.error, null, "editor login");
assert.equal(login.data.user.app_metadata.role, "photo_editor");
const id = "fb194187-dead-5aa8-9786-dc6187fc03a2";
const publicRead = await anon
  .from("product_photos")
  .select("product_id,storage_path,updated_at");
assert.equal(publicRead.error, null);
const fixture = publicRead.data.find((p) => p.product_id === id);
assert.ok(
  fixture,
  "First upload the temporary coffee fixture through the administrator UI.",
);
const photoResponse = await fetch(
  `${url}/storage/v1/object/public/menu-photos/${fixture.storage_path}`,
);
assert.equal(photoResponse.status, 200, "uploaded image is public");
assert.match(photoResponse.headers.get("content-type"), /image\/jpeg/);
const bytes = await photoResponse.arrayBuffer();
const before = await anon
  .from("products")
  .select("price")
  .eq("id", id)
  .single();
assert.equal(before.error, null);
const noWrite = await anon
  .from("product_photos")
  .upsert({ product_id: id, storage_path: `${id}/${randomUUID()}.jpg` });
assert.ok(noWrite.error, "anonymous writes forbidden");
const anonUpload = await anon.storage
  .from("menu-photos")
  .upload(`${id}/${randomUUID()}.jpg`, bytes, { contentType: "image/jpeg" });
assert.ok(anonUpload.error, "anonymous uploads forbidden");
const badType = await editor.storage
  .from("menu-photos")
  .upload(
    `${id}/${randomUUID()}.jpg`,
    new Blob(["invalid"], { type: "text/plain" }),
    { contentType: "text/plain" },
  );
assert.ok(badType.error, "bucket rejects non-image content type");
const overwrite = await editor.storage
  .from("menu-photos")
  .upload(fixture.storage_path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });
assert.ok(overwrite.error, "existing objects cannot be overwritten");
const noPriceWrite = await editor
  .from("products")
  .update({ price: before.data.price + 1 })
  .eq("id", id)
  .select("id");
assert.ok(
  noPriceWrite.error || noPriceWrite.data.length === 0,
  "photo editor cannot change prices",
);
assert.equal(
  (await anon.from("products").select("price").eq("id", id).single()).data
    .price,
  before.data.price,
);
const missing = randomUUID();
const invalid = await editor
  .from("product_photos")
  .upsert({
    product_id: missing,
    storage_path: `${missing}/${randomUUID()}.jpg`,
  });
assert.ok(invalid.error, "unknown product rejected");
const waiter = create();
const staff = JSON.parse(
  fs.readFileSync(
    "../cacique-novos-cardapios/.local/online-staff.json",
    "utf8",
  ),
).find((u) => u.role === "waiter");
assert.equal(
  (
    await waiter.auth.signInWithPassword({
      email: staff.email,
      password: staff.password,
    })
  ).error,
  null,
);
const noStaffWrite = await waiter
  .from("product_photos")
  .update({ storage_path: `${id}/${randomUUID()}.jpg` })
  .eq("product_id", id)
  .select("product_id");
assert.ok(
  noStaffWrite.error || noStaffWrite.data.length === 0,
  "waiter cannot edit photographs",
);
assert.equal(
  (
    await anon
      .from("product_photos")
      .select("storage_path")
      .eq("product_id", id)
      .single()
  ).data.storage_path,
  fixture.storage_path,
);
await Promise.all([editor.auth.signOut({scope: "local"}), waiter.auth.signOut({scope: "local"})]);
console.log(
  "PASS: editor login, public photo, JPEG optimization, anonymous and waiter restrictions, protected prices, MIME checks, append-only storage and product validation.",
);
