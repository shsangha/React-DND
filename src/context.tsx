import React, { Component, createContext, createRef } from "react";

interface Props {
  children: () => React.ReactNode;
}

interface Context {
  data: any[];
  updateContext: (update: object, callback: () => void) => void;
}

interface State {
  origin: number | null;
  current: number | null;
  previous: number | null;
  type: string;
}

export const DragContext: React.Context<any> = createContext({});

const defaultState = {
  origin: null,
  current: null,
  previous: null,
  type: ""
};

// will need to hold a ref to the draggable context for scrolling

export default class DragEnabledContainer extends Component<Props> {
  public DragContextRef: React.RefObject<any> = createRef();

  public state = { ...defaultState };

  public updateDragContext = (changes: object, callback: any) => {
    this.setState(
      prevState => ({
        ...prevState,
        ...changes
      }),
      () => {
        callback(this.state);
      }
    );
  };

  public render() {
    return (
      <div ref={this.DragContextRef}>
        <DragContext.Provider
          value={{
            updateDragContext: this.updateDragContext
          }}
        >
          {this.props.children()}
        </DragContext.Provider>
      </div>
    );
  }
}
