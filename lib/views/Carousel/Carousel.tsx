import * as React from 'react';
import { Motion, spring } from 'react-motion';
import { Container } from './components/Container';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  display: block;
  overflow: hidden;
  height: 100%;
  width: 100%;
  user-select: none;
`;

const CarouselWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
`;

export class Carousel extends React.Component<ICarouselProps, ICarouselState> {
  //
  // Reference to the carousel wrapper element:
  public container: React.RefObject<any>;

  /**
   * Handles initializing the React Class Component state and
   * any other required initial data
   * @param props Properties passed from parent component
   */
  public constructor(props: ICarouselProps) {
    super(props);
    this.state = {
      focusedElt: 1,
      touchOffset: 0,
      touchPageOffset: 0,
      touchStartX: undefined,
      touchStartY: undefined
    };
    this.container = React.createRef();
  }

  public componentDidMount() {
    // Add all component event listeners:
    this.container.current.addEventListener('mousedown', this.handleStart);
    this.container.current.addEventListener('touchstart', this.handleStart);
    this.container.current.addEventListener('mousemove', this.handleMove);
    this.container.current.addEventListener('touchmove', this.handleMove);
    // Add listeners to window for out-of-bounds catches
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mouseup', this.handleEnd);
    window.addEventListener('touchend', this.handleEnd);
  }

  public componentWillUnmount() {
    // On component unmount, remove all constructed listeners:
    this.container.current.removeEventListener('mousedown', this.handleStart);
    this.container.current.removeEventListener('touchstart', this.handleStart);
    this.container.current.removeEventListener('mousemove', this.handleMove);
    this.container.current.removeEventListener('touchmove', this.handleMove);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mouseup', this.handleEnd);
    window.removeEventListener('touchend', this.handleEnd);
  }

  /**
   * Handles keyboard event hooks passed to the carousel element:
   */
  public handleKeyDown = (e: any) => {
    switch (e.which) {
      // Right keyboard press:
      case 39: {
        this.handleFocusIncrement(1);
        break;
      }
      // Left keyboard press:
      case 37: {
        this.handleFocusIncrement(-1);
        break;
      }
    }
  };

  /**
   * Adds the touch start coordinate to the component state for
   * offset calculations from within the handleMove method.
   */
  public handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    this.setState({
      ...this.state,
      touchStartX:
        e.type === 'mousedown'
          ? (e as React.MouseEvent).screenX
          : (e as React.TouchEvent).touches[0].screenX,
      touchStartY:
        e.type === 'mousedown'
          ? (e as React.MouseEvent).screenY
          : (e as React.TouchEvent).touches[0].screenY
    });
  };

  /**
   * Updates the translation coordinates of the carousel container
   * based upon the current mouse/touch position.
   */
  public handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { focusedElt, touchStartX, touchStartY } = this.state;
    // Check if swipe initiated:
    if (touchStartX && touchStartY) {
      // Extract start position data of swipe:
      const x =
        e.type === 'mousemove'
          ? (e as React.MouseEvent).screenX
          : (e as React.TouchEvent).touches[0].screenX;
      const y =
        e.type === 'mousemove'
          ? (e as React.MouseEvent).screenY
          : (e as React.TouchEvent).touches[0].screenY;
      const dx = x - touchStartX;
      const dy = y - touchStartY;

      // Check if horizontal swipe:
      if (Math.abs(dx) > Math.abs(dy)) {
        // Process page turn:
        e.preventDefault();
        // If swipe goes out of page bound, dampen page 'give':
        const outOfBoundsSwipe =
          (dx > 0 && focusedElt === 1) ||
          (dx < 0 && focusedElt === this.props.children.length && true) ||
          false;
        this.setState({
          ...this.state,
          touchOffset: (outOfBoundsSwipe && dx - 0.65 * dx) || dx
        });

        // Rollover to next page on release if 28% turned in either
        // direction, else release will return to current page:
        if (Math.abs(dx) >= window.innerWidth / 3.5) {
          const { onThreshold } = this.props;
          const touchPageOffset = dx > 0 ? -1 : 1;
          this.setState(
            // Update page turn offset state:
            { ...this.state, touchPageOffset },
            // On completion, initiate callback:
            () => onThreshold && onThreshold(touchPageOffset)
          );
        } else {
          this.setState({ ...this.state, touchPageOffset: 0 });
        }
      }
    }
  };

  /**
   * Resets the component state for the next touch event.
   */
  public handleEnd = (e: MouseEvent | TouchEvent) => {
    this.handleFocusIncrement(this.state.touchPageOffset);
    this.setState({
      ...this.state,
      touchOffset: 0,
      touchPageOffset: 0,
      touchStartX: undefined,
      touchStartY: undefined
    });
  };

  /**
   * Increments the focus element and also performs basic out-of-bounds
   * checks on the new focus position.
   */
  public handleFocusIncrement = (inc: number) => {
    const { onPageTurn } = this.props;
    const focusedElt = this.state.focusedElt + inc;
    if (focusedElt >= 1 && focusedElt <= this.props.children.length) {
      this.setState(
        // Update focused page state:
        { ...this.state, focusedElt },
        // On completion, initiate page turn callback:
        () => onPageTurn && onPageTurn(this.state.focusedElt)
      );
    }
  };

  /**
   * Renders JSX Components and HMTL pseudo-tags to the React Virtual
   * DOM for rendering to the browser.
   */
  public render() {
    const { touchOffset, focusedElt } = this.state;
    const { children, style } = this.props;
    const translateX = ((focusedElt - 1) / children.length) * 100;

    return (
      <CarouselContainer style={style} innerRef={this.container}>
        <Motion
          style={{
            dst: spring(translateX, { stiffness: 400, damping: 50 }),
            touch: spring(touchOffset, { stiffness: 400, damping: 50 })
          }}
          defaultStyle={{ dst: translateX, touch: 0 }}
        >
          {({ dst, touch }) => (
            <CarouselWrapper
              style={{
                transform: `translateX(calc(-${dst}% + ${touch}px))`,
                width: (children && children.length * 100 + '%') || 0
              }}
            >
              {React.Children.map(children, child => (
                <Container>{child}</Container>
              ))}
            </CarouselWrapper>
          )}
        </Motion>
      </CarouselContainer>
    );
  }
}

export interface ICarouselProps {
  children?: any;
  style?: object;
  onPageTurn?: (pageNum: number) => void;
  onThreshold?: (direction: 1 | -1) => void;
}
export interface ICarouselState {
  focusedElt: number;
  touchStartX?: number;
  touchStartY?: number;
  touchOffset: number;
  touchPageOffset: number;
}
