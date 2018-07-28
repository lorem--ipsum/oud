import { BaseImmutable, Property } from 'immutable-class';

import { cartesianFromPolar } from '../utils/math-utils';
import { Variable } from './variable';
import { Particle } from './particle';

export interface EmitterValue {
  label?: string;
  x?: string | number;
  y?: string | number;
  angle?: string | number;
  spread?: string | number;
  initialVelocity?: string | number;
  batchSize?: string | number;
  emissionRate?: string | number;
  color?: string | number;
}

export interface EmitterJS {
  label?: string;
  x?: string;
  y?: string;
  angle?: string;
  spread?: string;
  initialVelocity?: string;
  batchSize?: string;
  emissionRate?: string;
  color?: string;
}

export class Emitter extends BaseImmutable<EmitterValue, EmitterJS> {
  static PROPERTIES: Property[] = [
    { name: 'label', defaultValue: 'Emitter', immutableClass: Variable },
    { name: 'x', defaultValue: '50', immutableClass: Variable },
    { name: 'y', defaultValue: '50', immutableClass: Variable },
    { name: 'angle', defaultValue: 'pi', immutableClass: Variable },
    { name: 'spread', defaultValue: 'pi/4', immutableClass: Variable },
    { name: 'velocity', defaultValue: '20', immutableClass: Variable },
    { name: 'batchSize', defaultValue: '10', immutableClass: Variable },
    { name: 'emissionRate', defaultValue: '1', immutableClass: Variable },
    { name: 'color', defaultValue: '[255, 90, 70]', immutableClass: Variable }
  ];

  static fromJS(params: EmitterValue = {}) {
    return new Emitter(BaseImmutable.jsToValue(Emitter.PROPERTIES, params));
  }

  private label: Variable;
  private x: Variable;
  private y: Variable;
  private angle: Variable;
  private spread: Variable;
  private velocity: Variable;
  private batchSize: Variable;
  private emissionRate: Variable;
  private color: Variable;

  private time = 0;

  constructor(params: EmitterValue) {
    super(params);
  }

  public getLabel() {
    return this.label.getValue();
  }

  public getX() {
    return this.x.getValue();
  }

  public getY() {
    return this.y.getValue();
  }

  public getAngle() {
    return this.angle.getValue();
  }

  public getSpread() {
    return this.spread.getValue();
  }

  public getVelocity() {
    return this.velocity.getValue();
  }

  public getBatchSize() {
    return this.batchSize.getValue();
  }

  public getEmissionRate() {
    return this.emissionRate.getValue();
  }

  public getColor() {
    return this.color.getValue();
  }

  getNewParticle(index: number, count: number): Particle {
    const initialVelocity = this.getVelocity();
    const spread = this.getSpread();
    const angle = this.getAngle();
    const color = this.getColor();

    const step = count > 1 ?  (spread / (count - 1)) * index : spread / 2;

    const velocity = cartesianFromPolar({
      radius: initialVelocity / 20,
      theta: angle - spread * .5 + step
    });

    return new Particle({
      time: this.time,
      position: {x: this.getX(), y: this.getY()},
      velocity,
      color
    }).update(this.time);
  }

  update(time: number): Particle[] {
    this.x.update({t: time});
    this.y.update({t: time});
    this.angle.update({t: time});
    this.spread.update({t: time});
    this.velocity.update({t: time});
    this.batchSize.update({t: time});
    this.emissionRate.update({t: time});
    this.color.update({t: time});

    if (time <= this.time) {
      return [];
    }

    this.time = time;

    const rate = this.getEmissionRate();

    if (!rate) return [];

    const batchSize = this.getBatchSize();

    const newParticles: Particle[] = [];

    for (let i = 0; i < batchSize; i++) {
      newParticles.push(this.getNewParticle(i, batchSize));
    }

    return newParticles;
  }

}
BaseImmutable.finalize(Emitter);
