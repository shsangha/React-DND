import React, { Component, cloneElement } from "react";
import { throwError, merge, fromEvent, of, forkJoin } from "rxjs";
import {
  switchMap,
  delay,
  filter,
  tap,
  pairwise,
  expand,
  takeUntil
} from "rxjs/operators";
import { DroppableContext, DraggableProps, ContainerContext } from "./types";
import { Container } from "./context";
import { DroppableContainer } from "./droppable";
import { getDroppable } from "./utils/getTarget";
import createDragEvent from "./utils/createDragEvent";
import noop from "./utils/noop";
import moveWithDrag from "./utils/moveWithDrag";
import resize from "./utils/resize";

interface Props extends DroppableContext, DraggableProps {
  containerContext: ContainerContext;
}

const noRefErrorMsg = (index: number) => `Ref not attached at index ${index} `;

class Draggable extends Component<Props> {
  public DraggableRef: React.RefObject<any> = React.createRef();

  public static contextType = Container;

  public getSnapshotBeforeUpdate(prevProps: any, prevState: any) {
    return this.DraggableRef.current!.getBoundingClientRect();
  }

  public componentDidUpdate(prevProps: Props, prevState: never, snapshot: any) {
    console.log(prevProps);
  }

  public componentDidMount() {
    this.sort$().subscribe();
  }

  public setDraggingAttrs = (el: HTMLElement) => {
    (el.style.touchAction = "none"), (el.style.pointerEvents = "none");
  };

  public sort$ = () => {
    const dragRef: HTMLElement = this.DraggableRef.current;

    return dragRef
      ? merge(
          fromEvent<TouchEvent>(dragRef, "touchstart", { passive: true }),
          fromEvent<MouseEvent>(dragRef, "mousedown")
        ).pipe(
          switchMap(downEvent => {
            const dataTransfer = new DataTransfer();
            const { pageX, pageY } =
              downEvent instanceof TouchEvent
                ? downEvent.touches[0]
                : downEvent;

            const boundingRect = dragRef.getBoundingClientRect();

            return forkJoin({
              offsets: of({
                pageX,
                pageY,
                windowX: window.scrollX,
                windowY: window.scrollY,
                offsetX: pageX - boundingRect.left,
                offsetY: pageY - boundingRect.top
              })
            }).pipe(
              delay(150),
              tap(() => {
                this.DraggableRef.current.dispatchEvent(
                  createDragEvent(downEvent, "dragstart", dataTransfer)
                );
              }),
              tap(() => {
                this.setDraggingAttrs(this.DraggableRef.current);
              }),
              tap(() => {
                const initalDropTarget = getDroppable(downEvent.target);
                if (initalDropTarget) {
                  initalDropTarget.dispatchEvent(
                    createDragEvent(downEvent, "dragenter", dataTransfer)
                  );
                }
              }),
              switchMap(({ offsets }) =>
                merge(
                  fromEvent<MouseEvent>(window, "mousemove"),
                  fromEvent<TouchEvent>(window, "touchmove", {
                    passive: true
                  })
                ).pipe(
                  tap(moveEvent => {
                    moveWithDrag(
                      moveEvent instanceof TouchEvent
                        ? moveEvent.touches[0]
                        : moveEvent,
                      offsets,
                      this.DraggableRef.current
                    );
                  }),

                  pairwise(),
                  switchMap(([prev, current]) => {
                    const { clientX: prevX, clientY: prevY } =
                      prev instanceof TouchEvent ? prev.touches[0] : prev;

                    const { clientX: currentX, clientY: currentY } =
                      current instanceof TouchEvent
                        ? current.touches[0]
                        : current;

                    const deltaX = Math.sign(currentX - prevX);
                    const deltaY = Math.sign(currentY - prevY);

                    return of(
                      getDroppable(document.elementFromPoint(prevX, prevY))
                    ).pipe(
                      tap(() => {
                        //    this.context.checkInContainer(currentX, currentY);
                      }),
                      expand(prevDroppable =>
                        of(
                          getDroppable(
                            document.elementFromPoint(currentX, currentY)
                          )
                        ).pipe(
                          tap(newDroppable => {
                            if (prevDroppable !== newDroppable) {
                              if (prevDroppable) {
                                prevDroppable.dispatchEvent(
                                  createDragEvent(
                                    prev,
                                    "dragleave",
                                    dataTransfer
                                  )
                                );
                              }
                              if (newDroppable) {
                                if (this.props.resize) {
                                  resize(
                                    this.DraggableRef.current,
                                    newDroppable,
                                    offsets,
                                    this.props.animationDuration
                                  );
                                }
                                newDroppable.dispatchEvent(
                                  createDragEvent(
                                    current,
                                    "dragenter",
                                    dataTransfer
                                  )
                                );
                              }
                            }
                          }),
                          //     filter(() => this.context.scroll(currentX, currentY)),
                          tap(() =>
                            this.context.scroll(
                              deltaX,
                              deltaY,
                              this.DraggableRef.current
                            )
                          ),
                          delay(150)
                        )
                      )
                    );
                  })
                )
              ),
              takeUntil(
                merge(
                  merge(
                    fromEvent<TouchEvent>(window, "touchend"),
                    fromEvent<MouseEvent>(window, "mouseup")
                  ).pipe(
                    tap(upEvent => {
                      const target = getDroppable(upEvent.target);
                      if (target) {
                        target.dispatchEvent(
                          createDragEvent(upEvent, "drop", dataTransfer)
                        );
                      }
                    }),
                    tap(upEvent => {
                      this.DraggableRef.current.dispatchEvent(
                        createDragEvent(upEvent, "dragend", dataTransfer)
                      );
                    })
                  ),
                  fromEvent<KeyboardEvent>(window, "keydown").pipe(
                    filter(keyEvent => keyEvent.keyCode === 27),
                    tap(keyEvent => {
                      if (this.props.onDragCancel) {
                        this.context.updateDragContext(this.props.onDragCancel);
                      } else {
                        // reset the context here
                      }
                    })
                  )
                )
              )
            );
          })
        )
      : throwError(noRefErrorMsg(3));
  };

  public onDragStart = (event: DragEvent) => {
    event.stopPropagation();
    const { index, id, onDragStart } = this.props;

    const { updateDragState } = this.context;

    updateDragState({
      origin: { index, id },
      currentPosition: index
    });

    if (onDragStart) {
      onDragStart(event);
    }
  };

  public onDragEnd = (event: DragEvent) => {
    event.stopPropagation();
  };

  public render() {
    const {
      animationDuration,
      resize: propsResize,
      children,
      containerContext,
      onDragCancel, // needs to be removed bc it isnt an actual event listener
      ...rest
    } = this.props;

    return cloneElement(children(), {
      ref: this.DraggableRef,
      ...rest
    });
  }
}

const WrappedDraggable = (props: DraggableProps) => (
  <Container.Consumer>
    {containerContext => (
      <DroppableContainer.Consumer>
        {droppableContext => (
          <Draggable
            containerContext={containerContext}
            {...droppableContext}
            {...props}
          />
        )}
      </DroppableContainer.Consumer>
    )}
  </Container.Consumer>
);

WrappedDraggable.defaultProps = {
  resize: false,
  onDragStart: noop,
  onDragEnd: noop,
  onDragCancel: noop,
  animationDuration: 0.3
};

export default WrappedDraggable;
