import { BaseImmutable, Property } from 'immutable-class';

import { parse, type EvalFunction } from 'mathjs/number';

const compiledExpressions = new Map<string, EvalFunction>();

function compile(expression: string): EvalFunction {
  let compiled = compiledExpressions.get(expression);
  if (!compiled) {
    compiled = parse(expression).compile();
    compiledExpressions.set(expression, compiled);
  }
  return compiled;
}

export interface VariableValue {
  expression: string;
  currentValue?: number;
}

export class Variable extends BaseImmutable<VariableValue, VariableValue> {
  static PROPERTIES: Property[] = [
    { name: 'expression' },
    { name: 'currentValue', defaultValue: 0 },
  ];

  static fromJS(params: VariableValue | string) {
    if (typeof params === 'string') params = { expression: params };

    return new Variable(BaseImmutable.jsToValue(Variable.PROPERTIES, params));
  }

  public expression: string;
  public currentValue: number;

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

    return new Variable(v);
  }

  eval(scope: Record<string, number>): number {
    return compile(this.expression).evaluate(scope);
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
