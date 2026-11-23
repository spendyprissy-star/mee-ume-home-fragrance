import * as THREE from 'three';
import {
  createBackingCardTexture,
  createSleeveTexture,
  createTopSealTexture,
  createWoodTexture,
} from './textures.js';

function normalizeShapeUVs(geometry, minX, maxX, minY, maxY) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const w = maxX - minX;
  const h = maxY - minY;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, (x - minX) / w, (y - minY) / h);
  }
  uv.needsUpdate = true;
}

function createHydrangeaFloret(colorHex, centerColorHex = 0xf4f2cc) {
  const floret = new THREE.Group();
  const petalGeo = new THREE.SphereGeometry(0.055, 12, 10);
  petalGeo.scale(1.15, 0.28, 0.88);
  const petalMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.52,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(petalGeo, petalMat);
    const a = (i * Math.PI) / 2;
    p.position.set(Math.cos(a) * 0.048, 0, Math.sin(a) * 0.048);
    p.rotation.y = -a;
    p.rotation.z = 0.22;
    floret.add(p);
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 8, 8),
    new THREE.MeshStandardMaterial({ color: centerColorHex, roughness: 0.6 })
  );
  center.position.y = 0.01;
  floret.add(center);
  return floret;
}

function createHydrangeaBouquet() {
  const group = new THREE.Group();
  const palette = [0x82caf2, 0x99d6f8, 0x6cb8e6, 0xa8e0fc, 0x76c2ee];
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x628b5a, roughness: 0.7 });

  // Stems
  for (let s = 0; s < 5; s++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.55, 8), stemMat);
    stem.position.set((s - 2) * 0.04, -0.24, (s % 2 - 0.5) * 0.04);
    stem.rotation.z = (s - 2) * 0.09;
    group.add(stem);
  }

  // Volumetric dome of hydrangea florets
  const count = 22;
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 0.165 + (i % 3) * 0.025;
    const floret = createHydrangeaFloret(palette[i % palette.length]);
    floret.position.set(
      Math.sin(phi) * Math.cos(theta) * r * 1.15,
      Math.cos(phi) * r * 0.95,
      Math.sin(phi) * Math.sin(theta) * r * 0.85
    );
    floret.lookAt(floret.position.clone().multiplyScalar(2));
    floret.rotateX(Math.PI / 2);
    floret.scale.setScalar(0.95 + (i % 3) * 0.12);
    group.add(floret);
  }

  // Subtle green leaves underneath
  const leafGeo = new THREE.SphereGeometry(0.08, 10, 8);
  leafGeo.scale(1.4, 0.15, 0.75);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5c8c53, roughness: 0.65 });
  for (let l = 0; l < 4; l++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const a = l * 1.55 + 0.4;
    leaf.position.set(Math.cos(a) * 0.16, -0.14, Math.sin(a) * 0.1);
    leaf.rotation.y = -a;
    leaf.rotation.z = -0.35;
    group.add(leaf);
  }

  return group;
}

