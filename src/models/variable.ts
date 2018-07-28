import * as math from 'mathjs';
import { BaseImmutable, Property } from 'immutable-class';

export interface VariableValue {
  expression: string;
}

export interface VariableJS {
  expression: string;
}

export class Variable extends BaseImmutable<VariableValue, VariableJS> {
  static PROPERTIES: Property[] = [
    { name: "expression" }
  ];

  static fromJS(params: VariableValue) {
    return new Variable(BaseImmutable.jsToValue(Variable.PROPERTIES, params));
  }

  private parsedExpression: math.MathNode;
  private currentValue = 0;

  constructor(params: VariableValue) {
    super(params);
  }

  changeExpression(value: string) {
    const v = this.valueOf();

    try {
      const p = math.parse(value);
      p.eval({t: 0});
      v.expression = value;
      this.parsedExpression = p;
      return new Variable(v);

    } catch (e) {
      console.log(e);
    }

    return this;
  }

  getExpression: () => math.MathNode;

  eval(scope: any): number {
    return this.parsedExpression ? this.parsedExpression.eval(scope) : 0;
  }

  update(scope: any) {
    this.currentValue = this.eval(scope);
  }

  getValue(): number {
    return this.currentValue;
  }
}

BaseImmutable.finalize(Variable);
