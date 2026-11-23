import * as THREE from 'three';

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')];
}

function addPaperNoise(ctx, w, h, alpha = 0.035) {
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 255 * alpha;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

export function createMarbleTexture() {
  const [canvas, ctx] = makeCanvas(1024, 1024);
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#f5efe6');
  grad.addColorStop(0.5, '#efe6da');
  grad.addColorStop(1, '#f7f2eb');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft cloudy marble patches
  for (let i = 0; i < 28; i++) {
    const x = (Math.sin(i * 4.17) * 0.5 + 0.5) * 1024;
    const y = (Math.cos(i * 2.93) * 0.5 + 0.5) * 1024;
    const r = 120 + (i % 5) * 55;
    const g = ctx.createRadialGradient(x, y, 8, x, y, r);
    g.addColorStop(0, i % 2 === 0 ? 'rgba(218, 202, 184, 0.24)' : 'rgba(255, 252, 247, 0.35)');
    g.addColorStop(1, 'rgba(245, 239, 230, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Organic golden-taupe and warm grey veins
  const drawVein = (startX, startY, angle, length, color, width) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    let x = startX;
    let y = startY;
    ctx.moveTo(x, y);
    const steps = 42;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const wave = Math.sin(t * 11 + startX * 0.02) * 14 + Math.cos(t * 23 + startY * 0.01) * 6;
      x += Math.cos(angle) * (length / steps) + Math.sin(angle) * wave * 0.28;
      y += Math.sin(angle) * (length / steps) - Math.cos(angle) * wave * 0.28;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  for (let i = 0; i < 16; i++) {
    drawVein(
      (i * 97) % 1024,
      (i * 151) % 1024,
      0.35 + (i % 4) * 0.25,
      580 + (i % 3) * 200,
      i % 3 === 0 ? 'rgba(181, 152, 118, 0.22)' : 'rgba(164, 152, 138, 0.16)',
      1 + (i % 3) * 1.1
    );
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createWoodTexture(tint = '#e4c79c') {
  const [canvas, ctx] = makeCanvas(512, 512);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 90; i++) {
    const y = (i / 90) * 512;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(162, 118, 72, 0.16)' : 'rgba(205, 168, 120, 0.14)';
    ctx.lineWidth = 1 + (i % 4);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.025 + i * 0.7) * 3.5);
    }
    ctx.stroke();
  }
  addPaperNoise(ctx, 512, 512, 0.03);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTopSealTexture() {
  const [canvas, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);

  // Subtle translucent white circular sticker
  ctx.fillStyle = 'rgba(255, 252, 247, 0.86)';
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(98, 76, 56, 0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 128, 98, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(128, 128, 72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#4a3828';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 44px Georgia, "Times New Roman", serif';
  ctx.fillText('MU', 128, 124);

  ctx.font = '600 13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('HOME FRAGRANCE', 128, 164);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBackingCardTexture() {
  const [canvas, ctx] = makeCanvas(1024, 1280);
  const grad = ctx.createLinearGradient(0, 0, 0, 1280);
  grad.addColorStop(0, '#ebe5dc');
  grad.addColorStop(0.55, '#dfd8ce');
  grad.addColorStop(1, '#d3cbc0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1280);

  // Soft studio highlight radial
  const glow = ctx.createRadialGradient(512, 340, 40, 512, 340, 460);
  glow.addColorStop(0, 'rgba(255, 251, 244, 0.55)');
  glow.addColorStop(1, 'rgba(255, 251, 244, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 1280);

  addPaperNoise(ctx, 1024, 1280, 0.025);

  ctx.fillStyle = '#3f2c1f';
  ctx.textAlign = 'center';
  ctx.font = '600 84px Georgia, "Times New Roman", serif';
  ctx.fillText('Mee Ume', 498, 240);

  ctx.font = '600 26px "Segoe UI", Arial, sans-serif';
  ctx.fillText('™', 696, 200);

  ctx.fillStyle = '#4d3a2c';
  ctx.font = '500 34px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText('润 香 大 师 创 香 室', 512, 306);

  ctx.fillStyle = '#604b3c';
  ctx.font = '400 23px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Indoor Fragrance Creation Room', 512, 348);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawDesertDaisy(ctx, cx, cy, scale = 1, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Embossed taupe leaf petals behind
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 2 + 0.35);
    const lg = ctx.createLinearGradient(0, 0, 90, 0);
    lg.addColorStop(0, 'rgba(164, 126, 92, 0.78)');
    lg.addColorStop(1, 'rgba(196, 162, 128, 0.45)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(54, 0, 42, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Cream outer petals
  for (let i = 0; i < 9; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 9);
    ctx.fillStyle = 'rgba(249, 241, 224, 0.92)';
    ctx.strokeStyle = 'rgba(205, 179, 144, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(34, 0, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Warm gold center with dots
  ctx.fillStyle = '#f2dca9';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  const dots = [
    [0, 0],
    [-9, -5],
    [9, -6],
    [-7, 8],
    [8, 7],
    [0, -11],
    [1, 11],
  ];
  ctx.fillStyle = '#b97728';
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, 3.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLavenderSprig(ctx, x, y, scale = 1, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  // Delicate stem
  ctx.strokeStyle = 'rgba(130, 128, 124, 0.65)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.quadraticCurveTo(10, 80, -4, -135);
  ctx.stroke();

  // Small sage-teal leaves near base
  const leaves = [
    [-2, 125, -0.55],
    [4, 95, 0.5],
    [-1, 55, -0.45],
  ];
  for (const [lx, ly, la] of leaves) {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(la);
    ctx.fillStyle = 'rgba(72, 118, 118, 0.72)';
    ctx.beginPath();
    ctx.ellipse(0, -14, 5, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Purple florets clustered upward
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const py = 50 - t * 182;
    const px = Math.sin(t * 2.5) * 4 + (i % 2 === 0 ? -9 : 9);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(i % 2 === 0 ? -0.35 : 0.35);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(148, 114, 182, 0.85)' : 'rgba(176, 146, 206, 0.85)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

export function createSleeveTexture(variant = 'desert') {
  const [canvas, ctx] = makeCanvas(1024, 1024);

  // Textured cream paperboard base
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#f5f0e8');
  grad.addColorStop(0.5, '#efe8de');
  grad.addColorStop(1, '#e7dfd3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle embossed botanical linework
  ctx.strokeStyle = 'rgba(218, 208, 194, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(160 + i * 35, 700, 120 + i * 18, Math.PI * 1.1, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(864 - i * 35, 700, 120 + i * 18, Math.PI * 1.2, Math.PI * 1.9);
    ctx.stroke();
  }

  addPaperNoise(ctx, 1024, 1024, 0.032);

  if (variant === 'desert') {
    // Desert Water floral motifs matching image 1
    drawDesertDaisy(ctx, 125, 595, 1.15, -0.25);
    drawDesertDaisy(ctx, 185, 845, 1.35, 0.2);
    drawDesertDaisy(ctx, 72, 930, 0.9, -0.4);
    drawDesertDaisy(ctx, 845, 815, 1.4, -0.3);
    drawDesertDaisy(ctx, 935, 935, 0.95, 0.35);
    drawDesertDaisy(ctx, 900, 560, 0.85, 0.5);
  } else {
    // Solitary Oriental lavender sprigs matching image 2
    drawLavenderSprig(ctx, 118, 690, 1.2, -0.18);
    drawLavenderSprig(ctx, 178, 795, 1.1, 0.14);
    drawLavenderSprig(ctx, 88, 860, 0.95, -0.28);

    drawLavenderSprig(ctx, 905, 690, 1.2, 0.18);
    drawLavenderSprig(ctx, 842, 795, 1.1, -0.14);
    drawLavenderSprig(ctx, 934, 860, 0.95, 0.28);
  }

  // Sleeve text sits cleanly in the lower center well below the U-cutout (cutout ends at canvas y ~ 582)
  ctx.textAlign = 'center';
  ctx.fillStyle = variant === 'desert' ? '#463121' : '#3e2c25';

  ctx.font = '700 48px Georgia, "Times New Roman", serif';
  ctx.fillText(variant === 'desert' ? 'Desert Water' : 'Solitary Oriental', 512, 658);

  ctx.font = '600 36px Georgia, "Times New Roman", serif';
  ctx.fillText('Flameless', 512, 730);
  ctx.fillText('Aromatherapy', 512, 774);

  // Thin short horizontal separator
  ctx.strokeStyle = 'rgba(92, 68, 52, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(486, 808);
  ctx.lineTo(538, 808);
  ctx.stroke();

  ctx.fillStyle = '#5a4334';
  ctx.font = '500 27px Georgia, "Times New Roman", serif';
  ctx.fillText(variant === 'desert' ? 'Essential Oil Diffuser' : 'Lavender', 512, 858);

  ctx.fillStyle = '#6f5848';
  ctx.font = '400 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('French fragrance  |  Master perfumer', 512, 922);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
