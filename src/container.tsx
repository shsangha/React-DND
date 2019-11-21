import React, {
  createContext,
  createRef,
  Component,
  cloneElement
} from "react";
import {
  Subject,
  race,
  fromEvent,
  forkJoin,
  of,
  merge,
  iif,
  Subscription
} from "rxjs";
import {
  switchMap,
  filter,
  map,
  tap,
  pairwise,
  expand,
  delay,
  takeUntil,
  debounceTime
} from "rxjs/operators";
import createPlaceHolder from "./utils/createPlaceHolder";
import getOffsets from "./utils/getOffsets";
import { getDraggable, getDroppable } from "./utils/getDraggable";
import moveWithDrag from "./utils/moveWithDrag";
import getEventType from "./utils/getEventType";
import sameContainer from "./utils/sameContainer";
import hasValidDraggableProps from "./utils/hasValidDraggableProps";
import createEvent from "./utils/createEvent";
import { getDraggableAttrs, getDroppableAttrs } from "./utils/getTargetAttrs";
import preventTouchScroll from "./utils/preventTouchScroll";
import memoizedScroll from "./utils/memoizedScroll";
import {
  ContainerState,
  ContainerContext as ContextType,
  ContainerProps,
  ElementWDataAttrs
} from "./types";

export const ContainerContext = createContext({} as ContextType);

export default class Container extends Component<
  ContainerProps,
  ContainerState
