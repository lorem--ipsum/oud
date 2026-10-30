import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import classNames from 'classnames';
import { BaseImmutable } from 'immutable-class';
import React from 'react';

import { Variable } from '../models/index';

import './variable-input.scss';

export interface VariableInputProps<T extends BaseImmutable<any, any>> {
  label: string;
  helpText?: string;
  target: T;
  path: string;
  onChange: (newInstance: T) => void;

  emptyUntilChangePlaceholder?: string;
}

export interface VariableInputState {
  value?: string;
  error?: string;
}

export class VariableInput<T extends BaseImmutable<any, any>> extends React.Component<
  VariableInputProps<T>,
  VariableInputState
> {
  constructor(props: VariableInputProps<T>, context: any) {
    super(props, context);

    this.state = {};
  }

  initFromProps(props: VariableInputProps<T>, previousTarget?: T) {
    const { target, path } = props;
    const { error } = this.state;

    const isNewTarget = previousTarget && !previousTarget.equals(target);

    if (!isNewTarget && (!target || !path || error)) return;

    this.setState({
      error: undefined,
      value: target.deepGet(path + '.expression'),
    });
  }

  componentDidMount() {
    this.initFromProps(this.props);
  }

  componentDidUpdate(prevProps: VariableInputProps<T>) {
    if (prevProps.target !== this.props.target || prevProps.path !== this.props.path) {
      this.initFromProps(this.props, prevProps.target);
    }
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target, path, onChange } = this.props;

    let error = '';
    let variable = target.deepGet(path) as Variable;

    try {
      variable = variable.changeExpression(e.target.value);
      onChange(target.deepChange(path, variable));
    } catch (e) {
      error = String(e);
    }

    this.setState({
      value: e.target.value,
      error,
    });
  };

  public render() {
    const { label, helpText, emptyUntilChangePlaceholder } = this.props;
    const { value, error } = this.state;

    const _label = emptyUntilChangePlaceholder
      ? label + ' (' + emptyUntilChangePlaceholder + ')'
      : label;

    return (
      <FormControl className={classNames('variable-input', { error: !!error })} error={!!error}>
        <InputLabel htmlFor="name-helper">{_label}</InputLabel>
        <Input
          id="name-helper"
          className="input"
          value={emptyUntilChangePlaceholder ? '' : value}
          onChange={this.onChange}
        />
        {helpText ? <FormHelperText id="name-helper-text">{helpText}</FormHelperText> : null}
        {error ? <FormHelperText id="name-helper-text">{error}</FormHelperText> : null}
      </FormControl>
    );
  }
}
