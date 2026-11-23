import { getActiveStep } from '../scene/timeline.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t) {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}

function fadeWindow(time, start, end, fadeIn = 0.55, fadeOut = 0.55) {
  if (time < start || time > end) return 0;
  const a = clamp01((time - start) / fadeIn);
  const b = clamp01((end - time) / fadeOut);
  return Math.min(a, b);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBrandLockup(ctx, cx, cy, scale, alpha, inkColor = '#4c3423') {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.fillStyle = inkColor;

  ctx.font = '600 68px Georgia, "Times New Roman", serif';
  ctx.fillText('Mee Ume', -10, 0);
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('™', 152, -32);

  // Thin horizontal hairline
  ctx.strokeStyle = 'rgba(92, 65, 45, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-165, 16);
  ctx.lineTo(165, 16);
  ctx.stroke();

  ctx.font = '500 21px "Segoe UI", Arial, sans-serif';
  ctx.fillText('H O M E   F R A G R A N C E', 0, 44);

  // Script tagline
  ctx.font = 'italic 400 32px Georgia, "Palatino Linotype", serif';
  ctx.fillStyle = '#5c4130';
  ctx.fillText('A touch of calm in every space.', 0, 92);

  // Heart ornament rule
  ctx.strokeStyle = 'rgba(92, 65, 45, 0.35)';
  ctx.beginPath();
  ctx.moveTo(-110, 114);
  ctx.lineTo(-18, 114);
  ctx.moveTo(18, 114);
  ctx.lineTo(110, 114);
  ctx.stroke();

  ctx.font = '400 18px Georgia, serif';
  ctx.fillText('♡', 0, 120);

  ctx.restore();
}

function drawFeatureIcon(ctx, type, cx, cy, r, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = 'rgba(255, 250, 243, 0.78)';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const s = r * 0.48;
  ctx.lineWidth = 2.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.6, s * 0.65);
    ctx.quadraticCurveTo(-s * 0.65, -s * 0.55, s * 0.65, -s * 0.65);
    ctx.quadraticCurveTo(s * 0.65, s * 0.55, -s * 0.6, s * 0.65);
    ctx.moveTo(-s * 0.6, s * 0.65);
    ctx.lineTo(s * 0.35, -s * 0.35);
    ctx.stroke();
  } else if (type === 'flameless') {
    // Flame outline
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.72);
    ctx.bezierCurveTo(s * 0.55, -s * 0.15, s * 0.55, s * 0.65, 0, s * 0.65);
    ctx.bezierCurveTo(-s * 0.55, s * 0.65, -s * 0.55, -s * 0.15, 0, -s * 0.72);
    ctx.stroke();
    // Diagonal slash
    ctx.beginPath();
    ctx.moveTo(-s * 0.68, -s * 0.68);
    ctx.lineTo(s * 0.68, s * 0.68);
    ctx.stroke();
  } else if (type === 'lotus') {
    // Center petal
    ctx.beginPath();
    ctx.moveTo(0, s * 0.55);
    ctx.quadraticCurveTo(s * 0.4, 0, 0, -s * 0.65);
    ctx.quadraticCurveTo(-s * 0.4, 0, 0, s * 0.55);
    ctx.stroke();
    // Side petals
    ctx.beginPath();
    ctx.moveTo(0, s * 0.55);
    ctx.quadraticCurveTo(-s * 0.85, s * 0.25, -s * 0.65, -s * 0.35);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.15, 0, s * 0.55);
    ctx.moveTo(0, s * 0.55);
    ctx.quadraticCurveTo(s * 0.85, s * 0.25, s * 0.65, -s * 0.35);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.15, 0, s * 0.55);
    ctx.stroke();
  } else if (type === 'home') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.05);
    ctx.lineTo(0, -s * 0.68);
    ctx.lineTo(s * 0.7, -s * 0.05);
    ctx.moveTo(-s * 0.5, -s * 0.22);
    ctx.lineTo(-s * 0.5, s * 0.6);
    ctx.lineTo(s * 0.5, s * 0.6);
    ctx.lineTo(s * 0.5, -s * 0.22);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderHudOverlay(ctx, width, height, { time, aspectMode, showCaptions }) {
  ctx.clearRect(0, 0, width, height);
  const isVertical = aspectMode === '9:16';
  const unit = isVertical ? width / 1080 : height / 1080;

  // Soft warm vignette framing
  const vig = ctx.createRadialGradient(
    width * 0.5,
    height * 0.48,
    Math.min(width, height) * 0.32,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.72
  );
  vig.addColorStop(0, 'rgba(255, 250, 243, 0)');
  vig.addColorStop(1, 'rgba(130, 102, 74, 0.14)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);

  // Subtle top-corner persistent promo pill (Steps 2-9)
  if (time >= 4.0 && time < 38.5) {
    const pillAlpha = fadeWindow(time, 4.0, 38.5, 0.6, 0.5) * 0.92;
    ctx.save();
    ctx.globalAlpha = pillAlpha;
    const pw = 310 * unit;
    const ph = 52 * unit;
    const px = isVertical ? (width - pw) / 2 : width - pw - 42 * unit;
    const py = isVertical ? 46 * unit : 38 * unit;
    ctx.fillStyle = 'rgba(68, 45, 29, 0.86)';
    drawRoundedRect(ctx, px, py, pw, ph, ph / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 198, 134, 0.75)';
    ctx.lineWidth = 1.5 * unit;
    ctx.stroke();

    ctx.fillStyle = '#f8e6c1';
    ctx.font = `600 ${19 * unit}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('25% OFF  •  2 FOR GH₵300', px + pw / 2, py + ph / 2);
    ctx.restore();
  }

  // STEP 1 (0 - 4.0s): Brand Opening Reveal
  if (time < 4.2) {
    const alpha = fadeWindow(time, 0.25, 4.1, 0.85, 0.6);
    const cy = isVertical ? height * 0.19 : height * 0.21;
    drawBrandLockup(ctx, width * 0.5, cy, unit * (isVertical ? 1.05 : 1.0), alpha);
  }

  // STEP 3 (8.5 - 13.0s): Desert Water Typography
  if (time >= 8.5 && time <= 13.2) {
    const a1 = fadeWindow(time, 8.6, 13.1, 0.55, 0.5);
    const a2 = fadeWindow(time, 9.6, 13.1, 0.55, 0.5);
    const a3 = fadeWindow(time, 10.6, 13.1, 0.55, 0.5);

    ctx.save();
    const tx = isVertical ? width * 0.5 : width * 0.24;
    const ty = isVertical ? height * 0.095 : height * 0.42;
    ctx.textAlign = isVertical ? 'center' : 'left';

    ctx.globalAlpha = a1;
    ctx.fillStyle = '#3d2a1d';
    ctx.font = `700 ${54 * unit}px Georgia, serif`;
    ctx.fillText('DESERT WATER', tx, ty);

    ctx.globalAlpha = a2;
    ctx.fillStyle = '#4e6f84';
    ctx.font = `600 ${28 * unit}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText('Flameless Aromatherapy', tx, ty + 48 * unit);

    ctx.globalAlpha = a3;
    ctx.fillStyle = '#6c5646';
    ctx.font = `400 ${24 * unit}px Georgia, serif`;
    ctx.fillText('Essential Oil Diffuser', tx, ty + 88 * unit);
    ctx.restore();
  }

  // STEP 4 (13.0 - 17.0s): Subtle Fragrance Flow Caption
  if (time >= 13.2 && time <= 17.0) {
    const alpha = fadeWindow(time, 13.3, 16.9, 0.5, 0.5);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4a372a';
    ctx.font = `italic 400 ${32 * unit}px Georgia, serif`;
    ctx.fillText('Pure botanical serenity in every breath', width * 0.5, isVertical ? height * 0.1 : height * 0.16);
    ctx.restore();
  }

  // STEP 6 (21.5 - 25.5s): Solitary Oriental Lavender Typography
  if (time >= 21.5 && time <= 25.6) {
    const a1 = fadeWindow(time, 21.6, 25.5, 0.55, 0.5);
    const a2 = fadeWindow(time, 22.4, 25.5, 0.55, 0.5);
    ctx.save();
    const tx = isVertical ? width * 0.5 : width * 0.76;
    const ty = isVertical ? height * 0.1 : height * 0.42;
    ctx.textAlign = isVertical ? 'center' : 'right';

    ctx.globalAlpha = a1;
    ctx.fillStyle = '#3f2b38';
    ctx.font = `700 ${50 * unit}px Georgia, serif`;
    ctx.fillText('SOLITARY ORIENTAL', tx, ty);

    ctx.globalAlpha = a2;
    ctx.fillStyle = '#744b8f';
    ctx.font = `500 ${34 * unit}px Georgia, serif`;
    ctx.fillText('Lavender', tx, ty + 52 * unit);
    ctx.restore();
  }

  // STEP 7 (25.5 - 30.5s): 4 Feature Highlights with Exact Icons
  if (time >= 25.5 && time <= 30.6) {
    const features = [
      { icon: 'leaf', label: 'Long-lasting Fragrance', appear: 25.7 },
      { icon: 'flameless', label: 'Flameless & Safe', appear: 26.6 },
      { icon: 'lotus', label: 'Elegant Décor', appear: 27.5 },
      { icon: 'home', label: 'Perfect for Home & Office', appear: 28.4 },
    ];
    const groupFadeOut = clamp01((30.6 - time) / 0.45);

    if (isVertical) {
      // Bottom 2x2 clean grid in 9:16
      const cols = 2;
      const cellW = width * 0.42;
      const startX = width * 0.5 - cellW * 0.5;
      const startY = height * 0.74;
      features.forEach((f, idx) => {
        const p = easeOutCubic((time - f.appear) / 0.45) * groupFadeOut;
        if (p <= 0.01) return;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = startX + col * cellW;
        const cy = startY + row * (118 * unit) + (1 - p) * 18 * unit;
        ctx.save();
        ctx.globalAlpha = p;
        drawFeatureIcon(ctx, f.icon, cx, cy, 32 * unit, '#4d3728');
        ctx.fillStyle = '#3f2c1f';
        ctx.font = `600 ${21 * unit}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(f.label, cx, cy + 54 * unit);
        ctx.restore();
      });
    } else {
      // Right-column stack matching the reference images in 16:9
      const rx = width * 0.72;
      const startY = height * 0.27;
      features.forEach((f, idx) => {
        const p = easeOutCubic((time - f.appear) / 0.45) * groupFadeOut;
        if (p <= 0.01) return;
        const cy = startY + idx * (135 * unit);
        const slideX = rx + (1 - p) * 28 * unit;
        ctx.save();
        ctx.globalAlpha = p;
        drawFeatureIcon(ctx, f.icon, slideX, cy, 34 * unit, '#4d3728');
        ctx.fillStyle = '#3f2c1f';
        ctx.font = `600 ${26 * unit}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.label, slideX + 54 * unit, cy);
        ctx.restore();
      });
    }
  }

  // STEP 8 (30.5 - 34.5s): Home & Office Transformation Labels
  if (time >= 30.5 && time <= 34.5) {
    const isOffice = time >= 32.4;
    const alpha = isOffice
      ? fadeWindow(time, 32.4, 34.5, 0.35, 0.35)
      : fadeWindow(time, 30.6, 32.45, 0.35, 0.35);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    const yTop = isVertical ? height * 0.16 : height * 0.15;

    ctx.fillStyle = '#4c3526';
    ctx.font = `700 ${24 * unit}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(isOffice ? 'FOR YOUR OFFICE' : 'FOR YOUR HOME', width * 0.5, yTop);

    ctx.fillStyle = '#6c5443';
    ctx.font = `400 ${26 * unit}px Georgia, serif`;
    ctx.fillText(
      isOffice ? 'Executive Desk  •  Reception  •  Modern Workspace' : 'Living Room  •  Bedroom  •  Spa Sanctuary',
      width * 0.5,
      yTop + 40 * unit
    );
    ctx.restore();
  }

  // STEP 10 (38.5 - 42.0s): Final Brand Reveal + 25% OFF / 2 for GH₵300 Offer
  if (time >= 38.5) {
    const p = easeOutCubic((time - 38.5) / 0.85);
    const offerP = easeOutCubic((time - 39.1) / 0.65);

    // Subtle soft warm cream veil behind text for legibility
    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, `rgba(248, 242, 232, ${0.48 * p})`);
    veil.addColorStop(0.42, `rgba(248, 242, 232, ${0.06 * p})`);
    veil.addColorStop(0.72, `rgba(248, 242, 232, ${0.8 * p})`);
    veil.addColorStop(1, `rgba(246, 238, 225, ${0.95 * p})`);
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);

    drawBrandLockup(
      ctx,
      width * 0.5,
      isVertical ? height * 0.15 : height * 0.17,
      unit * (isVertical ? 0.96 : 0.92),
      p
    );

    // Feature summary line
    ctx.save();
    ctx.globalAlpha = p;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5b4333';
    ctx.font = `500 ${isVertical ? 22 * unit : 23 * unit}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(
      'Flameless Aromatherapy  •  Elegant Décor  •  Long-lasting Fragrance',
      width * 0.5,
      isVertical ? height * 0.72 : height * 0.74
    );
    ctx.restore();

    // Special Offer Card: 25% Discount — 2 for GH₵300
    if (offerP > 0.01) {
      ctx.save();
      ctx.globalAlpha = offerP;
      const cardW = isVertical ? width * 0.84 : 680 * unit;
      const cardH = isVertical ? 176 * unit : 138 * unit;
      const cardX = (width - cardW) / 2;
      const cardY = (isVertical ? height * 0.765 : height * 0.785) + (1 - offerP) * 20 * unit;

      const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      cardGrad.addColorStop(0, '#3e291b');
      cardGrad.addColorStop(1, '#583b27');
      ctx.fillStyle = cardGrad;
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 22 * unit);
      ctx.fill();

      ctx.strokeStyle = '#e5c17d';
      ctx.lineWidth = 2.5 * unit;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f6d694';
      ctx.font = `700 ${21 * unit}px "Segoe UI", Arial, sans-serif`;
      ctx.fillText('🔥  SPECIAL OFFER  •  MASSIVE 25% DISCOUNT', width * 0.5, cardY + 42 * unit);

      ctx.fillStyle = '#fff9f0';
      ctx.font = `700 ${isVertical ? 40 * unit : 38 * unit}px Georgia, serif`;
      ctx.fillText('2 Diffusers for Just GH₵300', width * 0.5, cardY + (isVertical ? 100 * unit : 94 * unit));

      ctx.fillStyle = '#e7d5bc';
      ctx.font = `400 ${19 * unit}px "Segoe UI", Arial, sans-serif`;
      ctx.fillText('Desert Water  +  Solitary Oriental  •  Limited-Time Bundle', width * 0.5, cardY + (isVertical ? 142 * unit : 122 * unit));
      ctx.restore();
    }

    // Soft fade to warm cream in final 0.5s
    if (time > 41.4) {
      const endFade = clamp01((time - 41.4) / 0.6) * 0.55;
      ctx.fillStyle = `rgba(247, 240, 229, ${endFade})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Optional Voiceover Captions bar
  if (showCaptions && time < 38.4) {
    const step = getActiveStep(time);
    ctx.save();
    const maxW = isVertical ? width * 0.86 : width * 0.62;
    const boxH = 54 * unit;
    const bx = (width - maxW) / 2;
    const by = height - boxH - (isVertical ? 46 * unit : 30 * unit);

    ctx.fillStyle = 'rgba(42, 30, 22, 0.64)';
    drawRoundedRect(ctx, bx, by, maxW, boxH, 14 * unit);
    ctx.fill();

    ctx.fillStyle = '#faf3e8';
    ctx.font = `400 ${19 * unit}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(step.voiceover, width * 0.5, by + boxH / 2, maxW - 32 * unit);
    ctx.restore();
  }
}
