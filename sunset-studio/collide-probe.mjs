// Collision probe v2: objects vs fixtures (shelves/racks) and object-object, without parent skip.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const load = (file) => import(pathToFileURL(path.resolve(root, file)));
const { COLLECTION: c } = await load("collection.js");
const { TEXTURE_SOURCES } = await load("texture-sources.js");
const T = await load("assets/three.module.js");
const { buildShop } = await load("gallery.js");
const context = new Proxy({}, {
  get: (_, key) => key === "getImageData" ? () => ({ data: new Uint8ClampedArray(16), width: 2, height: 2 }) : () => {},
  set: () => true,
});
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) };
const textures = {};
for (const [key, url] of TEXTURE_SOURCES) {
  path.resolve(root, url);
  const [width, height] = c.imageSizes[url];
  textures[key] = new T.Texture({ width, height });
  if (key.startsWith("art-")) textures[key].userData.tripArtwork = true;
  if (key === "mobiles") textures[key].userData.tripOrnaments = true;
}
const shop = buildShop(textures);
shop.room.updateMatrixWorld(true);

// Fixture bounds: group children of room that are not catalog objects.
const objIds = new Set(shop.objects.map((o) => o.uuid));
const fixtures = [];
shop.room.children.forEach((ch) => {
  if (!ch.isGroup || ch.isInstancedMesh) return;
  // fixture groups contain mesh children; skip if this group is a catalog object
  if (objIds.has(ch.uuid)) return;
  const b = new T.Box3().setFromObject(ch, true);
  fixtures.push({ name: ch.name || "fixture", b, group: ch });
});
console.log("fixtures found:", fixtures.length);
fixtures.forEach((f) =>
  console.log("  ", f.name, [f.b.min.toArray(), f.b.max.toArray()]),
);

function overlap(a, b) {
  return !(
    a.max.x < b.min.x || b.max.x < a.min.x ||
    a.max.y < b.min.y || b.max.y < a.min.y ||
    a.max.z < b.min.z || b.max.z < a.min.z
  );
}
function inter(a, b) {
  const dx = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const dy = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
  const dz = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (dx <= 0 || dy <= 0 || dz <= 0) return 0;
  return dx * dy * dz;
}

// object vs object
const items = shop.objects.map((o) => ({ o, b: new T.Box3().setFromObject(o, true), type: o.userData.type }));
const seen = new Set();
const rows = [];
for (let i = 0; i < items.length; i++)
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    if (!overlap(a.b, b.b)) continue;
    const v = inter(a.b, b.b);
    const key = [a.type, b.type].sort().join("|");
    if (seen.has(key) || v < 5e-6) continue;
    seen.add(key);
    rows.push({ v, a: a.type, b: b.type });
  }
// object vs fixture
for (const it of items) {
  for (const f of fixtures) {
    if (!overlap(it.b, f.b)) continue;
    const v = inter(it.b, f.b);
    if (v < 1e-5) continue;
    rows.push({ v, a: it.type, b: "FIXTURE:" + f.name });
  }
}
rows.sort((x, y) => y.v - x.v);
for (const r of rows.slice(0, 80))
  console.log("v=" + r.v.toFixed(6) + "  " + r.a + " <-> " + r.b);
console.log("total pairs:", rows.length);
