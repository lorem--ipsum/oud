/*
 * Copyright (c) 2018 Imply Data, Inc. All rights reserved.
 *
 * This software is the confidential and proprietary information
 * of Imply Data, Inc.
 */

// tslint:disable-next-line
require("./circle-selector.css");

import * as classNames from 'classnames';
import * as React from 'react';

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