> {
  public containerRef = createRef<any>();
  public liveRegionRef = createRef<HTMLSpanElement>();
  public droppabeRefs: { [key: string]: HTMLElement } = {};

  public dragSub: Subscription = {} as Subscription;
  public keyboardSub: Subscription = {} as Subscription;

  public registerDroppable = (name: string, ref: any) => {
    this.droppabeRefs[name] = ref;
  };

  public unregisterDroppable = (name: string) => {
    delete this.droppabeRefs[name];
  };

  public mouse$ = new Subject<React.MouseEvent>();
  public touch$ = new Subject<React.TouchEvent>();
  public arrow$ = new Subject<KeyboardEvent>();

  public state = {
    dragState: {
      currentIndex: null,
      currentCollection: null,
      moveType: null
    },
    values: this.props.initialState
  };

  public static defaultProps = {
    initialState: {},
    placeholderClass: ""
  };

  public mouseDown = (e: React.MouseEvent) => {
    this.mouse$.next(e);
  };

  public touchStart = (e: React.TouchEvent) => {
    this.touch$.next(e);
  };

  public keyStart = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") {
      e.stopPropagation();
      e.preventDefault();
    }

    if (e.keyCode === 32) {
      const a = e.target as HTMLElement;
      a.blur();
      this.arrow$.next(e.nativeEvent);
    }
  };

  public createDrag$ = () =>
    race(this.mouse$, this.touch$).pipe(
      switchMap(downEvent => {
        downEvent.persist();

        const current = getDraggable(downEvent.target) as ElementWDataAttrs;

        const placeHolder = createPlaceHolder(
          current,
          this.props.placeholderClass
        );
        const placeholderRect = current.getBoundingClientRect();

        const { state: initialState } = this;

        let currentPos = getDraggableAttrs(current);

        hasValidDraggableProps(currentPos);

        this.setState({
          dragState: { ...currentPos, moveType: "pointer" }
        });

        this.screenReaderAnnounce(
          `Dragging ${currentPos.currentCollection} at index ${
            currentPos.currentIndex
          }`
        );

        return forkJoin({
          offsets: of({ ...getOffsets(downEvent, current) })
        }).pipe(
          switchMap(({ offsets }) =>
            merge(
              fromEvent<MouseEvent>(window, "mousemove"),
              fromEvent<TouchEvent>(
                downEvent.target as HTMLElement,
                "touchmove",
                {
                  passive: false
                }
              )
            ).pipe(
              map(e => {
                e.preventDefault();
                e.stopPropagation();
                return e;
              }),
              tap(moveEvent => {
                moveWithDrag(getEventType(moveEvent), offsets, placeHolder);
              }),
              pairwise(),
              debounceTime(66),
              switchMap(([prevMove, currentMove]) => {
                const { clientX: prevX, clientY: prevY } = getEventType(
                  prevMove
                )!;
                const { clientX: currentX, clientY: currentY } = getEventType(
                  currentMove
                )!;

                const scroll = memoizedScroll(
                  currentPos.currentCollection !== null
                    ? this.droppabeRefs[currentPos.currentCollection]
                    : null,
                  this.containerRef.current,
                  placeHolder,
                  Math.sign(currentX - prevX),
                  Math.sign(currentY - prevY),
                  10
                );

                return of(
                  getDraggable(document.elementFromPoint(currentX, currentY))
                ).pipe(
                  expand(target =>
                    iif(
                      () => target instanceof HTMLElement,
                      of(target).pipe(
                        map(() => getDraggableAttrs(target!)),
                        tap(newPos => {
                          hasValidDraggableProps(newPos);
                        }),
                        tap(newPos => {
                          if (!sameContainer(currentPos, newPos)) {
                            this.droppabeRefs[
                              newPos.currentCollection!
                            ].dispatchEvent(
                              createEvent("dragenter", {
                                type: "move",
                                position: newPos,
                                offsets,
                                placeholderRect
                              })
                            );
                          }
                        }),
                        tap(newPos => {
                          if (newPos.currentIndex !== currentPos.currentIndex) {
                            this.droppabeRefs[
                              newPos.currentCollection!
                            ].dispatchEvent(
                              createEvent("dragover", {
                                type: "move",
                                position: newPos,
                                offsets,
                                placeholderRect
                              })
                            );
                          }
                        }),
                        tap(newPos => {
                          currentPos = newPos;
                        })
                      ),
                      of({}).pipe(
                        map(() =>
                          getDroppable(
                            document.elementFromPoint(currentX, currentY)
                          )
                        ),
                        map(droppable => {
                          if (droppable instanceof HTMLElement) {
                            return getDroppableAttrs(droppable);
                          }
                          return null;
                        }),
                        tap(droppableattrs => {
                          if (
                            droppableattrs &&
                            droppableattrs.currentCollection
                          ) {
                            if (
                              currentPos.currentCollection !==
                              droppableattrs.currentCollection
                            ) {
                              currentPos = {
                                currentCollection:
                                  droppableattrs.currentCollection,
                                currentIndex: null
                              };
                              this.droppabeRefs[
                                droppableattrs.currentCollection
                              ].dispatchEvent(
                                createEvent("dragenter", {
                                  type: "move",
                                  position: currentPos,
                                  offsets,
                                  placeholderRect
                                })
                              );
                            }
                          }
                        })
                      )
                    ).pipe(
                      filter(() => scroll()),
                      delay(200),
                      map(() =>
                        getDraggable(
                          document.elementFromPoint(currentX, currentY)
                        )
                      )
                    )
                  )
                );
              })
            )
          ),
          takeUntil(
            merge(
              fromEvent<FocusEvent>(window, "blur").pipe(
                tap(() => {
                  placeHolder.remove();
                })
              ),
              merge(
                fromEvent<MouseEvent>(window, "mouseup"),
                fromEvent<TouchEvent>(window, "touchend")
              ).pipe(
                tap(() => {
                  placeHolder.remove();
                }),
                tap(() => {
                  this.screenReaderAnnounce("Drag ended");
                }),
                map(event => {
                  if (event instanceof TouchEvent) {
                    return event.changedTouches[0];
                  } else {
                    return event as MouseEvent;
                  }
                }),
                map(event =>
                  getDroppable(
                    document.elementFromPoint(event.clientX, event.clientY)
                  )
                ),
                tap(target => {
                  if (target instanceof HTMLElement) {
                    this.setState({
                      dragState: initialState.dragState
                    });
                    return;
                  }
                  this.setState(initialState);
                })
              )
            )
          )
        );
      })
    );

  public createKeyboard$ = () =>
    this.arrow$.pipe(
      switchMap(e => {
        const { state: initialState } = this;

        const current = getDraggable(e.target) as ElementWDataAttrs;

        const dragState = getDraggableAttrs(current);

        this.setState({ dragState: { ...dragState, moveType: "keyboard" } });

        const refNames = Object.keys(this.droppabeRefs);

        let index = refNames.indexOf(dragState.currentCollection);

        this.screenReaderAnnounce(
          `Dragging ${dragState.currentCollection} ${dragState.currentIndex}`
        );

        return fromEvent<KeyboardEvent>(window, "keydown").pipe(
          tap(event => {
            event.preventDefault();
          }),
          filter(event =>
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
              event.key
            )
          ),
          tap(event => {
            if (event.key === "ArrowDown") {
              if (index < refNames.length - 1) {
                index++;

                this.droppabeRefs[refNames[index]].dispatchEvent(
                  createEvent("dragenter", {
                    type: "ArrowDown",
                    container: this.containerRef.current
                  })
                );
              }
            }
            if (event.key === "ArrowUp") {
              if (index > 0) {
                index--;

                this.droppabeRefs[refNames[index]].dispatchEvent(
                  createEvent("dragenter", {
                    type: "ArrowUp",
                    container: this.containerRef.current
                  })
                );
              }
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              this.droppabeRefs[refNames[index]].dispatchEvent(
                createEvent("dragover", {
                  type: event.key,
                  container: this.containerRef.current
                })
              );
            }
          }),
          takeUntil(
            merge(
              fromEvent<MouseEvent>(window, "click").pipe(
                tap(() => {
                  this.setState(initialState);
                })
              ),
              fromEvent<KeyboardEvent>(window, "keydown").pipe(
                tap(event => {
                  event.preventDefault();
                }),
                filter(event => event.keyCode === 32 || event.key === "Escape"),
                tap(event => {
                  current.focus();

                  if (event.key === "Escape") {
                    this.setState(initialState);
                  } else {
                    this.setState({ dragState: initialState.dragState });
                  }
                })
              )
            ).pipe(
              tap(() => {
                this.screenReaderAnnounce("Drag ended");
              })
            )
          )
        );
      })
    );

  public componentDidMount() {
    const drag$ = this.createDrag$();
    const kbd$ = this.createKeyboard$();

    this.containerRef.current.addEventListener(
      "touchmove",
      preventTouchScroll,
      { passive: false }
    );

    this.keyboardSub = kbd$.subscribe(
      () => {},
      x => {
        console.log(x);
      }
    );
    this.dragSub = drag$.subscribe(
      () => {},
      x => {
        console.log(x);
      }
    );
  }

  public componentWillUnmount() {
    this.containerRef.current.removeEventListener(
      "tochmove",
      preventTouchScroll,
      { passive: false }
    );

    this.keyboardSub.unsubscribe();
    this.dragSub.unsubscribe();
  }

  public removeDraggable = (name: string, index: number) => {
    this.setState((prevState: ContainerState) => {
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

  public removeDroppable = (name: string) => {
    this.setState((prevState: ContainerState) => {
      const copy = { ...prevState.values };

      delete copy[name];

      return {
        values: copy
      };
    });
  };

  public insertDraggable = (name: string, value: any, index?: number) => {
    this.setState((prevState: ContainerState) => {
      const copy = [...prevState.values[name]];

      if (index) {
        copy.splice(index, 0, value);

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
          [name]: [...copy, value]
        }
      };
    });
  };

  public insertDroppable = (name: string, initalValues: any[]) => {
    this.setState((prevState: ContainerState) => {
      return {
        values: {
          ...prevState.values,
          [name]: initalValues
        }
      };
    });
  };

  public updateState = (
    change: (
      prevState: Readonly<ContainerState>,
      props: Readonly<ContainerProps>
    ) => ContainerState | Pick<ContainerState, "dragState" | "values"> | null,
    cb?: () => void
  ) => {
    this.setState(change, () => {
      if (cb) {
        cb();
      }
    });
  };

  public screenReaderAnnounce = (message: string) => {
    const region = this.liveRegionRef.current;

    if (region) {
      region.innerHTML = message;
    }
  };

  public render() {
    const { children } = this.props;

    return (
      <ContainerContext.Provider
        value={{
          state: this.state,
          mouseDown: this.mouseDown,
          touchStart: this.touchStart,
          keyStart: this.keyStart,
          registerDroppable: this.registerDroppable,
          unregisterDroppable: this.unregisterDroppable,
          updateState: this.updateState,
          screenReaderAnnounce: this.screenReaderAnnounce
        }}
      >
        <>
          {cloneElement(
            children({
              state: this.state,
              insertDraggable: this.insertDraggable,
              insertDroppable: this.insertDroppable,
              removeDraggable: this.removeDraggable,
              removeDroppable: this.removeDroppable,
              screenReaderAnnounce: this.screenReaderAnnounce,
              updateState: this.updateState
            }),
            {
              ref: this.containerRef
            }
          )}
          <span
            aria-live="assertive"
            ref={this.liveRegionRef}
            style={{
              width: 0,
              height: 0,
              position: "fixed",
              opacity: 0,
              pointerEvents: "none",
              top: "-1000px"
            }}
          />
        </>
      </ContainerContext.Provider>
    );
  }
}
