import * as regl from 'regl';

import { Particle } from '../models/index';

const pointWidth = 1;

let _regl: regl.Regl;
let width: number;
let height: number;
let frameLoop: regl.Cancellable;

export function init(canvas: HTMLCanvasElement, onDone: () => void) {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;

  regl({
    canvas,
    onDone: (err, r) => {
      _regl = r;
      onDone();
    },
  });
}

export function start(getParticles: (time: number) => Particle[]) {
  function animate(particles: Particle[]) {
    frameLoop = _regl.frame(({ tick }) => {
      nextTick(tick, getParticles(tick));
    });
  }

  animate(getParticles(0));
}

export function nextTick(tick: number, particles: Particle[]) {
  const drawPoints = createDrawPoints(particles);

  _regl.clear({
    color: [255, 255, 255, 1],
    depth: 1,
  });

  drawPoints({
    pointWidth,
    stageWidth: width,
    stageHeight: height,
  });
}

export function stop() {
  if (frameLoop && frameLoop) {
    frameLoop.cancel();
    frameLoop = undefined;
  }
}

export function clear() {
  _regl.clear({
    color: [255, 255, 255, 1],
    depth: 1,
  });
}

function createDrawPoints(points: Particle[]) {
  return _regl({
    frag: `
    // set the precision of floating point numbers
    precision highp float;

    // this value is populated by the vertex shader
    varying vec3 fragColor;

    void main() {
      // gl_FragColor is a special variable that holds the color of a pixel
      gl_FragColor = vec4(fragColor, 1);
    }
    `,

    vert: `
    // per vertex attributes
    attribute vec2 position;
    attribute vec3 color;

    // variables to send to the fragment shader
    varying vec3 fragColor;

    // values that are the same for all vertices
    uniform float pointWidth;
    uniform float stageWidth;
    uniform float stageHeight;

    // helper function to transform from pixel space to normalized device coordinates (NDC)
    // in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.
    vec2 normalizeCoords(vec2 _position) {
      // read in the positions into x and y vars
      float x = _position[0];
      float y = _position[1];

      return vec2(
        2.0 * ((x / stageWidth) - 0.5),
        // invert y since we think [0,0] is bottom left in pixel space
        -(2.0 * ((y / stageHeight) - 0.5)));
    }

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
      // update the size of a point based on the prop pointWidth
      gl_PointSize = pointWidth;

      // interpolate and send color to the fragment shader
      fragColor = hsv2rgb(color);

      // scale to normalized device coordinates
      // gl_Position is a special variable that holds the position of a vertex
      gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
    }
    `,

    attributes: {
      // each of these gets mapped to a single entry for each of the points.
      // this means the vertex shader will receive just the relevant value for a given point.
      position: points.map(d => [d.px, d.py]),
      color: points.map(d => d.color),
    },

    uniforms: {
      // by using `regl.prop` to pass these in, we can specify them as arguments
      // to our drawPoints function
      pointWidth: (_regl.prop as any)('pointWidth'),

      // regl actually provides these as viewportWidth and viewportHeight but I
      // am using these outside and I want to ensure they are the same numbers,
      // so I am explicitly passing them in.
      stageWidth: (_regl.prop as any)('stageWidth'),
      stageHeight: (_regl.prop as any)('stageHeight'),
    },

    // specify the number of points to draw
    count: points.length,

    // specify that each vertex is a point (not part of a mesh)
    primitive: 'points',
  });
}
