import { BaseImmutable, Property } from 'immutable-class';
import { Variable } from './variable';
import { Particle } from './particle';

import { CartesianVector } from '../utils/math-utils';

const G = 0.1;

export interface AttractorValue {
  label?: string;
  x?: string;
  y?: string;
  mass?: string;
}

export interface AttractorJS {
  label?: string;
  x?: string;
  y?: string;
  mass?: string;
}

export class Attractor extends BaseImmutable<AttractorValue, AttractorJS> {
  static PROPERTIES: Property[] = [
    { name: 'label', defaultValue: 'Attractor', immutableClass: Variable },
    { name: 'x', defaultValue: '250', immutableClass: Variable },
    { name: 'y', defaultValue: '250', immutableClass: Variable },
    { name: 'mass', defaultValue: '10', immutableClass: Variable }
  ];

  static fromJS(params: AttractorValue) {
    return new Attractor(BaseImmutable.jsToValue(Attractor.PROPERTIES, params));
  }

  private label: Variable;
  private x: Variable;
  private y: Variable;
  private mass: Variable;

  private time = 0;

  constructor(params: AttractorValue = {}) {
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

  public getMass() {
    return this.mass.getValue();
  }

  update(index: number) {
    this.time = index;
    this.mass.update({t: this.time});
    this.x.update({t: this.time});
    this.y.update({t: this.time});
  }

  getAttractionForce(p: Particle): CartesianVector {
    const mass = this.getMass();

    let x = this.getX() - p.px;
    let y = this.getY() - p.py;

    const squaredMag = x * x + y * y;
    const mag = Math.sqrt(squaredMag);

    const strength = (G * mass * p.mass) / squaredMag;

    x = strength * x / mag;
    y = strength * y / mag;

    return {x, y};
  }
}
BaseImmutable.finalize(Attractor);
