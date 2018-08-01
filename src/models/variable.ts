import * as math from 'mathjs';
import { BaseImmutable, Property } from 'immutable-class';

export type VariableValue = {
  expression: string;
  currentValue?: number;
  parsedExpression?: math.EvalFunction;
};

export class Variable extends BaseImmutable<VariableValue, VariableValue> {
  static PROPERTIES: Property[] = [
    { name: 'expression' },
    { name: 'currentValue', defaultValue: 0 },
    { name: 'parsedExpression', defaultValue: null }
  ];

  static fromJS(params: VariableValue | string) {
    if (typeof params === 'string') params = {expression: params};

    return new Variable(BaseImmutable.jsToValue(Variable.PROPERTIES, params));
  }


  public expression: string;
  public currentValue: number;
  public parsedExpression: math.EvalFunction;

  constructor(params: VariableValue) {
    super(params);
  }

  equals(other: any) {
    return other &&
      other instanceof Variable &&
      other.expression === this.expression
      ;
  }

  changeExpression(newExpression: string) {
    const v = this.valueOf();

    // math.parse(newExpression).eval({t: 0, j: 0});

    v.expression = newExpression;
    if (newExpression !== this.expression) v.parsedExpression = null;

    return new Variable(v);
  }


  eval(scope: any): number {
    if (!this.parsedExpression) {
      this.parsedExpression = math.parse(this.expression).compile();
    }

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
