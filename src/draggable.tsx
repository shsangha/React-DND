import * as React from "react";

const { Component, cloneElement, createRef } = React;

import { ContainerContext } from "./container";
import { DroppableContext } from "./droppable";
import { TweenLite } from "gsap";
import { DRAGGING_ELEMENT_ID } from "./constants";
import {
  ContainerState,
  DraggableProps,
  CombinedDraggableProps
} from "./types";

class DraggableElement extends Component<CombinedDraggableProps> {
  public static contextType = ContainerContext;

  public ref = createRef<any>();

  public componentDidUpdate(
    prevProps: CombinedDraggableProps,
    _: any,
    snapshot: ClientRect | DOMRect
  ) {
    if (prevProps.index !== this.props.index) {
      const newPos = this.ref.current!.getBoundingClientRect();

      const x = snapshot.left - newPos.left;
      const y = snapshot.top - newPos.top;
      const scaleX = snapshot.width / newPos.width;
      const scaleY = snapshot.height / newPos.height;

      TweenLite.killTweensOf(this.ref.current);

      TweenLite.fromTo(
        this.ref.current!,
        0.3,
        {
          x,
          y,
          scaleX,
          scaleY
        },
        {
          x: 0,
          y: 0,
          scale: 1
        }
      );
    }
  }

  public getSnapshotBeforeUpdate() {
    if (this.ref.current) {
      return this.ref.current.getBoundingClientRect();
    }
  }

  public removeCurrentDraggable = () => {
    const { updateState } = this.context;
    const { collection, index } = this.props;

    updateState((prevState: ContainerState) => {
      const copy = [...prevState.values[collection]];

      copy.splice(index, 1);

      return {
        values: {
          ...prevState.values,
          [collection]: copy
        }
      };
    });
  };

  public removeOnClick = () => {
    return {
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.removeCurrentDraggable();
      }
    };
  };

  public render() {
    const {
      state: {
        dragState: { currentCollection, currentIndex }
      },
      keyStart,
      touchStart,
      mouseDown
    } = this.context;

    const { collection, index, children } = this.props;

    const dragging = currentCollection === collection && index === currentIndex;

    const id = dragging ? { id: DRAGGING_ELEMENT_ID } : {};

    return cloneElement(
      children({ dragging, removeOnClick: this.removeOnClick }),
      {
        tabIndex: 0,
        ["data-index"]: index,
        ["data-collection"]: collection,
        ["data-draggable"]: true,
        ["aria-grabbed"]: dragging,
        ["aria-dropeffect"]: "move",
        draggable: true,
        onKeyDown: keyStart,
        onTouchStart: touchStart,
        onMouseDown: mouseDown,
        ref: this.ref,
        style: {
          display: "inline-block",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          MsUserSelect: "none",
          userSelect: "none"
        },
        ...id
      }
    );
  }
}

export const Draggable = (props: DraggableProps) => (
  <DroppableContext.Consumer>
    {context => <DraggableElement {...context} {...props} />}
  </DroppableContext.Consumer>
);
