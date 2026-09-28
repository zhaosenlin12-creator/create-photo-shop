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
}
const shop = buildShop(textures);
shop.room.updateMatrixWorld(true);
const byType = new Map();
for (const item of shop.objects) {
  const t = item.userData.type.replace(/-\d+$/, "");
  const b = new T.Box3().setFromObject(item, true);
  const h = b.max.y - b.min.y;
  if (!byType.has(t)) byType.set(t, []);
  byType.get(t).push({ at: item.position.y, min: b.min.y, h });
}
for (const [t, arr] of byType) {
  const offs = [...new Set(arr.map((x) => +(x.min - x.at).toFixed(3)))];
  const hs = [...new Set(arr.map((x) => +x.h.toFixed(3)))];
  console.log(t.padEnd(18), "bottomOffset(s)", JSON.stringify(offs), "h", JSON.stringify(hs));
}
