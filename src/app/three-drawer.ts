import THREE from 'three';

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
    if (!geometry) preRender(state.newParticles);
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

function preRender(particles: Particle[]) {
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(MAX_POINTS * 3);
  const colors = new Float32Array(MAX_POINTS * 3);

  const color = new THREE.Color();

  const n = Math.min(particles.length, MAX_POINTS);

  const halfHeight = height / 2;
  const halfWidth = width / 2;

  for (let i = 0; i < n; i++) {
    const p = particles[i];

    const a = i * 3;
    const b = i * 3 + 1;
    const c = i * 3 + 2;

    positions[a] = -(p.px - halfWidth);
    positions[b] = p.py - halfHeight;
    positions[c] = 0;

    color.setHSL(...p.color);
    colors[a] = color.r;
    colors[b] = color.g;
    colors[c] = color.b;
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  geometry.setDrawRange(0, n);

  geometry.computeBoundingSphere();

  const material = new THREE.PointsMaterial({ size: 1, vertexColors: true });

  points = new THREE.Points(geometry, material);
  scene.add(points);
}

function render(state: ParticleState) {
  const particles = state.newParticles.concat(state.particles);

  if (!geometry) return;

  const positions = geometry.attributes.position.array as Float32Array;
  const colors = geometry.attributes.color.array as Float32Array;

  const color = new THREE.Color();

  const n = Math.min(particles.length, MAX_POINTS);
  const halfHeight = height / 2;
  const halfWidth = width / 2;

  for (let i = 0; i < n; i++) {
    const p = particles[i];

    const a = i * 3;
    const b = i * 3 + 1;
    const c = i * 3 + 2;

    positions[a] = p.px - halfWidth;
    positions[b] = -(p.py - halfHeight);
    positions[c] = 0;

    color.setHSL(...p.color);
    colors[a] = color.r;
    colors[b] = color.g;
    colors[c] = color.b;
  }

  (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  (geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

  geometry.setDrawRange(0, n);

  renderer.render(scene, camera);
}
