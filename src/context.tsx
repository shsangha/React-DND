import React, { Component, createContext, createRef } from "react";
import { scroll } from "./utils";

interface Props {
  scroll: boolean;
  srollSensitivity: number;
  children: (a: any) => React.ReactNode;
}

interface State {
  data: any[];
  origin: { id: number; index: number } | null;
  over: number | null;
  currentPosition: number | null;
  previousPosition: number | null;
  withinContainer: boolean;
}

const defaultState = {
  data: [1, 2, 3, 4, 5],
  origin: null,
  over: null,
  currentPosition: null,
  previousPosition: null,
  withinContainer: true
};

export default class DragEnabledContainer extends Component<Props, State> {
  public containerRef: React.RefObject<any> = createRef();

  public state = { ...defaultState };

  public scroll = (deltaX: number, deltaY: number, target: HTMLElement) => {
    if (this.containerRef.current && this.props.scroll) {
      return scroll(
        deltaX,
        deltaY,
        this.containerRef.current,
        target,
        this.props.srollSensitivity
      );
    }
  };

  public checkInContainer = (x: number, y: number) => {
    this.setState(prevState => {
      const withinContainer =
        this.containerRef.current &&
        this.containerRef.current.contains(document.elementFromPoint(x, y));

      if (withinContainer === prevState.withinContainer) {
        return null;
      }
      return {
        withinContainer
      };
    });
  };

  public move = (target: number) => {
    this.setState(prevState => {
      if (prevState.currentPosition) {
        const data = [...prevState.data];
        data.splice(prevState.currentPosition, 1);
        data.splice(target, 0, prevState.data[prevState.currentPosition]);
        return {
          data,
          currentPosition: target
        };
      }
      throw new Error("Cant call move method when not dragging");
    });
  };

  public cancelMove = () => {};

  public swap = (origin: number, target: number) => {
    this.setState(prevState => {
      const data = [...prevState.data];

      data[origin] = prevState.data[target];
      data[target] = prevState.data[origin];

      return {
        data
      };
    });
  };

  public cancelSwap = () => {};

  public insert = () => {};

  public remove = (index: number) => {};

  public edit = (index: number) => {};

  public screenReaderAnnounce = () => {};

  public render() {
    return (
      <div ref={this.containerRef}>
        {this.props.children({ data: this.state.data, move: this.move })}
      </div>
    );
  }
}
