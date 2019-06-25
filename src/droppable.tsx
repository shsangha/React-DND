import React, { createContext, cloneElement } from "react";
import { Container } from "./context";
import { DroppableContext, DroppableProps, ContainerContext } from "./types";
import { DROPPABLE_ID } from "./constants";

export const DroppableContainer = createContext({} as DroppableContext);

interface Props extends DroppableProps, DroppableContext, ContainerContext {}

const Droppable = ({
  updateDragState,
  id,
  index,
  children,
  ...props
}: Props) => {
  const onDragEnter = (e: DragEvent) => {
    updateDragState({
      over: id
    });

    if (props.onDragEnter) {
      props.onDragEnter(e);
    }
  };

  const onDragLeave = (e: DragEvent) => {
    updateDragState({
      over: null
    });

    if (props.onDragEnter) {
      props.onDragEnter(e);
    }
  };

  const onDrop = (e: DragEvent) => {
    if (props.onDrop) {
      props.onDrop(e);
    }

    updateDragState({
      origin: null,
      over: null,
      currentPosition: null,
      previousPosition: null,
      withinContainer: true
    });
  };

  return (
    <DroppableContainer.Provider
      value={{
        id,
        index
      }}
    >
      {cloneElement(children(), {
        onDragEnter,
        onDragLeave,
        onDrop,
        [`${DROPPABLE_ID}`]: id
      })}
    </DroppableContainer.Provider>
  );
};

export default (hocProps: DroppableProps) => (
  <Container.Consumer>
    {context => <Droppable {...context} {...hocProps} />}
  </Container.Consumer>
);
