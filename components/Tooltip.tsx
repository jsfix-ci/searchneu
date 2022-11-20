import React from 'react';

export enum TooltipDirection {
  Up = 'UP',
  Down = 'DOWN',
}

export type TooltipProps = {
  text: string;
  direction: TooltipDirection;
  flipLeft?: boolean;
};

export default function Tooltip(props: TooltipProps) {
  return (
    <div className={props.flipLeft ? 'tooltip flip_tooltip' : 'tooltip'}>
      {props.text}
      <div className={`tooltip__arrow--${props.direction}`} />
    </div>
  );
}
