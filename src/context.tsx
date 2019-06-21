import React, { Component, createContext, createRef } from "react";

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
}

interface Context {
  updateDragData: (state: Partial<State>, props: Partial<Props>) => void;
  updateDragContext: (state: State) => void;
  move: () => void;
}

const defaultState = {
  data: [1, 2, 3, 4, 5],
  origin: null,
  over: null,
  currentPosition: null
};

export const DragContext: React.Context<any> = createContext({});

export default class DragEnabledContainer extends Component<Props, State> {
  public containerRef: React.RefObject<any> = createRef();

  public state = { ...defaultState };

  public scroll = () => {
    return true;
  };

  public checkInContainer = () => {
    return () => {
      console.log("rinng");
    };
  };

  public moveTo = (origin: number, target: number) => {
    this.setState(prevState => {
      const data = [...prevState.data];
      data.splice(origin, 1);
      data.splice(target, 0, prevState.data[origin]);
      return {
        data,
        currentPosition: target
      };
    });
  };

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

  public render() {
    return (
      <div ref={this.containerRef}>
        <DragContext.Provider
          value={{
            scroll: this.scroll,
            checkInContainer: this.checkInContainer,
            move: this.componentWillReceiveProps
          }}
        >
          {this.props.children({ data: this.state.data, move: this.moveTo })}
        </DragContext.Provider>
      </div>
    );
  }
}
