import Icon from '@material-ui/core/Icon';
import classNames from 'classnames';
import React from 'react';

import './icon-button.scss';

export interface IconButtonProps {
  icon: string;
  onClick: (event: React.MouseEvent<any>) => void;
  type: 'primary' | 'warn';
  label?: string;
}

export class IconButton extends React.Component<IconButtonProps, {}> {
  public render() {
    const { icon, onClick, type } = this.props;

    return (
      <Icon onClick={onClick} className={classNames('icon-button', type)}>
        {icon}
      </Icon>
    );
  }
}
