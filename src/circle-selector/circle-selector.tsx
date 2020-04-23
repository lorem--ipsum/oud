import React from 'react';

// tslint:disable-next-line
require('./circle-selector.css');

export interface CircleSelectorProps extends React.Props<any> {
  x: number;
  y: number;
  radius: number;
}

export class CircleSelector extends React.Component<CircleSelectorProps, {}> {
  render() {
    const { x, y, radius } = this.props;

    return (
      <circle
        className="circle-selector"
        style={{ transformOrigin: `${x}px ${y}px` }}
        cx={x}
        cy={y}
        r={radius}
      />
    );
  }
}
