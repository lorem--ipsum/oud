import * as React from 'react';
import * as classNames from 'classnames';

import { BaseImmutable } from 'immutable-class';
import { Variable } from '../models/index';

import { VariableInput } from '../variable-input/variable-input';
import { IconButton } from '../icon-button/icon-button';

import './detail.css';

export interface DetailProps<T> {
  items: T[];
  fields: string[];
  onChange: (items: T[]) => void;

  previous?: () => void;
  next?: () => void;

  remove?: () => void;
  duplicate?: () => void;
}

export interface DetailState<T> {
  item?: T;
  disabledProperties?: Record<string, boolean>;
}

export class Detail<T extends BaseImmutable<any, any>> extends React.Component<DetailProps<T>, DetailState<T>> {
  constructor(props: DetailProps<T>, context: any) {
    super(props, context);

    this.state = {};
  }

  initFromProps(props: DetailProps<T>) {
    const { items, fields } = props;

    let item = items[0];
    let disabledProperties: Record<string, boolean> = {};

    if (items.length > 1) {
      fields.forEach(field => {
        for (let i = 1; i < items.length; i++) {
          if (!item.get(field).equals(items[i].get(field))) {
            disabledProperties[field] = true;
            break;
          }
        }
      });
    }

    this.setState({
      item,
      disabledProperties
    });
  }

  componentWillMount() {
    this.initFromProps(this.props);
  }

  componentWillReceiveProps(nextProps: DetailProps<T>) {
    this.initFromProps(nextProps);
  }

  handleChange(item: T, field: string) {
    const { items, onChange } = this.props;

    const variable = item.get(field) as Variable;

    onChange(items.map(e => e.change(field, variable)));
  }

  getInput(path: string, label: string) {
    const { disabledProperties } = this.state;

    if (!path) return null;

    const { item } = this.state;


    return <VariableInput
      label={label}
      target={item}
      path={path}
      onChange={item => this.handleChange(item, path)}
      emptyUntilChangePlaceholder={disabledProperties[path] ? '≠ values' : null}
    />;
  }

  public render() {
    const { items, previous, next, fields, remove, duplicate } = this.props;
    const { item } = this.state;

    let inputs: JSX.Element[] = [];
    for (let i = 0; i < fields.length; i += 2) {
      inputs.push(<div className="row" key={i}>
        {this.getInput(fields[i], fields[i])}
        {this.getInput(fields[i + 1], fields[i + 1])}
      </div>)
    }

    return <div className={classNames('detail')}>
      <div className="title-row">
        { items.length === 1 && previous ? <IconButton type="primary" onClick={previous} icon="keyboard_arrow_left"/> : null }
        <div className="title">{items.length > 1 ? 'Several items selected' : item.get('label')}</div>
        { items.length === 1 && next ? <IconButton type="primary" onClick={next} icon="keyboard_arrow_right"/> : null }

        <div className="spacer"></div>
        { duplicate ? <IconButton type="primary" label="Duplicate" onClick={duplicate} icon="call_split"/> : null }
        { remove ? <IconButton type="warn" label="Delete" onClick={remove} icon="delete_outline"/> : null }
      </div>

      <div className="form">
        {inputs}
      </div>

    </div>;
  }
}
