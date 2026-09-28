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
const want = new Set(["memory-plate-sun", "memory-plate-desk", "memory-cloth-diamond", "memory-cloth-dots", "memory-cloth-stars"]);
for (const item of shop.objects) {
  const t = item.userData.type;
  if (!want.has(t)) continue;
  const b = new T.Box3().setFromObject(item, true);
  console.log(t, "at", item.position.toArray(), "parent", item.parent?.name,
    "bounds", [b.min.toArray(), b.max.toArray()],
    "h", (b.max.y - b.min.y).toFixed(4));
  // geometry structure
  item.traverse((m) => {
    if (m.isMesh && m.geometry.attributes.position) {
      const p = m.geometry.attributes.position;
      let miny = Infinity, maxy = -Infinity;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
      console.log("   mesh", m.name, "localY", miny.toFixed(4), "..", maxy.toFixed(4));
    }
  });
}
