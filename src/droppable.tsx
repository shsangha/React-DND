import * as React from "react";

const { createRef, createContext, cloneElement } = React;
import { ContainerContext } from "./container";
import {
  ContainerState,
  MoveDetail,
  DroppableProps,
  DroppableContext as Context
} from "./types";
import swap from "./utils/swap";
import sort from "./utils/sort";
import { DRAGGING_ELEMENT_ID, PLACEHOLDER_ID } from "./constants";
import { TimelineLite, TweenLite } from "gsap";
import { CustomDragEvent } from "./types";
import checkScroll from "./utils/checkScroll";
import ScrollToPlugin from "gsap/ScrollToPlugin";
const plugins = [ScrollToPlugin]; // just to avoid treeshaking

export const DroppableContext = createContext({} as Context);

export class Droppable extends React.Component<DroppableProps> {
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

  public resize = (detail: MoveDetail) => {
    const { placeholderRect, offsets } = detail;

    if (this.props.resize) {
      const draggedElement = document.querySelector(`#${DRAGGING_ELEMENT_ID}`);
      const placeholder = document.querySelector(`#${PLACEHOLDER_ID}`);

      if (draggedElement && placeholder) {
        const draggedRect = draggedElement.getBoundingClientRect();

        const { offsetX, offsetY } = offsets;

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

  public handleDragEnter = (e: CustomDragEvent) => {
    e.persist();

    let currrentDragPos: number | null = null;
    const { detail } = e;

    if (detail) {
      if (detail.type === "move") {
        currrentDragPos = detail.position.currentIndex;
      }
    }

    this.context.updateState(
      (prevState: ContainerState) => {
        const { currentIndex, currentCollection } = prevState.dragState;
        const { name, behavior, cap } = this.props;

        if ((cap && cap > prevState.values[name].length) || !cap) {
          if (currentCollection && typeof currentIndex === "number") {
            const prevArray = [...prevState.values[currentCollection]];
            const newArray = [...prevState.values[name]];

            const newPos =
              typeof currrentDragPos === "number"
                ? currrentDragPos
                : newArray.length;
            if (behavior === "sort" || behavior === "swap") {
              prevArray.splice(currentIndex, 1);
              newArray.splice(
                newPos,
                0,
                prevState.values[currentCollection][currentIndex]
              );

              this.context.screenReaderAnnounce(
                `Dragged element moved to  ${name} at index ${newPos}`
              );

              return {
                dragState: {
                  currentIndex:
                    typeof currrentDragPos === "number"
                      ? currrentDragPos
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

              this.context.screenReaderAnnounce(
                `Dragged element moved to  ${name} at index ${prevState.values[
                  name
                ].length - 1}`
              );

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

              this.context.screenReaderAnnounce(
                `Dragged element moved to  ${name} at index 0`
              );

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
        } else {
          this.context.screenReaderAnnounce(
            `Droppable ${this.props.name} at capaccity`
          );
        }
      },
      () => {
        if (e.detail && e.detail.type === "move") {
          this.resize(e.detail);
        } else if (e.detail) {
          const [x, y] = checkScroll(
            e.detail.container,
            this.droppableRef.current,
            0,
            0
          );
          const { behavior } = this.props;

          const draggedElement = document.querySelector(
            `#${DRAGGING_ELEMENT_ID}`
          );

          if (draggedElement) {
            draggedElement.scrollIntoView(behavior === "shift" ? true : false);
          }
        }
      }
    );
  };

  public handleDragOver = (e: CustomDragEvent) => {
    e.persist();

    const { detail } = e;

    let currrentDragPos: number | null = null;

    this.context.updateState(
      (prevState: ContainerState) => {
        const { behavior, name } = this.props;
        const {
          dragState: { currentCollection, currentIndex },
          values
        } = prevState;

        if (detail) {
          if (detail.type === "move") {
            currrentDragPos = detail.position.currentIndex;
          } else if (
            detail.type === "ArrowLeft" ||
            detail.type === "ArrowRight"
          ) {
            if (currentCollection && typeof currentIndex === "number") {
              currrentDragPos =
                detail.type === "ArrowLeft"
                  ? currentIndex > 0
                    ? currentIndex - 1
                    : null
                  : currentIndex <
                    prevState.values[currentCollection].length - 1
                  ? currentIndex + 1
                  : null;
            }
          }
        }

        if (prevState.dragState.currentIndex !== currrentDragPos) {
          if (
            currentCollection &&
            typeof currentIndex === "number" &&
            typeof currrentDragPos === "number"
          ) {
            if (behavior === "swap" || behavior === "sort") {
              if (behavior === "swap") {
                this.context.screenReaderAnnounce(
                  `Swapped index ${currentIndex} and ${currrentDragPos} in ${name}`
                );

                return {
                  dragState: {
                    currentCollection: name,
                    currentIndex: currrentDragPos
                  },
                  values: {
                    ...values,
                    [name]: swap(
                      currrentDragPos,
                      currentIndex!,
                      prevState.values[name]
                    )
                  }
                };
              } else {
                this.context.screenReaderAnnounce(
                  `Sorted dragged element to position ${currrentDragPos}`
                );
                return {
                  dragState: {
                    currentCollection: name,
                    currentIndex: currrentDragPos
                  },
                  values: {
                    ...values,
                    [name]: sort(
                      currentIndex!,
                      currrentDragPos,
                      prevState.values[name]
                    )
                  }
                };
              }
            }
          }
        }
      },
      () => {
        const draggedElement = document.querySelector(
          `#${DRAGGING_ELEMENT_ID}`
        );

        if (e.detail && e.detail.type === "move") {
          this.resize(e.detail);
        } else if (e.detail && draggedElement) {
          const [x, y] = checkScroll(
            this.droppableRef.current,
            draggedElement as HTMLElement,
            0,
            0
          );

          if (x || y) {
            TweenLite.to(this.droppableRef.current, 0.3, {
              scrollTo: {
                x: `+=${x * draggedElement.clientWidth}`,
                y: `+=${y * draggedElement.clientHeight}`
              }
            });
          } else {
            const [x, y] = checkScroll(
              e.detail.container,
              draggedElement as HTMLElement,
              0,
              0
            );

            if (x || y) {
              TweenLite.to(e.detail.container, 0.3, {
                scrollTo: {
                  x: `+=${x * draggedElement.clientWidth}`,
                  y: `+=${y * draggedElement.clientHeight}`
                }
              });
            }
          }
        }
      }
    );
  };

  public removeCurrentDroppable = () => {
    const { updateState } = this.context;

    const { name } = this.props;

    updateState((prevState: ContainerState) => {
      const copy = { ...prevState.values };

      delete copy[name];

      return {
        values: copy
      };
    });
  };

  public removeDraggableAtIndex = (index: number) => {
    const { updateState } = this.context;
    const { name } = this.props;

    updateState((prevState: ContainerState) => {
      const copy = [...prevState.values[name]];

      copy.splice(index, 1);

      return {
        values: {
          ...prevState.values,
          [name]: copy
        }
      };
    });
  };

  public insertInDraggable = (newVal: any, index?: number) => {
    const { updateState } = this.context;
    const { name } = this.props;

    updateState((prevState: ContainerState) => {
      const copy = [...prevState.values[name]];

      if (index) {
        copy.splice(index, 0, newVal);
        return {
          values: {
            ...prevState.values,
            [name]: copy
          }
        };
      }

      return {
        values: {
          ...prevState.values,
          [name]: [...prevState.values[name], newVal]
        }
      };
    });
  };

  public render() {
    const { children, name, cap } = this.props;

    const { currentCollection } = this.context.state.dragState;

    const dragging = currentCollection === name;

    const atCapacity = !!(
      currentCollection &&
      cap &&
      this.context.state.values[currentCollection].length === cap
    );

    return (
      <DroppableContext.Provider value={{ collection: this.props.name }}>
        {cloneElement(
          children({
            dragging,
            atCapacity,
            removeCurrentDroppable: this.removeCurrentDroppable,
            removeDraggableAtIndex: this.removeDraggableAtIndex,
            insertInDraggable: this.insertInDraggable
          }),
          {
            ["data-droppable"]: name,
            onDragEnter: this.handleDragEnter,
            onDragOver: this.handleDragOver,
            ref: this.droppableRef
          }
        )}
      </DroppableContext.Provider>
    );
  }
}
