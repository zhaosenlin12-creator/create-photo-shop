import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const local = (rel) => path.resolve(root, rel);
const load = (file) => import(pathToFileURL(local(file)));
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
  local(url);
  const [width, height] = c.imageSizes[url];
  textures[key] = new T.Texture({ width, height });
  if (key.startsWith("art-")) textures[key].userData.tripArtwork = true;
}
const shop = buildShop(textures);
shop.room.updateMatrixWorld(true);
for (const item of shop.objects) {
  const t = item.userData.type;
  if (t.startsWith("card-1") || t.startsWith("memory-pc-n")) {
    const b = new T.Box3().setFromObject(item, true);
    const center = b.getCenter(new T.Vector3());
    console.log(t, "pos", item.position.toArray(), "rot", item.rotation.toArray(),
      "center", [center.x, center.y, center.z], "size", [b.max.x-b.min.x, b.max.y-b.min.y, b.max.z-b.min.z]);
  }
}
