/*
 * Copyright (c) 2018 Imply Data, Inc. All rights reserved.
 *
 * This software is the confidential and proprietary information
 * of Imply Data, Inc.
 */

require('./circle-selector.css');

import * as React from 'react';
import * as classNames from 'classnames';

export interface CircleSelectorProps extends React.Props<any> {
  x: number;
  y: number;
  radius: number;
}

export class CircleSelector extends React.Component<CircleSelectorProps, {}> {
  render() {
    const { x, y, radius } = this.props;

    return <circle
        className="circle-selector"
        style={{transformOrigin: `${x}px ${y}px`}}
        cx={x}
        cy={y}
        r={radius}
      />
  }
}
