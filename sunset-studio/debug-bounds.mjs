// Exact copy of validator's first-loop check with printing.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const local = (rel) => {
  const p = path.resolve(root, rel);
  assert(p.startsWith(root + path.sep), "Asset stays in site");
  assert(fs.statSync(p).size > 0, "Nonempty asset " + rel);
  return p;
};
const load = (file) => import(pathToFileURL(local(file)));
const { COLLECTION: c } = await load("collection.js");
const { TEXTURE_SOURCES } = await load("texture-sources.js");
const T = await load("assets/three.module.js");
const { buildShop, CATALOG } = await load("gallery.js");
const context = new Proxy(
  {},
  {
    get: (_, key) =>
      key === "getImageData"
        ? () => ({ data: new Uint8ClampedArray(16), width: 2, height: 2 })
        : () => {},
    set: () => true,
  },
);
globalThis.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => context }),
};
const textures = {};
for (const [key, url] of TEXTURE_SOURCES) {
  local(url);
  const [width, height] = c.imageSizes[url];
  textures[key] = new T.Texture({ width, height });
  if (key.startsWith("art-")) textures[key].userData.tripArtwork = true;
  if (key === "mobiles") textures[key].userData.tripOrnaments = true;
}
const shop = buildShop(textures);
shop.room.updateMatrixWorld(true);
const r = c.scene.room;
console.log("room:", r.width, r.depth, r.height);
for (const item of shop.objects) {
  const b = new T.Box3().setFromObject(item, true);
  if (item.name.includes("jn-sea"))
    console.log("jn-sea pos:", item.position.toArray(), "bounds:", [b.min.toArray(), b.max.toArray()], "children:", item.children.length);
  const bad =
    b.isEmpty() ||
    b.max.y >= r.height + 0.05 ||
    b.min.y <= -0.1 ||
    b.min.x <= -r.width / 2 - 0.05 ||
    b.max.x >= r.width / 2 + 0.05 ||
    b.min.z <= -r.depth / 2 - 0.05 ||
    b.max.z >= r.depth / 2 + 0.05;
  if (bad) console.log("BAD", item.name, [b.min.toArray(), b.max.toArray()]);
}
console.log("checked", shop.objects.length);
