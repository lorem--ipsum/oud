import { BaseImmutable, Property } from 'immutable-class';
import { Variable, VariableValue } from './variable';
import { Particle } from './particle';

import { CartesianVector } from '../utils/math-utils';

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
    { name: 'x', defaultValue: Variable.fromJS({expression: '250'}), immutableClass: Variable },
    { name: 'y', defaultValue: Variable.fromJS({expression: '250'}), immutableClass: Variable },
    { name: 'mass', defaultValue: Variable.fromJS({expression: '10'}), immutableClass: Variable },
    { name: 'time', defaultValue: 0 }
  ];

  static fromJS(params: AttractorValue) {
    return new Attractor(BaseImmutable.jsToValue(Attractor.PROPERTIES, params));
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

  update(t: number, j: number) {
    return this.changeMany({
      mass: this.getMass().update({t, j}),
      x: this.getX().update({t, j}),
      y: this.getY().update({t, j}),
      time: t
    });
  }

  getAttractionForce(p: Particle): CartesianVector {
    const mass = this.getMass().getValue();

    let x = this.getX().getValue() - p.px;
    let y = this.getY().getValue() - p.py;

    const squaredMag = x * x + y * y;
    const mag = Math.sqrt(squaredMag);

    const strength = (G * mass * p.mass) / squaredMag;

    x = strength * x / mag;
    y = strength * y / mag;

    return {x, y};
  }
}
BaseImmutable.finalize(Attractor);
