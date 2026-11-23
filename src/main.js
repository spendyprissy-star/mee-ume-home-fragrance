import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createMeeUmeProduct } from './products/meeUmeBox.js';
import { createEnvironment } from './scene/environment.js';
import { applyTimelineState, getActiveStep, STEPS, TOTAL_DURATION } from './scene/timeline.js';
import { renderHudOverlay } from './overlay/hudRenderer.js';
import { LuxurySoundtrack } from './audio/soundtrack.js';

const stageEl = document.getElementById('stage');
const webglCanvas = document.getElementById('webgl-canvas');
const hudCanvas = document.getElementById('hud-canvas');
const hudCtx = hudCanvas.getContext('2d');

const playBtn = document.getElementById('btn-play');
const replayBtn = document.getElementById('btn-replay');
const ratio916Btn = document.getElementById('btn-916');
const ratio169Btn = document.getElementById('btn-169');
const inspectBtn = document.getElementById('btn-inspect');
const soundBtn = document.getElementById('btn-sound');
const voiceBtn = document.getElementById('btn-voice');
const captionsBtn = document.getElementById('btn-captions');
const exportBtn = document.getElementById('btn-export');
const scrubberEl = document.getElementById('scrubber');
const timeReadoutEl = document.getElementById('time-readout');
const stepTitleEl = document.getElementById('step-title');
const stepsGridEl = document.getElementById('steps-grid');
const exportStatusEl = document.getElementById('export-status');

// Scene & Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: webglCanvas,
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance',
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.98;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1e7da);
scene.fog = new THREE.Fog(0xf1e7da, 6.5, 14.5);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(36, 9 / 16, 0.1, 40);
const controls = new OrbitControls(camera, stageEl);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 1.6;
controls.maxDistance = 6.5;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enabled = false;

// Lighting
const hemiLight = new THREE.HemisphereLight(0xfffaf2, 0xcab9a4, 1.05);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.25);
sunLight.position.set(3.4, 5.2, 3.8);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 14;
sunLight.shadow.camera.left = -4;
sunLight.shadow.camera.right = 4;
sunLight.shadow.camera.top = 4;
sunLight.shadow.camera.bottom = -4;
sunLight.shadow.bias = -0.0006;
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0xf6ecdf, 0.72);
fillLight.position.set(-3.5, 2.6, 2.5);
scene.add(fillLight);

const accentLight = new THREE.PointLight(0xcce8ff, 0.9, 8, 1.4);
accentLight.position.set(-1.5, 2.1, 1.8);
scene.add(accentLight);

const lights = { hemi: hemiLight, sun: sunLight, fill: fillLight, accent: accentLight };

// Products & Environment
const env = createEnvironment();
scene.add(env);

const desertBox = createMeeUmeProduct('desert');
const orientalBox = createMeeUmeProduct('oriental');
scene.add(desertBox);
scene.add(orientalBox);

const soundtrack = new LuxurySoundtrack();

// Playback State
const state = {
  time: 0,
  playing: true,
  aspectMode: '9:16',
  inspecting: false,
  muted: false,
  voice: false,
  captions: true,
  exporting: false,
};

let mediaRecorder = null;
let exportCanvas = null;
let exportCtx = null;

function getRenderDimensions() {
  return state.aspectMode === '9:16' ? { w: 720, h: 1280 } : { w: 1280, h: 720 };
}

function updateViewportDimensions() {
  const { w, h } = getRenderDimensions();
  renderer.setSize(w, h, false);
  hudCanvas.width = w;
  hudCanvas.height = h;
  camera.aspect = w / h;
  camera.fov = state.aspectMode === '9:16' ? 40 : 34;
  camera.updateProjectionMatrix();

  stageEl.classList.toggle('ratio-916', state.aspectMode === '9:16');
  stageEl.classList.toggle('ratio-169', state.aspectMode === '16:9');
  ratio916Btn.classList.toggle('active', state.aspectMode === '9:16');
  ratio169Btn.classList.toggle('active', state.aspectMode === '16:9');
}

// Build 10-step chapter buttons
const stepButtons = STEPS.map((step) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'step-chip';
  btn.innerHTML = `<span class="num">${step.id}</span><span>${step.label}</span>`;
  btn.addEventListener('click', () => {
    state.time = step.start + 0.05;
    if (state.inspecting) setInspectMode(false);
    renderFrame(state.time);
  });
  stepsGridEl.appendChild(btn);
  return { step, btn };
});

function setInspectMode(enabled) {
  state.inspecting = enabled;
  controls.enabled = enabled;
  inspectBtn.classList.toggle('active', enabled);
  inspectBtn.textContent = enabled ? 'Exit 3D Orbit' : '3D Inspect';
  if (enabled) {
    state.playing = false;
    soundtrack.stop();
    playBtn.textContent = 'Play';
  }
}

function setAspectMode(mode) {
  if (state.exporting) return;
  state.aspectMode = mode;
  updateViewportDimensions();
  renderFrame(state.time);
}

function renderFrame(t) {
  applyTimelineState({
    time: t,
    aspectMode: state.aspectMode,
    camera,
    desertBox,
    orientalBox,
    env,
    lights,
    controlsTarget: controls.target,
    isInspecting: state.inspecting,
  });

  if (state.inspecting) {
    controls.update();
  }

  renderer.render(scene, camera);

  if (!state.inspecting) {
    renderHudOverlay(hudCtx, hudCanvas.width, hudCanvas.height, {
      time: t,
      aspectMode: state.aspectMode,
      showCaptions: state.captions,
    });
  } else {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
  }

  // Update UI readouts
  scrubberEl.value = String(t);
  timeReadoutEl.textContent = `${t.toFixed(1)}s / ${TOTAL_DURATION.toFixed(0)}s`;
  const active = getActiveStep(t);
  stepTitleEl.textContent = `Step ${active.id} — ${active.label}`;
  for (const item of stepButtons) {
    item.btn.classList.toggle('active', item.step.id === active.id);
  }
}

