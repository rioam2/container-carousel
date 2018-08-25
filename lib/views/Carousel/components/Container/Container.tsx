import * as React from 'react';
import styled from 'styled-components';

const ContainerWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  /* Custom Scrollbar rules: */
  &::-webkit-scrollbar {
    width: 10px;
    left: 3px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 10px;
  }
`;

export const Container = ({ color, children }: IContainerProps) => {
  return (
    <ContainerWrapper style={{ background: color || 'inherit' }}>
      {children}
    </ContainerWrapper>
  );
};

export interface IContainerProps {
  children?: any;
  color?: string;
}
