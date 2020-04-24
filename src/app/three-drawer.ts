import * as THREE from 'three';

import { Particle } from '../models/index';

let geometry: THREE.BufferGeometry | undefined;

const MAX_POINTS = 100000;

let container: HTMLDivElement;

let camera: THREE.Camera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let width: number;
let height: number;

let points: THREE.Points;

interface ParticleState {
  newParticles: Particle[];
  discardedParticles: Particle[];
  particles: Particle[];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number;
  let g: number;
  let b: number;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r, g, b];
}

let t: number;

export function init(_container: HTMLDivElement, onDone: () => void) {
  container = _container;

  const rect = container.getBoundingClientRect();
  height = rect.height;
  width = rect.width;
  camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
  camera.position.z = 20;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  container.appendChild(renderer.domElement);

  t = 0;

  onDone();
}

let animationFrameHandle: number | undefined;

export function start(getParticles: (time: number) => ParticleState) {
  function animate() {
    animationFrameHandle = requestAnimationFrame(animate);

    const state = getParticles(t++);
    if (!geometry) preRender();
    render(state);
  }

  animate();
}

export function stop() {
  if (animationFrameHandle) {
    cancelAnimationFrame(animationFrameHandle);
    animationFrameHandle = undefined;
  }
}

export function clear() {
  if (geometry) {
    geometry.dispose();
    geometry = undefined;

    scene.remove(points);
    renderer.render(scene, camera);
  }
}

function preRender() {
  geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(new Float32Array(MAX_POINTS * 3), 3),
  );
  geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(new Float32Array(MAX_POINTS * 3), 3),
  );

  points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 1, vertexColors: true }));
  scene.add(points);
}

function render(state: ParticleState) {
  const particles = state.newParticles.concat(state.particles);

  if (!geometry) return;

  const positions = geometry.attributes.position.array as Float32Array;
  const colors = geometry.attributes.color.array as Float32Array;

  const n = Math.min(particles.length, MAX_POINTS);
  const halfHeight = height / 2;
  const halfWidth = width / 2;

  for (let i = 0; i < n; i++) {
    const p = particles[i];

    const i0 = i * 3;
    const i1 = i * 3 + 1;
    const i2 = i * 3 + 2;

    positions[i0] = p.px - halfWidth;
    positions[i1] = -(p.py - halfHeight);
    positions[i2] = 0;

    const [r, g, b] = hslToRgb(...p.color);
    colors[i0] = r;
    colors[i1] = g;
    colors[i2] = b;
  }

  (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  (geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

  geometry.setDrawRange(0, n);

  renderer.render(scene, camera);
}