// Animation Loop
let lastTs = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.max(0, Math.min(0.05, (now - lastTs) / 1000));
  lastTs = now;

  if (state.playing && !state.inspecting) {
    state.time += dt;
    if (state.time >= TOTAL_DURATION) {
      if (state.exporting) {
        finishExport();
        return;
      }
      state.time = 0;
    }
    if (!state.muted && soundtrack.isPlaying) {
      soundtrack.syncVoiceover(state.time);
    }
  }

  renderFrame(state.time);

  if (state.exporting && exportCtx) {
    exportCtx.drawImage(webglCanvas, 0, 0);
    exportCtx.drawImage(hudCanvas, 0, 0);
    exportStatusEl.textContent = `Recording ${state.time.toFixed(1)}s / ${TOTAL_DURATION.toFixed(0)}s`;
  }
}

// Video Export (.webm)
function startExport() {
  if (state.exporting) {
    cancelExport();
    return;
  }
  if (typeof MediaRecorder === 'undefined') {
    exportStatusEl.textContent = 'Video export is not supported in this browser.';
    return;
  }

  setInspectMode(false);
  const { w, h } = getRenderDimensions();
  exportCanvas = document.createElement('canvas');
  exportCanvas.width = w;
  exportCanvas.height = h;
  exportCtx = exportCanvas.getContext('2d');

  soundtrack.start();
  const videoStream = exportCanvas.captureStream(30);
  const audioTrack = soundtrack.getAudioTrack();
  const hasAudio = Boolean(audioTrack && !state.muted);
  if (hasAudio) {
    videoStream.addTrack(audioTrack);
  }

  const preferredMimes = hasAudio
    ? [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=h264,aac',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]
    : [
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
  const mimeType = preferredMimes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const fileExt = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

  const chunks = [];
  mediaRecorder = new MediaRecorder(videoStream, { mimeType, videoBitsPerSecond: 6_000_000 });
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    if (chunks.length > 0 && state.exportingComplete) {
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      const url = URL.createObjectURL(blob);
      const filename = `Mee-Ume-Advert-${state.aspectMode === '9:16' ? '9x16' : '16x9'}.${fileExt}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      exportStatusEl.textContent = `Saved to your Downloads folder: ${filename}`;
    }
    state.exporting = false;
    state.exportingComplete = false;
    exportBtn.textContent = 'Export & Save Video';
    exportBtn.classList.remove('recording');
  };

  state.exporting = true;
  state.exportingComplete = false;
  state.time = 0;
  state.playing = true;
  playBtn.textContent = 'Pause';
  exportBtn.textContent = 'Cancel Export';
  exportBtn.classList.add('recording');
  exportStatusEl.textContent = `Recording ${fileExt.toUpperCase()}…`;
  mediaRecorder.start(250);
}

function finishExport() {
  state.playing = false;
  state.exportingComplete = true;
  playBtn.textContent = 'Play';
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

function cancelExport() {
  state.exportingComplete = false;
  state.exporting = false;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  exportStatusEl.textContent = 'Export cancelled — no file was saved.';
  exportBtn.textContent = 'Export & Save Video';
  exportBtn.classList.remove('recording');
}

// UI Event Listeners
playBtn.addEventListener('click', () => {
  if (state.inspecting) setInspectMode(false);
  state.playing = !state.playing;
  playBtn.textContent = state.playing ? 'Pause' : 'Play';
  if (state.playing && !state.muted) {
    soundtrack.start();
  } else {
    soundtrack.stop();
  }
});

replayBtn.addEventListener('click', () => {
  if (state.inspecting) setInspectMode(false);
  state.time = 0;
  state.playing = true;
  playBtn.textContent = 'Pause';
  if (!state.muted) soundtrack.start();
});

ratio916Btn.addEventListener('click', () => setAspectMode('9:16'));
ratio169Btn.addEventListener('click', () => setAspectMode('16:9'));
inspectBtn.addEventListener('click', () => setInspectMode(!state.inspecting));

soundBtn.addEventListener('click', () => {
  state.muted = !state.muted;
  soundtrack.setMuted(state.muted);
  if (!state.muted && state.playing) {
    soundtrack.start();
  }
  soundBtn.textContent = state.muted ? 'Sound: Off' : 'Sound: On';
  soundBtn.classList.toggle('active', !state.muted);
});

voiceBtn.addEventListener('click', () => {
  state.voice = !state.voice;
  soundtrack.setVoiceEnabled(state.voice);
  voiceBtn.textContent = state.voice ? 'Voiceover: On' : 'Voiceover: Off';
  voiceBtn.classList.toggle('active', state.voice);
});

captionsBtn.addEventListener('click', () => {
  state.captions = !state.captions;
  captionsBtn.textContent = state.captions ? 'Captions: On' : 'Captions: Off';
  captionsBtn.classList.toggle('active', state.captions);
});

exportBtn.addEventListener('click', startExport);

scrubberEl.addEventListener('input', () => {
  if (state.inspecting) setInspectMode(false);
  state.time = Number(scrubberEl.value);
  renderFrame(state.time);
});

// Start audio gracefully on first user interaction if unmuted
window.addEventListener(
  'pointerdown',
  () => {
    if (state.playing && !state.muted && !soundtrack.isPlaying) {
      soundtrack.start();
    }
  },
  { once: true }
);

updateViewportDimensions();
renderFrame(0);
requestAnimationFrame(animate);
