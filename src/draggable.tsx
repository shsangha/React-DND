import React, { Component, cloneElement, createRef } from "react";
import { ContainerContext } from "./container";
import { DroppableContext } from "./droppable";
import { TweenLite } from "gsap";
import { DRAGGING_ELEMENT_ID } from "./constants";

interface Props {
  children: React.ReactNode;
  index: number;
}

interface ComponentProps extends Props {
  collection: string;
}

class Draggable extends Component<ComponentProps> {
  public static contextType = ContainerContext;

  public ref = createRef<HTMLDivElement>();

  public componentDidUpdate(
    prevProps: any,
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

  public render() {
    const {
      state: {
        dragState: { currentCollection, currentIndex }
      }
    } = this.context;

    const { collection, index } = this.props;

    const dragging = currentCollection === collection && index === currentIndex;

    return (
      <div
        data-index={this.props.index}
        data-collection={this.props.collection}
        data-draggable={true}
        onTouchStart={this.context.touchStart}
        onMouseDown={this.context.mouseDown}
        className={`${dragging ? DRAGGING_ELEMENT_ID : ""}`}
        ref={this.ref}
        style={{
          border: "1px solid black",
          background: `${dragging ? "orange" : "green"}`,
          padding: "5px",
          display: "inline-block",
          fontSize: "60px"
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default (props: Props) => (
  <DroppableContext.Consumer>
    {context => <Draggable {...context} {...props} />}
  </DroppableContext.Consumer>
);
