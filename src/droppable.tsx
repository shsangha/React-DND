import React, { createContext, cloneElement } from "react";
import { DragContext } from "./context";
import noop from "./utils/noop";

interface Props {
  index: number;
  id: number; // translates to drop-id internally
  disabled?: boolean;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
  children: () => React.ReactNode;
}

interface DroppableContext {
  id: number;
  index: number;
}

const DroppableContext = createContext({} as DroppableContext);

const Droppable = (props: Props) => {
  const onDragEnter = (e: DragEvent) => {};

  const onDragLeave = (e: DragEvent) => {};

  const onDrop = (e: DragEvent) => {};

  return cloneElement(
    <DroppableContext.Provider
      value={{
        id: props.id,
        index: props.index
      }}
    >
      {props.children()}
    </DroppableContext.Provider>,
    {
      onDragEnter,
      onDragLeave,
      onDrop
    }
  );
};

export default (props: Props) => (
  <DragContext.Consumer>
    {context => <Droppable {...context} {...props} />}
  </DragContext.Consumer>
);
