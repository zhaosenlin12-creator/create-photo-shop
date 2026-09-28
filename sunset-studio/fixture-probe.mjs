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
const want = new Set(["worktable", "trestle-small", "table-cloth", "plinth-ent", "crate-low", "basket", "shelf-main", "memory-board", "maker-gallery", "card-rack"]);
shop.room.children.forEach((ch) => {
  if (!ch.isGroup || ch.isInstancedMesh) return;
  if (!want.has(ch.name?.replace("fixture-", ""))) return;
  const b = new T.Box3().setFromObject(ch, true);
  console.log("###", ch.name, "sizeH decl:", c.scene.fixtures.find((f) => "fixture-" + f.id === ch.name)?.size?.[1], "boundsY", b.min.y.toFixed(3), "..", b.max.y.toFixed(3));
  ch.traverse((m) => {
    if (m.isMesh && m.geometry.attributes.position) {
      const p = m.geometry.attributes.position;
      let miny = Infinity, maxy = -Infinity;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
      const w = new T.Box3().setFromObject(m, true);
      console.log("   ", m.name.slice(0, 34).padEnd(36), "localY", miny.toFixed(3), "..", maxy.toFixed(3), "worldY", w.min.y.toFixed(3), "..", w.max.y.toFixed(3));
    }
  });
});
