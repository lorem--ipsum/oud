import { BaseImmutable, Property } from 'immutable-class';

import { cartesianFromPolar } from '../utils/math-utils';
import { Variable, VariableValue } from './variable';
import { Particle } from './particle';

export interface EmitterValue {
  name: string;
  label?: VariableValue | string;
  x?: VariableValue | string;
  y?: VariableValue | string;
  angle?: VariableValue | string;
  spread?: VariableValue | string;
  velocity?: VariableValue | string;
  batchSize?: VariableValue | string;
  emissionRate?: VariableValue | string;
  hue?: VariableValue | string;
  saturation?: VariableValue | string;
  lightness?: VariableValue | string;
  lifeSpan?: VariableValue | string;
  time?: number;
}

export interface EmitterJS {
  name: string;
  label?: string;
  x?: string;
  y?: string;
  angle?: string;
  spread?: string;
  velocity?: string;
  batchSize?: string;
  emissionRate?: string;
  hue?: string;
  saturation?: string;
  lightness?: string;
  lifeSpan?: string;
  time?: number;
}

export class Emitter extends BaseImmutable<EmitterValue, EmitterJS> {
  static PROPERTIES: Property[] = [
    { name: 'name' },
    { name: 'label', defaultValue: 'Emitter' },
    { name: 'x', defaultValue: Variable.fromJS('50'), immutableClass: Variable },
    { name: 'y', defaultValue: Variable.fromJS('50'), immutableClass: Variable },
    { name: 'angle', defaultValue: Variable.fromJS('pi'), immutableClass: Variable },
    { name: 'spread', defaultValue: Variable.fromJS('pi/4'), immutableClass: Variable },
    { name: 'velocity', defaultValue: Variable.fromJS('20'), immutableClass: Variable },
    { name: 'batchSize', defaultValue: Variable.fromJS('10'), immutableClass: Variable },
    { name: 'emissionRate', defaultValue: true, immutableClass: Variable },
    { name: 'lifeSpan', defaultValue: Variable.fromJS('2000'), immutableClass: Variable },

    { name: 'hue', defaultValue: Variable.fromJS('255'), immutableClass: Variable },
    { name: 'saturation', defaultValue: Variable.fromJS('.9'), immutableClass: Variable },
    { name: 'lightness', defaultValue: Variable.fromJS('.7'), immutableClass: Variable },
    { name: 'time', defaultValue: 0 }

  ];

  static fromJS(params: EmitterValue) {
    return new Emitter(BaseImmutable.jsToValue(Emitter.PROPERTIES, params));
  }

  static isEmitter(candidate: any): candidate is Emitter {
    return candidate instanceof Emitter;
  }

  static unserialize(value: string) {
    const bits = value.split('_');

    return new Emitter({
      name: bits[0],
      label: bits[1],
      x: Variable.fromJS(bits[2]),
      y: Variable.fromJS(bits[3]),
      angle: Variable.fromJS(bits[4]),
      spread: Variable.fromJS(bits[5]),
      velocity: Variable.fromJS(bits[6]),
      batchSize: Variable.fromJS(bits[7]),
      emissionRate: Variable.fromJS(bits[8]),
      hue: Variable.fromJS(bits[9]),
      saturation: Variable.fromJS(bits[10]),
      lightness: Variable.fromJS(bits[11]),
      lifeSpan: Variable.fromJS(bits[12])
    });
  }

  public name: string;
  private label: Variable;
  private x: Variable;
  private y: Variable;
  private angle: Variable;
  private spread: Variable;
  private velocity: Variable;
  private batchSize: Variable;
  private emissionRate: Variable;
  private hue: Variable;
  private saturation: Variable;
  private lightness: Variable;
  private lifeSpan: Variable;

  public time: number;

  constructor(params: EmitterValue) {
    super(params);
  }

  equals(other: any) {
    return Emitter.isEmitter(other)
      && other.label === this.label
      && other.x.expression === this.x.expression
      && other.y.expression === this.y.expression
      && other.angle.expression === this.angle.expression
      && other.spread.expression === this.spread.expression
      && other.velocity.expression === this.velocity.expression
      && other.batchSize.expression === this.batchSize.expression
      && other.emissionRate.expression === this.emissionRate.expression
      && other.lifeSpan.expression === this.lifeSpan.expression
      && other.hue.expression === this.hue.expression
      && other.saturation.expression === this.saturation.expression
      && other.lightness.expression === this.lightness.expression
      ;
  }

  serialize() {
    return [
      this.name,
      this.getLabel(),

      this.getX().expression,
      this.getY().expression,
      this.getAngle().expression,
      this.getSpread().expression,
      this.getVelocity().expression,
      this.getBatchSize().expression,
      this.getEmissionRate().expression,
      this.getHue().expression,
      this.getSaturation().expression,
      this.getLightness().expression,
      this.getLifeSpan().expression
    ].join('_');
  }

  getName: () => string;
  getLabel: () => string;
  getX: () => Variable;
  getY: () => Variable;
  getAngle: () => Variable;
  getSpread: () => Variable;
  getVelocity: () => Variable;
  getBatchSize: () => Variable;
  getEmissionRate: () => Variable;

  getHue: () => Variable;
  getSaturation: () => Variable;
  getLightness: () => Variable;

  getLifeSpan: () => Variable;

  getCurrentColor() {
    const color = [
      Math.floor(this.getHue().getValue() * 255),
      Math.floor(this.getSaturation().getValue() * 100),
      Math.floor(this.getLightness().getValue() * 100)
    ];

    return `hsl(${color[0]}, ${color[1]}%, ${color[2]}%)`;
  }

  getNewParticle(index: number, count: number): Particle {
    const spread = this.getSpread().getValue();
    const angle = this.getAngle().getValue();
    const color = [
      this.getHue().getValue(),
      this.getSaturation().getValue(),
      this.getLightness().getValue()
    ];
    const x = this.getX().getValue();
    const y = this.getY().getValue();
    const lifeSpan = this.getLifeSpan().getValue();

    const step = count > 1 ?  (spread / (count - 1)) * index : spread / 2;

    const velocity = cartesianFromPolar({
      radius: this.getVelocity().getValue() / 20,
      theta: angle - spread * .5 + step
    });

    return new Particle({
      time: this.time,
      position: {x, y},
      velocity,
      acceleration: {x: 0, y: 0},
      color,
      lifeSpan
    });
  }

  update(t: number, j: number, n: number) {
    const v = this.valueOf();

    v.x = this.getX().update({t, j, n});
    v.y = this.getY().update({t, j, n});
    v.angle = this.getAngle().update({t, j, n});
    v.spread = this.getSpread().update({t, j, n});
    v.velocity = this.getVelocity().update({t, j, n});
    v.batchSize = this.getBatchSize().update({t, j, n});
    v.emissionRate = this.getEmissionRate().update({t, j, n});
    v.hue = this.getHue().update({t, j, n});
    v.saturation = this.getSaturation().update({t, j, n});
    v.lightness = this.getLightness().update({t, j, n});
    v.lifeSpan = this.getLifeSpan().update({t, j, n});

    v.time = t >= this.time || isNaN(this.time) ? t : this.time;

    return new Emitter(v);
  }

  emit(target: Particle[]) {
    const rate = this.getEmissionRate().getValue();

    if (!rate) return;

    const batchSize = this.getBatchSize().getValue();

    for (let i = 0; i < batchSize; i++) {
      target.push(this.getNewParticle(i, batchSize));
    }
  }

}
BaseImmutable.finalize(Emitter);
