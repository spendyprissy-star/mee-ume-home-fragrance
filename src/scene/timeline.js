import * as THREE from 'three';

export const TOTAL_DURATION = 42.0;

export const STEPS = [
  {
    id: 1,
    start: 0.0,
    end: 4.0,
    label: 'Opening: Calm Luxury',
    voiceover: 'Welcome to Mee Ume Home Fragrance. A touch of calm in every space.',
  },
  {
    id: 2,
    start: 4.0,
    end: 8.5,
    label: 'Product Reveal',
    voiceover: 'Discover beautiful fragrances designed to transform your surroundings.',
  },
  {
    id: 3,
    start: 8.5,
    end: 13.0,
    label: 'Desert Water',
    voiceover: 'From the refreshing floral purity of Desert Water...',
  },
  {
    id: 4,
    start: 13.0,
    end: 17.0,
    label: 'Fragrance Waves',
    voiceover: 'Experience long-lasting fragrance flowing effortlessly through your room.',
  },
  {
    id: 5,
    start: 17.0,
    end: 21.5,
    label: 'Solitary Oriental',
    voiceover: '...to the soothing Lavender elegance of Solitary Oriental.',
  },
  {
    id: 6,
    start: 21.5,
    end: 25.5,
    label: 'Lavender Scene',
    voiceover: 'Crafted to bring warmth, serenity, and balance to your quiet spaces.',
  },
  {
    id: 7,
    start: 25.5,
    end: 30.5,
    label: 'Key Features',
    voiceover: 'Long-lasting fragrance. Flameless and safe. Elegant décor for home and office.',
  },
  {
    id: 8,
    start: 30.5,
    end: 34.5,
    label: 'Home & Office',
    voiceover: 'Perfect for your home. Perfect for your office.',
  },
  {
    id: 9,
    start: 34.5,
    end: 38.5,
    label: 'Hero Duo',
    voiceover: 'Mee Ume Home Fragrance. A touch of calm in every space.',
  },
  {
    id: 10,
    start: 38.5,
    end: 42.0,
    label: '25% Off Offer',
    voiceover: 'Special offer: get two diffusers for just 300 cedis — enjoy 25 percent off today.',
  },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function getActiveStep(time) {
  const t = Math.max(0, Math.min(TOTAL_DURATION - 0.001, time));
  return STEPS.find((s) => t >= s.start && t < s.end) || STEPS[STEPS.length - 1];
}

export function applyTimelineState({
  time,
  aspectMode,
  camera,
  desertBox,
  orientalBox,
  env,
  lights,
  controlsTarget,
  isInspecting,
}) {
  const isVertical = aspectMode === '9:16';
  const zoomScale = isVertical ? 1.38 : 1.0;

  // Gentle breathing/breeze on reeds & flowers
  const breeze = Math.sin(time * 1.4) * 0.018;
  for (const box of [desertBox, orientalBox]) {
    if (box.userData.reedsGroup) {
      box.userData.reedsGroup.rotation.z = breeze;
    }
    if (box.userData.floralGroup) {
      box.userData.floralGroup.rotation.z = breeze * 0.7;
    }
  }

  // Flickering candle
  if (env.userData.candle) {
    const { flame, flameLight } = env.userData.candle.userData;
    const flick = 1 + Math.sin(time * 11.3) * 0.08 + Math.cos(time * 17.7) * 0.05;
    flame.scale.set(1, flick, 1);
    flameLight.intensity = 1.25 * flick;
  }

  // Atmospheric sunlit motes drifting gently
  if (env.userData.motes) {
    const pos = env.userData.motes.geometry.attributes.position;
    const base = env.userData.motes.userData.basePositions;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      pos.setXYZ(
        i,
        base[ix] + Math.sin(time * 0.35 + i) * 0.14,
        ((base[ix + 1] + time * 0.09) % 3.2) + 0.15,
        base[ix + 2] + Math.cos(time * 0.3 + i * 0.7) * 0.1
      );
    }
    pos.needsUpdate = true;
  }

  // Fragrance translucent ribbons visibility & flow
  let ribbonAlpha = 0;
  let ribbonTint = 0xaadcfc;
  if (time >= 12.5 && time < 17.5) {
    ribbonAlpha = Math.sin(clamp01((time - 12.5) / 5.0) * Math.PI) * 0.13;
    ribbonTint = 0xa9dcfa;
  } else if (time >= 21.0 && time < 26.0) {
    ribbonAlpha = Math.sin(clamp01((time - 21.0) / 5.0) * Math.PI) * 0.11;
    ribbonTint = 0xd6baf0;
  } else if (time >= 30.2 && time < 34.8) {
    ribbonAlpha = Math.sin(clamp01((time - 30.2) / 4.6) * Math.PI) * 0.12;
    ribbonTint = 0xf4ddb8;
  }

  if (env.userData.ribbons) {
    env.userData.ribbons.rotation.y = time * 0.12;
    for (const r of env.userData.ribbons.userData.ribbons) {
      r.mat.opacity = ribbonAlpha;
      r.mat.color.lerp(new THREE.Color(ribbonTint), 0.08);
    }
  }

  // Product visibility & positioning per phase
  if (time < 17.0) {
    // Steps 1-4: Desert Water hero
    desertBox.visible = true;
    orientalBox.visible = false;
    desertBox.position.set(0, 0, 0);
    desertBox.rotation.set(0, 0, 0);
    desertBox.scale.setScalar(1);
    env.userData.lavenderScatter.visible = false;
    env.userData.officeAccent.visible = false;
  } else if (time < 18.6) {
    // Smooth cross-transition (Step 5 start)
    const p = smoothstep(17.0, 18.6, time);
    desertBox.visible = p < 0.7;
    orientalBox.visible = p > 0.25;
    desertBox.position.set(-p * 1.4, 0, -p * 0.6);
    desertBox.scale.setScalar(1 - p * 0.25);
    orientalBox.position.set((1 - p) * 1.4, 0, (1 - p) * 0.3);
    orientalBox.scale.setScalar(0.75 + p * 0.25);
    orientalBox.rotation.set(0, (1 - p) * -0.45, 0);
    env.userData.lavenderScatter.visible = p > 0.45;
    env.userData.officeAccent.visible = false;
  } else if (time < 34.5) {
    // Steps 5b-8: Solitary Oriental featured (with Home/Office switch in Step 8)
    desertBox.visible = false;
    orientalBox.visible = true;
    orientalBox.position.set(0, 0, 0);
    orientalBox.rotation.set(0, 0, 0);
    orientalBox.scale.setScalar(1);
    env.userData.lavenderScatter.visible = time < 32.3;
    env.userData.officeAccent.visible = time >= 32.3 && time < 34.5;
  } else {
    // Steps 9-10: Both variants side-by-side Hero Shot + Final Reveal
    desertBox.visible = true;
    orientalBox.visible = true;
    const spread = isVertical ? 0.66 : 0.78;
    desertBox.position.set(-spread, 0, 0);
    orientalBox.position.set(spread, 0, 0);
    desertBox.rotation.set(0, 0.14, 0);
    orientalBox.rotation.set(0, -0.14, 0);
    desertBox.scale.setScalar(0.95);
    orientalBox.scale.setScalar(0.95);
    env.userData.lavenderScatter.visible = true;
    env.userData.officeAccent.visible = false;
  }

  // Lighting mood transitions
  const isLavenderMood = time >= 17.5 && time < 26.0;
  const isOfficeMood = time >= 32.3 && time < 34.5;
  const isFinalBright = time >= 38.5;

  const targetWallColor = isLavenderMood
    ? new THREE.Color(0xede2ea)
    : isOfficeMood
      ? new THREE.Color(0xe7e1d8)
      : isFinalBright
        ? new THREE.Color(0xf7f0e6)
        : new THREE.Color(0xf1e7da);
  env.userData.backWallMat.color.lerp(targetWallColor, 0.08);

  lights.accent.color.lerp(
    new THREE.Color(isLavenderMood ? 0xd9b8f5 : isOfficeMood ? 0xffe4bc : 0xcce8ff),
    0.08
  );
  lights.sun.intensity = isFinalBright ? 2.55 : isOfficeMood ? 2.0 : 2.25;

  // Camera Choreography (skipped while user manually orbits in 3D Inspect mode)
  if (isInspecting) return;

  const camPos = new THREE.Vector3(0, 1.15, 3.6 * zoomScale);
  const lookAt = new THREE.Vector3(0, 0.92, 0);

  if (time < 4.0) {
    // Step 1: Wide sunlit establishing dolly-in
    const t = smoothstep(0, 4.0, time);
    camPos.set(lerp(-1.1, 0.15, t), lerp(1.55, 1.18, t), lerp(5.1, 3.75, t) * zoomScale);
    lookAt.set(lerp(-0.25, 0, t), 0.96, 0);
  } else if (time < 8.5) {
    // Step 2: Slow 180-degree cinematic orbit around Desert Water
    const t = smoothstep(4.0, 8.5, time);
    const angle = lerp(-0.55, 0.65, t);
    const radius = lerp(3.45, 3.05, Math.sin(t * Math.PI)) * zoomScale;
    camPos.set(Math.sin(angle) * radius, lerp(1.12, 1.24, t), Math.cos(angle) * radius);
    lookAt.set(0, 0.92, 0);
  } else if (time < 13.0) {
    // Step 3: Push-in toward Desert Water glass & blue hydrangeas
    const t = smoothstep(8.5, 13.0, time);
    camPos.set(lerp(0.35, -0.1, t), lerp(1.16, 0.96, t), lerp(3.15, 2.25, t) * zoomScale);
    lookAt.set(0, lerp(0.92, 0.84, t), 0);
  } else if (time < 17.0) {
    // Step 4: Pull back gently to showcase flowing fragrance ribbons
    const t = smoothstep(13.0, 17.0, time);
    camPos.set(lerp(-0.1, 0.25, t), lerp(0.96, 1.32, t), lerp(2.25, 3.6, t) * zoomScale);
    lookAt.set(0, lerp(0.84, 1.15, t), 0);
  } else if (time < 21.5) {
    // Step 5: Orbit reveal of Solitary Oriental
    const t = smoothstep(17.0, 21.5, time);
    const angle = lerp(0.55, -0.45, t);
    const radius = 3.2 * zoomScale;
    camPos.set(Math.sin(angle) * radius, lerp(1.22, 1.1, t), Math.cos(angle) * radius);
    lookAt.set(0, 0.92, 0);
  } else if (time < 25.5) {
    // Step 6: Intimate bedside push-in on Lavender & bottle
    const t = smoothstep(21.5, 25.5, time);
    camPos.set(lerp(-0.35, 0.08, t), lerp(1.08, 0.94, t), lerp(3.0, 2.2, t) * zoomScale);
    lookAt.set(0, 0.86, 0);
  } else if (time < 30.5) {
    // Step 7: Centered composition for 4 Feature Badges
    const t = smoothstep(25.5, 30.5, time);
    const xOffset = isVertical ? 0 : -0.35;
    camPos.set(xOffset, lerp(1.02, 1.1, t), 3.35 * zoomScale);
    lookAt.set(isVertical ? 0 : 0.25, 0.96, 0);
  } else if (time < 34.5) {
    // Step 8: Home (left pan) -> Office (right pan)
    const t = smoothstep(30.5, 34.5, time);
    camPos.set(lerp(-0.9, 0.85, t), lerp(1.2, 1.14, t), 3.5 * zoomScale);
    lookAt.set(0, 0.92, 0);
  } else if (time < 38.5) {
    // Step 9: Hero Duo slow studio orbit
    const t = smoothstep(34.5, 38.5, time);
    const angle = lerp(-0.36, 0.34, t);
    const radius = (isVertical ? 4.35 : 3.45);
    camPos.set(Math.sin(angle) * radius, lerp(1.16, 1.08, t), Math.cos(angle) * radius);
    lookAt.set(0, 0.88, 0);
  } else {
    // Step 10: Gentle push-in & hold for Brand Reveal + 25% Off GH₵300 card
    const t = smoothstep(38.5, 41.2, time);
    const startZ = isVertical ? 4.35 : 3.45;
    const endZ = isVertical ? 3.9 : 3.05;
    camPos.set(0, lerp(1.08, 1.02, t), lerp(startZ, endZ, t));
    lookAt.set(0, isVertical ? 0.96 : 0.9, 0);
  }

  camera.position.copy(camPos);
  camera.lookAt(lookAt);
  controlsTarget.copy(lookAt);
}
