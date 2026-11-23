import * as THREE from 'three';
import { createMarbleTexture, createWoodTexture } from '../products/textures.js';
import { createLavenderSpike } from '../products/meeUmeBox.js';

function createBook(title, w, h, d, coverHex) {
  const group = new THREE.Group();
  const coverMat = new THREE.MeshStandardMaterial({ color: coverHex, roughness: 0.78 });
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf6f0e4, roughness: 0.85 });

  const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), coverMat);
  cover.castShadow = true;
  cover.receiveShadow = true;
  group.add(cover);

  const pages = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.82, d * 0.96), pagesMat);
  pages.position.x = 0.02;
  group.add(pages);

  // Spine title texture
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#' + coverHex.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = '#5a4738';
  ctx.font = '500 28px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 48);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spine = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.96, h * 0.88),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 })
  );
  spine.position.z = d / 2 + 0.002;
  group.add(spine);

  return group;
}

function createCandleOnTray() {
  const group = new THREE.Group();

  // Gold-rimmed marble/brass tray
  const tray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.4, 0.05, 36),
    new THREE.MeshStandardMaterial({ color: 0xc8a464, roughness: 0.28, metalness: 0.75 })
  );
  tray.position.y = 0.025;
  tray.castShadow = true;
  tray.receiveShadow = true;
  group.add(tray);

  const innerTray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.052, 36),
    new THREE.MeshStandardMaterial({ color: 0xf4eee5, roughness: 0.45 })
  );
  innerTray.position.y = 0.028;
  group.add(innerTray);

  // Ribbed cream candle
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.36, 28),
    new THREE.MeshStandardMaterial({
      color: 0xf7efe3,
      roughness: 0.52,
      emissive: 0x3b220a,
      emissiveIntensity: 0.25,
    })
  );
  candle.position.y = 0.22;
  candle.castShadow = true;
  group.add(candle);

  // Flame teardrop
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.024, 0.085, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd782 })
  );
  flame.position.y = 0.45;
  group.add(flame);

  const flameLight = new THREE.PointLight(0xffb85c, 1.35, 3.8, 1.6);
  flameLight.position.y = 0.48;
  group.add(flameLight);

  // Subtle green leaves next to candle
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4d7745, roughness: 0.55 });
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), leafMat);
    leaf.scale.set(1.4, 0.15, 0.75);
    leaf.position.set(-0.2 + i * 0.07, 0.075, 0.14 - (i % 2) * 0.06);
    leaf.rotation.y = i * 0.55;
    group.add(leaf);
  }

  group.userData.flame = flame;
  group.userData.flameLight = flameLight;
  return group;
}

function createCeramicVaseWithFlowers() {
  const group = new THREE.Group();
  const points = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.2, 0),
    new THREE.Vector2(0.28, 0.32),
    new THREE.Vector2(0.23, 0.65),
    new THREE.Vector2(0.13, 0.85),
    new THREE.Vector2(0.16, 0.94),
  ];
  const vase = new THREE.Mesh(
    new THREE.LatheGeometry(points, 32),
    new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.32, metalness: 0.04 })
  );
  vase.castShadow = true;
  group.add(vase);

  // White/cream blossoms & green leaves
  const bloomMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.55 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5c8451, roughness: 0.6 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 0.08 + (i % 3) * 0.08;
    const h = 0.98 + (i % 4) * 0.12;
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), bloomMat);
    bloom.scale.set(1.1, 0.7, 1.1);
    bloom.position.set(Math.cos(a) * r, h, Math.sin(a) * r);
    group.add(bloom);

    if (i % 2 === 0) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), leafMat);
      leaf.scale.set(1.5, 0.14, 0.7);
      leaf.position.set(Math.cos(a + 0.3) * (r + 0.11), h - 0.06, Math.sin(a + 0.3) * (r + 0.11));
      leaf.rotation.y = -a;
      group.add(leaf);
    }
  }
  return group;
}