function createOrientalPurpleFlower() {
  const group = new THREE.Group();

  // Stem
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5b7f4f, roughness: 0.7 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.72, 10), stemMat);
  stem.position.set(0.02, -0.36, -0.02);
  stem.rotation.z = 0.12;
  group.add(stem);

  // Curved large magnolia/oriental petals
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(0.11, 0.08, 0.14, 0.24, 0, 0.34);
  petalShape.bezierCurveTo(-0.14, 0.24, -0.11, 0.08, 0, 0);

  const petalGeo = new THREE.ShapeGeometry(petalShape, 14);
  const pos = petalGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Cup the petal inward cleanly
    const cup = (x * x) * 1.4 + Math.sin((y / 0.34) * Math.PI) * 0.045;
    pos.setZ(i, cup);
  }
  petalGeo.computeVertexNormals();

  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x8656a8,
    roughness: 0.46,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xa67ec4,
    roughness: 0.42,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });

  // 6 outer petals + 4 inner petals
  for (let i = 0; i < 6; i++) {
    const p = new THREE.Mesh(petalGeo, i % 2 === 0 ? outerMat : innerMat);
    const a = (i * Math.PI * 2) / 6;
    p.rotation.z = a;
    p.rotation.x = -0.68;
    p.scale.setScalar(1.02);
    group.add(p);
  }
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(petalGeo, innerMat);
    const a = (i * Math.PI * 2) / 4 + 0.4;
    p.rotation.z = a;
    p.rotation.x = -0.92;
    p.scale.setScalar(0.78);
    group.add(p);
  }

  // Cream-white stamen cluster in center
  const stamenGroup = new THREE.Group();
  const filamentMat = new THREE.MeshStandardMaterial({ color: 0xf7f0d6, roughness: 0.55 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xe6d495, roughness: 0.5 });
  for (let s = 0; s < 16; s++) {
    const a = (s / 16) * Math.PI * 2;
    const tilt = 0.2 + (s % 3) * 0.14;
    const holder = new THREE.Group();
    const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.075, 6), filamentMat);
    fil.position.y = 0.038;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), tipMat);
    tip.position.y = 0.078;
    holder.add(fil, tip);
    holder.rotation.y = a;
    holder.rotation.z = tilt;
    stamenGroup.add(holder);
  }
  stamenGroup.rotation.x = Math.PI / 2 - 0.15;
  stamenGroup.position.z = 0.04;
  group.add(stamenGroup);

  group.rotation.x = -0.22;
  group.rotation.y = 0.18;
  return group;
}

export function createLavenderSpike(height = 0.48, colorHex = 0x764396) {
  const spike = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.008, height, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c7c52, roughness: 0.75 })
  );
  stem.position.y = height * 0.5;
  spike.add(stem);

  const budGeo = new THREE.SphereGeometry(0.017, 7, 7);
  budGeo.scale(0.85, 1.35, 0.85);
  const budMat1 = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.62 });
  const budMat2 = new THREE.MeshStandardMaterial({ color: 0x9968ba, roughness: 0.62 });

  const startY = height * 0.42;
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const y = startY + t * (height * 0.58);
    const angle = i * 1.45;
    const radius = 0.018 * (1 - t * 0.45);
    const bud = new THREE.Mesh(budGeo, i % 2 === 0 ? budMat1 : budMat2);
    bud.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    bud.rotation.z = Math.cos(angle) * 0.35;
    spike.add(bud);
  }
  return spike;
}

function createDiffuserBottle(variant, woodTex) {
  const bottle = new THREE.Group();

  // Matte black base collar ring
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.215, 0.068, 40),
    new THREE.MeshStandardMaterial({ color: 0x191716, roughness: 0.42, metalness: 0.15 })
  );
  collar.position.y = 0.034;
  collar.castShadow = true;
  bottle.add(collar);

  // Clear glass apothecary bottle (Lathe profile matching reference photo)
  const glassPoints = [
    new THREE.Vector2(0.01, 0.04),
    new THREE.Vector2(0.185, 0.04),
    new THREE.Vector2(0.205, 0.07),
    new THREE.Vector2(0.202, 0.14),
    new THREE.Vector2(0.165, 0.21),
    new THREE.Vector2(0.095, 0.255),
    new THREE.Vector2(0.088, 0.32),
    new THREE.Vector2(0.125, 0.345),
    new THREE.Vector2(0.125, 0.362),
    new THREE.Vector2(0.085, 0.362),
    new THREE.Vector2(0.08, 0.32),
  ];
  const glassGeo = new THREE.LatheGeometry(glassPoints, 44);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.9,
    transparent: true,
    opacity: 0.95,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.5,
    thickness: 0.35,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.castShadow = true;
  bottle.add(glassMesh);

  // Inner oil liquid volume
  const liquidPoints = [
    new THREE.Vector2(0.0, 0.055),
    new THREE.Vector2(0.175, 0.055),
    new THREE.Vector2(0.182, 0.12),
    new THREE.Vector2(0.145, 0.165),
    new THREE.Vector2(0.0, 0.165),
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidPoints, 32);
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: variant === 'desert' ? 0xdbeaf2 : 0x26211e,
    transmission: variant === 'desert' ? 0.72 : 0.22,
    transparent: true,
    opacity: variant === 'desert' ? 0.75 : 0.92,
    roughness: 0.08,
    ior: 1.42,
  });
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  bottle.add(liquidMesh);

  // Turned natural wooden stopper cap
  const capPoints = [
    new THREE.Vector2(0.0, 0.27),
    new THREE.Vector2(0.072, 0.27),
    new THREE.Vector2(0.076, 0.355),
    new THREE.Vector2(0.118, 0.365),
    new THREE.Vector2(0.122, 0.47),
    new THREE.Vector2(0.112, 0.482),
    new THREE.Vector2(0.0, 0.482),
  ];
  const capGeo = new THREE.LatheGeometry(capPoints, 36);
  const capMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.58,
    metalness: 0.02,
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.castShadow = true;
  bottle.add(capMesh);

  return bottle;
}

