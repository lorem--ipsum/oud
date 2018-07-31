import * as math from 'mathjs';
import { BaseImmutable, Property } from 'immutable-class';

export type VariableValue = {
  expression: string;
  currentValue?: number;
};

export class Variable extends BaseImmutable<VariableValue, VariableValue> {
  static PROPERTIES: Property[] = [
    { name: 'expression' },
    { name: 'currentValue', defaultValue: 0 }
  ];

  static fromJS(params: VariableValue | string) {
    if (typeof params === 'string') params = {expression: params};

    return new Variable(BaseImmutable.jsToValue(Variable.PROPERTIES, params));
  }


  public expression: string;
  public currentValue: number;

  constructor(params: VariableValue) {
    super(params);
  }


  // toJS() {
  //   return {
  //     expression: this.expression,
  //     currentValue: this.currentValue,
  //   };
  // }

  changeExpression(value: string) {
    const v = this.valueOf();

    // math.parse(value).eval({t: 0, j: 0});

    v.expression = value;

    return new Variable(v);
  }


  eval(scope: any): number {
    return math.parse(this.expression).eval(scope);
  }

  update(scope: any) {
    const v = this.valueOf();

    const currentValue = this.eval(scope);
    v.currentValue = isNaN(currentValue) ? 0 : currentValue;

    return new Variable(v);
  }

  getValue(): number {
    return this.currentValue;
  }
}

BaseImmutable.finalize(Variable);