function createFragranceRibbons() {
  const group = new THREE.Group();
  const ribbons = [];

  for (let i = 0; i < 5; i++) {
    const pts = [];
    const phase = i * 1.25;
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const y = 0.75 + t * 1.7;
      const x = Math.sin(t * 4.2 + phase) * (0.28 + t * 0.75) - 0.15;
      const z = Math.cos(t * 3.5 + phase) * (0.22 + t * 0.45);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 64, 0.008 + (i % 2) * 0.004, 8, false);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xa9dcfa : 0xf4ddb8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);
    ribbons.push({ mesh, mat, baseColor: mat.color.clone(), phase });
  }

  group.userData.ribbons = ribbons;
  return group;
}

function createAtmosphericMotes() {
  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6.5;
    positions[i * 3 + 1] = Math.random() * 3.2 + 0.15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xfff3d9,
    size: 0.028,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.userData.basePositions = positions.slice();
  return points;
}

export function createEnvironment() {
  const env = new THREE.Group();

  const marbleTex = createMarbleTexture();
  const woodTex = createWoodTexture('#cfa87b');

  // Polished cream marble tabletop
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.3, 9),
    new THREE.MeshPhysicalMaterial({
      map: marbleTex,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    })
  );
  table.position.y = -0.15;
  table.receiveShadow = true;
  env.add(table);

  // Soft warm cream architectural backdrop wall with window-shadow gradient feel
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf1e7da,
    roughness: 0.92,
  });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), wallMat);
  backWall.position.set(0, 4.2, -3.2);
  backWall.receiveShadow = true;
  env.add(backWall);

  // Subtle decorative gold wall trim frame (seen in reference photo 2 right edge)
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 5.2, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xc9ab70, roughness: 0.3, metalness: 0.7 })
  );
  trim.position.set(2.4, 2.5, -2.9);
  env.add(trim);

  // Left props: Ceramic vase + Kinfolk-style stacked books
  const vase = createCeramicVaseWithFlowers();
  vase.position.set(-2.35, 0.42, -1.05);
  env.add(vase);

  const bookBottom = createBook('Better Living', 1.25, 0.21, 0.9, 0xe8dfd2);
  bookBottom.position.set(-2.25, 0.105, -0.85);
  bookBottom.rotation.y = 0.24;
  env.add(bookBottom);

  const bookTop = createBook('The Kinfolk Home', 1.15, 0.2, 0.84, 0xf2ebe0);
  bookTop.position.set(-2.24, 0.31, -0.86);
  bookTop.rotation.y = 0.18;
  env.add(bookTop);

  // Right props: Lit candle on gold tray
  const candle = createCandleOnTray();
  candle.position.set(2.15, 0, -0.75);
  env.add(candle);

  // Foreground lavender sprigs (shown during Solitary Oriental / Hero scenes)
  const lavenderScatter = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const s = createLavenderSpike(0.55, i % 2 === 0 ? 0x733b94 : 0x8f5cb0);
    s.rotation.z = Math.PI / 2 - 0.18 + (i % 3) * 0.12;
    s.rotation.y = -0.35 + i * 0.22;
    s.position.set(-1.35 + (i % 3) * 0.14, 0.03 + (i % 2) * 0.015, 0.72 + Math.floor(i / 3) * 0.14);
    lavenderScatter.add(s);
  }
  env.add(lavenderScatter);

  // Office architectural accent props (wooden desk trim & minimal brass lamp silhouette, shown in Step 8)
  const officeAccent = new THREE.Group();
  const deskBlotter = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.018, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x3b322b, roughness: 0.75 })
  );
  deskBlotter.position.set(0, 0.009, 0.2);
  officeAccent.add(deskBlotter);

  const woodSidePanel = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 3.2, 0.08),
    new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55 })
  );
  woodSidePanel.position.set(-2.6, 1.6, -2.5);
  officeAccent.add(woodSidePanel);
  officeAccent.visible = false;
  env.add(officeAccent);

  // Sunlit floating dust motes & translucent fragrance ribbons
  const motes = createAtmosphericMotes();
  env.add(motes);

  const ribbons = createFragranceRibbons();
  env.add(ribbons);

  env.userData = {
    candle,
    vase,
    lavenderScatter,
    officeAccent,
    motes,
    ribbons,
    backWallMat: wallMat,
    table,
  };

  return env;
}
