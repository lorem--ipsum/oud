import { CartesianVector } from '../utils/math-utils';
import { Attractor } from './attractor';

const LIFE_SPAN = 1000;

export class Particle {

  // Position
  public px = 0;
  public py = 0;

  // Velocity
  private vx = 0;
  private vy = 0;

  // Acceleration
  private ax = 0;
  private ay = 0;

  public color: [number, number, number];

  public mass = 1;

  public time = 0;
  private timeAtCreation = 0;

  constructor(params: any) {
    this.timeAtCreation = params.time;

    this.px = params.position.x;
    this.py = params.position.y;

    if (params.velocity) {
      this.vx = params.velocity.x;
      this.vy = params.velocity.y;
    }

    if (params.acceleration) {
      this.ax = params.acceleration.x;
      this.ay = params.acceleration.y;
    }

    this.color = params.color || [172, 207, 165];
  }

  update(time: number, attractors: Attractor[] = []) {
    this.px += this.vx;
    this.py += this.vy;

    this.vx += this.ax;
    this.vy += this.ay;

    let i = attractors.length;
    while (i--) {
      const f = attractors[i].getAttractionForce(this);
      this.ax += f.x;
      this.ay += f.y;
    }

    this.time = time;

    return this;
  }

  kill() {
    this.time = this.timeAtCreation + LIFE_SPAN;
  }

  get age() {
    return this.time - this.timeAtCreation;
  }

  isLost() {
    const { px, py } = this;
    return px < 0 || py < 0 || px > 500 || py > 500;
  }

  isDead() {
    return this.age >= LIFE_SPAN;
  }

  getOpacity() {
    return this.age < 0 ? 0 : (1 - this.age / LIFE_SPAN);
  }

  applyForce(force: CartesianVector) {
    this.ax += force.x;
    this.ay += force.y;
  }

  drawOn(ctx: CanvasRenderingContext2D) {
    const { px, py } = this;

    const color = this.color;
    ctx.fillStyle =  `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${this.getOpacity()})`;
    ctx.fillRect(px - 1, py - 1, 2, 2);
  }
}
