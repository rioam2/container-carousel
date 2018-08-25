import * as React from 'react';
import './Container.css';

export const Container = ({ color, children }: IContainerProps) => {
  return (
    <div
      style={{ background: color || 'inherit' }}
      className="ContainerWrapper"
    >
      {children}
    </div>
  );
};

export interface IContainerProps {
  children?: any;
  color?: string;
}
