import './attractor-renderer.css';

import * as React from 'react';
import * as classNames from 'classnames';

import { Attractor } from '../models/index';

import { CircleSelector } from '../circle-selector/circle-selector';

export interface AttractorRendererProps extends React.Props<any> {
  selected?: boolean;
  attractor: Attractor;
  onClick: (event: React.MouseEvent<SVGGElement>) => void;
}

export class AttractorRenderer extends React.Component<AttractorRendererProps> {
  render() {
    const { attractor, onClick, selected } = this.props;

    const mass = attractor.getMass().getValue();

    const x = attractor.getX().getValue();
    const y = attractor.getY().getValue();

    return <g className={classNames('attractor-renderer', {positive: mass > 0, negative: mass < 0})}>
      <circle
        className="background"
        cx={x}
        cy={y}
        r={Math.min(20, Math.abs(mass))}
      />

      <g className="event-target-container" onClick={onClick}>
        <circle
          className="event-target"
          cx={x}
          cy={y}
          r="20"
        />
      </g>

      { selected ? <CircleSelector x={x} y={y} radius={20 + 3}/> : null }

    </g>

  }
}
