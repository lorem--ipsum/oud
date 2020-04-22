import { BaseImmutable, Property } from 'immutable-class';

import { CartesianVector } from '../utils/math-utils';

import { Particle } from './particle';
import { Variable, VariableValue } from './variable';

const G = 0.1;

export interface AttractorValue {
  name: string;
  label?: string;
  x?: VariableValue | string;
  y?: VariableValue | string;
  mass?: VariableValue | string;
  time?: number;
}

export interface AttractorJS {
  name: string;
  label?: string;
  x?: string;
  y?: string;
  mass?: string;
  time?: number;
}

export class Attractor extends BaseImmutable<AttractorValue, AttractorJS> {
  static isAttractor(candidate: any): candidate is Attractor {
    return candidate instanceof Attractor;
  }

  static PROPERTIES: Property[] = [
    { name: 'name' },
    { name: 'label', defaultValue: 'Attractor' },
    {
      name: 'x',
      defaultValue: Variable.fromJS({ expression: '250' }),
      immutableClass: Variable,
    },
    {
      name: 'y',
      defaultValue: Variable.fromJS({ expression: '250' }),
      immutableClass: Variable,
    },
    {
      name: 'mass',
      defaultValue: Variable.fromJS({ expression: '10' }),
      immutableClass: Variable,
    },
    { name: 'time', defaultValue: 0 },
  ];

  static fromJS(params: AttractorValue) {
    return new Attractor(BaseImmutable.jsToValue(Attractor.PROPERTIES, params));
  }

  static unserialize(value: string) {
    const bits = value.split('_');

    return new Attractor({
      name: bits[0],
      label: bits[1],
      x: Variable.fromJS(bits[2]),
      y: Variable.fromJS(bits[3]),
      mass: Variable.fromJS(bits[4]),
    });
  }

  public name: string;
  private label: string;
  private x: Variable;
  private y: Variable;
  private mass: Variable;
  private time: number;

  constructor(params: AttractorValue) {
    super(params);
  }

  public getName: () => string;
  public getLabel: () => string;

  public getX: () => Variable;
  public getY: () => Variable;
  public getMass: () => Variable;

  equals(other: any) {
    return (
      Attractor.isAttractor(other) &&
      other.label === this.label &&
      other.x.expression === this.x.expression &&
      other.y.expression === this.y.expression &&
      other.mass.expression === this.mass.expression
    );
  }

  serialize() {
    return [
      this.name,
      this.getLabel(),

      this.getX().expression,
      this.getY().expression,
      this.getMass().expression,
    ].join('_');
  }

  update(scope: { t: number; j: number; n: number; r: number; R: number }) {
    const v = this.valueOf();

    v.mass = this.getMass().update(scope);
    v.x = this.getX().update(scope);
    v.y = this.getY().update(scope);
    v.time = scope.t;

    return new Attractor(v);
  }

  getAttractionForce(p: Particle): CartesianVector {
    const mass = this.getMass().getValue();

    let x = this.getX().getValue() - p.px;
    let y = this.getY().getValue() - p.py;

    const squaredMag = x * x + y * y;
    const mag = Math.sqrt(squaredMag);

    const strength = (G * mass * p.mass) / squaredMag;

    x = (strength * x) / mag;
    y = (strength * y) / mag;

    return { x, y };
  }
}
BaseImmutable.finalize(Attractor);