export function createMeeUmeProduct(variant = 'desert') {
  const root = new THREE.Group();
  root.name = `mee-ume-${variant}`;

  const W = 1.18;
  const H = 1.82;
  const D = 0.72;

  const woodTex = createWoodTexture();
  const backingTex = createBackingCardTexture();
  const sleeveTex = createSleeveTexture(variant);
  const sealTex = createTopSealTexture();

  // 1. Arched cream inner backing card
  const archShape = new THREE.Shape();
  const bw = W * 0.92;
  const bh = H * 0.87;
  archShape.moveTo(-bw / 2, 0.03);
  archShape.lineTo(bw / 2, 0.03);
  archShape.lineTo(bw / 2, bh * 0.82);
  archShape.quadraticCurveTo(bw / 2, bh, 0, bh);
  archShape.quadraticCurveTo(-bw / 2, bh, -bw / 2, bh * 0.82);
  archShape.closePath();

  const archGeo = new THREE.ShapeGeometry(archShape, 28);
  normalizeShapeUVs(archGeo, -bw / 2, bw / 2, 0.03, bh);
  const archMat = new THREE.MeshStandardMaterial({
    map: backingTex,
    roughness: 0.78,
    side: THREE.DoubleSide,
  });
  const archCard = new THREE.Mesh(archGeo, archMat);
  archCard.position.z = -D * 0.24;
  root.add(archCard);

  // Cream interior floor platform
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.96, 0.04, D * 0.94),
    new THREE.MeshStandardMaterial({ color: 0xe6ded2, roughness: 0.72 })
  );
  floor.position.y = 0.02;
  root.add(floor);

  // 2. Fragrance reeds (left-back inside box)
  const reedsGroup = new THREE.Group();
  const reedMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.68 });
  for (let r = 0; r < 7; r++) {
    const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.16, 8), reedMat);
    const spread = (r - 3) * 0.024;
    reed.position.set(-0.26 + spread, 1.08, -0.06 + (r % 2) * 0.025);
    reed.rotation.z = -spread * 0.28;
    reed.rotation.x = ((r % 3) - 1) * 0.02;
    reed.castShadow = true;
    reedsGroup.add(reed);
  }
  root.add(reedsGroup);
  root.userData.reedsGroup = reedsGroup;

  // 3. Variant Floral Arrangement inside box
  const floralGroup = new THREE.Group();
  if (variant === 'desert') {
    const bouquet = createHydrangeaBouquet();
    bouquet.position.set(-0.18, 0.78, 0.04);
    floralGroup.add(bouquet);
  } else {
    const orientalFlower = createOrientalPurpleFlower();
    orientalFlower.position.set(-0.18, 0.88, 0.08);
    floralGroup.add(orientalFlower);

    // Purple lavender cluster on right-back behind the bottle
    const lavCluster = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const spike = createLavenderSpike(0.42 + (i % 3) * 0.07, i % 2 === 0 ? 0x6f398e : 0x874da8);
      spike.position.set(0.14 + (i % 4) * 0.065, 0.34, -0.06 - Math.floor(i / 4) * 0.05);
      spike.rotation.z = (i - 3.5) * 0.08;
      spike.rotation.x = 0.08;
      lavCluster.add(spike);
    }
    floralGroup.add(lavCluster);
  }
  root.add(floralGroup);
  root.userData.floralGroup = floralGroup;

  // 4. Diffuser Bottle (center-right front, visible through cutout)
  const bottle = createDiffuserBottle(variant, woodTex);
  bottle.position.set(0.11, 0.38, 0.08);
  root.add(bottle);
  root.userData.bottle = bottle;

  // 5. Scalloped Die-Cut Lower Paperboard Sleeve
  const sleeveH = 1.02;
  const hw = W / 2;
  const sleeveShape = new THREE.Shape();
  sleeveShape.moveTo(-hw, 0);
  sleeveShape.lineTo(hw, 0);
  sleeveShape.lineTo(hw, 0.82);
  // Right scalloped ear curving down into bottle window
  sleeveShape.bezierCurveTo(hw * 0.82, 0.9, hw * 0.56, 0.84, 0.32, 0.68);
  sleeveShape.bezierCurveTo(0.27, 0.44, -0.14, 0.44, -0.19, 0.69);
  // Left scalloped ear curving down to left edge
  sleeveShape.bezierCurveTo(-0.34, 0.83, -0.49, 0.8, -hw, 0.86);
  sleeveShape.closePath();

  const frontSleeveGeo = new THREE.ExtrudeGeometry(sleeveShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 28,
  });
  normalizeShapeUVs(frontSleeveGeo, -hw, hw, 0, sleeveH);

  const sleeveFrontMat = new THREE.MeshStandardMaterial({
    map: sleeveTex,
    roughness: 0.84,
    metalness: 0.02,
  });
  const sleeveSideMat = new THREE.MeshStandardMaterial({
    color: 0xf0e9df,
    roughness: 0.85,
  });

  const frontSleeve = new THREE.Mesh(frontSleeveGeo, [sleeveFrontMat, sleeveSideMat]);
  frontSleeve.position.set(0, 0.002, D / 2 - 0.018);
  frontSleeve.castShadow = true;
  frontSleeve.receiveShadow = true;
  root.add(frontSleeve);

  // Side & back lower sleeve wrap so 180/360 degree orbit is seamless
  const backSleeve = new THREE.Mesh(new THREE.BoxGeometry(W - 0.01, 0.84, 0.018), sleeveSideMat);
  backSleeve.position.set(0, 0.422, -D / 2 + 0.01);
  root.add(backSleeve);

  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.85, D - 0.02), sleeveSideMat);
  leftSleeve.position.set(-W / 2 + 0.009, 0.426, 0);
  root.add(leftSleeve);

  const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.82, D - 0.02), sleeveSideMat);
  rightSleeve.position.set(W / 2 - 0.009, 0.412, 0);
  root.add(rightSleeve);

  // 6. Outer Transparent Acrylic Display Box + Specular Edges + MU Top Seal
  const acrylicGeo = new THREE.BoxGeometry(W, H, D);
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.14,
    roughness: 0.04,
    metalness: 0.02,
    ior: 1.49,
    reflectivity: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const acrylicBox = new THREE.Mesh(acrylicGeo, acrylicMat);
  acrylicBox.position.y = H / 2;
  root.add(acrylicBox);

  const edgesGeo = new THREE.EdgesGeometry(acrylicGeo);
  const edgesLine = new THREE.LineSegments(
    edgesGeo,
    new THREE.LineBasicMaterial({ color: 0xfbf8f3, transparent: true, opacity: 0.58 })
  );
  edgesLine.position.y = H / 2;
  root.add(edgesLine);

  // Circular MU top seal sticker
  const seal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.22),
    new THREE.MeshBasicMaterial({ map: sealTex, transparent: true, depthWrite: false })
  );
  seal.position.set(0, H - 0.17, D / 2 + 0.004);
  root.add(seal);

  return root;
}
