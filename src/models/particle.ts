import { CartesianVector } from '../utils/math-utils';
import { Attractor } from './attractor';

const MEMORY_SPAN = 400;

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
  private lifeSpan: number;

  constructor(params: any) {
    this.time = params.time;
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
    this.lifeSpan = params.lifeSpan;
  }

  update(time: number, attractors: Attractor[] = []) {
    if (time < this.timeAtCreation) return this;
    if (time === this.time) return this;

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
    this.time = this.timeAtCreation + this.lifeSpan;
  }

  get age() {
    return this.time - this.timeAtCreation;
  }

  isLost() {
    const { px, py } = this;
    return px < 0 || py < 0 || px > 500 || py > 500;
  }

  isDead() {
    return this.age >= this.lifeSpan;
  }

  get opacity() {
    return this.age < 0 ? 0 : (1 - this.age / this.lifeSpan);
  }
}
