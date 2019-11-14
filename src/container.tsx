import React, { createContext, createRef, Component } from "react";
import {
  Subject,
  race,
  fromEvent,
  forkJoin,
  of,
  merge,
  iif,
  throwError,
  NEVER
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
  throttleTime,
  debounceTime
} from "rxjs/operators";
import { TweenLite } from "gsap";
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
import { DRAGGING_ELEMENT_ID, PLACEHOLDER_ID } from "./constants";
import { ContainerState } from "./types";
import { placeholder } from "@babel/types";

interface ExtendedHTMLElement extends HTMLElement {
  ["data-collection"]: string;
  ["data-index"]: number;
}

interface Props {
  children: (state: any) => React.ReactNode;
  resize: boolean;
}

interface RefObject {
  [key: string]: React.RefObject<HTMLElement>;
}

export const ContainerContext = createContext({} as any);

export default class Container extends Component<Props, ContainerState> {
  public containerRef = createRef<any>();

  public droppabeRefs: { [key: string]: HTMLElement } = {};

  public registerDroppable = (name: string, ref: any) => {
    this.droppabeRefs[name] = ref;
  };

  public unregisterDroppable = (name: string) => {
    delete this.droppabeRefs[name];
  };

  public mouse$ = new Subject<React.MouseEvent>();
  public touch$ = new Subject<React.TouchEvent>();

  public state = {
    dragState: {
      currentIndex: null,
      currentCollection: null
    },
    values: {
      name: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      age: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
      smell: ["er"]
    }
  };

  public static defaultProps = {
    scrollX: false,
    scrollY: false,
    resize: true
  };

  public mouseDown = (e: React.MouseEvent) => {
    this.mouse$.next(e);
  };

  public touchStart = (e: React.TouchEvent) => {
    this.touch$.next(e);
  };

  public createDrag$ = () => {
    return race(this.mouse$, this.touch$).pipe(
      switchMap(downEvent => {
        const current = getDraggable(downEvent.target) as ExtendedHTMLElement;
        const placeHolder = createPlaceHolder(current);
        const placeholderRect = current.getBoundingClientRect();

        current.style.background = "green";

        const { state } = this;

        let currentPos = getDraggableAttrs(current);

        hasValidDraggableProps(currentPos);

        this.setState({
          dragState: currentPos
        });

        return forkJoin({
          offsets: of({ ...getOffsets(downEvent, current) })
        }).pipe(
          tap(() => {
            this.setState({ dragState: currentPos });
          }),
          switchMap(({ offsets }) =>
            merge(
              fromEvent<React.MouseEvent>(window, "mousemove"),
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
              debounceTime(33.3),

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
                                ...newPos,
                                ...offsets,
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
                                ...newPos,
                                ...offsets,
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
                                  ...currentPos,
                                  ...offsets,
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
            merge(fromEvent<MouseEvent>(window, "mouseup")).pipe(
              tap(() => {
                placeHolder.remove();
              }),
              tap(event => {
                // need to cancel here
              })
            )
          )
        );
      })
    );
  };

  public createKeyboard$ = () => {};

  public componentDidMount() {
    const drag$ = this.createDrag$();

    this.containerRef.current.addEventListener(
      "touchmove",
      preventTouchScroll,
      { passive: false }
    );

    drag$.subscribe(
      () => {},
      x => {
        console.log(x);
      },
      () => {
        console.log("done");
      }
    );
  }

  public componentWillUnmount() {
    this.containerRef.current.removeEventListener(
      "tochmove",
      preventTouchScroll,
      { passive: false }
    );
  }

  public updateState = (
    change: (
      prevState: Readonly<ContainerState>,
      props: Readonly<Props>
    ) => ContainerState | Pick<ContainerState, "dragState" | "values"> | null,
    cb?: () => void
  ) => {
    this.setState(change, () => {
      if (cb) {
        cb();
      }
    });
  };

  public render() {
    return (
      <ContainerContext.Provider
        value={{
          state: this.state,
          mouseDown: this.mouseDown,
          touchStart: this.touchStart,
          registerDroppable: this.registerDroppable,
          unregisterDroppable: this.unregisterDroppable,
          updateState: this.updateState
        }}
      >
        <div
          style={{
            width: "50vw",
            height: "50vh",
            background: "green",
            overflow: "scroll"
          }}
          ref={this.containerRef}
        >
          {this.props.children(this.state)}
        </div>
      </ContainerContext.Provider>
    );
  }
}
