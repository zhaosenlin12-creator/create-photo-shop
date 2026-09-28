// Sunset Studio custom makers: plate, dish, tablecloth, pen.
// Authored for the fictional "Sunset Studio" souvenir collection.
import * as T from "./assets/three.module.js";
import {
  box,
  cyl,
  ring,
  tube,
  mesh,
  lathe,
  rounded,
  plane,
  mat,
  textured,
  cream,
  silver,
} from "./materials.js";
import {
  enamel,
  brass,
  steel,
  rubber,
  magnetMetal,
  thread,
  tube as craftTube,
  group,
  roundBlock,
  polygon,
  ellipse,
  relief,
  jewel,
  arch,
  link,
  splitRing,
  chainPath,
  chain,
  magnetBack,
  pinBack,
} from "./craft.js";

const GLAZE = (c) => enamel(c || "#e9e2d2");
const FOOT = mat("#d6cfbf", 0.55);

function polarShape(radius, points, lobes, wobble, phase = 0) {
  const s = new T.Shape();
  for (let i = 0; i <= points; i++) {
    const th = (i / points) * Math.PI * 2;
    const rad = radius * (1 + wobble * Math.cos(lobes * th + phase));
    const x = Math.cos(th) * rad;
    const y = Math.sin(th) * rad;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function polyShape(radius, sides, rot = 0) {
  const s = new T.Shape();
  for (let i = 0; i <= sides; i++) {
    const th = (i / sides) * Math.PI * 2 + rot;
    const x = Math.cos(th) * radius;
    const y = Math.sin(th) * radius;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function scaleShape(shape, k) {
  const pts = shape.getPoints(64);
  const s = new T.Shape();
  pts.forEach((p, i) =>
    i ? s.lineTo(p.x * k, p.y * k) : s.moveTo(p.x * k, p.y * k),
  );
  s.closePath();
  return s;
}

// Extrude a flat object: shape lies in the xz plane, thickness along +y.
function flatExtrude(parent, shape, depth, material, y0 = 0) {
  const geo = new T.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.0012,
    bevelThickness: 0.0008,
    bevelSegments: 2,
    curveSegments: 48,
  });
  geo.rotateX(-Math.PI / 2);
  const o = mesh(parent, geo, material, 0, y0, 0);
  return o;
}

// ---- Plates: shallow dishes with shaped rims, glaze, foot, artwork face ----
function plateConfig(model, R) {
  switch (model) {
    case "plate-sun":
      return { outer: polarShape(R, 48, 0, 0), inner: 0.88 }; // round
    case "plate-palm":
      return { outer: polyShape(R, 4, Math.PI / 4), inner: 0.84 }; // diamond square
    case "plate-canyon":
      return { outer: polarShape(R, 48, 2, 0.17, Math.PI / 2), inner: 0.86 }; // oval
    case "plate-neon":
      return { outer: polarShape(R, 40, 5, 0.11), inner: 0.84 }; // five-petal
    case "plate-desk":
      return { outer: polarShape(R, 40, 4, 0.13), inner: 0.85 }; // four-lobe
    case "plate-wall":
      return { outer: polyShape(R, 6), inner: 0.84 }; // hexagon
    case "plate-wave":
      return { outer: polarShape(R, 64, 12, 0.06), inner: 0.88 }; // scallop
    case "plate-stars":
      return { outer: polarShape(R, 40, 3, 0.24, Math.PI), inner: 0.82 }; // rounded three-lobe
    default:
      return { outer: polarShape(R, 48, 0, 0), inner: 0.88 };
  }
}

function buildPlate(g, d, tex, model) {
  const R = 0.16;
  const { outer, inner } = plateConfig(model, R);
  const glaze = GLAZE(d.color);
  flatExtrude(g, outer, 0.016, glaze, 0); // rim ring, 0..0.016
  const im = flatExtrude(g, scaleShape(outer, inner), 0.01, glaze, 0.004); // 0.004..0.014
  const faceW = R * 2 * inner * 0.94;
  plane(g, faceW, faceW, tex, 0, 0.0154, 0.0009);
  cyl(g, 0.045, 0.058, 0.009, 0, 0.0045, 0, FOOT, 32);
  return true;
}

// ---- Small dishes: smaller, deeper catch-all forms, distinct silhouettes ----
function dishConfig(model, R) {
  switch (model) {
    case "dish-sea":
      return { outer: polarShape(R, 48, 0, 0), inner: 0.8 }; // round
    case "dish-palm":
      return { outer: polarShape(R, 48, 2, 0.18, Math.PI / 2), inner: 0.78 }; // oval
    case "dish-trail":
      return { outer: polyShape(R, 4, 0), inner: 0.8 }; // square
    case "dish-neon":
      return { outer: polarShape(R, 36, 5, 0.14), inner: 0.76 }; // five-petal
    case "dish-desk":
      return { outer: polyShape(R, 6), inner: 0.78 }; // hexagon
    case "dish-wall":
      return { outer: polyShape(R, 4, Math.PI / 4), inner: 0.78 }; // diamond
    case "dish-wave":
      return { outer: polarShape(R, 56, 8, 0.16), inner: 0.74 }; // wavy edge
    case "dish-stars":
      return { outer: polyShape(R, 8, Math.PI / 8), inner: 0.76 }; // eight-point star
    default:
      return { outer: polarShape(R, 48, 0, 0), inner: 0.8 };
  }
}

function buildDish(g, d, tex, model) {
  const R = 0.105;
  const { outer, inner } = dishConfig(model, R);
  const glaze = GLAZE(d.color);
  flatExtrude(g, outer, 0.02, glaze, 0); // taller rim, 0..0.02
  const im = flatExtrude(g, scaleShape(outer, inner), 0.012, glaze, 0.005); // 0.005..0.017
  const faceW = R * 2 * inner * 0.95;
  plane(g, faceW, faceW, tex, 0, 0.0186, 0.0011);
  cyl(g, 0.03, 0.04, 0.008, 0, 0.004, 0, FOOT, 32);
  return true;
}

// ---- Tablecloths: patterned cloth lying on tables with hanging edges ----
function buildCloth(g, d, tex, model) {
  const sizes = {
    "cloth-diamond": [1.5, 0.95, 0.16],
    "cloth-dots": [1.3, 0.82, 0.2],
    "cloth-stars": [1.08, 0.7, 0.24],
  };
  const [w, dep, hang] = sizes[model] || sizes["cloth-diamond"];
  const geo = new T.PlaneGeometry(w, dep, 28, 30);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = Math.abs(y) / (dep / 2); // 0 center -> 1 edge
    const sag = Math.pow(t, 5) * (hang * 1.55) + 0.005 * Math.sin(t * Math.PI);
    pos.setZ(i, -sag);
  }
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  const cloth = mesh(g, geo, textured(tex, 0.98, { side: T.DoubleSide }), 0, 0, 0);
  // Fringe on the two long edges for the star cloth.
  if (model === "cloth-stars") {
    for (let i = 0; i <= 26; i++) {
      const x = -w / 2 + (i / 26) * w;
      for (const sign of [-1, 1]) {
        tube(
          g,
          [
            [x, sign * dep * 0.48, -hang - 0.012],
            [x, sign * dep * 0.48, -hang - 0.055],
          ],
          0.002,
          mat(d.color || "#2b5d66", 0.8),
        );
      }
    }
  }
  return true;
}

// ---- Pens: distinct barrels, tips, clips/caps and finials ----
function buildPen(g, d, tex, model) {
  const ink = GLAZE(d.color);
  const tip = (rt, h, y0) => cyl(g, rt, 0.006, h, 0, y0 + h / 2, 0, brass, 12);
  const barrel = (rt, h, y0, matl = ink, seg = 16) =>
    cyl(g, rt, rt, h, 0, y0 + h / 2, 0, matl, seg);
  switch (model) {
    case "pen-classic": {
      barrel(0.006, 0.13, 0, ink);
      tip(0.004, 0.022, -0.011);
      tube(g, [[0.0065, 0.115, 0], [0.0065, 0.148, 0], [0.0065, 0.158, -0.005]], 0.0012, brass);
      plane(g, 0.0115, 0.052, tex, 0, 0.07, 0.0064);
      break;
    }
    case "pen-cap": {
      barrel(0.0065, 0.11, 0, ink);
      tip(0.0036, 0.02, -0.01);
      cyl(g, 0.008, 0.008, 0.045, 0, 0.117, 0, GLAZE("#c87a45"), 16); // cap
      tube(g, [[0.0086, 0.128, 0], [0.0086, 0.153, 0]], 0.0013, brass);
      plane(g, 0.011, 0.046, tex, 0, 0.062, 0.0068);
      break;
    }
    case "pen-hex": {
      mesh(g, new T.CylinderGeometry(0.0068, 0.0068, 0.13, 6), ink, 0, 0.065, 0);
      tip(0.0038, 0.02, -0.01);
      tube(g, [[0.0072, 0.112, 0], [0.0072, 0.148, 0], [0.0072, 0.156, -0.004]], 0.0012, brass);
      plane(g, 0.011, 0.046, tex, 0, 0.066, 0.0074);
      break;
    }
    case "pen-mini": {
      barrel(0.0075, 0.09, 0, ink, 14);
      tip(0.0038, 0.016, -0.008);
      cyl(g, 0.0075, 0.0075, 0.012, 0, 0.096, 0, mat("#3a3a38", 0.5), 16);
      plane(g, 0.012, 0.04, tex, 0, 0.05, 0.0077);
      break;
    }
    case "pen-quill": {
      barrel(0.0058, 0.115, 0, ink);
      tip(0.0036, 0.02, -0.01);
      plane(g, 0.0105, 0.042, tex, 0, 0.062, 0.0058);
      const feather = new T.Shape();
      feather.absellipse(0, 0, 0.02, 0.052, 0, Math.PI * 2, false, 0);
      const fGeo = new T.ExtrudeGeometry(feather, { depth: 0.002, bevelEnabled: false });
      const f1 = mesh(g, fGeo, mat("#f3ead8", 0.85), 0, 0.132, 0);
      f1.rotation.z = 0.32;
      const f2 = mesh(g, fGeo.clone(), mat("#f3ead8", 0.85), 0, 0.142, 0);
      f2.rotation.z = -0.32;
      craftTube(g, [[0, 0.126, 0], [0, 0.16, 0]], 0.0016, thread);
      break;
    }
    case "pen-palm": {
      barrel(0.006, 0.115, 0, ink);
      tip(0.0036, 0.02, -0.01);
      plane(g, 0.011, 0.046, tex, 0, 0.062, 0.0072);
      const leaf = new T.Shape();
      leaf.absellipse(0, 0, 0.013, 0.046, 0, Math.PI * 2, false, 0);
      const lGeo = new T.ExtrudeGeometry(leaf, { depth: 0.002, bevelEnabled: false });
      for (let i = 0; i < 5; i++) {
        const l = mesh(g, lGeo.clone(), enamel("jade"), 0, 0.128, 0);
        l.rotation.z = (i / 5) * Math.PI * 2;
        l.rotation.x = 0.45 + (i % 2) * 0.2;
        l.position.x = Math.cos((i / 5) * Math.PI * 2) * 0.016;
        l.position.z = Math.sin((i / 5) * Math.PI * 2) * 0.016;
      }
      break;
    }
    default:
      return false;
  }
  return true;
}

// ---- Coasters: sets with distinct silhouettes, glazed face, cork underside ----
function buildCoaster(g, d, tex, model) {
  const R = 0.085;
  let outer;
  switch (model) {
    case "cs-palm":
      outer = polarShape(R, 48, 2, 0.18, Math.PI / 2); // oval
      break;
    case "cs-canyon":
      outer = polyShape(R, 4, 0); // square
      break;
    case "cs-neon":
      outer = polarShape(R, 36, 5, 0.12); // five-petal
      break;
    case "cs-desk":
      outer = polyShape(R, 6); // hexagon
      break;
    case "cs-wall":
      outer = polyShape(R, 4, Math.PI / 4); // diamond
      break;
    case "cs-wave":
      outer = polarShape(R, 56, 10, 0.07); // wavy
      break;
    case "cs-wood":
      outer = polyShape(R, 8, Math.PI / 8); // octagon-star
      break;
    default:
      outer = polarShape(R, 48, 0, 0); // cs-sea round
  }
  flatExtrude(g, outer, 0.016, GLAZE(d.color), 0.002); // glazed rim ring 0.002..0.018
  flatExtrude(g, scaleShape(outer, 0.9), 0.011, GLAZE(d.color), 0.004); // well 0.004..0.015
  const faceW = R * 2 * 0.84;
  plane(g, faceW, faceW, tex, 0, 0.0139, 0.0008); // artwork face
  flatExtrude(g, scaleShape(outer, 0.97), 0.0025, mat("#c9b98f", 0.95), -0.0025); // cork underside
  return true;
}

// ---- Journals: distinct formats, bindings and page-edge treatments ----
function buildJournal(g, d, tex, model) {
  const cfg = {
    "jn-sea": { w: 0.236, h: 0.306, t: 0.033, cover: GLAZE("#2b5d66"), spineW: 0.05, pageGold: false, rings: false },
    "jn-palm": { w: 0.3, h: 0.22, t: 0.028, cover: GLAZE("#c87a45"), spineW: 0.05, pageGold: false, rings: false },
    "jn-canyon": { w: 0.24, h: 0.31, t: 0.045, cover: GLAZE("#b99b72"), spineW: 0.09, pageGold: false, rings: false },
    "jn-neon": { w: 0.236, h: 0.306, t: 0.03, cover: GLAZE("#3a3a38"), spineW: 0.05, pageGold: true, rings: false },
    "jn-desk": { w: 0.25, h: 0.24, t: 0.026, cover: GLAZE("#b99b72"), spineW: 0.04, pageGold: false, rings: true },
    "jn-wave": { w: 0.19, h: 0.25, t: 0.024, cover: GLAZE("#2b5d66"), spineW: 0.035, pageGold: false, rings: false },
  }[model] || { w: 0.236, h: 0.306, t: 0.033, cover: GLAZE(d.color), spineW: 0.05, pageGold: false, rings: false };
  const { w, h, t, cover, spineW, pageGold, rings } = cfg;
  const pageM = pageGold ? mat("#d9a44f", 0.55) : cream;
  // Page block, standing upright, face toward +z.
  box(g, w * 0.94, h * 0.92, t * 0.6, 0, h / 2, -t * 0.02, pageM);
  if (pageGold) box(g, w * 0.94, 0.012, t * 0.6, 0, h * 0.965, -t * 0.02, mat("#d9a44f", 0.8)); // gold top edge
  // Back board and front board.
  box(g, w, h, t * 0.13, 0, h / 2, -t * 0.075, cover);
  box(g, w, h, t * 0.13, 0, h / 2, t * 0.04, cover);
  // Spine strip on the right side.
  box(g, spineW, h, t * 0.13, w / 2 - spineW / 2, h / 2, t * 0.01, mat("#3a3a38", 0.4));
  // Cover artwork.
  plane(g, w * 0.88, h * 0.84, tex, 0, h / 2, t * 0.11);
  // Loose-leaf rings for the desk journal.
  if (rings) {
    for (const ry of [0.42, 0.62]) {
      tube(g, [[w / 2 - 0.012, h * ry, 0], [w / 2 + 0.008, h * ry, 0]], 0.003, brass);
    }
  }
  return true;
}

// ---- Fridge magnets: layered enamel silhouettes with shaped artwork faces ----
function crescentShape(R) {
  const s = new T.Shape();
  for (let i = 0; i <= 64; i++) {
    const th = (i / 64) * Math.PI * 2;
    const r = R * (1 + 0.34 * Math.cos(th + Math.PI / 2));
    const x = Math.cos(th) * r;
    const y = Math.sin(th) * r;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}
function archShape(R) {
  const s = new T.Shape();
  const r = R * 0.72;
  s.moveTo(-R, -R * 0.55);
  s.lineTo(-R, R * 0.05);
  for (let i = 0; i <= 24; i++) {
    const th = Math.PI + (i / 24) * Math.PI;
    s.lineTo(Math.cos(th) * r, R * 0.05 + Math.sin(th) * r);
  }
  s.lineTo(R, R * 0.05);
  s.lineTo(R, -R * 0.55);
  s.closePath();
  return s;
}
function peaksShape(R) {
  const s = new T.Shape();
  s.moveTo(-R, -R * 0.55);
  s.lineTo(-R * 0.55, R * 0.32);
  s.lineTo(-R * 0.1, -R * 0.1);
  s.lineTo(R * 0.22, R * 0.42);
  s.lineTo(R * 0.62, -R * 0.05);
  s.lineTo(R, -R * 0.55);
  s.closePath();
  return s;
}
function leafShape(R) {
  // Pointed leaf lying horizontally: widest at the middle, tapering to both tips.
  const s = new T.Shape();
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (t - 0.5) * 2 * R;
    const y = Math.sin(Math.PI * t) * R * 0.38;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}
function shapeMinY(shape) {
  let m = Infinity;
  for (const p of shape.getPoints(48)) if (p.y < m) m = p.y;
  return m;
}
function magnetConfig(model, R) {
  switch (model) {
    case "mg-sun":      return { outer: polarShape(R, 40, 8, 0.09) };
    case "mg-wave":     return { outer: polarShape(R, 64, 9, 0.1) };
    case "mg-mountain": return { outer: peaksShape(R) };
    case "mg-arch":     return { outer: archShape(R) };
    case "mg-star":     return { outer: polarShape(R, 40, 5, 0.34, Math.PI) };
    case "mg-diamond":  return { outer: polyShape(R, 4, Math.PI / 4) };
    case "mg-moon":     return { outer: crescentShape(R) };
    case "mg-leaf":     return { outer: leafShape(R) };
    default:            return { outer: polarShape(R, 48, 0, 0) };
  }
}
function buildMagnet(g, d, tex, model) {
  const R = 0.1;
  const { outer } = magnetConfig(model, R);
  const glaze = GLAZE(d.color);
  const minY = shapeMinY(outer);
  const lift = -minY;
  const opts = {
    depth: 0.02,
    bevelEnabled: true,
    bevelSize: 0.0012,
    bevelThickness: 0.0008,
    bevelSegments: 2,
    curveSegments: 48,
  };
  // Enamel base: silhouette in the xy plane, thickness along +z (sticker style).
  mesh(g, new T.ExtrudeGeometry(outer, opts), glaze, 0, lift, 0);
  // Cream recessed well in front of the base.
  const well = scaleShape(outer, 0.78);
  mesh(g, new T.ExtrudeGeometry(well, { ...opts, depth: 0.012 }), cream, 0, lift, 0.02);
  // Artwork face cropped to the silhouette, normalized UVs.
  const face = scaleShape(outer, 0.7);
  const faceGeo = new T.ShapeGeometry(face, 32);
  const pos = faceGeo.attributes.position;
  const uv = faceGeo.attributes.uv;
  let minX = Infinity, maxX = -Infinity, minY2 = Infinity, maxY2 = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY2) minY2 = y; if (y > maxY2) maxY2 = y;
  }
  const sx = maxX - minX, sy = maxY2 - minY2;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) - minX) / sx, (pos.getY(i) - minY2) / sy);
  }
  const fm = mesh(g, faceGeo, textured(tex, 0.85, {}), 0, lift, 0.034);
  fm.userData.sourcePhoto = d.sourcePhoto;
  // Rear magnet discs on the back face, centered vertically on the magnet body.
  const pts = outer.getPoints(48);
  let maxY = -Infinity;
  for (const p of pts) if (p.y > maxY) maxY = p.y;
  magnetBack(g, lift + Math.min(maxY - minY, 0.1) * 0.22, 0.12, -0.02);
  return true;
}

export function buildCustomProduct(group, definition, textures) {
  const tex = textures["art-" + definition.artIndex];
  const m = definition.model;
  if (!m || !tex) return false;
  if (m.startsWith("plate-")) return buildPlate(group, definition, tex, m);
  if (m.startsWith("dish-")) return buildDish(group, definition, tex, m);
  if (m.startsWith("cloth-")) return buildCloth(group, definition, tex, m);
  if (m.startsWith("pen-")) return buildPen(group, definition, tex, m);
  if (m.startsWith("cs-")) return buildCoaster(group, definition, tex, m);
  if (m.startsWith("jn-")) return buildJournal(group, definition, tex, m);
  if (m.startsWith("mg-")) return buildMagnet(group, definition, tex, m);
  return false;
}

export function decorateShop({ room, colliders, fixtures, textures, collection }) {
  // Optional architecture; the authored manifest already carries the full room.
}
