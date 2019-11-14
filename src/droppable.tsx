import React, { Component, createRef, createContext } from "react";
import { ContainerContext } from "./container";
import { ContainerState } from "./types";
import swap from "./utils/swap";
import sort from "./utils/sort";
import { throttle } from "lodash";
import { DRAGGING_ELEMENT_ID, PLACEHOLDER_ID } from "./constants";
import { TimelineLite } from "gsap";

interface Props {
  name: string;
  children: React.ReactChild;
  behavior: "swap" | "sort" | "shift" | "append";
  resize: boolean;
}

export const DroppableContext = createContext({} as any);

export default class Droppable extends Component<Props> {
  public static contextType = ContainerContext;
  public static defaultProps = {
    behavior: "swap",
    resize: true
  };

  public droppableRef = createRef<any>();

  public componentDidMount() {
    this.context.registerDroppable(this.props.name, this.droppableRef.current);
  }

  public componentWillUnmount() {
    this.context.unregisterDroppable(this.props.name);
  }

  public resize = (e: any) => {
    const {
      detail: { placeholderRect, offsetX, offsetY }
    } = e;

    if (this.props.resize) {
      const draggedElement = document.querySelector(`.${DRAGGING_ELEMENT_ID}`);
      const placeholder = document.querySelector(`#${PLACEHOLDER_ID}`);

      if (draggedElement && placeholder) {
        const draggedRect = draggedElement.getBoundingClientRect();

        const scaleX = draggedRect.width / placeholderRect.width;
        const scaleY = draggedRect.height / placeholderRect.height;

        new TimelineLite()
          .to(placeholder, 0.3, {
            transformOrigin: `${offsetX}px ${offsetY}px`,
            scaleX,
            scaleY
          })
          .to(
            placeholder.children,
            0.3,
            {
              transformOrigin: "0 0",
              scaleX: 1 / scaleX,
              scaleY: 1 / scaleY
            },
            "-=0.3"
          );
      }
    }
  };

  public handleDragEnter = (e: any) => {
    e.persist();

    this.context.updateState(
      (prevState: ContainerState) => {
        const { currentIndex, currentCollection } = prevState.dragState;
        const { name, behavior } = this.props;

        if (currentCollection && typeof currentIndex === "number") {
          const prevArray = [...prevState.values[currentCollection]];
          const newArray = [...prevState.values[name]];
          if (behavior === "sort" || behavior === "swap") {
            prevArray.splice(currentIndex, 1);
            newArray.splice(
              typeof e.detail.currentIndex === "number"
                ? e.detail.currentIndex
                : newArray.length,
              0,
              prevState.values[currentCollection][currentIndex]
            );

            return {
              dragState: {
                currentIndex:
                  typeof e.detail.currentIndex === "number"
                    ? e.detail.currentIndex
                    : newArray.length - 1,
                currentCollection: name
              },
              values: {
                ...prevState.values,
                [name]: newArray,
                [currentCollection]: prevArray
              }
            };
          }

          if (behavior === "append") {
            prevArray.splice(currentIndex, 1);

            return {
              dragState: {
                currentIndex: prevState.values[name].length,
                currentCollection: name
              },
              values: {
                ...prevState.values,
                [currentCollection]: prevArray,
                [name]: [
                  ...prevState.values[name],
                  prevState.values[currentCollection][currentIndex]
                ]
              }
            };
          }

          if (behavior === "shift") {
            prevArray.splice(currentIndex, 1);

            return {
              dragState: {
                currentIndex: 0,
                currentCollection: name
              },
              values: {
                ...prevState.values,
                [currentCollection]: prevArray,
                [name]: [
                  prevState.values[currentCollection][currentIndex],
                  ...prevState.values[name]
                ]
              }
            };
          }
        }
      },
      () => {
        this.resize(e);
      }
    );
  };

  public handleDragOver = (e: any) => {
    e.persist();

    this.context.updateState(
      (prevState: ContainerState) => {
        if (prevState.dragState.currentIndex !== e.detail.currentIndex) {
          const { behavior, name } = this.props;
          const {
            dragState: { currentCollection, currentIndex },
            values
          } = prevState;

          if (
            currentCollection &&
            typeof currentIndex === "number" &&
            typeof e.detail.currentIndex === "number"
          ) {
            if (behavior === "swap" || behavior === "sort") {
              return behavior === "swap"
                ? {
                    dragState: {
                      currentCollection: name,
                      currentIndex: e.detail.currentIndex
                    },
                    values: {
                      ...values,
                      [name]: swap(
                        e.detail.currentIndex,
                        currentIndex!,
                        prevState.values[name]
                      )
                    }
                  }
                : {
                    dragState: {
                      currentCollection: name,
                      currentIndex: e.detail.currentIndex
                    },
                    values: {
                      ...values,
                      [name]: sort(
                        currentIndex!,
                        e.detail.currentIndex,
                        prevState.values[name]
                      )
                    }
                  };
            }
          }
        }
      },
      () => {
        this.resize(e);
      }
    );
  };

  public render() {
    return (
      <DroppableContext.Provider value={{ collection: this.props.name }}>
        <div
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          ref={this.droppableRef}
          data-droppable={this.props.name}
          style={{
            overflow: "scroll"
          }}
        >
          {this.props.children}
        </div>
      </DroppableContext.Provider>
    );
  }
}
