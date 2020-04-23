import classNames from 'classnames';
import React from 'react';

import { CircleSelector } from '../circle-selector/circle-selector';
import { Emitter } from '../models/index';
import { cartesianFromPolar, CartesianVector } from '../utils/math-utils';

import './emitter-renderer.css';

function arc(center: CartesianVector, radius: number, startAngle: number, endAngle: number) {
  const a = cartesianFromPolar({ radius, theta: endAngle });
  const b = cartesianFromPolar({ radius, theta: startAngle });

  const start = {
    x: center.x + a.x,
    y: center.y + a.y,
  };

  const end = {
    x: center.x + b.x,
    y: center.y + b.y,
  };

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    center.x,
    center.y,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    center.x,
    center.y,
  ].join(' ');
}

const KNOB_PADDING = 10;

export interface EmitterRendererProps extends React.Props<any> {
  emitter: Emitter;
  selected?: boolean;
  onClick: (event: React.MouseEvent<SVGGElement>) => void;
}

export interface EmitterRendererState {}

export class EmitterRenderer extends React.Component<EmitterRendererProps, EmitterRendererState> {
  constructor(props: EmitterRendererProps, context: any) {
    super(props, context);
    this.state = {};
  }

  getHandlePath() {
    const { emitter } = this.props;
    const x = emitter.getX().getValue();
    const y = emitter.getY().getValue();
    const velocity = Math.max(1, emitter.getVelocity().getValue());
    const angle = emitter.getAngle().getValue();

    const end = cartesianFromPolar({ radius: velocity + KNOB_PADDING, theta: angle });
    end.x += x;
    end.y += y;

    return ['M', x, y, 'L', end.x, end.y].join(' ');
  }

  getKnobPosition() {
    const { emitter } = this.props;
    const x = emitter.getX().getValue();
    const y = emitter.getY().getValue();
    const velocity = Math.max(1, emitter.getVelocity().getValue());
    const angle = emitter.getAngle().getValue();

    const end = cartesianFromPolar({ radius: velocity + KNOB_PADDING, theta: angle });

    return {
      x: end.x + x,
      y: end.y + y,
    };
  }

  getArc() {
    const { emitter } = this.props;

    const x = emitter.getX().getValue();
    const y = emitter.getY().getValue();
    const spread = emitter.getSpread().getValue();
    const angle = emitter.getAngle().getValue();
    const velocity = Math.max(1, emitter.getVelocity().getValue());

    return arc({ x, y }, velocity, angle - spread / 2, angle + spread / 2);
  }

  render() {
    const { onClick, emitter, selected } = this.props;

    const x = emitter.getX().getValue();
    const y = emitter.getY().getValue();
    const velocity = emitter.getVelocity().getValue();

    return (
      <g onClick={onClick} className={classNames('emitter-renderer', { selected })}>
        <path
          className="output-pipe"
          d={this.getArc()}
          style={{ fill: emitter.getCurrentColor() }}
        />

        <g className="event-target-container">
          <circle className="event-target" cx={x} cy={y} r={velocity} />
        </g>

        {selected ? <CircleSelector x={x} y={y} radius={velocity + 3} /> : null}
      </g>
    );
  }
}
