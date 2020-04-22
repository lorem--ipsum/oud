import { BaseImmutable, Property } from 'immutable-class';
import * as math from 'mathjs';
import moize from 'moize';

export interface VariableValue {
  expression: string;
  currentValue?: number;
  parsedExpression?: math.EvalFunction;
}

export class Variable extends BaseImmutable<VariableValue, VariableValue> {
  static PROPERTIES: Property[] = [
    { name: 'expression' },
    { name: 'currentValue', defaultValue: 0 },
    { name: 'parsedExpression', defaultValue: null },
  ];

  static fromJS(params: VariableValue | string) {
    if (typeof params === 'string') params = { expression: params };

    return new Variable(BaseImmutable.jsToValue(Variable.PROPERTIES, params));
  }

  public expression: string;
  public currentValue: number;
  public parsedExpression: math.EvalFunction;

  constructor(params: VariableValue) {
    super(params);
  }

  toJS() {
    return this.expression as any;
  }

  equals(other: any) {
    return other && other instanceof Variable && other.expression === this.expression;
  }

  changeExpression(newExpression: string) {
    const v = this.valueOf();

    v.expression = newExpression;
    if (newExpression !== this.expression) v.parsedExpression = null;

    return new Variable(v);
  }

  eval(scope: Record<string, number>): number {
    if (!this.parsedExpression) {
      this.parsedExpression = math.parse(this.expression).compile();
    }

    return this.parsedExpression.evaluate(scope);
  }

  update(scope: Record<string, number>) {
    const currentValue = this.eval(scope);

    const v = this.valueOf();
    v.currentValue = isNaN(currentValue) ? 0 : currentValue;

    return new Variable(v);
  }

  getValue(): number {
    return this.currentValue;
  }
}

BaseImmutable.finalize(Variable);
